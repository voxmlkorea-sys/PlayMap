import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Calendar, DollarSign, Tag, Receipt, ChevronDown, ChevronUp, TrendingDown, Building2, Link } from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onAddTransaction: (tx: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const LedgerModal: React.FC<Props> = ({ isOpen, onClose, transactions, onAddTransaction, onDeleteTransaction }) => {
  // Default to Feb 2026 to show mock data immediately
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-01'));
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Form State
  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        tDate.getFullYear() === currentDate.getFullYear() && 
        tDate.getMonth() === currentDate.getMonth()
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentDate]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const dateKey = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const totalSpent = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const toggleExpand = (id: string) => {
    setExpandedTxId(prev => prev === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchant || !newAmount) return;

    onAddTransaction({
      merchantName: newMerchant,
      amount: parseFloat(newAmount),
      category: newCategory,
      date: new Date(newDate).toISOString(),
      currency: 'USD',
      countryCode: 'US',
      status: 'completed'
    });

    // Reset Form
    setNewMerchant('');
    setNewAmount('');
    setIsAdding(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-lg h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white shrink-0">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-indigo-200" />
                  Expense Ledger
                </h2>
                <p className="text-indigo-200 text-sm mt-1">Manage your spending manually</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
           </div>

           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-indigo-700/50 rounded-lg p-1">
                 <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-5 h-5" /></button>
                 <span className="font-bold w-24 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                 <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="text-right">
                 <div className="text-indigo-200 text-xs uppercase font-bold">Total</div>
                 <div className="text-2xl font-bold">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
           
           {/* Add Button */}
           {!isAdding && (
             <button 
               onClick={() => setIsAdding(true)}
               className="w-full py-3 mb-4 border-2 border-dashed border-indigo-200 rounded-xl flex items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
             >
               <Plus className="w-5 h-5" />
               Add Manual Transaction
             </button>
           )}

           {/* Add Form */}
           {isAdding && (
             <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 mb-6 animate-in slide-in-from-top-4">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">New Entry</h3>
                  <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
               </div>
               
               <div className="space-y-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="Amount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Merchant / Item Name" 
                    value={newMerchant}
                    onChange={(e) => setNewMerchant(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <select 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none appearance-none"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                        />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 mt-2">
                    Save Entry
                  </button>
               </div>
             </form>
           )}

           {/* List */}
           <div className="space-y-6">
             {Object.keys(groupedTransactions).length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  No transactions for this month.
               </div>
             ) : (
               Object.entries(groupedTransactions).map(([date, rawTxs]) => {
                 // Fix: Explicitly cast to Transaction[] to avoid 'unknown' type errors
                 const txs = rawTxs as Transaction[];
                 const dailyTotal = txs.reduce((acc, curr) => acc + curr.amount, 0);

                 return (
                 <div key={date}>
                   <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-10 flex items-center gap-2 mb-2">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{date}</span>
                     <div className="h-px bg-gray-200 flex-1" />
                     <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                        ${dailyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </span>
                   </div>
                   
                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                     {txs.map(tx => {
                       const isScanned = (tx.memo || '').includes('Subtotal:') || !!tx.receiptData;
                       const isManual = tx.id.startsWith('manual_');
                       const isPlaid = !isScanned && !isManual;
                       const isExpanded = expandedTxId === tx.id;

                       return (
                       <div key={tx.id} className="flex flex-col group transition-all duration-200">
                         {/* Main Row */}
                         <div 
                           className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
                           onClick={() => isScanned && toggleExpand(tx.id)}
                         >
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 relative">
                                {tx.category.slice(0, 2).toUpperCase()}
                                {isPlaid && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-100" title="Plaid Linked">
                                        <Building2 className="w-3 h-3 text-gray-400" />
                                    </div>
                                )}
                             </div>
                             <div className="min-w-0">
                               <div className="font-bold text-gray-900 truncate">{tx.merchantName}</div>
                               <div className="text-xs text-gray-500 flex items-center gap-2">
                                 <span>{tx.category}</span>
                                 {isScanned && (
                                   <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold flex items-center gap-0.5">
                                      <Receipt className="w-3 h-3" /> Scanned
                                   </span>
                                 )}
                                 {isPlaid && (
                                   <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold flex items-center gap-0.5">
                                      <Link className="w-3 h-3" /> Linked
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">
                                  ${tx.amount.toFixed(2)}
                              </span>
                              
                              {/* Expand/Collapse Chevron for Scanned items */}
                              {isScanned && (
                                <div className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                   <ChevronDown className="w-4 h-4" />
                                </div>
                              )}

                              <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTransaction(tx.id);
                                  }}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                         </div>
                         
                         {/* Expanded Detail View */}
                         {isExpanded && isScanned && (
                            <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">
                               <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm">
                                  <div className="flex justify-between items-center mb-2 border-b border-dashed border-gray-200 pb-2">
                                     <span className="font-bold text-gray-700">Receipt Details</span>
                                     <span className="text-xs text-gray-400">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  
                                  {tx.receiptData ? (
                                     <div className="space-y-1.5">
                                        {tx.receiptData.items.map((item, idx) => (
                                           <div key={idx} className="flex flex-col text-xs">
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">{item.name} {item.quantity && item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                                                <span className="font-medium">${item.price.toFixed(2)}</span>
                                              </div>
                                              {item.cheaperAlternative && (
                                                 <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-max mt-0.5">
                                                    <TrendingDown className="w-3 h-3" />
                                                    <span>Better price at {item.cheaperAlternative.store}: ${item.cheaperAlternative.price}</span>
                                                 </div>
                                              )}
                                           </div>
                                        ))}
                                        <div className="border-t border-gray-100 my-1 pt-1 space-y-1 mt-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Subtotal</span>
                                                <span>${tx.receiptData.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Tax</span>
                                                <span>${tx.receiptData.tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Tip</span>
                                                <span>${tx.receiptData.tip.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1 mt-1">
                                                <span>Total</span>
                                                <span>${tx.receiptData.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                     </div>
                                  ) : (
                                     <div className="text-xs text-gray-500 italic">
                                        {tx.memo || "Detailed receipt data unavailable for this item."}
                                     </div>
                                  )}
                               </div>
                            </div>
                         )}
                       </div>
                     )})}
                   </div>
                 </div>
               )})
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerModal;