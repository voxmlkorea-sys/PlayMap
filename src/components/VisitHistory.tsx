
import React from 'react';
import { Transaction } from '../types';
import { History, ArrowRight } from 'lucide-react';

interface Props {
  currentId: string;
  merchantName: string;
  transactions: Transaction[];
  onSelectTransaction: (id: string) => void;
}

const VisitHistory: React.FC<Props> = ({ currentId, merchantName, transactions, onSelectTransaction }) => {
  // Filter history: same merchant, is current user, exclude current displayed tx
  const history = transactions
    .filter(t => 
      t.merchantName.toLowerCase() === merchantName.toLowerCase() && 
      t.user.isCurrentUser &&
      t.id !== currentId
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (history.length === 0) return null;

  const totalSpent = history.reduce((acc, t) => acc + t.amount, 0);

  // Helper to determine recency label with unified design logic
  const getRecencyLabel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Unified Logic: If it's in the current month, label it "This Month" regardless of whether it is Today or This Week.
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return "This Month";
    }

    return null;
  };

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          Visit History
        </h4>
        <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full shadow-sm">
          {history.length} previous visits
        </span>
      </div>

      <div className="max-h-60 overflow-y-auto">
        {history.map((tx, index) => {
           const recencyLabel = getRecencyLabel(tx.date);
           const isRecent = !!recencyLabel;
           
           return (
            <button 
                key={tx.id}
                onClick={() => onSelectTransaction(tx.id)}
                className="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-center justify-between group last:border-0"
            >
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                        ${isRecent ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}
                    `}>
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[9px] uppercase opacity-70">
                                {new Date(tx.date).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span>
                                {new Date(tx.date).getDate()}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            {tx.category}
                            {recencyLabel && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-bold border border-indigo-100">
                                    {recencyLabel}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">
                            {tx.memo || "No memo"}
                        </div>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                        ${tx.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5">
                        View <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </button>
           );
        })}
      </div>
      
      <div className="p-3 bg-gray-50 text-right border-t border-gray-100">
          <p className="text-xs text-gray-500">
              Total spent previously: <span className="font-bold text-gray-900">${totalSpent.toFixed(2)}</span>
          </p>
      </div>
    </div>
  );
};

export default VisitHistory;
