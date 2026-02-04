
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatarUrl: string; // URL to avatar image
  isCurrentUser: boolean;
}

export interface Comment {
  id: string;
  user: UserInfo;
  text: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  amount: number; // Converted amount in Home Currency (KRW)
  currency: string; // Home Currency Code (e.g., KRW)
  
  // Foreign Transaction Details
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  countryCode?: string; // e.g., 'US', 'JP', 'FR' for flags

  merchantName: string;
  date: string; // ISO date string
  category: string;
  location?: Location; // If null/undefined, considered "Online"
  status: 'pending' | 'completed';
  logoUrl?: string;

  // Social / Lifelogging features
  memo?: string;
  photoUrl?: string;
  visibility: 'private' | 'friends' | 'public'; // CHANGED: 3-level visibility
  comments?: Comment[]; // NEW: Comments for friend interactions
  likeCount?: number; // NEW: Number of "Helpful" votes
  
  // Who made this transaction?
  user: UserInfo;
  
  // NEW: Store full receipt data if available
  receiptData?: ReceiptData;
}

export interface Offer {
  id: string;
  merchantName: string; // Used for matching
  cashbackRate: number; // e.g., 0.05 for 5%
  description: string;
  location?: Location; // NEW: To show available offers on map
  category?: string;
  validFrom: string; // NEW: ISO Date
  validUntil: string; // NEW: ISO Date
}

// NEW: Search Result from Map
export interface SearchResult {
  name: string;
  location: Location;
  description?: string;
}

export interface Card {
  id: string;
  bankName: string;
  cardName: string;
  last4: string;
  color: string; // Tailwind color class or hex
  type: 'Credit' | 'Debit';
}

export interface SpendingSummary {
  total: number;
  byCategory: Record<string, number>;
}

// NEW: Notification Interface
export type NotificationType = 'social_like' | 'social_comment' | 'offer_nearby' | 'system_alert';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  relatedId?: string; // ID of transaction or offer to link to
  relatedType?: 'transaction' | 'offer';
}

// NEW: Memo Interface for Shopping List
export interface MemoItem {
  id: string;
  text: string;
  completed: boolean;
}

// NEW: Receipt Scanner Interfaces
export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
  cheaperAlternative?: {
    store: string;
    price: number;
  };
}

export interface ReceiptData {
  merchantName: string;
  date: string;
  currency: string;
  subtotal: number;
  tax: number;
  tip: number;
  totalAmount: number;
  items: ReceiptItem[];
}

// NEW: Shared Budget Configuration Type
export interface BudgetConfig {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  customStart?: string; // YYYY-MM-DD
  customEnd?: string;   // YYYY-MM-DD
}
