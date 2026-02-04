import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { MessageCircle, ThumbsUp } from 'lucide-react';

interface Props {
  merchantName: string;
  reviews: Transaction[];
  currentTransactionId?: string;
  compact?: boolean; // New prop
}

const PlaceReviews: React.FC<Props> = ({ merchantName, reviews, currentTransactionId, compact = false }) => {
  
  // Local state to track liked reviews (Mocking backend persistence)
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  // Filter relevant reviews:
  // 1. Matches merchant name (case-insensitive)
  // 2. Is NOT the currently viewed transaction (deduplication)
  // 3. Has a memo or photo (to be a meaningful review)
  const filteredReviews = useMemo(() => {
    return reviews.filter(t => 
      t.merchantName.toLowerCase() === merchantName.toLowerCase() &&
      t.id !== currentTransactionId &&
      (t.memo || t.photoUrl)
    );
  }, [reviews, merchantName, currentTransactionId]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = new Set(likedReviews);
    if (newLiked.has(id)) {
        newLiked.delete(id);
    } else {
        newLiked.add(id);
    }
    setLikedReviews(newLiked);
  };

  if (filteredReviews.length === 0) {
      if (compact) return (
         <div className="py-10 text-center text-gray-400 text-sm italic">
             No reviews found for this place.
         </div>
      );
      return null;
  }

  return (
    <div className="mt-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
      {!compact && (
        <div className="flex items-center gap-2 mb-4 px-1">
            <MessageCircle className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            What people say
            </h3>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {filteredReviews.length}
            </span>
        </div>
      )}

      <div className="space-y-4">
        {filteredReviews.map(review => {
          const isLiked = likedReviews.has(review.id);
          const likeCount = (review.likeCount || 0) + (isLiked ? 1 : 0);
          
          return (
            <div key={review.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative transition-all hover:shadow-md">
              {/* Review Header: User Info */}
              <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={review.user.avatarUrl} 
                    alt={review.user.name} 
                    className="w-9 h-9 rounded-full bg-gray-100 border border-gray-50 object-cover" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{review.user.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(review.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
              </div>

              {/* Review Content */}
              <div className="pl-1">
                {review.memo && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {review.memo}
                  </p>
                )}

                {review.photoUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-100 mb-3">
                    <img 
                      src={review.photoUrl} 
                      alt="Review attachment" 
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50">
                  <button 
                      onClick={(e) => handleLike(review.id, e)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full transition-all active:scale-95 ${
                          isLiked 
                          ? 'text-indigo-600 bg-indigo-50' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount > 0 ? likeCount : 'Helpful'}</span>
                  </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
         <button className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
           View all {filteredReviews.length} check-ins
         </button>
      </div>
    </div>
  );
};

export default PlaceReviews;