
import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Transaction, Offer, SearchResult } from '../types';
import { Crown, Sparkles, Search, ShoppingBag, Utensils, Coffee, Car, MapPin, DollarSign, Percent, Globe, Cloud } from 'lucide-react';

// --- ONLINE HUB CONFIG ---
const ONLINE_HUB_LOCATION: [number, number] = [40.6892, -74.0445]; // Near Statue of Liberty / Water

// --- CUSTOM MARKER RENDERER ---

// 1. Offer Marker (The "Coin" - Unvisited Opportunity)
const createOfferMarker = (offer: Offer) => {
    // User requested to reduce by more than half from previous 0.7 -> ~0.3
    // This makes it a small dot to avoid clutter
    const scale = 0.3; 
    const size = 36 * scale; // ~11px
    
    // Gradient ID unique to this render usually, but static for now is fine
    const gradientId = "offerGradient"; 

    const html = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        transition: transform 0.2s;
      ">
        <svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow: visible;">
            <defs>
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#34D399;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
            </defs>
            <!-- Thicker stroke for visibility at small size -->
            <circle cx="50" cy="50" r="45" fill="url(#${gradientId})" stroke="white" stroke-width="15" />
        </svg>
      </div>
    `;
  
    return L.divIcon({
      className: 'custom-offer-marker',
      html: html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2], // Center anchored
      popupAnchor: [0, -size / 2],
    });
};

// 2. Transaction Marker (The "Pin" - Visited Place)
const createTransactionMarker = (count: number, isSelected: boolean, category: string, hasOffer: boolean, isOnlineHub: boolean = false, hasOnlineOffersAvailable: boolean = false) => {
  const isVip = count >= 5 && !isOnlineHub;
  const scale = isSelected ? 1.2 : 1.0;

  let fillColor = '#FFFFFF';
  let strokeColor = '#94A3B8'; // Default slate
  let iconColor = '#64748B';
  let badgeIcon = null;
  let gradientFill = null;

  // Icon Selection
  let IconComponent = MapPin;
  if (isOnlineHub) IconComponent = Globe;
  else if (category === 'Dining') IconComponent = Utensils;
  else if (category === 'Shopping') IconComponent = ShoppingBag;
  else if (category === 'Cafe') IconComponent = Coffee;
  else if (category === 'Transport') IconComponent = Car;

  if (isOnlineHub) {
     if (hasOnlineOffersAvailable) {
         // ONLINE HUB WITH OFFERS: Green "Deals" Style
         fillColor = '#ECFDF5'; // Emerald-50
         strokeColor = '#059669'; // Emerald-600
         iconColor = '#059669'; 
         badgeIcon = <Sparkles size={12} fill="#F59E0B" className="text-yellow-400" />;
     } else {
         // STANDARD ONLINE HUB
         fillColor = '#EFF6FF'; // Blue-50
         strokeColor = '#3B82F6'; // Blue-500
         iconColor = '#2563EB'; // Blue-600
         badgeIcon = <Cloud size={12} fill="#3B82F6" className="text-white" />;
     }
  } else if (hasOffer) {
     // MATCHED: Premium Green Pin with Green Border (Updated from Gold to Green)
     strokeColor = '#059669'; // Emerald-700
     iconColor = '#FFFFFF';
     gradientFill = "url(#matchedGradient)";
     badgeIcon = <Sparkles size={12} fill="#F59E0B" className="text-yellow-300" />;
  } else if (isVip) {
     // VIP: Gold Pin
     fillColor = '#FFFBEB'; // Light amber
     strokeColor = '#F59E0B';
     iconColor = '#D97706';
     badgeIcon = <Crown size={12} fill="#F59E0B" className="text-amber-500" />;
  } else {
     // NORMAL: White Pin with Category Color Stroke
     switch (category) {
        case 'Dining': strokeColor = '#F97316'; iconColor = '#F97316'; break;
        case 'Shopping': strokeColor = '#0EA5E9'; iconColor = '#0EA5E9'; break;
        case 'Cafe': strokeColor = '#F43F5E'; iconColor = '#F43F5E'; break;
        case 'Transport': strokeColor = '#475569'; iconColor = '#475569'; break;
        default: strokeColor = '#6366F1'; iconColor = '#6366F1';
     }
  }

  const pinPath = "M50 0 C20 0 0 22 0 48 C0 75 50 120 50 120 C50 120 100 75 100 48 C100 22 80 0 50 0 Z";

  const html = `
    <div style="
        position: relative;
        width: ${50 * scale}px;
        height: ${60 * scale}px;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        transform-origin: bottom center;
        transition: transform 0.2s;
    ">
      <svg viewBox="0 0 100 120" width="100%" height="100%" style="overflow: visible;">
        <defs>
            <linearGradient id="matchedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
            </linearGradient>
        </defs>
        
        <!-- Pin Body -->
        <path d="${pinPath}" fill="${gradientFill || fillColor}" stroke="${strokeColor}" stroke-width="3" />
        
        <!-- Inner Circle Background -->
        ${!hasOffer && !isOnlineHub ? `<circle cx="50" cy="48" r="30" fill="#F8FAFC" opacity="0.5" />` : ''}
        ${isOnlineHub ? `<circle cx="50" cy="48" r="30" fill="${hasOnlineOffersAvailable ? '#D1FAE5' : '#DBEAFE'}" opacity="0.5" />` : ''}
      </svg>
      
      <!-- Icon -->
      <div style="
        position: absolute;
        top: ${scale === 1.2 ? '22px' : '18px'};
        left: 50%;
        transform: translateX(-50%);
        color: ${iconColor};
      ">
        ${renderToStaticMarkup(<IconComponent size={20 * scale} strokeWidth={2.5} />)}
      </div>

      <!-- Count Badge -->
      ${count > 1 ? `
        <div style="
            position: absolute;
            top: 0;
            right: 0;
            background: #1E293B;
            color: white;
            font-size: 10px;
            font-weight: bold;
            min-width: 20px;
            height: 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
        ">
            ${count}
        </div>
      ` : ''}

      <!-- Status Badge (Crown/Sparkle/Cloud) -->
      ${badgeIcon ? `
        <div style="
            position: absolute;
            top: -6px;
            left: -6px;
            background: white;
            border-radius: 50%;
            padding: 3px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid ${strokeColor};
        ">
            ${renderToStaticMarkup(badgeIcon)}
        </div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'custom-tx-marker',
    html: html,
    iconSize: [50 * scale, 60 * scale],
    iconAnchor: [25 * scale, 60 * scale], // Bottom tip anchored
    popupAnchor: [0, -60 * scale],
  });
};

const createSearchMarker = (hasOffer: boolean) => {
    const icon = hasOffer ? (
        <div className="flex flex-col items-center animate-pulse">
            <Sparkles size={28} className="text-yellow-300 fill-yellow-300 drop-shadow-md" />
        </div>
    ) : (
        <MapPin size={32} className="text-white fill-white" />
    );

    return L.divIcon({
        className: 'custom-search-marker',
        html: renderToStaticMarkup(
            <div className="relative flex flex-col items-center justify-end h-20 w-20 drop-shadow-xl">
                 {hasOffer && (
                     <div className="absolute -top-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 shadow-sm z-10 whitespace-nowrap flex items-center gap-1">
                        <Sparkles size={10} fill="black" /> CASHBACK
                     </div>
                 )}
                 <div className={`rounded-full p-3 animate-bounce border-4 shadow-lg ${hasOffer ? 'bg-emerald-600 border-white ring-2 ring-emerald-200' : 'bg-red-600 border-white'}`}>
                    {icon}
                 </div>
                 <div className={`absolute -bottom-2 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ${hasOffer ? 'bg-emerald-800' : 'bg-black'}`}>
                    {hasOffer ? 'Offer Found' : 'Found'}
                 </div>
            </div>
        ),
        iconSize: [80, 80],
        iconAnchor: [40, 80],
        popupAnchor: [0, -80]
    });
};

interface Props {
  transactions: Transaction[];
  offers: Offer[];
  selectedId?: string;
  selectedCategory?: string;
  onMarkerClick: (id: string, type: 'transaction' | 'offer') => void;
  onMapClick: () => void;
  searchResult?: SearchResult | null;
}

const MapRevalidator = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const MapController: React.FC<{ 
  selectedCategory: string; 
  onMapClick: () => void; 
  selectedId?: string;
  groupedData: { key: string, transactions: Transaction[], position: [number, number], isOnlineHub: boolean }[];
  offers: Offer[];
  searchResult?: SearchResult | null;
}> = ({ selectedCategory, onMapClick, selectedId, groupedData, offers, searchResult }) => {
  const map = useMap();
  const dataRef = useRef({ groupedData, offers, searchResult });

  useEffect(() => {
    dataRef.current = { groupedData, offers, searchResult };
  }, [groupedData, offers, searchResult]);

  useMapEvents({
    click: () => onMapClick(),
  });

  useEffect(() => {
     if (searchResult && searchResult.location) {
         map.flyTo([searchResult.location.lat, searchResult.location.lng], 16, { duration: 1.5, easeLinearity: 0.25 });
     }
  }, [searchResult, map]);

  useEffect(() => {
    if (selectedCategory === 'Overseas') {
        map.flyTo([35, 0], 2, { duration: 1.5 });
    } else if (selectedCategory === 'Online') {
        // Fly to Online Hub
        map.flyTo(ONLINE_HUB_LOCATION, 14, { duration: 1.5 });
    }
  }, [selectedCategory, map]);

  useEffect(() => {
    if (!selectedId) return;
    const { groupedData: currentGroups, offers: currentOffers } = dataRef.current;

    const group = currentGroups.find(g => g.transactions.some(t => t.id === selectedId));
    if (group) {
        map.flyTo(group.position, 16, { duration: 1.5, easeLinearity: 0.25 });
        return;
    }

    const offer = currentOffers.find(o => o.id === selectedId);
    if (offer && offer.location) {
        map.flyTo([offer.location.lat, offer.location.lng], 16, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [selectedId, map]); 

  return null;
};

const MapComponent: React.FC<Props> = ({ transactions, offers, selectedId, selectedCategory = 'All', onMarkerClick, onMapClick, searchResult }) => {
  
  const mapOffers = offers.filter(o => !!o.location);
  // Count online offers (no location) to check if we should highlight the Online Hub
  const onlineOffersCount = offers.filter(o => !o.location || o.category === 'Online').length;

  // CHANGED: Shifted center to Soho/NoHo area to match new data cluster
  const centerPosition: [number, number] = [40.7250, -73.9950];

  // Match search result with offers to highlight if it's a Kard event
  const searchResultOffer = useMemo(() => {
       if (!searchResult) return null;
       return offers.find(o => 
           o.merchantName.toLowerCase().includes(searchResult.name.toLowerCase()) || 
           searchResult.name.toLowerCase().includes(o.merchantName.toLowerCase())
       );
  }, [searchResult, offers]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { key: string, transactions: Transaction[], position: [number, number], isOnlineHub: boolean }> = {};
    const onlineTransactions: Transaction[] = [];

    transactions.forEach(t => {
      // Logic: If no location, add to Online Hub list
      if (!t.location) {
          onlineTransactions.push(t);
          return;
      }

      const key = `${t.location.lat.toFixed(5)},${t.location.lng.toFixed(5)}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          transactions: [],
          position: [t.location.lat, t.location.lng],
          isOnlineHub: false
        };
      }
      groups[key].transactions.push(t);
    });

    // Add Online Hub Group if exists OR if there are online offers to show even without transactions
    // Note: We only show the hub if there are transactions, as per original logic, but we could change this.
    // Keeping it to active transactions for now.
    if (onlineTransactions.length > 0) {
        groups['online-hub'] = {
            key: 'online-hub',
            transactions: onlineTransactions,
            position: ONLINE_HUB_LOCATION,
            isOnlineHub: true
        };
    }

    return Object.values(groups);
  }, [transactions]);

  return (
    <div className="h-full w-full z-0 relative bg-slate-100">
      <MapContainer 
        center={centerPosition} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="h-full w-full outline-none"
        zoomControl={false}
      >
        <MapRevalidator />
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en"
          maxZoom={20}
          detectRetina={true}
        />
        
        <MapController 
            selectedCategory={selectedCategory} 
            onMapClick={onMapClick} 
            selectedId={selectedId}
            groupedData={groupedTransactions}
            offers={offers}
            searchResult={searchResult}
        />

        {searchResult && searchResult.location && (
            <Marker
                position={[searchResult.location.lat, searchResult.location.lng]}
                icon={createSearchMarker(!!searchResultOffer)}
                zIndexOffset={10000}
            >
                <Popup className="font-sans" autoPan={false}>
                     <div className="font-bold text-sm text-gray-900">{searchResult.name}</div>
                     <div className="text-xs text-gray-500 mb-2">{searchResult.location.address}</div>
                     {searchResultOffer && (
                         <div className="bg-emerald-50 border border-emerald-100 rounded p-1 text-center">
                            <div className="text-xs font-bold text-emerald-600">Offer Available</div>
                            <div className="text-[10px] text-emerald-500">{Math.round(searchResultOffer.cashbackRate * 100)}% Cashback</div>
                         </div>
                     )}
                </Popup>
            </Marker>
        )}

        {/* 1. Offers Markers ("Coins") - Shown if not visited or matched yet? 
             Actually, we show them as unvisited opportunities.
        */}
        {mapOffers.map((offer) => {
            // Check if this offer location is already covered by a transaction group (visited)
            // If visited, we rely on the Transaction Pin to show the "Matched" state
            // But for simple logic, we just render them if they are strictly offers.
            // A better logic: Check if any transaction is near this offer.
            const isVisited = groupedTransactions.some(g => 
                Math.abs(g.position[0] - offer.location!.lat) < 0.0001 &&
                Math.abs(g.position[1] - offer.location!.lng) < 0.0001
            );
            
            // If visited, hide this offer marker, because the Visit Marker will become "Premium"
            if (isVisited) return null;

            return (
                <Marker
                    key={`offer-${offer.id}`}
                    position={[offer.location!.lat, offer.location!.lng]}
                    icon={createOfferMarker(offer)}
                    eventHandlers={{
                        click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            onMarkerClick(offer.id, 'offer');
                        }
                    }}
                    zIndexOffset={500}
                >
                    <Popup className="font-sans" autoPan={false}>
                         <div className="text-center">
                            <div className="font-bold text-sm text-emerald-600">{offer.merchantName}</div>
                            <div className="text-xs font-bold text-gray-700">{Math.round(offer.cashbackRate*100)}% Cashback</div>
                            <button className="mt-2 bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-bold w-full">
                                Tap to Activate
                            </button>
                         </div>
                    </Popup>
                </Marker>
            );
        })}

        {/* 2. Transaction Pins (Visits) */}
        {groupedTransactions.map((group) => {
           const sortedTxs = group.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
           const latestTx = sortedTxs[0];
           const count = group.transactions.length;
           const isSelected = group.transactions.some(t => t.id === selectedId);
           
           // Match Offer Logic
           const hasOffer = offers.some(o => 
               o.merchantName.toLowerCase() === latestTx.merchantName.toLowerCase() ||
               (o.location && 
                latestTx.location &&
                Math.abs(o.location.lat - latestTx.location.lat) < 0.0001 && 
                Math.abs(o.location.lng - latestTx.location.lng) < 0.0001)
           );

           return (
            <Marker 
              key={`group-${group.key}`} 
              position={group.position}
              icon={createTransactionMarker(
                  count, 
                  isSelected, 
                  latestTx.category, 
                  hasOffer, 
                  group.isOnlineHub,
                  group.isOnlineHub && onlineOffersCount > 0 // Pass flag if online offers exist
              )}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  onMarkerClick(latestTx.id, 'transaction');
                },
              }}
              zIndexOffset={isSelected ? 1000 : (hasOffer ? 950 : (count >= 5 ? 900 : 800))}
            >
              <Popup className="font-sans" autoPan={false}>
                <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="font-bold text-sm text-gray-900">{group.isOnlineHub ? 'Online Purchases' : latestTx.merchantName}</div>
                    
                    {count > 1 ? (
                        <div className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded w-max">
                            {count} items total
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">
                            {new Date(latestTx.date).toLocaleDateString()}
                        </div>
                    )}

                    {group.isOnlineHub && onlineOffersCount > 0 && (
                        <div className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold w-max flex items-center gap-1 mt-1 border border-emerald-200">
                            <Sparkles size={10} fill="currentColor" /> {onlineOffersCount} Deals Available
                        </div>
                    )}

                    {hasOffer && !group.isOnlineHub && (
                        <div className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold w-max flex items-center gap-1 mt-1 border border-emerald-200">
                            <Sparkles size={10} fill="currentColor" /> Cashback Pending
                        </div>
                    )}
                </div>
              </Popup>
            </Marker>
           );
        })}
      </MapContainer>
      
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50/90 to-transparent pointer-events-none z-[400]" />
      
      <style>{`
        .custom-tx-marker, .custom-offer-marker, .custom-search-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
