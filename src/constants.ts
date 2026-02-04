
import { Transaction, Offer, Card, UserInfo, NotificationItem, MemoItem } from './types';

// --- MOCK USERS ---
export const CURRENT_USER: UserInfo = {
  id: 'u1',
  name: 'Alex Johnson',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  isCurrentUser: true,
};

const FRIEND_ALICE: UserInfo = {
  id: 'u2',
  name: 'Alice Kim',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  isCurrentUser: false,
};

// --- IMAGE ASSETS POOL ---
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Dining': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', // Restaurant interior
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', // Food plating
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80', // Restaurant vibe
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', // Food
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', // Fancy dish
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80', // Bar
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80', // Cocktail
  ],
  'Cafe': [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', // Coffee cup
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80', // Cafe vibe
    'https://images.unsplash.com/photo-1507133750069-bef72f3707a9?w=600&q=80', // Latte art
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80', // Coffee shop interior
    'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80', // Coffee beans
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', // Cafe table
  ],
  'Shopping': [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', // Shopping mall
    'https://images.unsplash.com/photo-1511556820780-f91278d1e2df?w=600&q=80', // Store
    'https://images.unsplash.com/photo-1571781565036-d3f7595ca814?w=600&q=80', // Clothing rack
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80', // Storefront
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&q=80', // Bags
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80', // Clothing store
  ],
  'Transport': [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80', // Driving
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80', // Subway
    'https://images.unsplash.com/photo-1565545620986-538421869e5d?w=600&q=80', // Taxi
  ],
  'Entertainment': [
    'https://images.unsplash.com/photo-1517604931442-710e8ed05feb?w=600&q=80', // Movie theater
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', // Concert
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80', // Cinema
  ],
  'Online': [
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80', // Online payment
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80', // Laptop shopping
  ],
  'Default': [
     'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=600&q=80' // Generic payment
  ]
};

// --- DATA GENERATOR CONFIG ---
// CHANGED: Refined locations to specific walkable shopping districts in NYC to avoid water/bad placement
const SHOPPING_DISTRICTS = [
  { name: 'Soho, NYC', lat: 40.7233, lng: -74.0030, weight: 0.4 },        // Prince St & Broadway
  { name: 'Union Square, NYC', lat: 40.7359, lng: -73.9911, weight: 0.3 }, // 14th St
  { name: 'West Village, NYC', lat: 40.7359, lng: -74.0036, weight: 0.3 }  // Bleecker St
];

const MERCHANTS = [
  { name: 'Starbucks', category: 'Cafe' },
  { name: 'Blue Bottle', category: 'Cafe' },
  { name: 'Dunkin', category: 'Cafe' },
  { name: 'La Colombe', category: 'Cafe' },
  { name: 'McDonalds', category: 'Dining' },
  { name: 'Shake Shack', category: 'Dining' },
  { name: 'Chipotle', category: 'Dining' },
  { name: 'Sweetgreen', category: 'Dining' },
  { name: 'Joe\'s Pizza', category: 'Dining' },
  { name: 'Prince St Pizza', category: 'Dining' },
  { name: 'Whole Foods', category: 'Shopping' },
  { name: 'Trader Joes', category: 'Shopping' },
  { name: 'Sephora', category: 'Shopping' },
  { name: 'CVS Pharmacy', category: 'Shopping' },
  { name: 'Nike', category: 'Shopping' },
  { name: 'Adidas', category: 'Shopping' },
  { name: 'Uniqlo', category: 'Shopping' },
  { name: 'Kith', category: 'Shopping' },
  { name: 'Supreme', category: 'Shopping' },
  { name: 'Uber', category: 'Transport' },
  { name: 'AMC Theatres', category: 'Entertainment' },
  // Online Specific Merchants
  { name: 'Amazon', category: 'Online' },
  { name: 'Netflix', category: 'Subscription' },
  { name: 'Spotify', category: 'Subscription' },
  { name: 'Apple Services', category: 'Online' },
  { name: 'DoorDash', category: 'Dining' }
];

const MEMOS = [
  "Great service!", "Too crowded.", "Love this place.", "Quick lunch.", 
  "Expensive but worth it.", "My favorite spot.", "Just okay.", 
  "Best in town!", "Coffee was cold.", "Friendly staff.", 
  "Weekend vibes.", "Date night.", "Grocery run.", "Needed this."
];

// --- GENERATOR FUNCTIONS ---

const getRandomImage = (category: string) => {
    const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Default'];
    return images[Math.floor(Math.random() * images.length)];
};

