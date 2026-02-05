import React from 'react';
import { TestState } from '../types';

interface GaugeProps {
  speed: number;
  progress: number;
  state: TestState;
  onRestart: () => void;
}

const Gauge: React.FC<GaugeProps> = ({ speed, progress, state, onRestart }) => {
  const isComplete = state === TestState.COMPLETE;
  const isIdle = state === TestState.IDLE;
  
  // Calculate circle stroke
  const radius = 120;
  const stroke = 4; // Thinner stroke for minimalist look
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Background Circle */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="absolute transform -rotate-90"
        >
          {/* Track */}
          <circle
            stroke={!isIdle ? "#e5e7eb" : "transparent"} /* Gray-200 or transparent if idle */
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle - Green when complete, Black/Green when running */}
          {!isIdle && (
            <circle
              stroke={isComplete ? "#22c55e" : "#1a1a1a"} /* Green-500 if complete, Black if running */
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center text-center">
          {state === TestState.CONNECTING ? (
            <div className="animate-pulse text-gray-400 font-medium text-xl">Connecting...</div>
          ) : (
            <>
              <div className={`text-7xl sm:text-8xl font-bold tracking-tighter ${isComplete ? 'text-[#22c55e]' : 'text-[#1a1a1a]'}`}>
                {speed.toFixed(1)}
              </div>
              <div className="text-gray-400 text-xl mt-2 font-medium">Mbps</div>
            </>
          )}
        </div>
      </div>

      {/* Restart/Action Button */}
      <div className="mt-4 h-16 flex items-center justify-center relative z-10">
        {isComplete && (
           <button 
             onClick={onRestart}
             className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
             aria-label="Restart Test"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
        )}
        {isIdle && (
           <button 
             onClick={onRestart}
             className="w-16 h-16 bg-white border-2 border-gray-200 text-black rounded-full flex items-center justify-center shadow-lg hover:border-black transition-all"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </button>
        )}
      </div>
    </div>
  );
};

export default Gauge;