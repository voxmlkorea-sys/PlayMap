
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X, PieChart, TrendingUp, ChevronLeft, ChevronRight, Calendar, ArrowRight, ListFilter, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Transaction, BudgetConfig } from '../types';
import AiInsights from './AiInsights';
import TransactionCard from './TransactionCard';
import { MOCK_OFFERS } from '../constants'; // Import offers for the card

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgetConfig: BudgetConfig;
  aiPersona?: string;
}

type ReportMode = 'month' | 'range';

const MonthlyReportModal: React.FC<Props> = ({ isOpen, onClose, transactions, budgetConfig, aiPersona = 'standard' }) => {
  const [mode, setMode] = useState<ReportMode>('month');
  
  // Helper for local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // State for Month Mode (Default: Today)
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthInputRef = useRef<HTMLInputElement>(null);

  // State for Range Mode (Default: Start of this month - Today)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
        start: getLocalDateString(start),
        end: getLocalDateString(now)
    };
  });

  // State for selecting a specific day in the calendar
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Reset/Sync to Budget Config when modal opens
  useEffect(() => {
    if (isOpen) {
        const now = new Date();
        setSelectedDay(null);

        // SYNC LOGIC: Set initial view based on Budget Config
        if (budgetConfig.amount > 0) {
            if (budgetConfig.period === 'custom' && budgetConfig.customStart && budgetConfig.customEnd) {
                // Case: Custom Range -> Switch to Range Mode
                setMode('range');
                setDateRange({
                    start: budgetConfig.customStart,
                    end: budgetConfig.customEnd
                });
            } else if (budgetConfig.period === 'weekly') {
                // Case: Weekly -> Switch to Range Mode (This week)
                setMode('range');
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
                const monday = new Date(now.setDate(diff));
                const sunday = new Date(now.setDate(monday.getDate() + 6));
                setDateRange({
                    start: getLocalDateString(monday),
                    end: getLocalDateString(sunday)
                });
            } else if (budgetConfig.period === 'yearly') {
                // Case: Yearly -> Switch to Range Mode (This Year)
                setMode('range');
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                setDateRange({
                    start: getLocalDateString(startOfYear),
                    end: getLocalDateString(endOfYear)
                });
            } else {
                // Case: Monthly (Default) -> Month Mode
                setMode('month');
                setCurrentDate(new Date());
            }
        } else {
            // No Budget Set -> Default to current Month
            setMode('month');
            setCurrentDate(new Date());
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            setDateRange({
                start: getLocalDateString(start),
                end: getLocalDateString(now)
            });
        }
    }
  }, [isOpen, budgetConfig]);

  // Reset selected day when month changes
  useEffect(() => {
    setSelectedDay(null);
  }, [currentDate]);

  // Filter transactions based on active mode
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);

      if (mode === 'month') {
        return (
          tDate.getFullYear() === currentDate.getFullYear() && 
          tDate.getMonth() === currentDate.getMonth()
        );
      } else {
        // Range Mode
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        // Set end date to end of day to include transactions on that day
        end.setHours(23, 59, 59, 999);
        
        return tDate >= start && tDate <= end;
      }
    });
  }, [transactions, mode, currentDate, dateRange]);

  // Filter transactions for the specifically selected day
  const selectedDayTransactions = useMemo(() => {
    if (selectedDay === null || mode !== 'month') return [];
    return filteredTransactions.filter(t => new Date(t.date).getDate() === selectedDay);
  }, [filteredTransactions, selectedDay, mode]);

  const totalSpent = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Calendar Data (Days of Month)
  const calendarDays = useMemo(() => {
    if (mode !== 'month') return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    // Padding for start of week (0=Sun)
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate, mode]);

  // Daily Spending Map for Calendar
  const dailySpending = useMemo(() => {
    const map = new Map<number, number>(); // day -> amount
    if (mode === 'month') {
        filteredTransactions.forEach(t => {
            const d = new Date(t.date).getDate();
            map.set(d, (map.get(d) || 0) + t.amount);
        });
    }
    return map;
  }, [filteredTransactions, mode]);

  // Calculate category breakdown
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + t.amount;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]); // Sort by amount desc
  }, [filteredTransactions]);

  // Budget Calculations (Visual Only - based on REPORT view)
  // Logic: Compare Total Spent in *Current View* vs Budget Goal
  const budgetStatus = useMemo(() => {
      if (budgetConfig.amount <= 0) return { progress: 0, isOver: false, remaining: 0, spent: 0 };
      
      const spent = totalSpent; // Use the total calculated from the *currently filtered* view
      const progress = (spent / budgetConfig.amount) * 100;
      
      return {
          progress: progress,
          isOver: progress > 100,
          remaining: Math.max(0, budgetConfig.amount - spent),
          spent: spent
      };
  }, [totalSpent, budgetConfig]);

  // Handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(new Date(e.target.value + '-01'));
    }
  };
  const handleRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };
  const handleDayClick = (day: number) => {
     // Toggle selection
     setSelectedDay(prev => prev === day ? null : day);
  };

  const formatMonthDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };
  const formatInputValue = (date: Date) => {
    return getLocalDateString(date).slice(0, 7); // YYYY-MM
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Spending Report</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => { setMode('month'); setSelectedDay(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => { setMode('range'); setSelectedDay(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'range' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Date Selection Controls */}
          <div className="mb-6">
            {mode === 'month' ? (
              <>
                {/* Month Picker Nav */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100 relative mb-4">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-indigo-600 hover:shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2 relative">
                    <span className="text-lg font-bold text-gray-900 select-none">
                      {formatMonthDisplay(currentDate)}
                    </span>
                    <button 
                      onClick={() => monthInputRef.current?.showPicker()}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <input 
                      ref={monthInputRef}
                      type="month"
                      value={formatInputValue(currentDate)}
                      onChange={handleMonthChange}
                      className="absolute inset-0 opacity-0 pointer-events-none" 
                    />
                  </div>

                  <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-indigo-600 hover:shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* BUDGET VISUALIZATION (Based on Config) */}
                {budgetConfig.amount > 0 && (
                    <div className="mb-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Target className="w-16 h-16 text-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-2 relative z-10">
                             <div className="flex items-center gap-1.5">
                                 <div className="bg-indigo-100 p-1 rounded-md text-indigo-600">
                                     <Target className="w-3.5 h-3.5" />
                                 </div>
                                 <div>
                                     <span className="text-[10px] font-bold text-gray-500 uppercase block leading-none mb-0.5">
                                         {budgetConfig.period === 'custom' ? 'Custom Goal' : `${budgetConfig.period} Goal`}
                                     </span>
                                     <div className="text-xs font-bold text-indigo-900">
                                         Target: ${budgetConfig.amount.toLocaleString()}
                                     </div>
                                 </div>
                             </div>
                             {/* Sync Indicator */}
                             {mode === 'month' && budgetConfig.period === 'monthly' && (
                                 <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                     <CheckCircle2 className="w-3 h-3" /> Active Period
                                 </div>
                             )}
                        </div>
                        
                        <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div 
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${budgetStatus.isOver ? 'bg-red-500' : (budgetStatus.progress > 80 ? 'bg-amber-500' : 'bg-green-500')}`}
                                style={{ width: `${Math.min(100, budgetStatus.progress)}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs relative z-10">
                             <span className={budgetStatus.isOver ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                {Math.round(budgetStatus.progress)}% Used (${budgetStatus.spent.toLocaleString()})
                             </span>
                             {budgetStatus.isOver ? (
                                 <span className="flex items-center gap-1 text-red-600 font-bold">
                                     <AlertTriangle className="w-3 h-3" />
                                     Over by ${Math.abs(budgetStatus.remaining).toLocaleString()}
                                 </span>
                             ) : (
                                 <span className="text-gray-500">
                                     ${budgetStatus.remaining.toLocaleString()} left
                                 </span>
                             )}
                        </div>
                    </div>
                )}

                {/* VISUAL CALENDAR GRID */}
                <div className="bg-white rounded-xl">
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                            <div key={d} className="text-[10px] uppercase text-gray-400 font-bold">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, idx) => {
                            if (!date) return <div key={`pad-${idx}`} className="aspect-square" />;
                            const day = date.getDate();
                            const spent = dailySpending.get(day);
                            const isSelected = selectedDay === day;
                            
                            return (
                                <button 
                                    key={day} 
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                      aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative border transition-all cursor-pointer hover:bg-gray-50
                                      ${isSelected 
                                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md z-10 scale-105' 
                                          : spent 
                                              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold' 
                                              : 'bg-transparent border-transparent text-gray-400'
                                      }
                                    `}
                                >
                                    <span>{day}</span>
                                    {/* Dot indicator for spending */}
                                    {spent && !isSelected && <div className="w-1 h-1 bg-indigo-500 rounded-full mt-0.5" />}
                                    {/* Dot indicator for selected (white) */}
                                    {spent && isSelected && <div className="w-1 h-1 bg-white/70 rounded-full mt-0.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Transaction List */}
                {selectedDay !== null && (
                    <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <ListFilter className="w-4 h-4 text-indigo-500" />
                                {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay} Transactions
                            </h4>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {selectedDayTransactions.length} Items
                            </span>
                        </div>
                        
                        <div className="space-y-2 bg-gray-50/50 p-2 rounded-xl border border-gray-100 max-h-60 overflow-y-auto">
                            {selectedDayTransactions.length > 0 ? (
                                selectedDayTransactions.map(t => (
                                    <TransactionCard 
                                        key={t.id} 
                                        transaction={t} 
                                        offers={MOCK_OFFERS}
                                    />
                                ))
                            ) : (
                                <div className="py-4 text-center text-xs text-gray-400">
                                    No transactions on this day.
                                </div>
                            )}
                        </div>
                    </div>
                )}
              </>
            ) : (
              /* RANGE PICKER */
              <>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                <div className="flex-1 relative">
                  <label className="text-[10px] uppercase text-gray-400 font-bold ml-1 mb-0.5 block">Start Date</label>
                  <input 
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleRangeChange('start', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="pt-5">
                   <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold ml-1 mb-0.5 block">End Date</label>
                  <input 
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleRangeChange('end', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* BUDGET VISUALIZATION (RANGE MODE) */}
              {budgetConfig.amount > 0 && (
                    <div className="mb-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Target className="w-16 h-16 text-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-2 relative z-10">
                             <div className="flex items-center gap-1.5">
                                 <div className="bg-indigo-100 p-1 rounded-md text-indigo-600">
                                     <Target className="w-3.5 h-3.5" />
                                 </div>
                                 <div>
                                     <span className="text-[10px] font-bold text-gray-500 uppercase block leading-none mb-0.5">
                                         {budgetConfig.period === 'custom' ? 'Custom Range Goal' : `${budgetConfig.period} Goal`}
                                     </span>
                                     <div className="text-xs font-bold text-indigo-900">
                                         Target: ${budgetConfig.amount.toLocaleString()}
                                     </div>
                                 </div>
                             </div>
                             
                             {/* Range Match Indicator */}
                             {(budgetConfig.period === 'custom' || budgetConfig.period === 'weekly' || budgetConfig.period === 'yearly') && (
                                 <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                     <CheckCircle2 className="w-3 h-3" /> Active Period
                                 </div>
                             )}
                        </div>
                        
                        <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div 
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${budgetStatus.isOver ? 'bg-red-500' : (budgetStatus.progress > 80 ? 'bg-amber-500' : 'bg-green-500')}`}
                                style={{ width: `${Math.min(100, budgetStatus.progress)}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs relative z-10">
                             <span className={budgetStatus.isOver ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                {Math.round(budgetStatus.progress)}% Used (${budgetStatus.spent.toLocaleString()})
                             </span>
                             {budgetStatus.isOver ? (
                                 <span className="flex items-center gap-1 text-red-600 font-bold">
                                     <AlertTriangle className="w-3 h-3" />
                                     Over by ${Math.abs(budgetStatus.remaining).toLocaleString()}
                                 </span>
                             ) : (
                                 <span className="text-gray-500">
                                     ${budgetStatus.remaining.toLocaleString()} left
                                 </span>
                             )}
                        </div>
                    </div>
                )}
              </>
            )}
          </div>

          {/* AI Insights Section (Updates based on filtered transactions) */}
          <div className="mb-6">
            {filteredTransactions.length > 0 ? (
               <AiInsights 
                 key={`${mode === 'month' ? currentDate.toISOString() : `${dateRange.start}-${dateRange.end}`}-${aiPersona}-${budgetConfig.amount}`} 
                 transactions={filteredTransactions} 
                 persona={aiPersona}
                 budgetConfig={budgetConfig}
               />
            ) : (
               <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-400 border border-dashed border-gray-200">
                  No transactions found for this period.
               </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-gray-500 text-xs mb-1">Total Spent</div>
              <div className="text-xl font-bold text-gray-900">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-gray-500 text-xs mb-1">Transactions</div>
              <div className="text-xl font-bold text-gray-900">
                {filteredTransactions.length}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {filteredTransactions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Top Categories
              </h3>
              <div className="space-y-3">
                {categoryStats.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                      <span className="text-sm text-gray-600 font-medium">{category}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto p-4 bg-gray-50 border-t border-gray-100 text-center rounded-b-2xl">
          <button 
            onClick={onClose}
            className="text-indigo-600 font-semibold text-sm hover:underline"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportModal;
