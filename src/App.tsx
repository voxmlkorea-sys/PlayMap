
import React, { useState, useMemo, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent';
import TransactionCard from './components/TransactionCard';
import PlaceReviews from './components/PlaceReviews'; 
import FriendComments from './components/FriendComments'; 
import VisitHistory from './components/VisitHistory';
import SideMenu from './components/SideMenu';
import MonthlyReportModal from './components/MonthlyReportModal';
import LedgerModal from './components/LedgerModal';
import CategoryFilter from './components/CategoryFilter';
import LoginScreen from './components/LoginScreen';
import NotificationCenter from './components/NotificationCenter';
import MemoWidget from './components/MemoWidget';
import ReceiptScanner from './components/ReceiptScanner';
import { MOCK_TRANSACTIONS, MOCK_CARDS, MOCK_FRIENDS_TRANSACTIONS, MOCK_GLOBAL_TRANSACTIONS, CURRENT_USER, MOCK_NOTIFICATIONS, MOCK_MEMO_ITEMS } from './constants';
import { Menu, Bell, Sparkles, X, MapPin, Camera, Lock, Globe2, Save, Trash2, Edit3, Users, User, Earth, MessageCircle, ChevronUp, ScanLine, ExternalLink, Loader2, Percent, Cloud, Mic, MicOff, RefreshCw } from 'lucide-react';
import { Transaction, NotificationItem, MemoItem, ReceiptData, SearchResult, Card, BudgetConfig, Offer } from './types';
import { getPlaceDetailsWithGrounding, searchPlaceOnMap } from './services/geminiService';
import { fetchKardOffers, checkKardMatch, enrollCardToKard } from './services/kardService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // View Mode: 'personal' | 'friends' | 'global'
  const [viewMode, setViewMode] = useState<'personal' | 'friends' | 'global'>('personal');

  const [selectedTxId, setSelectedTxId] = useState<string | undefined>(undefined);
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>(undefined);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // Detail View Tab (Friends Talk vs Reviews)
  const [detailTab, setDetailTab] = useState<'friends' | 'reviews'>('reviews');

  // Controls whether the bottom sheet is visible
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Controls the height mode of the sheet: 'half' (approx 55%) or 'full' (approx 92%)
  const [sheetMode, setSheetMode] = useState<'half' | 'full'>('half');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false); 
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Notification State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Memo Widget State
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memoItems, setMemoItems] = useState<MemoItem[]>(MOCK_MEMO_ITEMS);

  // Default to 'monthly' to reduce clutter as requested
  const [currentPeriod, setCurrentPeriod] = useState<'today' | 'weekly' | 'monthly' | 'all'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // My transactions (Editable)
  const [myTransactions, setMyTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  
  // My Cards State
  const [myCards, setMyCards] = useState<Card[]>(MOCK_CARDS);

  // Budget State (Updated to use BudgetConfig)
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
      amount: 0,
      period: 'monthly'
  });

  // AI Persona State ('standard' | 'mom' | 'robot' | 'cheerleader' | 'scrooge')
  const [aiPersona, setAiPersona] = useState<string>('standard');

  // Maps Grounding State
  const [groundingInfo, setGroundingInfo] = useState<{ text: string, links: any[] } | null>(null);
  const [isFetchingGrounding, setIsFetchingGrounding] = useState(false);

  // --- KARD INTEGRATION STATE ---
  const [offers, setOffers] = useState<Offer[]>([]); // Initialize empty, fetch via service
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // Voice Input Hook for Memory Log
  const { isListening: isMemoryListening, startListening: startMemoryListening, hasSupport: hasVoiceSupport } = useSpeechRecognition();

  // Refs for Drag Gesture
  const dragStartY = useRef<number>(0);
  
  // --- KARD SERVICE INIT ---
  // Fetch offers when authenticated
  useEffect(() => {
    if (isAuthenticated) {
        setIsLoadingOffers(true);
        fetchKardOffers(CURRENT_USER.id)
            .then(data => {
                setOffers(data);
                setIsLoadingOffers(false);
            })
            .catch(err => {
                console.error("Failed to load Kard offers", err);
                setIsLoadingOffers(false);
            });
    }
  }, [isAuthenticated]);

  // Combined data based on view mode
  const activeTransactions = useMemo(() => {
    if (viewMode === 'global') {
      // Global: Mine + Friends + Strangers
      return [...myTransactions, ...MOCK_FRIENDS_TRANSACTIONS, ...MOCK_GLOBAL_TRANSACTIONS];
    } else if (viewMode === 'friends') {
      // Friends: Mine + Friends
      return [...myTransactions, ...MOCK_FRIENDS_TRANSACTIONS];
    }
    // Personal: Mine
    return myTransactions;
  }, [viewMode, myTransactions]);

  // ALL Public/Shared Transactions for Reviews (Review Data Pool)
  const allReviewSourceData = useMemo(() => {
    return [
      ...myTransactions.filter(t => t.visibility === 'public'),
      ...MOCK_FRIENDS_TRANSACTIONS, 
      ...MOCK_GLOBAL_TRANSACTIONS
    ];
  }, [myTransactions]);

  // --- Memory Log State ---
  const [memoInput, setMemoInput] = useState('');
  const [visibilityInput, setVisibilityInput] = useState<'private' | 'friends' | 'public'>('private');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditingMemory, setIsEditingMemory] = useState(false);

  // Filter Transactions by Date Period
  const filteredData = useMemo(() => {
    let filtered = [...activeTransactions];
    const now = new Date(); // Use real current date

    if (currentPeriod === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(t => new Date(t.date) >= startOfDay);
    } else if (currentPeriod === 'weekly') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (currentPeriod === 'monthly') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(t => new Date(t.date) >= oneMonthAgo);
    }

    if (selectedCategory === 'Overseas') {
       filtered = filtered.filter(t => t.countryCode && t.countryCode !== 'KR');
    } else if (selectedCategory === 'Online') {
       // Filter for transactions WITHOUT location
       filtered = filtered.filter(t => !t.location);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.merchantName.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTransactions, currentPeriod, selectedCategory, searchTerm]);

  // Budget Alert Logic (Dynamic based on Period & Custom Range)
  useEffect(() => {
    if (budgetConfig.amount <= 0) return;

    const now = new Date();
    let spendingInPeriod = 0;

    // Filter transactions based on budget period
    const relevantTransactions = myTransactions.filter(t => {
        const d = new Date(t.date);
        
        if (budgetConfig.period === 'monthly') {
             return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (budgetConfig.period === 'yearly') {
             return d.getFullYear() === now.getFullYear();
        } else if (budgetConfig.period === 'weekly') {
             const oneWeekAgo = new Date(now);
             oneWeekAgo.setDate(now.getDate() - 7);
             return d >= oneWeekAgo && d <= now;
        } else if (budgetConfig.period === 'custom' && budgetConfig.customStart && budgetConfig.customEnd) {
             const start = new Date(budgetConfig.customStart);
             const end = new Date(budgetConfig.customEnd);
             // Set end date to end of day
             end.setHours(23, 59, 59, 999);
             return d >= start && d <= end;
        }
        return false;
    });

    spendingInPeriod = relevantTransactions.reduce((acc, t) => acc + t.amount, 0);
    const ratio = spendingInPeriod / budgetConfig.amount;

    // Helper for period name display
    const periodDisplay = budgetConfig.period === 'custom' ? 'custom period' : budgetConfig.period;

    // Check for "Over Budget"
    if (ratio >= 1.0) {
        // Prevent duplicate alerts
        const hasAlert = notifications.some(n => n.title === 'Budget Exceeded' && !n.isRead);
        if (!hasAlert) {
            setNotifications(prev => [{
                id: `alert_over_${Date.now()}`,
                type: 'system_alert',
                title: 'Budget Exceeded',
                message: `You have exceeded your ${periodDisplay} budget of $${budgetConfig.amount.toLocaleString()}.`,
                timeAgo: 'Just now',
                isRead: false
            }, ...prev]);
            setIsNotificationOpen(true); // Open panel to alert user
        }
    } 
    // Check for "Near Budget" (80%)
    else if (ratio >= 0.8) {
        const hasAlert = notifications.some(n => n.title === 'Approaching Budget Limit' && !n.isRead);
        if (!hasAlert) {
            setNotifications(prev => [{
                id: `alert_near_${Date.now()}`,
                type: 'system_alert',
                title: 'Approaching Budget Limit',
                message: `You have used ${(ratio * 100).toFixed(0)}% of your ${periodDisplay} budget.`,
                timeAgo: 'Just now',
                isRead: false
            }, ...prev]);
            setIsNotificationOpen(true);
        }
    }
  }, [myTransactions, budgetConfig, notifications]);

  // Filter Offers: Show offers valid TODAY, without strict period restriction
  const filteredOffers = useMemo(() => {
    const now = new Date();
    
    return offers.filter(o => {
      // Date Check: Must be valid NOW
      if (o.validFrom && o.validUntil) {
         const start = new Date(o.validFrom);
         const end = new Date(o.validUntil);
         if (now < start || now > end) return false;
      }

      if (searchTerm && !o.merchantName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory === 'All') return true; 
      
      // Allow Online offers to show if category is Online, OR if we're just browsing generally (handled by All)
      return o.category === selectedCategory || (selectedCategory === 'Online' && !o.location);
    });
  }, [searchTerm, selectedCategory, offers]); // Added 'offers' dependency

  // Match search result with offers
  const searchResultOffer = useMemo(() => {
    if (!searchResult) return undefined;
    return offers.find(o => 
      o.merchantName.toLowerCase().includes(searchResult.name.toLowerCase()) ||
      searchResult.name.toLowerCase().includes(o.merchantName.toLowerCase())
    );
  }, [searchResult, offers]);

  const selectedTransaction = useMemo(() => 
    activeTransactions.find(t => t.id === selectedTxId), 
  [activeTransactions, selectedTxId]);

  const selectedOffer = useMemo(() => 
    offers.find(o => o.id === selectedOfferId), 
  [selectedOfferId, offers]);


  // Effect: Populate memory form & Reset Tabs
  useEffect(() => {
    if (selectedTransaction) {
      setMemoInput(selectedTransaction.memo || '');
      setVisibilityInput(selectedTransaction.visibility || 'private');
      setPhotoPreview(selectedTransaction.photoUrl || null);
      setIsEditingMemory(false);
      // Reset Grounding
      setGroundingInfo(null);
      
      // Intelligent Tab Default
      if (selectedTransaction.visibility === 'private') {
        setDetailTab('reviews'); // Private can't have friends talk
      } else {
        setDetailTab('friends'); // Default to friends talk if possible
      }
    }
  }, [selectedTransaction]);

  const handleMarkerClick = (id: string, type: 'transaction' | 'offer') => {
    setIsSheetOpen(true); 
    setSheetMode('half'); // Reset to half height when opening new item
    if (type === 'transaction') {
      setSelectedTxId(id);
      setSelectedOfferId(undefined);
      setSearchResult(null); // Clear search result when clicking existing item
    } else {
      setSelectedOfferId(id);
      setSelectedTxId(undefined);
      setSearchResult(null);
    }
  };

  const handleMapClick = () => {
    setIsSheetOpen(false);
    setSheetMode('half');
    setSelectedTxId(undefined);
    setSelectedOfferId(undefined);
  };

  // --- Map Search Handler ---
  const handleMapSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearchingMap(true);
    setSearchResult(null);

    // Current center approximation (NYC)
    const currentCenter = { lat: 40.7580, lng: -73.9855 };
    const result = await searchPlaceOnMap(searchTerm, currentCenter);

    if (result) {
        setSearchResult(result);
        setIsSheetOpen(true);
        setSelectedTxId(undefined);
        setSelectedOfferId(undefined);
    } else {
        alert("Could not find location.");
    }
    setIsSearchingMap(false);
  };
  
  // NEW: Suggestion Handler
  const handleSuggestionSelect = (result: SearchResult) => {
      setSearchTerm(result.name); // Update input
      setSearchResult(result); // Set result immediately
      setIsSheetOpen(true);
      setSelectedTxId(undefined);
      setSelectedOfferId(undefined);
  };

  const handleCategoryChange = (txId: string, newCategory: string) => {
    if (!myTransactions.find(t => t.id === txId)) return;
    setMyTransactions(prev => prev.map(t => 
      t.id === txId ? { ...t, category: newCategory } : t
    ));
  };

  // --- Touch/Drag Handlers for Bottom Sheet ---
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = dragStartY.current - endY;
    const threshold = 30;

    if (Math.abs(diff) < threshold) return;

    if (diff > 0) {
        setSheetMode('full');
    } else {
        if (sheetMode === 'full') {
            setSheetMode('half');
        } else {
            setIsSheetOpen(false);
        }
    }
  };
  
  const toggleSheetMode = () => {
      setSheetMode(prev => prev === 'half' ? 'full' : 'half');
  };

  // --- Notification Handlers ---
  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    setIsNotificationOpen(false);

    if (item.type === 'system_alert') {
        setIsReportOpen(true);
    } else if (item.relatedId) {
        if (item.relatedType === 'offer') {
             const offer = offers.find(o => o.id === item.relatedId);
             if (offer) {
                setSelectedOfferId(offer.id);
                setSelectedTxId(undefined);
                setIsSheetOpen(true);
             }
        } else {
             const tx = activeTransactions.find(t => t.id === item.relatedId) 
                        || MOCK_FRIENDS_TRANSACTIONS.find(t => t.id === item.relatedId)
                        || myTransactions.find(t => t.id === item.relatedId);
             
             if (tx) {
                if (!tx.user.isCurrentUser) setViewMode('friends');
                setSelectedTxId(tx.id);
                setSelectedOfferId(undefined);
                setIsSheetOpen(true);
             }
        }
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Memo Widget Handlers ---
  const handleAddMemo = (text: string) => {
    setMemoItems(prev => [...prev, { id: `m_${Date.now()}`, text, completed: false }]);
  };
  const handleToggleMemo = (id: string) => {
    setMemoItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  const handleDeleteMemo = (id: string) => {
    setMemoItems(prev => prev.filter(item => item.id !== id));
  };
  const handleClearAllMemos = () => setMemoItems([]);

  // --- Memory Log Handlers ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPhotoPreview(imageUrl);
      setIsEditingMemory(true);
    }
  };
  const handleSaveMemory = () => {
    if (!selectedTxId) return;
    if (!myTransactions.find(t => t.id === selectedTxId)) {
        alert("You cannot edit this memory.");
        return;
    }
    setMyTransactions(prev => prev.map(t => 
      t.id === selectedTxId ? { 
        ...t, 
        memo: memoInput, 
        photoUrl: photoPreview || undefined, 
        visibility: visibilityInput 
      } : t
    ));
    setIsEditingMemory(false);
  };
  const handleDeletePhoto = () => {
    setPhotoPreview(null);
    setIsEditingMemory(true);
  };

  const handleVoiceInput = () => {
      startMemoryListening((text) => {
          setMemoInput(prev => prev ? `${prev} ${text}` : text);
          setIsEditingMemory(true);
      });
  };

  // --- Process New Transaction (Simulate Webhook) ---
  const processNewTransaction = async (tx: Transaction) => {
     setMyTransactions(prev => [tx, ...prev]);
     
     // Call Kard Service Simulation
     const matchResult = await checkKardMatch(tx);
     
     if (matchResult.matched && matchResult.offer) {
         setNotifications(prev => [{
             id: `notif_${Date.now()}`,
             type: 'offer_nearby', // Reusing this type for reward alert
             title: 'Cashback Earned!',
             message: `You earned $${matchResult.rewardAmount?.toFixed(2)} at ${matchResult.offer?.merchantName}!`,
             timeAgo: 'Just now',
             isRead: false,
             relatedId: tx.id,
             relatedType: 'transaction'
         }, ...prev]);
         setIsNotificationOpen(true); // Alert user
     }
  };

  // --- Receipt Handler ---
  const handleSaveReceipt = (data: ReceiptData, category: string) => {
      const breakdownText = `Subtotal: $${data.subtotal.toFixed(2)} | Tax: $${data.tax.toFixed(2)} | Tip: $${data.tip.toFixed(2)}`;
      let txDate = new Date().toISOString();
      if (data.date) {
        const parsedDate = new Date(data.date);
        if (!isNaN(parsedDate.getTime())) {
            const now = new Date();
            parsedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            txDate = parsedDate.toISOString();
        }
      }
      const newTransaction: Transaction = {
          id: `scan_${Date.now()}`,
          amount: data.totalAmount,
          currency: data.currency || 'USD',
          merchantName: data.merchantName,
          date: txDate, 
          category: category,
          status: 'completed',
          countryCode: 'US', 
          location: { lat: 40.7580, lng: -73.9855 }, 
          user: CURRENT_USER,
          visibility: 'private',
          memo: breakdownText,
          receiptData: data 
      };
      
      processNewTransaction(newTransaction);
      
      setTimeout(() => {
          setSelectedTxId(newTransaction.id);
          setIsSheetOpen(true);
      }, 300);
  };

  // --- Ledger Handlers ---
  const handleAddManualTransaction = (txData: Partial<Transaction>) => {
     const newTransaction: Transaction = {
        id: `manual_${Date.now()}`,
        amount: 0,
        currency: 'USD',
        merchantName: 'Unknown',
        date: new Date().toISOString(),
        category: 'Shopping',
        status: 'completed',
        user: CURRENT_USER,
        visibility: 'private',
        ...txData 
     };
     processNewTransaction(newTransaction);
  };
  const handleDeleteTransaction = (id: string) => {
     if (window.confirm("Are you sure you want to delete this transaction?")) {
        setMyTransactions(prev => prev.filter(t => t.id !== id));
        if (selectedTxId === id) {
           setSelectedTxId(undefined);
           setIsSheetOpen(false);
        }
     }
  };

  // --- Card Handler (With Kard Enrollment Sim) ---
  const handleAddCard = async (card: Card) => {
      setMyCards(prev => [...prev, card]);
      // Simulate enrolling this card to Kard
      await enrollCardToKard(card.id);
      alert(`Card ending in ${card.last4} linked and enrolled in Rewards program!`);
  };

  // --- Maps Grounding Handler ---
  const fetchGroundingInfo = async () => {
    if (!selectedTransaction) return;
    setIsFetchingGrounding(true);
    const result = await getPlaceDetailsWithGrounding(
        selectedTransaction.merchantName,
        selectedTransaction.location
    );
    setGroundingInfo(result);
    setIsFetchingGrounding(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const isSelectedMine = selectedTransaction?.user?.isCurrentUser ?? true;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 relative overflow-hidden">
      
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        cards={myCards}
        onAddCard={handleAddCard}
        onSelectPeriod={(period) => {
          setCurrentPeriod(period);
          setIsMenuOpen(false);
          setIsSheetOpen(true);
          setSelectedTxId(undefined);
          setSelectedOfferId(undefined);
        }}
        currentPeriod={currentPeriod}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        currentBudget={budgetConfig}
        onSaveBudget={(config) => setBudgetConfig(config)}
        aiPersona={aiPersona}
        onSelectPersona={setAiPersona}
        offers={offers} // --- CHANGE: Pass offers to SideMenu
      />

      <MonthlyReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={myTransactions} 
        budgetConfig={budgetConfig}
        aiPersona={aiPersona}
      />
      
      <LedgerModal 
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        transactions={myTransactions}
        onAddTransaction={handleAddManualTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <ReceiptScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSave={handleSaveReceipt}
      />

      <NotificationCenter 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Top Header */}
      <header className="absolute top-0 left-0 w-full z-[1000] px-4 py-4 pointer-events-none">
        <div className="flex items-center justify-between max-w-md mx-auto w-full pointer-events-auto">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 transition-transform active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100 flex p-1 relative">
             <button
               onClick={() => setViewMode('personal')}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all relative z-10 ${viewMode === 'personal' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
             >
               <User className="w-3 h-3" />
               My Flow
             </button>
             <button
               onClick={() => setViewMode('friends')}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all relative z-10 ${viewMode === 'friends' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
             >
               <Users className="w-3 h-3" />
               Friends
             </button>
             <button
               onClick={() => setViewMode('global')}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all relative z-10 ${viewMode === 'global' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
             >
               <Earth className="w-3 h-3" />
               World
             </button>
             
             <div 
               className="absolute top-1 bottom-1 bg-indigo-600 rounded-full transition-all duration-300 ease-in-out"
               style={{
                 left: viewMode === 'personal' ? '4px' : viewMode === 'friends' ? '33%' : '66%',
                 width: viewMode === 'personal' ? '85px' : viewMode === 'friends' ? '80px' : '75px'
               }}
             />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 relative transition-transform active:scale-95"
            >
               <Bell className="w-5 h-5" />
               {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
               )}
            </button>
          </div>
        </div>
      </header>

      {/* Loading Offers Indicator (simulated API) */}
      {isLoadingOffers && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[800] bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold backdrop-blur-md animate-in fade-in slide-in-from-top-4">
              <Loader2 className="w-3 h-3 animate-spin" />
              Fetching Kard Rewards...
          </div>
      )}

      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleMapSearch}
        isSearching={isSearchingMap}
        onSuggestionSelect={handleSuggestionSelect}
        offers={offers}
        currentPeriod={currentPeriod}
        onSelectPeriod={setCurrentPeriod}
      />

      {/* Floating Action Buttons (Right side) - Adjusted top position to top-32 to avoid overlap with search */}
      <div className="absolute top-32 right-4 z-[900] flex flex-col gap-3 items-end pointer-events-none">
        <div className="pointer-events-auto">
            <MemoWidget 
                items={memoItems}
                onAddItem={handleAddMemo}
                onToggleItem={handleToggleMemo}
                onDeleteItem={handleDeleteMemo}
                onClearAll={handleClearAllMemos}
                isOpen={isMemoOpen}
                onToggleOpen={() => setIsMemoOpen(!isMemoOpen)}
            />
        </div>

        <button
           onClick={() => setIsScannerOpen(true)}
           className="pointer-events-auto bg-indigo-600 p-3 rounded-full shadow-lg text-white hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center w-12 h-12"
        >
           <ScanLine className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-0 left-0 w-full h-full z-0">
        <MapComponent 
          transactions={filteredData} 
          offers={filteredOffers}
          selectedId={selectedTxId || selectedOfferId}
          selectedCategory={selectedCategory}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          searchResult={searchResult}
        />
      </div>

      <div 
        className={`
          absolute bottom-0 left-0 w-full z-20 flex flex-col transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
          ${isSheetOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ height: sheetMode === 'full' ? '92%' : '55%' }}
      >
        <div className="flex-1 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border-t border-gray-200">
          
          {/* Combined Header & Handle for better touch target */}
          <div 
            className="bg-white shrink-0 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Draggable Handle Visual */}
            <div 
                className="w-full flex flex-col items-center justify-center pt-4 pb-3"
                onClick={toggleSheetMode}
            >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-1" />
                {sheetMode === 'half' && (
                    <div className="text-[10px] text-gray-300 flex items-center gap-1 animate-pulse">
                        <ChevronUp className="w-3 h-3" />
                        <span>Swipe up for details</span>
                    </div>
                )}
            </div>

            {/* Sheet Header Content */}
            <div className="w-full flex items-center justify-between px-6 pb-2">
                <div className="mt-1 w-full" onClick={toggleSheetMode}>
                {searchResult ? (
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                       <MapPin className="w-5 h-5" />
                       <span>Search Result</span>
                    </div>
                ) : selectedOfferId ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                    <Sparkles className="w-5 h-5" />
                    <span>Reward Available</span>
                    </div>
                ) : selectedTxId ? (
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span>Transaction Details</span>
                    </div>
                ) : (
                    <div className="text-gray-900 font-bold flex items-center gap-2">
                    {viewMode === 'global' ? 'Global Feed' : viewMode === 'friends' ? 'Social Feed' : 'My Activity'}
                    </div>
                )}
                </div>
                
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsSheetOpen(false);
                }}
                className="mt-1 p-1 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
                >
                <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 bg-slate-50">
            <div className="max-w-md mx-auto pt-4">

              {/* SEARCH RESULT VIEW */}
              {searchResult && (
                  <div className="animate-in slide-in-from-bottom-4 fade-in pb-10">
                      <div className={`bg-white p-5 rounded-2xl border shadow-sm mb-4 ${searchResultOffer ? 'border-emerald-500 ring-2 ring-emerald-50' : 'border-red-100'}`}>
                          <div className="flex justify-between items-start mb-2">
                              <h2 className="text-xl font-bold text-gray-900 mb-1">{searchResult.name}</h2>
                              {searchResultOffer && (
                                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse">
                                      <Sparkles className="w-3 h-3 fill-current" />
                                      <span>{Math.round(searchResultOffer.cashbackRate * 100)}% BACK</span>
                                  </div>
                              )}
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${searchResultOffer ? 'text-emerald-500' : 'text-red-500'}`} />
                              <span>{searchResult.location.address || "Address details from map."}</span>
                          </div>
                          {searchResult.description && (
                              <p className="mt-3 text-sm text-gray-500 italic border-l-2 border-red-200 pl-3">
                                  {searchResult.description}
                              </p>
                          )}
                          
                          {/* New Offer Block */}
                          {searchResultOffer && (
                              <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100 flex gap-3">
                                  <div className="bg-white p-2 rounded-full shadow-sm text-emerald-600 h-fit">
                                      <Percent className="w-4 h-4" />
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-bold text-emerald-900">Offer Available</h4>
                                      <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">{searchResultOffer.description}</p>
                                  </div>
                              </div>
                          )}
                          
                          <div className="mt-6 flex gap-3">
                              <button className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${searchResultOffer ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                                  Go There
                              </button>
                              <button 
                                onClick={() => {
                                    // Simulate adding a plan/memo
                                    handleAddMemo(`Visit ${searchResult.name}`);
                                    alert("Added to Memo Widget!");
                                }}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                              >
                                  Save to Plan
                              </button>
                          </div>
                      </div>
                      
                      <div className="text-center text-xs text-gray-400 mt-4">
                          Search result provided by Gemini & Google Maps Grounding
                      </div>
                  </div>
              )}

              {selectedOffer && (
                <div className="animate-in slide-in-from-bottom-4 fade-in">
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedOffer.merchantName}</h2>
                      <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        {Math.round(selectedOffer.cashbackRate * 100)}% CASHBACK
                      </span>
                    </div>
                    
                    {selectedOffer.location?.address && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 bg-white/60 p-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                          <span>{selectedOffer.location.address}</span>
                      </div>
                    )}

                    <p className="text-gray-600 mb-4 text-sm">{selectedOffer.description}</p>
                    <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95">
                      Activate Offer
                    </button>
                  </div>
                  
                  <PlaceReviews 
                     merchantName={selectedOffer.merchantName} 
                     reviews={allReviewSourceData} 
                  />
                </div>
              )}

              {selectedTransaction && (
                 <div className="mb-6 animate-in slide-in-from-bottom-4 fade-in pb-10">
                    <TransactionCard 
                      transaction={selectedTransaction} 
                      offers={filteredOffers}
                      onCategoryChange={(newCat) => handleCategoryChange(selectedTransaction.id, newCat)}
                    />

                    {selectedTransaction.location && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                            <div className="p-2 bg-white rounded-full shadow-sm text-gray-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Location</h4>
                                <p className="text-sm text-gray-600 mt-0.5">{selectedTransaction.location.address}</p>
                            </div>
                        </div>
                    )}

                    {/* Google Maps Grounding Section */}
                    {selectedTransaction.location && (
                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Globe2 className="w-4 h-4 text-blue-600" />
                                    <h4 className="text-sm font-bold text-blue-900">Google Maps Info</h4>
                                </div>
                                {!groundingInfo && !isFetchingGrounding && (
                                    <button 
                                        onClick={fetchGroundingInfo}
                                        className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Ask AI
                                    </button>
                                )}
                            </div>

                            {isFetchingGrounding && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 py-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Fetching place details...</span>
                                </div>
                            )}

                            {groundingInfo && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <p className="text-xs text-blue-800 leading-relaxed mb-3">
                                        {groundingInfo.text}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {groundingInfo.links.map((link, idx) => (
                                            <a 
                                                key={idx} 
                                                href={link.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[10px] font-bold bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {link.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!selectedTransaction.location && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                           <div className="p-2 bg-white rounded-full shadow-sm text-blue-500">
                               <Cloud className="w-5 h-5" />
                           </div>
                           <div>
                               <h4 className="text-sm font-bold text-blue-900">Online Purchase</h4>
                               <p className="text-xs text-blue-600 mt-0.5">This transaction occurred online.</p>
                           </div>
                        </div>
                    )}

                    {isSelectedMine ? (
                        <>
                          <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Memory Log
                              </h4>
                              {isEditingMemory || memoInput !== (selectedTransaction.memo || '') || visibilityInput !== (selectedTransaction.visibility || 'private') ? (
                                  <button onClick={handleSaveMemory} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded">
                                    <Save className="w-3 h-3" /> Save
                                  </button>
                              ) : null}
                            </div>
                            
                            <div className="p-4 space-y-4">
                              <div>
                                {photoPreview ? (
                                  <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                                    <img src={photoPreview} alt="Memory" className="w-full h-48 object-cover" />
                                    <button 
                                      onClick={handleDeletePhoto}
                                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                      <p className="text-xs text-gray-500 font-medium">Add a photo</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                  </label>
                                )}
                              </div>

                              <div className="relative">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Edit3 className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-500 uppercase">Note</span>
                                    </div>
                                    
                                    {/* VOICE INPUT BUTTON */}
                                    {hasVoiceSupport && (
                                        <button 
                                            onClick={handleVoiceInput}
                                            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 text-[10px] font-bold ${isMemoryListening ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            {isMemoryListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                                            {isMemoryListening ? 'Listening...' : 'Dictate'}
                                        </button>
                                    )}
                                </div>
                                <textarea 
                                  value={memoInput}
                                  onChange={(e) => {
                                    setMemoInput(e.target.value);
                                    setIsEditingMemory(true);
                                  }}
                                  placeholder="Write a short memory about this spending..."
                                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none h-24"
                                />
                              </div>

                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Who can see this?</label>
                                <div className="flex rounded-lg bg-gray-200 p-1">
                                    <button
                                      onClick={() => { setVisibilityInput('private'); setIsEditingMemory(true); }}
                                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${visibilityInput === 'private' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                      <Lock className="w-3 h-3" /> Private
                                    </button>
                                    <button
                                      onClick={() => { setVisibilityInput('friends'); setIsEditingMemory(true); }}
                                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${visibilityInput === 'friends' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                      <Users className="w-3 h-3" /> Friends
                                    </button>
                                    <button
                                      onClick={() => { setVisibilityInput('public'); setIsEditingMemory(true); }}
                                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${visibilityInput === 'public' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                      <Globe2 className="w-3 h-3" /> Public
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-center">
                                  {visibilityInput === 'private' && "Only visible to you."}
                                  {visibilityInput === 'friends' && "Visible to your friends list."}
                                  {visibilityInput === 'public' && "Visible to everyone on the Global map."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* --- VISIT HISTORY (NEW) --- */}
                          <VisitHistory 
                            currentId={selectedTransaction.id}
                            merchantName={selectedTransaction.merchantName}
                            transactions={myTransactions}
                            onSelectTransaction={setSelectedTxId}
                          />
                        </>
                    ) : (
                        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6 text-center">
                            <p className="text-sm text-gray-500 italic">
                                This is a {selectedTransaction.visibility === 'public' ? 'public' : 'shared'} memory from {selectedTransaction.user?.name}.
                            </p>
                        </div>
                    )}
                    
                    {/* TABS: Friends Talk vs Reviews */}
                    <div className="mt-8">
                       <div className="flex items-center gap-6 border-b border-gray-100 mb-4 px-2">
                          <button
                            onClick={() => setDetailTab('friends')}
                            className={`pb-2 text-sm font-bold transition-all relative flex items-center gap-2 ${detailTab === 'friends' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <Users className="w-4 h-4" />
                            Friends Talk
                            {detailTab === 'friends' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                          </button>
                          
                          <button
                            onClick={() => setDetailTab('reviews')}
                            className={`pb-2 text-sm font-bold transition-all relative flex items-center gap-2 ${detailTab === 'reviews' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            What people say
                            {detailTab === 'reviews' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                          </button>
                       </div>

                       {detailTab === 'friends' ? (
                          selectedTransaction.visibility === 'private' ? (
                              <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                 <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                 <p className="text-sm font-bold text-gray-700">Private Memory</p>
                                 <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                                   Change visibility to 'Friends' or 'Public' to start a conversation.
                                 </p>
                              </div>
                          ) : (
                              <FriendComments 
                                transaction={selectedTransaction}
                                currentUser={CURRENT_USER}
                                compact={true}
                              />
                          )
                       ) : (
                          <PlaceReviews 
                             merchantName={selectedTransaction.merchantName}
                             reviews={allReviewSourceData}
                             currentTransactionId={selectedTransaction.id}
                             compact={true}
                          />
                       )}
                    </div>
                 </div>
              )}

              {!selectedOffer && !selectedTransaction && !searchResult && (
                 <div className="space-y-3">
                    {filteredData.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">
                        No transactions found for this view.
                      </div>
                    ) : (
                      filteredData.map((t) => (
                        <div key={t.id} onClick={() => setSelectedTxId(t.id)}>
                          <TransactionCard transaction={t} offers={filteredOffers} />
                        </div>
                      ))
                    )}
                 </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
