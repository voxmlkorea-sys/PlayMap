import React from 'react';
import { NotificationItem } from '../types';
import { Heart, MessageCircle, Zap, Bell, CheckCircle2 } from 'lucide-react';

interface Props {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
}

const NotificationCenter: React.FC<Props> = ({ notifications, isOpen, onClose, onNotificationClick, onMarkAllRead }) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'social_like': return <Heart className="w-4 h-4 text-pink-500 fill-pink-100" />;
      case 'social_comment': return <MessageCircle className="w-4 h-4 text-indigo-500 fill-indigo-100" />;
      case 'offer_nearby': return <Zap className="w-4 h-4 text-amber-500 fill-amber-100" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Backdrop for closing */}
      <div className="fixed inset-0 z-[1900]" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-[2000] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 origin-top-right">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
          <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
          <button 
            onClick={onMarkAllRead}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Mark all read
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No new notifications.
            </div>
          ) : (
            notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => onNotificationClick(item)}
                className={`w-full text-left p-4 border-b border-gray-50 flex items-start gap-3 transition-colors hover:bg-gray-50 ${!item.isRead ? 'bg-indigo-50/40' : 'bg-white'}`}
              >
                <div className={`p-2 rounded-full shrink-0 ${!item.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                   {getIcon(item.type)}
                </div>
                <div>
                   <div className="flex justify-between items-start w-full">
                     <p className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                       {item.title}
                     </p>
                     {!item.isRead && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-2 mt-1" />}
                   </div>
                   <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{item.message}</p>
                   <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{item.timeAgo}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;