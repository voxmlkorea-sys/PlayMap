
import React, { useState } from 'react';
import { MemoItem } from '../types';
import { Plus, Trash2, Check, Minimize2, Maximize2, ClipboardList, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Props {
  items: MemoItem[];
  onAddItem: (text: string) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const MemoWidget: React.FC<Props> = ({ items, onAddItem, onToggleItem, onDeleteItem, onClearAll, isOpen, onToggleOpen }) => {
  const [inputValue, setInputValue] = useState('');
  const { isListening, startListening, hasSupport } = useSpeechRecognition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddItem(inputValue.trim());
      setInputValue('');
    }
  };

  const handleMicClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      startListening((text) => {
          // If input has text, append; otherwise set
          setInputValue(prev => prev ? `${prev} ${text}` : text);
      });
  };

  if (!isOpen) {
    return (
        <button
            onClick={onToggleOpen}
            className="bg-white p-3 rounded-full shadow-lg border border-gray-200 text-indigo-600 hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center relative"
        >
            <ClipboardList className="w-6 h-6" />
            {items.filter(i => !i.completed).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {items.filter(i => !i.completed).length}
                </span>
            )}
        </button>
    );
  }

  return (
    <div className="bg-white w-72 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
      {/* Header */}
      <div className="bg-indigo-600 p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="font-bold text-sm">Shopping List</span>
        </div>
        <div className="flex items-center gap-1">
            {items.length > 0 && (
                <button 
                    onClick={onClearAll}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1"
                    title="Clear All"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <button onClick={onToggleOpen} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <Minimize2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-64 p-2 space-y-1">
        {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs italic">
                List is empty.<br/>Add items for your trip!
            </div>
        ) : (
            items.map(item => (
                <div key={item.id} className="group flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <button 
                        onClick={() => onToggleItem(item.id)}
                        className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-all
                            ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 hover:border-indigo-400'}
                        `}
                    >
                        {item.completed && <Check className="w-3 h-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                        {item.text}
                    </span>
                    <button 
                        onClick={() => onDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add item..."
                    className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                {/* Voice Input Button */}
                {hasSupport && (
                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`absolute right-1 top-1 p-1 rounded-md transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-indigo-600'}`}
                    >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                )}
            </div>
            <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
      </form>
    </div>
  );
};

export default MemoWidget;
