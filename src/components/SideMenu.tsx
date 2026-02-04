
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, User, PieChart, Receipt, Plus, Check, Shield, Building2, Lock, Loader2, ChevronRight, Settings, Phone, Mail as MailIcon, MapPin, Globe, CreditCard as CardIcon, ChevronLeft, LogOut, Target, DollarSign, Save, Smile, Bot, Megaphone, Coins, ChevronDown, ChevronUp, Clock, ArrowRight, Cloud, Sparkles, ExternalLink } from 'lucide-react';
import { Card, BudgetConfig, Offer } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  onAddCard: (card: Card) => void;
  onSelectPeriod: (period: 'today' | 'weekly' | 'monthly' | 'all') => void;
  currentPeriod: string;
  onOpenReport: () => void;
  onOpenLedger: () => void;
  currentBudget?: BudgetConfig;
  onSaveBudget?: (config: BudgetConfig) => void;
  aiPersona?: string;
  onSelectPersona?: (persona: string) => void;
  offers?: Offer[]; // New prop for Online Offers
}

const BANKS = [
  { id: 'chase', name: 'Chase', color: 'bg-[#117aca]', type: 'Credit', cardName: 'Sapphire Preferred' },
  { id: 'boa', name: 'Bank of America', color: 'bg-[#e31837]', type: 'Debit', cardName: 'Advantage Banking' },
  { id: 'amex', name: 'American Express', color: 'bg-[#006fcf]', type: 'Credit', cardName: 'Platinum Card' },
  { id: 'wf', name: 'Wells Fargo', color: 'bg-[#d71e28]', type: 'Debit', cardName: 'Active Cash' },
  { id: 'citi', name: 'Citi', color: 'bg-[#003b70]', type: 'Credit', cardName: 'Double Cash' },
];

