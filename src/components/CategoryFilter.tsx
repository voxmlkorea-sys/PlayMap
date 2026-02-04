
import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../constants';
import { Search, X, Plane, Filter, ChevronDown, ChevronRight, Loader2, MapPin, Sparkles, Calendar, Globe } from 'lucide-react';
import { getPlaceSuggestions } from '../services/geminiService';
import { SearchResult, Offer } from '../types';

interface Props {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: () => void;
  isSearching?: boolean;
  onSuggestionSelect?: (result: SearchResult) => void;
  offers: Offer[];
  // Date Filtering Props
  currentPeriod: 'today' | 'weekly' | 'monthly' | 'all';
  onSelectPeriod: (period: 'today' | 'weekly' | 'monthly' | 'all') => void;
}

const CategoryFilter: React.FC<Props> = ({ 
  selectedCategory, 
  onSelectCategory, 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit, 
  isSearching,
  onSuggestionSelect,
  offers,
  currentPeriod,
  onSelectPeriod
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isDateExpanded, setIsDateExpanded] = useState(false);
  
  // Suggestion State
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const periodLabels = {
    today: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    all: 'All Time'
  };

  // Helper to find matching offer
  const findMatchingOffer = (placeName: string) => {
      const lowerName = placeName.toLowerCase();
      return offers.find(o => {
          const lowerMerchant = o.merchantName.toLowerCase();
          
          // 1. Direct inclusion check
          if (lowerName.includes(lowerMerchant) || lowerMerchant.includes(lowerName)) return true;
          
          // 2. First word check (Robustness for "AMC Empire" vs "AMC Theatres")
          const placeFirst = lowerName.split(' ')[0];
          const merchantFirst = lowerMerchant.split(' ')[0];
          if (placeFirst.length >= 3 && placeFirst === merchantFirst) return true;

          return false;
      });
  };

  // Debounced Search Logic
  useEffect(() => {
    if (!isSearchExpanded || searchTerm.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
    }

    // Clear previous timeout
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    setIsLoadingSuggestions(true);
    // Set new timeout (debounce) - REDUCED TO 300ms for faster feedback
    debounceTimeout.current = setTimeout(async () => {
        try {
            // Approx center (NYC) - ideally passed from props
            const results = await getPlaceSuggestions(searchTerm, { lat: 40.7580, lng: -73.9855 });
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, 300); 

    return () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm, isSearchExpanded]);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setIsCategoryExpanded(false);
    setIsDateExpanded(false);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    onSearchChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        setShowSuggestions(false); // Hide suggestions on submit
        onSearchSubmit();
    }
  };

  const toggleCategoryMenu = () => {
    setIsCategoryExpanded(!isCategoryExpanded);
    if (!isCategoryExpanded) {
      setIsSearchExpanded(false);
      setIsDateExpanded(false);
    }
  };

  const toggleDateMenu = () => {
    setIsDateExpanded(!isDateExpanded);
    if (!isDateExpanded) {
      setIsSearchExpanded(false);
      setIsCategoryExpanded(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    onSelectCategory(cat);
  };

  const handlePeriodSelect = (period: 'today' | 'weekly' | 'monthly' | 'all') => {
    onSelectPeriod(period);
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
      if (onSuggestionSelect) {
          onSuggestionSelect(suggestion);
      } else {
          onSearchChange(suggestion.name);
          onSearchSubmit();
      }
      setShowSuggestions(false);
      setSuggestions([]); // Clear to avoid showing stale data next time
  };

  return (
    <div className="absolute top-20 left-0 w-full z-[500] px-4 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto items-start">
        
        <div className="flex gap-2 items-center w-full relative">
          {/* Search Input Area */}
          <div className={`
            relative transition-all duration-300 ease-in-out shadow-lg rounded-full bg-white flex items-center border border-gray-100
            ${isSearchExpanded ? 'w-64 px-2' : 'w-10 h-10 justify-center cursor-pointer hover:bg-gray-50'}
          `}>
             {isSearchExpanded ? (
               <>
                 {isSearching || isLoadingSuggestions ? (
                    <Loader2 className="w-4 h-4 text-indigo-500 ml-2 shrink-0 animate-spin" />
                 ) : (
                    <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" onClick={onSearchSubmit} />
                 )}
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => onSearchChange(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Search places..."
                   className="w-full bg-transparent border-none focus:ring-0 text-sm px-2 py-2 outline-none"
                   autoFocus
                   onFocus={() => {
                       if(suggestions.length > 0) setShowSuggestions(true);
                   }}
                 />
                 <button onClick={handleCloseSearch} className="p-1 rounded-full hover:bg-gray-100">
                   <X className="w-4 h-4 text-gray-500" />
                 </button>
               </>
             ) : (
               <button onClick={handleSearchClick} className="w-full h-full flex items-center justify-center">
                 <Search className="w-5 h-5 text-gray-600" />
               </button>
             )}
          </div>

          {/* SUGGESTIONS DROPDOWN */}
          {showSuggestions && isSearchExpanded && (
              <div className="absolute top-12 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in">
                  <div className="max-h-60 overflow-y-auto">
                      {suggestions.map((item, idx) => {
                          const matchedOffer = findMatchingOffer(item.name);
                          
                          return (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(item)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors group relative"
                            >
                                <div className={`mt-0.5 p-1.5 rounded-full ${matchedOffer ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                    {matchedOffer ? <Sparkles className="w-3.5 h-3.5 fill-current" /> : <MapPin className="w-3.5 h-3.5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
                                        {matchedOffer && (
                                            <div className="shrink-0 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                                {Math.round(matchedOffer.cashbackRate * 100)}% BACK
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">{item.location.address}</div>
                                </div>
                            </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* 'Category' Trigger Button */}
          {!isSearchExpanded && (
            <button
              onClick={toggleCategoryMenu}
              className={`
                px-4 py-2.5 rounded-full text-xs font-bold shadow-lg transition-all border flex items-center gap-2
                ${isCategoryExpanded || selectedCategory !== 'All'
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                }
              `}
            >
              <Filter className="w-3 h-3" />
              <span>{selectedCategory === 'All' ? 'Category' : selectedCategory}</span>
              {isCategoryExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {/* 'Date' Trigger Button */}
          {!isSearchExpanded && (
            <button
              onClick={toggleDateMenu}
              className={`
                px-4 py-2.5 rounded-full text-xs font-bold shadow-lg transition-all border flex items-center gap-2
                ${isDateExpanded
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                }
              `}
            >
              <Calendar className="w-3 h-3" />
              <span>{periodLabels[currentPeriod]}</span>
              {isDateExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Expandable Category Chips */}
        {isCategoryExpanded && (
           <div className="flex flex-wrap gap-2 p-1 animate-in slide-in-from-top-2 fade-in duration-200">
              {/* Reset Option */}
              <button
                onClick={() => handleCategorySelect('All')}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-colors
                  ${selectedCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}
                `}
              >
                All
              </button>

              {CATEGORIES.map((cat) => {
                const isOverseas = cat === 'Overseas';
                const isOnline = cat === 'Online' || cat === 'Subscription';
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-colors flex items-center gap-1
                      ${isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {isOverseas && <Plane className="w-3 h-3" />}
                    {isOnline && <Globe className="w-3 h-3" />}
                    {cat}
                  </button>
                );
              })}
           </div>
        )}

        {/* Expandable Date Chips */}
        {isDateExpanded && (
           <div className="flex flex-wrap gap-2 p-1 animate-in slide-in-from-top-2 fade-in duration-200">
              {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((period) => {
                const isSelected = currentPeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => handlePeriodSelect(period)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-colors
                      ${isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {periodLabels[period]}
                  </button>
                );
              })}
           </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
