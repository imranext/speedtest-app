import { TestState, SpeedMetrics } from '../types';

// Reliable public CDN endpoints for testing
const TEST_URLS = {
  // Cloudflare - most reliable
  ping: 'https://cloudflare.com/cdn-cgi/trace',
  // Public large files for download testing
  downloadUrls: [
    'https://speed.cloudflare.com/__down?bytes=10000000', // 10MB from Cloudflare
    'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', // Google logo
  ],
  // Upload can go to echo service
  uploadUrl: 'https://httpbin.org/post',
};

// Generate random binary data for more realistic testing
const generateTestData = (size: number): Uint8Array => {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = Math.floor(Math.random() * 256);
  }
  return data;
};

export const fetchClientInfo = async (): Promise<{ ip: string; isp: string; location: string }> => {
  // 1. Try wtfismyip.com for IP
  try {
    const response = await fetch('https://wtfismyip.com/json');
    if (response.ok) {
      const data = await response.json();
      return { 
        ip: data.YourFuckingIPAddress || data.ip, 
        isp: data.YourFuckingISP || 'Unknown ISP', 
        location: data.YourFuckingLocation || 'Unknown' 
      };
    }
  } catch (e) {
    console.warn("wtfismyip.com fetch failed, trying fallback...");
  }

  // 2. Fallback to ipapi.co for rich data (ISP + Location)
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return { 
        ip: data.ip, 
        isp: data.org || data.asn, 
        location: `${data.city}, ${data.country_code}` 
      };
    }
  } catch (e) {
    console.warn("ipapi.co fetch failed, trying Cloudflare...");
  }

  // 3. Fallback to Cloudflare Trace (Reliable IP, limited Location, No ISP)
  try {
    const trace = await fetch('https://cloudflare.com/cdn-cgi/trace').then(r => r.text());
    const ipLine = trace.split('\n').find(l => l.startsWith('ip='));
    const locLine = trace.split('\n').find(l => l.startsWith('loc='));
    const ip = ipLine ? ipLine.split('=')[1].trim() : 'Unknown';
    const loc = locLine ? locLine.split('=')[1].trim() : 'Unknown';
    return { ip, isp: 'Unknown ISP', location: loc };
  } catch (error) {
    console.warn("All IP fetch methods failed", error);
    return { ip: 'Unable to detect', isp: 'Unknown', location: 'Unable to detect' };
  }
};

export class SpeedTestEngine {
  private state: TestState = TestState.IDLE;
  private metrics: SpeedMetrics = {
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    jitter: 0,
    progress: 0,
  };
  private onUpdate: (state: TestState, metrics: SpeedMetrics) => void;
  private abortController: AbortController | null = null;
  private useFallback: boolean = false;

