import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  subValue?: string;
  colorClass?: string;
  textColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  unit, 
  subValue, 
  colorClass = "bg-gray-100", 
  textColorClass = "text-gray-900" 
}) => {
  return (
    <div className={`flex flex-col p-6 rounded-lg ${colorClass} shadow-sm`}>
      <span className="text-gray-500 text-sm font-medium mb-2">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${textColorClass} tracking-tight`}>{value}</span>
        <span className="text-gray-500 text-sm font-medium">{unit}</span>
      </div>
      {subValue && (
        <span className="text-xs text-gray-400 mt-2">{subValue}</span>
      )}
    </div>
  );
};

export default StatCard;