// 1. Generate Physical Store Locations
const generateStoreLocations = (count: number) => {
  const stores = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let selectedDistrict = SHOPPING_DISTRICTS[0];
    
    // Weighted selection of district
    for (const district of SHOPPING_DISTRICTS) {
      cumulative += district.weight;
      if (rand <= cumulative) {
        selectedDistrict = district;
        break;
      }
    }

    // CHANGED: Reduced jitter from 0.04 to 0.006 (approx 600m) for tighter clustering on streets
    const lat = selectedDistrict.lat + (Math.random() - 0.5) * 0.006; 
    const lng = selectedDistrict.lng + (Math.random() - 0.5) * 0.006;
    
    // Pick a merchant that isn't strictly online-only for physical spots
    const physicalMerchants = MERCHANTS.filter(m => !['Online', 'Subscription'].includes(m.category));
    const merchant = physicalMerchants[Math.floor(Math.random() * physicalMerchants.length)];

    stores.push({
      id: `store_${i}`,
      merchantName: merchant.name,
      category: merchant.category,
      location: {
        lat,
        lng,
        address: `${Math.floor(Math.random() * 200 + 1)} ${selectedDistrict.name.split(',')[0]} St`
      }
    });
  }
  return stores;
};

// CHANGED: Reduce store count for cleaner map
const STORE_LOCATIONS = generateStoreLocations(300);

// Select "Favorite Spots" (Repeat Visits)
const FAVORITE_STORES = STORE_LOCATIONS
    .filter(s => ['Starbucks', 'Whole Foods', 'Sweetgreen', 'Shake Shack', 'Kith'].includes(s.merchantName))
    .slice(0, 15); // Top 15 favorite locations

// 2. Generate Offers
const generateOffers = (count: number) => {
  const offers: Offer[] = [];
  const now = new Date();
  
  // STRATEGY: Ensure ALL Favorite Stores have offers to guarantee "Green Pin" experience
  const targetStores = [...FAVORITE_STORES, ...STORE_LOCATIONS]; 

  for (let i = 0; i < count; i++) {
    const store = targetStores[i % targetStores.length];
    const rate = [0.05, 0.08, 0.10, 0.15, 0.20][Math.floor(Math.random() * 5)];
    
    const validFrom = new Date(now);
    validFrom.setDate(now.getDate() - Math.floor(Math.random() * 5)); 
    
    const validUntil = new Date(now);
    validUntil.setDate(now.getDate() + Math.floor(Math.random() * 10) + 1);

    // Avoid duplicate offers
    if (!offers.find(o => o.merchantName === store.merchantName && Math.abs(o.location!.lat - store.location.lat) < 0.0001)) {
        offers.push({
        id: `off_gen_${i}`,
        merchantName: store.merchantName,
        cashbackRate: rate,
        description: `${(rate * 100).toFixed(0)}% Cashback at ${store.merchantName}`,
        location: store.location,
        category: store.category,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString()
        });
    }
  }
  return offers;
};

