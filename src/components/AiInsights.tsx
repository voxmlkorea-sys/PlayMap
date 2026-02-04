
import React, { useEffect, useState } from 'react';
import { Transaction, BudgetConfig } from '../types';
import { generateSpendingInsight } from '../services/geminiService';
import { Sparkles, Loader2, Smile, Bot, Megaphone, Coins } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  persona?: string;
  budgetConfig?: BudgetConfig;
}

const AiInsights: React.FC<Props> = ({ transactions, persona = 'standard', budgetConfig }) => {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Prevent infinite loops / redundant calls
    let isMounted = true;
    
    const fetchInsight = async () => {
      setLoading(true);
      const result = await generateSpendingInsight(transactions, persona, budgetConfig);
      if (isMounted) {
        setInsight(result);
        setLoading(false);
      }
    };

    fetchInsight();
    
    return () => { isMounted = false; };
  }, [transactions, persona, budgetConfig]); // Re-run if persona or budget changes

  if (!process.env.API_KEY) return null;

  const getPersonaIcon = () => {
      switch (persona) {
          case 'mom': return <Smile className="w-5 h-5 text-pink-300" />;
          case 'robot': return <Bot className="w-5 h-5 text-gray-300" />;
          case 'cheerleader': return <Megaphone className="w-5 h-5 text-yellow-300" />;
          case 'scrooge': return <Coins className="w-5 h-5 text-amber-200" />;
          default: return <Sparkles className="w-5 h-5 text-yellow-300" />;
      }
  };

  const getPersonaColor = () => {
      switch (persona) {
          case 'mom': return 'from-pink-500 to-rose-500';
          case 'robot': return 'from-slate-700 to-gray-800';
          case 'cheerleader': return 'from-orange-500 to-yellow-500';
          case 'scrooge': return 'from-amber-700 to-yellow-700'; // Miserly gold/brown
          default: return 'from-indigo-600 to-violet-600';
      }
  };

  const getPersonaTitle = () => {
      switch (persona) {
          case 'mom': return 'Mom\'s Advice';
          case 'robot': return 'System Analysis';
          case 'cheerleader': return 'Cheer Squad';
          case 'scrooge': return 'Scrooge\'s Review';
          default: return 'AI Spending Insights';
      }
  };

  return (
    <div className={`bg-gradient-to-r ${getPersonaColor()} rounded-xl p-4 text-white shadow-lg mb-4 flex items-start gap-3 transition-colors duration-500`}>
      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
        {getPersonaIcon()}
      </div>
      <div className="flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">{getPersonaTitle()}</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-white/70">
             <Loader2 className="w-3 h-3 animate-spin" />
             <span>Thinking...</span>
          </div>
        ) : (
          <p className="text-sm font-medium leading-relaxed">
            "{insight}"
          </p>
        )}
      </div>
    </div>
  );
};

export default AiInsights;
