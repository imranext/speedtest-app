export enum TestState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface SpeedMetrics {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  progress: number; // 0-100
  clientIp?: string;
  isp?: string;
  location?: string;
}

export interface AiInsight {
  status: 'loading' | 'success' | 'error' | 'idle';
  content: string;
}