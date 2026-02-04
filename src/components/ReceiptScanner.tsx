import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2, ScanLine, ShoppingCart, ArrowRight, AlertCircle, TrendingDown, Save, Receipt, Sparkles } from 'lucide-react';
import { analyzeReceipt } from '../services/geminiService';
import { ReceiptData } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReceiptData, category: string) => void;
}

const ReceiptScanner: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReceiptData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Shopping');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeReceipt(base64);
      setResult(data);
      // Auto-guess category based on merchant name (simple heuristic)
      if (data?.merchantName) {
        const name = data.merchantName.toLowerCase();
        if (name.includes('cafe') || name.includes('coffee')) setSelectedCategory('Cafe');
        else if (name.includes('burger') || name.includes('pizza') || name.includes('restaurant')) setSelectedCategory('Dining');
        else if (name.includes('uber') || name.includes('taxi')) setSelectedCategory('Transport');
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadDemo = () => {
    setIsAnalyzing(true);
    setImagePreview("https://images.unsplash.com/photo-1554412664-6a4d8f640b3b?q=80&w=600&auto=format&fit=crop"); // Mock image
    setResult(null);
    
    setTimeout(() => {
        // Toggle between two mock scenarios
        const isRestaurant = Math.random() > 0.5;
        
        const mockData: ReceiptData = isRestaurant ? {
            merchantName: "Joe's Pizza",
            date: new Date().toISOString().split('T')[0],
            currency: "USD",
            subtotal: 24.50,
            tax: 2.15,
            tip: 4.50,
            totalAmount: 31.15,
            items: [
                { name: "Cheese Pizza (L)", price: 18.00, quantity: 1 },
                { name: "Garlic Knots", price: 4.00, quantity: 1 },
                { name: "Coke", price: 2.50, quantity: 1 }
            ]
        } : {
            merchantName: "Whole Foods",
            date: new Date().toISOString().split('T')[0],
            currency: "USD",
            subtotal: 42.50,
            tax: 3.20,
            tip: 0,
            totalAmount: 45.70,
            items: [
                { name: "Organic Milk", price: 5.99, quantity: 1, cheaperAlternative: { store: "Trader Joe's", price: 4.29 } },
                { name: "Eggs (12ct)", price: 4.99, quantity: 1 },
                { name: "Chicken Breast", price: 12.50, quantity: 1 },
                { name: "Avocados", price: 5.00, quantity: 2, cheaperAlternative: { store: "Aldi", price: 3.50 } },
                { name: "Almond Butter", price: 14.02, quantity: 1 }
            ]
        };
        
        setResult(mockData);
        setSelectedCategory(isRestaurant ? 'Dining' : 'Shopping');
        setIsAnalyzing(false);
    }, 1500);
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveClick = () => {
      if (result) {
          onSave(result, selectedCategory);
          onClose();
          handleReset();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
               <ScanLine className="w-5 h-5" />
            </div>
            <div>
               <h3 className="font-bold text-gray-900 leading-tight">Receipt AI</h3>
               <p className="text-[10px] text-gray-500">Scan & Breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          
          {!imagePreview ? (
            <div className="flex flex-col gap-4">
                <div className="h-56 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                        <Camera className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="font-bold text-gray-700 relative z-10">Tap to Scan Receipt</p>
                    <p className="text-xs text-gray-400 mt-1 relative z-10">Supports JPG, PNG</p>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs text-gray-400 font-medium">OR</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <button 
                    onClick={handleLoadDemo}
                    className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Try Demo Receipt
                </button>
            </div>
          ) : (
            <div className="space-y-4">
               {/* Image Preview */}
               <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black h-32">
                  <img src={imagePreview} alt="Receipt" className="w-full h-full object-cover opacity-80" />
                  <button 
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-black/70 backdrop-blur-md"
                  >
                    Rescan
                  </button>
               </div>

               {/* Loading State */}
               {isAnalyzing && (
                 <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                    <p className="font-bold text-gray-800">Analyzing Receipt...</p>
                    <p className="text-xs text-gray-500">Separating Tax, Tip, and Items...</p>
                 </div>
               )}

               {/* Results */}
               {result && (
                 <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in">
                    
                    {/* Main Receipt Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                       {/* Receipt jagged edge effect top */}
                       <div className="absolute top-0 left-0 w-full h-1 bg-[radial-gradient(circle,transparent_50%,#f9fafb_50%)] bg-[length:10px_10px] opacity-20"></div>

                       <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100 border-dashed">
                          <div>
                             <h2 className="text-xl font-bold text-gray-900">{result.merchantName}</h2>
                             <p className="text-xs text-gray-500">{result.date}</p>
                          </div>
                          <div className="text-right">
                             <div className="flex items-center gap-1 justify-end text-xs text-gray-400 mb-1">
                                <Receipt className="w-3 h-3" />
                                <span>Total</span>
                             </div>
                             <p className="text-2xl font-bold text-indigo-600">${result.totalAmount.toFixed(2)}</p>
                          </div>
                       </div>
                       
                       {/* Category Selector */}
                       <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.slice(0, 4).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                            selectedCategory === cat 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                       </div>

                       {/* Items List */}
                       <div className="space-y-2 mb-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Items</p>
                          {result.items.map((item, idx) => (
                             <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                   <span className="text-gray-700 truncate max-w-[70%]">{item.name}</span>
                                   <span className="text-gray-900 font-medium">${item.price.toFixed(2)}</span>
                                </div>
                                
                                {/* Comparison Logic */}
                                {item.cheaperAlternative && (
                                   <div className="flex items-center gap-2 bg-green-50 px-2 py-1.5 rounded-lg border border-green-100 w-full">
                                      <TrendingDown className="w-3 h-3 text-green-600 shrink-0" />
                                      <div className="text-[10px] text-green-700 flex-1">
                                         Found cheaper at <span className="font-bold">{item.cheaperAlternative.store}</span>: <span className="font-bold underline">${item.cheaperAlternative.price.toFixed(2)}</span>
                                      </div>
                                   </div>
                                )}
                             </div>
                          ))}
                       </div>

                       {/* Breakdown Section */}
                       <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-100">
                           <div className="flex justify-between text-xs text-gray-500">
                               <span>Subtotal</span>
                               <span>${result.subtotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs text-gray-500">
                               <span>Tax</span>
                               <span>${result.tax.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs text-gray-500">
                               <span>Tip</span>
                               <span>${result.tip.toFixed(2)}</span>
                           </div>
                           <div className="border-t border-gray-200 my-1 pt-1 flex justify-between text-sm font-bold text-gray-900">
                               <span>Total</span>
                               <span>${result.totalAmount.toFixed(2)}</span>
                           </div>
                       </div>
                    </div>

                    {/* Action Bar */}
                    <button 
                        onClick={handleSaveClick}
                        className="w-full bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-transform active:scale-95 font-bold"
                    >
                        <Save className="w-5 h-5" />
                        Save to Expense Log
                    </button>
                 </div>
               )}

               {!isAnalyzing && !result && imagePreview && (
                  <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" />
                     <span>Could not extract data. Please try again with a clearer image.</span>
                  </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;