const SideMenu: React.FC<Props> = ({ isOpen, onClose, cards, onAddCard, onSelectPeriod, currentPeriod, onOpenReport, onOpenLedger, currentBudget, onSaveBudget, aiPersona = 'standard', onSelectPersona, offers = [] }) => {
  // Navigation State
  const [menuView, setMenuView] = useState<'main' | 'profile' | 'payment' | 'budget' | 'online-offers'>('main');

  // Plaid Simulation State
  const [isPlaidOpen, setIsPlaidOpen] = useState(false);
  const [plaidStep, setPlaidStep] = useState<'intro' | 'select' | 'auth' | 'loading' | 'success'>('intro');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  
  // Fake Auth Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Profile Form State
  const [profileName, setProfileName] = useState('Alex Johnson');
  const [profileEmail, setProfileEmail] = useState('alex.j@example.com');
  const [profilePhone, setProfilePhone] = useState('+1 (555) 123-4567');
  
  // Local Persona State for Profile Form
  const [tempPersona, setTempPersona] = useState(aiPersona);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Payment Info State
  const [billingAddress, setBillingAddress] = useState('123 Fintech Blvd, New York, NY 10001');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  
  // Budget State
  const [budgetInput, setBudgetInput] = useState<string>(currentBudget?.amount ? currentBudget.amount.toString() : '');
  const [budgetPeriod, setBudgetPeriod] = useState<string>('monthly');
  // Custom Date Range State
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const PERSONAS = [
      { id: 'standard', name: 'Standard Advisor', icon: User, desc: 'Professional and friendly advice.', color: 'bg-indigo-100 text-indigo-600' },
      { id: 'mom', name: 'Nagging Mom', icon: Smile, desc: 'Strict, caring, wants you to save!', color: 'bg-pink-100 text-pink-600' },
      { id: 'robot', name: 'Mechanical Bot', icon: Bot, desc: 'Cold, hard data only.', color: 'bg-gray-200 text-gray-700' },
      { id: 'cheerleader', name: 'Cheerleader', icon: Megaphone, desc: 'High energy! Celebrates everything!', color: 'bg-yellow-100 text-yellow-600' },
      { id: 'scrooge', name: 'Scrooge', icon: Coins, desc: 'Hates spending. Loves hoarding gold.', color: 'bg-amber-100 text-amber-800' },
  ];

  const resetPlaid = () => {
      setIsPlaidOpen(false);
      setPlaidStep('intro');
      setSelectedBank(null);
      setUsername('');
      setPassword('');
  };

  // Reset menu view when closed
  useEffect(() => {
    if (!isOpen) {
        // Delay reset slightly to allow close animation to finish
        const timer = setTimeout(() => {
            setMenuView('main');
            resetPlaid();
            setIsPersonaMenuOpen(false);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (currentBudget) {
        setBudgetInput(currentBudget.amount ? currentBudget.amount.toString() : '');
        setBudgetPeriod(currentBudget.period);
        if (currentBudget.period === 'custom') {
            setCustomStart(currentBudget.customStart || '');
            setCustomEnd(currentBudget.customEnd || '');
        }
    }
  }, [currentBudget]);

  // Sync temp persona when prop changes
  useEffect(() => {
    setTempPersona(aiPersona);
  }, [aiPersona]);

  // Filter Online Offers
  const onlineOffers = offers.filter(o => !o.location || o.category === 'Online' || o.category === 'Subscription');

  const handleBankSelect = (bank: typeof BANKS[0]) => {
      setSelectedBank(bank);
      setPlaidStep('auth');
  };

  const handlePlaidSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setPlaidStep('loading');
      
      // Simulate API delay
      setTimeout(() => {
          setPlaidStep('success');
          // Add the card automatically after success message
          setTimeout(() => {
              if (selectedBank) {
                  const newCard: Card = {
                      id: `card_${Date.now()}`,
                      bankName: selectedBank.name,
                      cardName: selectedBank.cardName,
                      last4: Math.floor(1000 + Math.random() * 9000).toString(),
                      type: selectedBank.type as 'Credit' | 'Debit',
                      color: selectedBank.color // Use bank brand color
                  };
                  onAddCard(newCard);
              }
              resetPlaid();
          }, 1500);
      }, 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSelectPersona) {
          onSelectPersona(tempPersona);
      }
      alert("Profile and preferences updated successfully!");
      setMenuView('main');
  };

  const handleSavePaymentInfo = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Payment settings updated!");
      setMenuView('main');
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBudget) {
        const val = parseFloat(budgetInput.replace(/,/g, ''));
        
        // Validation for custom range
        if (budgetPeriod === 'custom' && (!customStart || !customEnd)) {
            alert("Please select both start and end dates for custom range.");
            return;
        }

        const newConfig: BudgetConfig = {
            amount: isNaN(val) ? 0 : val,
            period: budgetPeriod as any,
            customStart: budgetPeriod === 'custom' ? customStart : undefined,
            customEnd: budgetPeriod === 'custom' ? customEnd : undefined
        };

        onSaveBudget(newConfig);
        alert(`Budget goal updated!`);
        setMenuView('main');
    }
  };

  const currentPersonaData = PERSONAS.find(p => p.id === tempPersona) || PERSONAS[0];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[2001] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Dynamic Header */}
        <div className="p-6 bg-indigo-600 text-white relative overflow-hidden shrink-0 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
             <User className="w-24 h-24" />
          </div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-20">
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative z-10 pt-2">
            {menuView === 'main' ? (
                <>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden shrink-0 bg-white/20 shadow-lg">
                            <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileName}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold truncate">{profileName}</h2>
                            <p className="text-indigo-200 text-sm truncate">{profileEmail}</p>
                        </div>
                    </div>
                    
                    {/* Account Quick Actions */}
                    <div className="flex gap-2 mt-6">
                        <button 
                            onClick={() => setMenuView('profile')}
                            className="flex-1 bg-indigo-700/50 hover:bg-indigo-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-indigo-500/30"
                        >
                            <Settings className="w-3 h-3" /> Profile
                        </button>
                        <button 
                            onClick={() => setMenuView('payment')}
                            className="flex-1 bg-indigo-700/50 hover:bg-indigo-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-indigo-500/30"
                        >
                            <CreditCard className="w-3 h-3" /> Billing
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-[108px] justify-center">
                     <button 
                        onClick={() => setMenuView('main')}
                        className="flex items-center gap-1 text-indigo-200 hover:text-white text-sm font-bold mb-2 w-fit"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {menuView === 'profile' && <User className="w-6 h-6" />}
                        {menuView === 'payment' && <CreditCard className="w-6 h-6" />}
                        {menuView === 'budget' && <Target className="w-6 h-6" />}
                        {menuView === 'online-offers' && <Cloud className="w-6 h-6" />}
                        
                        {menuView === 'profile' && 'Edit Profile'}
                        {menuView === 'payment' && 'Payment Settings'}
                        {menuView === 'budget' && 'Set Budget Goal'}
                        {menuView === 'online-offers' && 'Online Offers'}
                    </h2>
                </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
          
          {/* MAIN MENU VIEW */}
          {menuView === 'main' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Management Section */}
                <section className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Management</h3>
                    
                    {/* Budget Goal Button */}
                    <button 
                        onClick={() => setMenuView('budget')}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                        <Target className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                        <div className="text-sm font-bold text-gray-900">Budget Goal</div>
                        <div className="text-[10px] text-gray-500">
                            {currentBudget?.amount && currentBudget.amount > 0 
                             ? `Target: $${currentBudget.amount.toLocaleString()}` 
                             : 'Set a spending limit'}
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                    </button>
                    
                    {/* Online Offers Button (NEW) */}
                    <button 
                        onClick={() => setMenuView('online-offers')}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        <Cloud className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                        <div className="text-sm font-bold text-gray-900">Online Offers</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            {onlineOffers.length} Exclusive Deals <Sparkles className="w-3 h-3 text-yellow-500 fill-current" />
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                    </button>

                    {/* Expense Ledger Button */}
                    <button 
                        onClick={() => {
                        onOpenLedger();
                        onClose();
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">Expense Ledger</div>
                        <div className="text-[10px] text-gray-500">Add & Edit Transactions</div>
                    </div>
                    </button>

                    {/* Spending Report Button */}
                    <button 
                        onClick={() => {
                        onOpenReport();
                        onClose();
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                        <PieChart className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">Spending Report</div>
                        <div className="text-[10px] text-gray-500">AI Insights & Breakdown</div>
                    </div>
                    </button>
                </section>

                {/* Spending History Section */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Filter History
                    </h3>
                    <div className="space-y-1">
                    {['today', 'weekly', 'monthly', 'all'].map((period) => (
                        <button
                        key={period}
                        onClick={() => onSelectPeriod(period as any)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between
                            ${currentPeriod === period 
                            ? 'bg-gray-100 text-gray-900 font-bold' 
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                        <span className="capitalize">
                            {period === 'all' ? 'All Time' : period === 'today' ? 'Today' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
                        </span>
                        {currentPeriod === period && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </button>
                    ))}
                    </div>
                </section>

                {/* My Cards Section */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> My Wallets & Cards
                    </h3>
                    <div className="space-y-3">
                    {cards.map(card => (
                        <div key={card.id} className={`p-4 rounded-xl text-white shadow-md relative overflow-hidden ${card.color}`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-medium opacity-80">{card.bankName}</span>
                            <span className="text-xs font-bold border border-white/30 px-2 py-0.5 rounded">{card.type}</span>
                            </div>
                            <div className="font-mono text-lg tracking-wider mb-1">
                            •••• •••• •••• {card.last4}
                            </div>
                            <div className="text-xs opacity-75">{card.cardName}</div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute top-4 -right-8 w-16 h-16 bg-white/10 rounded-full" />
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => setIsPlaidOpen(true)}
                        className="w-full py-3 bg-black text-white rounded-xl shadow-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-bold">Connect via Plaid</span>
                    </button>
                    </div>
                </section>
                
                <section className="pt-4 border-t border-gray-100">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </section>
            </div>
          )}

          {/* ONLINE OFFERS VIEW */}
          {menuView === 'online-offers' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                      <Cloud className="w-6 h-6 text-blue-600 shrink-0" />
                      <div>
                          <h4 className="font-bold text-gray-900 text-sm">Online Exclusive</h4>
                          <p className="text-xs text-blue-700 mt-1">
                              Shop at these merchants online to earn automatic cashback. No activation required.
                          </p>
                      </div>
                  </div>

                  {onlineOffers.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                          <Cloud className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          No online offers available right now.
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {onlineOffers.map((offer) => (
                              <div key={offer.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                  {/* Top Banner */}
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-gray-900">{offer.merchantName}</h3>
                                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 fill-current" />
                                          {Math.round(offer.cashbackRate * 100)}% Back
                                      </span>
                                  </div>
                                  
                                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                      {offer.description}
                                  </p>

                                  <div className="flex gap-2">
                                     <button 
                                        onClick={() => {
                                            alert(`Redirecting to ${offer.merchantName} store...`);
                                            // window.open('https://...', '_blank');
                                        }}
                                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                                     >
                                         Shop Now <ExternalLink className="w-3 h-3" />
                                     </button>
                                     <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                                         Details
                                     </button>
                                  </div>

                                  {/* Decorative */}
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/0 to-green-50/50 rounded-bl-full pointer-events-none" />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* PROFILE VIEW */}
          {menuView === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                       <div className="w-20 h-20 mx-auto rounded-full bg-white border border-gray-200 mb-3 p-1">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileName}`} alt="avatar" className="w-full h-full rounded-full" />
                       </div>
                       <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Change Avatar</button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Full Name</label>
                          <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input 
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Email Address</label>
                          <div className="relative">
                              <MailIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input 
                                type="email"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Phone Number</label>
                          <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input 
                                type="tel"
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                      </div>
                  </div>

                  {/* AI Persona Section (Collapsible Menu Style) */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> AI Assistant Persona
                    </label>
                    
                    {/* Selected Item / Trigger */}
                    <button
                        type="button"
                        onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left bg-white hover:bg-gray-50 ${isPersonaMenuOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}`}
                    >
                        <div className={`p-2 rounded-lg shrink-0 ${currentPersonaData.color}`}>
                            <currentPersonaData.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900">{currentPersonaData.name}</div>
                            <div className="text-xs text-gray-500 leading-tight mt-0.5 truncate">{currentPersonaData.desc}</div>
                        </div>
                        {isPersonaMenuOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {/* Dropdown Menu */}
                    {isPersonaMenuOpen && (
                        <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-in slide-in-from-top-2">
                            {PERSONAS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        setTempPersona(p.id);
                                        setIsPersonaMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0
                                        ${tempPersona === p.id ? 'bg-indigo-50/50' : ''}`}
                                >
                                    <div className={`p-2 rounded-lg shrink-0 ${p.color} bg-opacity-50`}>
                                        <p.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs text-gray-900">{p.name}</div>
                                        <div className="text-[10px] text-gray-500 leading-tight">{p.desc}</div>
                                    </div>
                                    {tempPersona === p.id && <Check className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>

                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                      Save Profile & Settings
                  </button>
              </form>
          )}

          {/* BUDGET VIEW */}
          {menuView === 'budget' && (
              <form onSubmit={handleSaveBudget} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                          <Target className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-gray-900">Set Budget Goal</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                          Choose a period and amount. We'll track it for you.
                      </p>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Time Period</label>
                      <div className="relative mb-4">
                           <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                           <select
                               value={budgetPeriod}
                               onChange={(e) => setBudgetPeriod(e.target.value)}
                               className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                           >
                               <option value="weekly">Weekly</option>
                               <option value="monthly">Monthly</option>
                               <option value="yearly">Yearly</option>
                               <option value="custom">Custom Range</option>
                           </select>
                           <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Custom Range Date Pickers */}
                      {budgetPeriod === 'custom' && (
                          <div className="flex items-center gap-2 mb-4 bg-amber-50/50 p-2 rounded-xl border border-amber-100 animate-in slide-in-from-top-2">
                            <div className="flex-1">
                              <label className="text-[9px] uppercase text-gray-400 font-bold ml-1 mb-0.5 block">Start</label>
                              <input 
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div className="pt-4">
                               <ArrowRight className="w-3 h-3 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] uppercase text-gray-400 font-bold ml-1 mb-0.5 block">End</label>
                              <input 
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                              />
                            </div>
                          </div>
                      )}

                      <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Budget Amount</label>
                      <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input 
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="e.g., 2000"
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                      </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                      <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                          <h4 className="text-xs font-bold text-blue-800">Smart Alerts</h4>
                          <p className="text-[10px] text-blue-600 mt-1 leading-snug">
                              You will receive alerts when you approach your {budgetPeriod === 'custom' ? 'custom period' : budgetPeriod} limit.
                          </p>
                      </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Goal
                  </button>
              </form>
          )}

          {/* PAYMENT SETTINGS VIEW */}
          {menuView === 'payment' && (
              <form onSubmit={handleSavePaymentInfo} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Billing Address</label>
                          <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input 
                                type="text"
                                value={billingAddress}
                                onChange={(e) => setBillingAddress(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Default Currency</label>
                          <div className="relative">
                              <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <select 
                                value={defaultCurrency}
                                onChange={(e) => setDefaultCurrency(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                              >
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="KRW">KRW (₩)</option>
                                  <option value="JPY">JPY (¥)</option>
                              </select>
                          </div>
                      </div>
                   </div>

                   <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                 <CardIcon className="w-5 h-5" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-gray-900 text-sm">PlayMap Premium</h4>
                                 <p className="text-xs text-gray-500">Active Subscription</p>
                             </div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-indigo-200/50 pt-3 mt-2">
                            <span className="text-gray-600">Next Billing</span>
                            <span className="font-bold text-gray-900">Nov 1, 2024 ($9.99)</span>
                        </div>
                        <button type="button" className="w-full mt-3 py-2 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50">
                            Manage Subscription
                        </button>
                   </div>
                   
                   <div className="text-center text-xs text-gray-400 px-4">
                       To manage your connected cards, please return to the main menu and use the "My Wallets" section.
                   </div>

                   <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                      Update Billing Info
                  </button>
              </form>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
          PlayMap v1.1.0 • Connected to Plaid
        </div>
      </div>

      {/* PLAID SIMULATION MODAL */}
      {isPlaidOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetPlaid} />
            
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Plaid Header */}
                <div className="bg-black text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center font-bold text-xs">P</div>
                        <span className="font-bold tracking-wide">PLAID</span>
                    </div>
                    <button onClick={resetPlaid} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content based on step */}
                <div className="p-6 min-h-[300px] flex flex-col">
                    
                    {plaidStep === 'intro' && (
                        <div className="flex flex-col h-full text-center">
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect your bank</h3>
                                <p className="text-gray-500 text-sm px-4">
                                    PlayMap uses Plaid to securely link your bank account. Your data is encrypted and private.
                                </p>
                            </div>
                            <button 
                                onClick={() => setPlaidStep('select')}
                                className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors mt-6"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {plaidStep === 'select' && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Select your institution</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {BANKS.map(bank => (
                                    <button 
                                        key={bank.id}
                                        onClick={() => handleBankSelect(bank)}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${bank.color} text-white flex items-center justify-center font-bold text-xs`}>
                                            {bank.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-gray-900 flex-1 text-left">
                                            {bank.name}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <span className="text-xs text-gray-400">Don't see your bank? Search (Demo only)</span>
                            </div>
                        </div>
                    )}

                    {plaidStep === 'auth' && selectedBank && (
                        <form onSubmit={handlePlaidSubmit} className="flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-lg ${selectedBank.color} text-white flex items-center justify-center font-bold`}>
                                    {selectedBank.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedBank.name}</h3>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Secure Connection
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">User ID</label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                        placeholder="Enter user ID"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors mt-6"
                            >
                                Submit
                            </button>
                        </form>
                    )}

                    {plaidStep === 'loading' && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
                            <h3 className="font-bold text-gray-900">Verifying credentials...</h3>
                            <p className="text-xs text-gray-500 mt-2">This usually takes a few seconds.</p>
                        </div>
                    )}

                    {plaidStep === 'success' && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Success!</h3>
                            <p className="text-sm text-gray-500 mt-2 px-6">
                                Your <strong>{selectedBank?.name}</strong> account has been successfully linked to PlayMap.
                            </p>
                        </div>
                    )}

                </div>
                
                {/* Plaid Footer */}
                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> Secured by Plaid
                    </p>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default SideMenu;
