import React, { useState, useEffect, useRef } from 'react';
import Gauge from './components/Gauge';
import StatCard from './components/StatCard';
import AiInsights from './components/AiInsights';
import { SpeedTestEngine, fetchClientInfo } from './services/networkService';
import { getNetworkInsights } from './services/geminiService';
import { TestState, SpeedMetrics, AiInsight } from './types';

const App: React.FC = () => {
  const [testState, setTestState] = useState<TestState>(TestState.IDLE);
  const [metrics, setMetrics] = useState<SpeedMetrics>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    jitter: 0,
    progress: 0,
  });
  const [clientInfo, setClientInfo] = useState({ ip: '...', isp: '...', location: '' });
  const [insight, setInsight] = useState<AiInsight>({ status: 'idle', content: '' });
  const [showDetails, setShowDetails] = useState(false);
  
  const engineRef = useRef<SpeedTestEngine | null>(null);

  useEffect(() => {
    // Initialize user info on mount
    fetchClientInfo().then(info => setClientInfo(info));

    engineRef.current = new SpeedTestEngine((newState, newMetrics) => {
      setTestState(newState);
      setMetrics(newMetrics);
      
      // Auto-show details when test completes
      if (newState === TestState.COMPLETE) {
        setShowDetails(true);
      }
    });

    return () => {
      if (engineRef.current) engineRef.current.stop();
    };
  }, []);

  const handleStart = () => {
    setInsight({ status: 'idle', content: '' });
    setShowDetails(false);
    engineRef.current?.start();
  };

  const handleStop = () => {
    engineRef.current?.stop();
    setTestState(TestState.IDLE);
  };

  const handleAiAnalysis = async () => {
    if (testState !== TestState.COMPLETE) return;
    setInsight({ status: 'loading', content: '' });
    const result = await getNetworkInsights(metrics);
    setInsight({ status: 'success', content: result });
  };

  // Display Logic:
  // 1. If Uploading, show Upload Speed.
  // 2. If Complete, show Download Speed (as per FAST.com style, main number is Download).
  // 3. Otherwise (Idle/Connecting/Downloading), show Download Speed.
  const displaySpeed = testState === TestState.UPLOAD 
    ? metrics.uploadSpeed 
    : metrics.downloadSpeed;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-1">
          {/* Logo Icon - Red Speedometer style */}
          <svg className="w-8 h-8 text-[#e50914]" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 2.45V11h2.55c.16.63.26 1.3.26 2 0 2.62-1.23 4.96-3.14 6.46L11 17.8c1.55-1.2 2.55-3.08 2.55-5.18 0-.46-.07-.9-.19-1.32H11V6.45h2z" opacity=".9"/>
          </svg>
          <div className="flex items-center tracking-tighter">
            <span className="text-2xl font-bold text-black">Speed</span>
            <span className="text-2xl font-bold text-[#e50914]">X</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
           {/* Clean header */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
        
        <div className="w-full max-w-4xl p-4 transition-all duration-500 ease-in-out flex flex-col items-center">
          
          <div className="text-center mb-4">
            <h2 className="text-lg text-gray-800 font-medium">Your Internet speed is</h2>
          </div>

          <Gauge 
            speed={displaySpeed}
            progress={metrics.progress}
            state={testState}
            onRestart={handleStart}
          />

          {/* Details Section (Pastel Boxes) */}
          <div className={`mt-12 w-full transition-all duration-700 overflow-hidden ${showDetails || testState === TestState.UPLOAD || testState === TestState.COMPLETE ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              
              {/* Upload (Blue) */}
              <StatCard 
                label="Uploaded" 
                value={metrics.uploadSpeed > 0 ? metrics.uploadSpeed.toFixed(1) : '-'} 
                unit="Mbps" 
                colorClass="bg-[#eaf3fa]" // Light Blue
                textColorClass="text-gray-900"
              />

              {/* Latency (Yellow/Beige) */}
              <StatCard 
                label="Latency" 
                value={testState === TestState.IDLE ? '-' : `${metrics.ping}`} 
                unit="ms"
                subValue={`Jitter: ${metrics.jitter} ms`} 
                colorClass="bg-[#fcf8e3]" // Light Yellow
                textColorClass="text-gray-900"
              />
              
               {/* Download (Green) - "Speed" */}
              <StatCard 
                label="Download" 
                value={metrics.downloadSpeed.toFixed(1)} 
                unit="Mbps" 
                colorClass="bg-[#e6f4ea]" // Light Green
                textColorClass="text-gray-900"
              />
            </div>
            
            {/* Client & Server Info Row */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center max-w-3xl mx-auto text-sm text-gray-500 w-full px-4 border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 items-center w-full justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Client:</span>
                  <span>{clientInfo.ip}</span>
                  {clientInfo.location && clientInfo.location !== 'Unknown' && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{clientInfo.location}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Server:</span>
                  <span>Cloudflare Edge</span>
                </div>
              </div>
            </div>
            
            {/* AI Insights Section */}
            {testState === TestState.COMPLETE && (
               <div className="max-w-3xl mx-auto w-full">
                 <AiInsights insight={insight} onAnalyze={handleAiAnalysis} />
               </div>
            )}
          </div>

          {!showDetails && testState === TestState.COMPLETE && (
            <div className="mt-12 text-center">
               <button onClick={() => setShowDetails(true)} className="text-sm font-medium text-gray-500 border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-100 hover:text-black transition-colors">Show more info</button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-sm text-gray-400">
        <div className="flex flex-col sm:flex-row justify-between max-w-6xl mx-auto gap-4 items-center">
          <div className="flex gap-1 items-center">
             <span className="text-gray-500 text-xs font-semibold tracking-wider">POWERED BY</span>
             <a 
               href="https://imran.pro.bd" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="font-bold text-[#e50914] hover:opacity-80 transition-opacity ml-1"
             >
               ImranX
             </a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;