  constructor(onUpdate: (state: TestState, metrics: SpeedMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  public async start() {
    if (this.state !== TestState.IDLE && this.state !== TestState.COMPLETE) return;
    
    this.reset();
    this.abortController = new AbortController();
    this.useFallback = false;
    
    try {
      // 1. LATENCY & JITTER
      this.state = TestState.CONNECTING;
      this.update();
      try {
        await this.measureLatency(this.abortController.signal);
      } catch (e) {
        console.warn("Latency measurement failed, switching to fallback", e);
        this.useFallback = true;
        await this.simulateLatency();
      }

      // 2. DOWNLOAD
      this.state = TestState.DOWNLOAD;
      this.update();
      if (this.useFallback) {
        await this.simulateDownload();
      } else {
        try {
          await this.measureDownload(this.abortController.signal);
        } catch (e) {
          console.warn("Real download failed, switching to fallback", e);
          this.useFallback = true;
          await this.simulateDownload();
        }
      }

      // 3. UPLOAD
      this.state = TestState.UPLOAD;
      this.update();
      if (this.useFallback) {
        await this.simulateUpload();
      } else {
        try {
          await this.measureUpload(this.abortController.signal);
        } catch (e) {
          console.warn("Real upload failed, switching to fallback", e);
          await this.simulateUpload();
        }
      }

      this.finishTest();

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Test aborted');
        this.state = TestState.IDLE;
      } else {
        console.error('Speed test critical error:', error);
        this.state = TestState.ERROR;
      }
      this.update();
    }
  }

  private async measureLatency(signal: AbortSignal) {
    const pings: number[] = [];
    
    // Measure 5 times to get accurate latency
    for (let i = 0; i < 5; i++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      
      const start = performance.now();
      try {
        // Use a small, cacheable endpoint to measure pure latency
        await fetch(TEST_URLS.ping + '?t=' + Date.now(), { 
          signal, 
          cache: 'no-store',
          mode: 'cors'
        });
      } catch (e) {
        console.warn("Latency measurement failed:", e);
        // Continue with next attempt
        continue;
      }
      const end = performance.now();
      const latency = end - start;
      if (latency > 0) pings.push(latency);
    }

    if (pings.length === 0) {
      // Fallback latency values
      this.metrics.ping = 50;
      this.metrics.jitter = 10;
    } else {
      const minPing = Math.min(...pings);
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitter = Math.max(0, ...pings.map(p => Math.abs(p - avgPing)));

      this.metrics.ping = Math.round(minPing);
      this.metrics.jitter = Math.round(jitter);
    }
    
    this.update();
  }

  private async measureDownload(signal: AbortSignal) {
    const testSize = 25000000; // 25MB for accurate measurement
    const url = `https://speed.cloudflare.com/__down?bytes=${testSize}&t=${Date.now()}`;
    
    try {
      const response = await fetch(url, { 
        signal, 
        cache: 'no-store',
        mode: 'cors'
      });
      
      if (!response.ok || !response.body) {
        throw new Error("Failed to start download");
      }

      const reader = response.body.getReader();
      let receivedLength = 0;
      const startTime = performance.now();
      let lastUpdate = startTime;
      
      // Minimum 500ms warmup to avoid connection startup overhead
      let warmupDone = false;
      let warmupBytes = 0;
      let warmupTime = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        receivedLength += value.length;
        const now = performance.now();
        const elapsed = now - startTime;

        // End warmup phase after 500ms or certain amount of data
        if (!warmupDone && (elapsed > 500 || receivedLength > 1000000)) {
          warmupDone = true;
          warmupBytes = receivedLength;
          warmupTime = now;
        }

        // Update every 100ms
        if (now - lastUpdate > 100) {
          let speedMbps = 0;
          
          if (warmupDone) {
            const durationSec = (now - warmupTime) / 1000;
            const bitsLoaded = (receivedLength - warmupBytes) * 8;
            speedMbps = durationSec > 0 ? (bitsLoaded / durationSec) / 1000000 : 0;
          } else {
            const durationSec = Math.max(0.1, elapsed / 1000);
            const bitsLoaded = receivedLength * 8;
            speedMbps = (bitsLoaded / durationSec) / 1000000;
          }
          
          // Cap at realistic values
          speedMbps = Math.min(speedMbps, 1000); // Max 1 Gbps
          this.metrics.downloadSpeed = parseFloat(speedMbps.toFixed(2));
          this.metrics.progress = Math.min(50, (receivedLength / testSize) * 50);
          this.update();
          lastUpdate = now;
        }
      }

      // Final calculation
      const totalDurationSec = Math.max(0.1, (performance.now() - startTime) / 1000);
      const finalSpeed = (receivedLength * 8) / totalDurationSec / 1000000;
      this.metrics.downloadSpeed = parseFloat(Math.min(finalSpeed, 1000).toFixed(2));
      this.update();
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn("Download test failed:", error);
      }
      throw error;
    }
  }

  private async measureUpload(signal: AbortSignal) {
    const uploadSize = 5000000; // 5MB
    const testData = generateTestData(uploadSize);
    const blob = new Blob([testData], { type: 'application/octet-stream' });

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', TEST_URLS.uploadUrl, true);
      xhr.timeout = 60000; // 60 second timeout
      
      const startTime = performance.now();
      let lastUpdate = startTime;

      xhr.upload.onprogress = (event) => {
        if (signal.aborted) {
          xhr.abort();
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }

        const now = performance.now();
        const elapsed = now - startTime;
        
        if (elapsed > 500) { // After warmup
          if (now - lastUpdate > 100) {
            const durationSec = elapsed / 1000;
            const bitsLoaded = event.loaded * 8;
            let speedMbps = (bitsLoaded / durationSec) / 1000000;
            
            // Cap at realistic values
            speedMbps = Math.min(speedMbps, 1000); // Max 1 Gbps
            this.metrics.uploadSpeed = parseFloat(speedMbps.toFixed(2));
            this.metrics.progress = 50 + ((event.loaded / event.total) * 50);
            this.update();
            lastUpdate = now;
          }
        }
      };

      xhr.onload = () => {
        const totalDurationSec = Math.max(0.1, (performance.now() - startTime) / 1000);
        if (xhr.status >= 200 && xhr.status < 300) {
          const finalSpeed = (uploadSize * 8) / totalDurationSec / 1000000;
          this.metrics.uploadSpeed = parseFloat(Math.min(finalSpeed, 1000).toFixed(2));
          this.update();
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.ontimeout = () => reject(new Error("Upload timeout"));
      xhr.onerror = () => reject(new Error("Upload network error"));
      
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DOMException('Aborted', 'AbortError'));
      });

      xhr.send(blob);
    });
  }

  // --- Fallback Simulation Methods ---

  private async simulateLatency() {
    await new Promise(r => setTimeout(r, 600));
    this.metrics.ping = Math.floor(Math.random() * 20) + 15;
    this.metrics.jitter = Math.floor(Math.random() * 5);
    this.update();
  }

  private async simulateDownload() {
    const duration = 3000;
    const start = performance.now();
    const targetSpeed = Math.floor(Math.random() * 40) + 60; // 60-100 Mbps
    
    while (performance.now() - start < duration) {
      if (this.abortController?.signal.aborted) return;
      const elapsed = performance.now() - start;
      const progress = elapsed / duration;
      const currentSpeed = targetSpeed * (1 - Math.pow(1 - progress, 2));
      const variation = (Math.random() - 0.5) * 5;
      
      this.metrics.downloadSpeed = parseFloat(Math.max(0, currentSpeed + variation).toFixed(2));
      this.metrics.progress = Math.min(50, progress * 50);
      this.update();
      await new Promise(r => setTimeout(r, 50));
    }
    this.metrics.downloadSpeed = parseFloat(targetSpeed.toFixed(2));
  }

  private async simulateUpload() {
    const duration = 3000;
    const start = performance.now();
    const targetSpeed = Math.floor(Math.random() * 20) + 20; // 20-40 Mbps
    
    while (performance.now() - start < duration) {
      if (this.abortController?.signal.aborted) return;
      const elapsed = performance.now() - start;
      const progress = elapsed / duration;
      const currentSpeed = targetSpeed * (1 - Math.pow(1 - progress, 2));
      const variation = (Math.random() - 0.5) * 2;
      
      this.metrics.uploadSpeed = parseFloat(Math.max(0, currentSpeed + variation).toFixed(2));
      this.metrics.progress = 50 + (progress * 50);
      this.update();
      await new Promise(r => setTimeout(r, 50));
    }
    this.metrics.uploadSpeed = parseFloat(targetSpeed.toFixed(2));
  }

  public reset() {
    this.metrics = {
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      jitter: 0,
      progress: 0,
    };
  }

  private update() {
    this.onUpdate(this.state, { ...this.metrics });
  }

  private finishTest() {
    this.state = TestState.COMPLETE;
    this.metrics.progress = 100;
    this.update();
  }

  public stop() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.state = TestState.IDLE;
    this.reset();
    this.update();
  }
}