// 3. Generate Transactions
const generateTransactions = (count: number, user: UserInfo, isGlobal: boolean) => {
  const txs: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // 30% chance to be Online Transaction (no location)
    const isOnline = Math.random() < 0.3; 
    let store;
    let location;
    
    if (isOnline) {
        // Pick an online-friendly merchant
        const onlineMerchants = MERCHANTS.filter(m => ['Online', 'Subscription', 'Shopping'].includes(m.category) || m.name === 'Amazon' || m.name === 'DoorDash' || m.name === 'Spotify' || m.name === 'Apple Services');
        const merchant = onlineMerchants[Math.floor(Math.random() * onlineMerchants.length)];
        store = {
            merchantName: merchant.name,
            category: merchant.category,
            location: undefined
        };
        location = undefined;
    } else {
        if (!isGlobal) {
            // PERSONAL DATA STRATEGY:
            if (Math.random() < 0.8 && FAVORITE_STORES.length > 0) {
                store = FAVORITE_STORES[Math.floor(Math.random() * FAVORITE_STORES.length)];
            } else {
                 store = STORE_LOCATIONS[Math.floor(Math.random() * STORE_LOCATIONS.length)];
            }
        } else {
            // GLOBAL DATA STRATEGY
            store = STORE_LOCATIONS[Math.floor(Math.random() * STORE_LOCATIONS.length)];
        }
        location = store.location;
    }

    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const amount = parseFloat((Math.random() * 100 + 5).toFixed(2));
    const hasMemo = Math.random() > 0.8;
    
    // UPDATED: High chance of photo for Global transactions to populate "What people say"
    const hasPhoto = isGlobal ? Math.random() > 0.4 : (Math.random() > 0.9 && !isOnline); 
    
    const txUser = isGlobal ? {
      id: `stranger_${Math.floor(Math.random() * 1000)}`,
      name: `User ${Math.floor(Math.random() * 1000)}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      isCurrentUser: false
    } : user;

    txs.push({
      id: `tx_gen_${isGlobal ? 'g' : 'm'}_${i}`,
      amount,
      currency: 'USD',
      merchantName: store.merchantName,
      date: date.toISOString(),
      category: store.category,
      status: 'completed',
      countryCode: 'US',
      location: location, 
      user: txUser,
      visibility: isGlobal ? 'public' : (Math.random() > 0.5 ? 'private' : 'friends'),
      memo: hasMemo ? MEMOS[Math.floor(Math.random() * MEMOS.length)] : undefined,
      photoUrl: hasPhoto ? getRandomImage(store.category) : undefined,
      likeCount: isGlobal ? Math.floor(Math.random() * 50) : 0
    });
  }
  return txs;
};

// --- EXECUTE GENERATION ---

// CHANGED: Reduced offer count to 80 for cleaner map
export const GENERATED_OFFERS = generateOffers(80);

// NEW: Explicit Online Offers for Kard Event Feature (Enhanced list)
const ONLINE_OFFERS: Offer[] = [
    {
        id: 'off_online_1',
        merchantName: 'Amazon',
        cashbackRate: 0.05,
        description: '5% Cashback on Electronics',
        category: 'Online',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
        id: 'off_online_2',
        merchantName: 'Netflix',
        cashbackRate: 0.10,
        description: '10% Cashback on Subscription',
        category: 'Subscription',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
        id: 'off_online_3',
        merchantName: 'DoorDash',
        cashbackRate: 0.08,
        description: '8% Cashback on Orders over $20',
        category: 'Dining',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
        id: 'off_online_4',
        merchantName: 'Spotify',
        cashbackRate: 0.15,
        description: '15% Cashback on Premium',
        category: 'Subscription',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
        id: 'off_online_5',
        merchantName: 'Apple Services',
        cashbackRate: 0.05,
        description: '5% Cashback on App Store',
        category: 'Online',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
        id: 'off_online_6',
        merchantName: 'Uber',
        cashbackRate: 0.05,
        description: '5% Cashback on Rides',
        category: 'Transport',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
    }
];

// Global Visits
export const GENERATED_GLOBAL_TRANSACTIONS = generateTransactions(2000, CURRENT_USER, true);

// My Visits
export const GENERATED_MY_TRANSACTIONS = generateTransactions(150, CURRENT_USER, false);


// --- EXPORT COMBINED DATA ---

export const MOCK_CARDS: Card[] = [
  {
    id: 'card_1',
    bankName: 'Chase',
    cardName: 'Sapphire Preferred',
    last4: '4242',
    color: 'bg-blue-800',
    type: 'Credit'
  },
  {
    id: 'card_2',
    bankName: 'Amex',
    cardName: 'Gold Card',
    last4: '1005',
    color: 'bg-yellow-500 text-black',
    type: 'Credit'
  }
];

export const CATEGORIES = [
  'Dining',
  'Shopping',
  'Transport',
  'Travel',
  'Overseas',
  'Entertainment',
  'Cafe',
  'Online',       // Added for filter
  'Subscription'  // Added for filter
];

export const MOCK_OFFERS: Offer[] = [
  ...GENERATED_OFFERS,
  ...ONLINE_OFFERS // Add online offers to the pool
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  ...GENERATED_MY_TRANSACTIONS
];

export const MOCK_FRIENDS_TRANSACTIONS: Transaction[] = [
  {
    id: 'ftx_1',
    merchantName: 'Joe\'s Pizza',
    amount: 4.50,
    currency: 'USD',
    date: new Date().toISOString(),
    category: 'Dining',
    status: 'completed',
    countryCode: 'US',
    location: { lat: 40.7305, lng: -74.0021, address: '7 Carmine St, NYC' }, // West Village
    memo: "Classic NYC slice! 🍕",
    photoUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80", // High quality pizza slice
    visibility: 'friends',
    user: FRIEND_ALICE,
    likeCount: 5
  }
];

export const MOCK_GLOBAL_TRANSACTIONS: Transaction[] = [
  ...GENERATED_GLOBAL_TRANSACTIONS
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'social_comment',
    title: 'New Comment',
    message: 'Alice Kim commented on your Blue Bottle visit.',
    timeAgo: '2m ago',
    isRead: false,
    relatedId: MOCK_TRANSACTIONS[0]?.id || 'tx_gen_m_0', 
    relatedType: 'transaction'
  },
  {
    id: 'n2',
    type: 'offer_nearby',
    title: 'Reward Nearby',
    message: 'Nike (8% Cashback) is 5 mins away!',
    timeAgo: '1h ago',
    isRead: false,
    relatedId: 'off_gen_0',
    relatedType: 'offer'
  }
];

export const MOCK_MEMO_ITEMS: MemoItem[] = [
  { id: 'm1', text: 'Buy Milk 🥛', completed: false },
  { id: 'm2', text: 'Eggs 🥚', completed: true },
];
