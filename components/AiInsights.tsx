import React from 'react';
import { AiInsight } from '../types';

interface AiInsightsProps {
  insight: AiInsight;
  onAnalyze: () => void;
}

const AiInsights: React.FC<AiInsightsProps> = ({ insight, onAnalyze }) => {
  if (insight.status === 'idle') {
    return (
      <div className="mt-8 flex justify-center">
        <button
          onClick={onAnalyze}
          className="flex items-center gap-2 text-gray-700 font-medium hover:text-black transition-colors border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-full shadow-sm"
        >
          <svg className="w-5 h-5 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Get AI Network Insights
        </button>
      </div>
    );
  }

  if (insight.status === 'loading') {
    return (
      <div className="mt-8 p-6 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#e50914]"></div>
        <span className="text-gray-600 font-medium">Analyzing connection...</span>
      </div>
    );
  }

  if (insight.status === 'error') {
    return (
      <div className="mt-8 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center">
        <p>{insight.content}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-8 rounded-lg bg-white border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
         <div className="p-1.5 bg-red-50 rounded-full">
           <svg className="w-5 h-5 text-[#e50914]" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
           </svg>
         </div>
         <h3 className="text-gray-900 font-semibold tracking-wide">Gemini Network Report</h3>
      </div>
      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{insight.content}</p>
    </div>
  );
};

export default AiInsights;