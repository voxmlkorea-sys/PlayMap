
import React from 'react';

interface Props {
  currentPeriod: 'today' | 'weekly' | 'monthly' | 'all';
  onSelectPeriod: (period: 'today' | 'weekly' | 'monthly' | 'all') => void;
}

const DateFilter: React.FC<Props> = ({ currentPeriod, onSelectPeriod }) => {
  const labels = {
    today: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    all: 'All Time'
  };

  return (
    <div className="absolute top-32 left-0 w-full z-[450] px-4 pointer-events-none">
      <div className="flex gap-2 pointer-events-auto overflow-x-auto no-scrollbar pb-2">
         {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
             <button
               key={key}
               onClick={() => onSelectPeriod(key)}
               className={`
                 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border transition-all whitespace-nowrap
                 ${currentPeriod === key 
                    ? 'bg-gray-900 text-white border-gray-900 scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                 }
               `}
             >
               {labels[key]}
             </button>
         ))}
      </div>
    </div>
  );
};

export default DateFilter;
