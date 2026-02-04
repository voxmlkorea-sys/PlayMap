import React, { useState } from 'react';
import { Transaction, UserInfo, Comment } from '../types';
import { Send, Users } from 'lucide-react';

interface Props {
  transaction: Transaction;
  currentUser: UserInfo;
  compact?: boolean; // New prop to hide header if needed
}

const FriendComments: React.FC<Props> = ({ transaction, currentUser, compact = false }) => {
  const [comments, setComments] = useState<Comment[]>(transaction.comments || []);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment: Comment = {
      id: `nc_${Date.now()}`,
      user: currentUser,
      text: inputText,
      timestamp: new Date().toISOString()
    };

    setComments([...comments, newComment]);
    setInputText('');
  };

  return (
    <div className="mt-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
      {!compact && (
        <div className="flex items-center gap-2 mb-4 px-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Friends Board
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Friends Only
            </span>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[200px] flex flex-col">
        {/* Comment List */}
        <div className="flex-1 space-y-4 mb-4">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic py-8">
              <p>No comments yet.</p>
              <p>Be the first to say something!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMe = comment.user.id === currentUser.id;
              return (
                <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img 
                    src={comment.user.avatarUrl} 
                    alt={comment.user.name} 
                    className="w-8 h-8 rounded-full bg-white border border-gray-200" 
                  />
                  <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`
                      px-3 py-2 rounded-2xl text-sm shadow-sm
                      ${isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }
                    `}>
                      {comment.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                       {/* Simple time logic for prototype */}
                       {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FriendComments;