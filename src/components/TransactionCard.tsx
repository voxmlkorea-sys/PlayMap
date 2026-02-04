import React, { useMemo, useState } from 'react';
import { Transaction, Offer } from '../types';
import { ShoppingBag, Coffee, Utensils, Fuel, Store, Globe, Plane, Info, Image as ImageIcon, FileText, Lock, Globe2, Share2, Check, Users, Sparkles, Monitor, Cloud } from 'lucide-react';

interface Props {
  transaction: Transaction;
  offers: Offer[];
  onClick?: () => void;
  onCategoryChange?: (newCategory: string) => void;
  hideAmount?: boolean;
}

const TransactionCard: React.FC<Props> = ({ transaction, offers, onClick, onCategoryChange, hideAmount }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const isForeign = transaction.originalCurrency && transaction.originalCurrency !== 'USD';
  const isMine = transaction.user?.isCurrentUser ?? true; // Default to true if user not defined
  const isOnline = !transaction.location;

  // Flag mapping based on country code
  const getFlag = (code?: string) => {
    switch(code) {
      case 'US': return '🇺🇸';
      case 'JP': return '🇯🇵';
      case 'FR': return '🇫🇷';
      case 'KR': return '🇰🇷';
      case 'GB': return '🇬🇧';
      default: return '🌍';
    }
  };

  const matchedOffer = useMemo(() => {
    return offers.find(o => {
      const tName = transaction.merchantName.toLowerCase();
      const oName = o.merchantName.toLowerCase();
      // Check for bidirectional inclusion for better mock matching
      return tName.includes(oName) || oName.includes(tName);
    });
  }, [transaction.merchantName, offers]);

  const getIcon = (category: string) => {
    if (isOnline) return <Cloud className="w-5 h-5" />;
    
    switch (category) {
      case 'Dining': case 'Restaurant': return <Utensils className="w-5 h-5" />;
      case 'Cafe': return <Coffee className="w-5 h-5" />;
      case 'Convenience Store': return <Store className="w-5 h-5" />;
      case 'Shopping': case 'Clothing & Accessories': return <ShoppingBag className="w-5 h-5" />;
      case 'Transport': return <Fuel className="w-5 h-5" />;
      case 'Travel': return <Plane className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopied(true);
    // Simulate clipboard copy
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe2 className="w-3 h-3 text-green-500" />;
      case 'friends': return <Users className="w-3 h-3 text-indigo-500" />;
      default: return <Lock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'friends': return 'Friends';
      default: return 'Private';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-xl bg-white shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md group mb-3
        ${matchedOffer ? 'border-2 border-green-500 bg-green-50/30 ring-1 ring-green-100' : 'border border-gray-100'}
      `}
    >
      {/* Social Header (Friend's post) */}
      {!isMine && transaction.user && (
         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-50">
            <img src={transaction.user.avatarUrl} alt={transaction.user.name} className="w-6 h-6 rounded-full bg-gray-200" />
            <span className="text-xs font-bold text-gray-700">{transaction.user.name}</span>
            <span className="text-[10px] text-gray-400">• Shared a memory</span>
         </div>
      )}

      {/* Main Row */}
      <div className="flex items-start justify-between mt-1">
        {/* Left: Icon + Text */}
        <div className="flex items-center gap-3">
          <div className={`
            p-2.5 rounded-full shrink-0 relative
            ${matchedOffer ? 'bg-green-100 text-green-700' : (isOnline ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600')}
          `}>
            {getIcon(transaction.category)}
            {/* Small Flag indicator on icon for foreign tx */}
            {isForeign && (
              <span className="absolute -bottom-1 -right-1 text-sm leading-none drop-shadow-md">
                {getFlag(transaction.countryCode)}
              </span>
            )}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate pr-2 flex items-center gap-1">
              {transaction.merchantName}
            </h3>
            
            <div className="flex items-center flex-wrap gap-y-1 mt-0.5">
               {/* Category Chip */}
               <div className="flex items-center gap-0.5 text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mr-1">
                  {transaction.category}
               </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                 <span>{new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                 {isOnline && (
                     <span className="flex items-center gap-0.5 text-blue-500 font-medium">
                         • Online
                     </span>
                 )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Amount + Badges */}
        {!hideAmount && (
          <div className="text-right shrink-0 ml-2 flex flex-col items-end">
             {/* Stacked Badges to prevent overlap */}
             {matchedOffer && (
                <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm mb-1 whitespace-nowrap flex items-center gap-1 animate-in zoom-in duration-300">
                   <Sparkles className="w-3 h-3 fill-current" />
                   Cashback Pending
                </div>
             )}
             {isForeign && !matchedOffer && (
               <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm mb-1 whitespace-nowrap">
                   {transaction.originalCurrency} Payment
               </div>
             )}

            {/* Main Amount (USD) */}
            <p className="font-bold text-gray-900 text-lg leading-tight">
              ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            
            {/* Sub Amount (Original Currency if Foreign) */}
            {isForeign && (
              <div className="flex flex-col items-end">
                <p className="text-xs text-gray-500 font-medium font-mono mt-0.5">
                   {transaction.originalCurrency} {transaction.originalAmount?.toLocaleString()}
                </p>
              </div>
            )}

            {matchedOffer && (
               <p className="text-xs text-green-600 font-bold mt-0.5">
                 +${(transaction.amount * matchedOffer.cashbackRate).toFixed(2)}
               </p>
            )}
          </div>
        )}
      </div>
      
      {/* Footer: Memory/Social Indicators */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            {(transaction.memo || transaction.photoUrl) ? (
                <>
                    {transaction.photoUrl && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                            <ImageIcon className="w-3 h-3 text-indigo-500" />
                            <span>Photo</span>
                        </div>
                    )}
                    {transaction.memo && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                            <FileText className="w-3 h-3 text-indigo-500" />
                            <span className="truncate max-w-[150px]">{transaction.memo}</span>
                        </div>
                    )}
                </>
            ) : (
                <span className="text-[10px] text-gray-300 italic">No details added</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                {getVisibilityIcon(transaction.visibility)}
                <span className="hidden sm:inline">{getVisibilityLabel(transaction.visibility)}</span>
              </div>
              
              {/* Share Button (Only if Public and Mine) */}
              {isMine && transaction.visibility === 'public' && (
                  <button 
                    onClick={handleShare}
                    className={`
                        ml-1 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all
                        ${isCopied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                  >
                      {isCopied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                      {isCopied ? 'Copied' : 'Share'}
                  </button>
              )}
          </div>
      </div>
    </div>
  );
};

export default TransactionCard;