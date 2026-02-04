
import { Offer, Transaction } from '../types';
import { MOCK_OFFERS } from '../constants';

// --- CONFIGURATION ---
// 백엔드 개발 완료 시 false로 변경하세요.
const USE_MOCK_API = true; 
const API_BASE_URL = 'https://api.your-backend-domain.com/v1';

/**
 * [GET] /offers
 * Fetches active offers for the user.
 * Real Flow: App -> Your Backend -> Kard API (/offers)
 */
export const fetchKardOffers = async (userId: string): Promise<Offer[]> => {
  if (!USE_MOCK_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/kard/offers?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Add auth token here
        }
      });

      if (!response.ok) throw new Error('Failed to fetch offers');
      
      const data = await response.json();
      // Data transformation might be needed here depending on your backend response format
      return data as Offer[]; 

    } catch (error) {
      console.error("[Kard API] Error fetching offers:", error);
      // Fallback to mock data or return empty array depending on requirement
      return MOCK_OFFERS; 
    }
  }

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Mock API] Offers loaded for user: ${userId}`);
      resolve(MOCK_OFFERS);
    }, 800);
  });
};

/**
 * [POST] /transactions/match
 * Checks if a transaction is eligible for a reward.
 * Real Flow: App -> Your Backend -> Kard API (/transactions)
 */
export const checkKardMatch = async (transaction: Transaction): Promise<{ matched: boolean, offer?: Offer, rewardAmount?: number }> => {
  if (!USE_MOCK_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/kard/transactions/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });

      if (!response.ok) throw new Error('Failed to match transaction');
      return await response.json();

    } catch (error) {
      console.error("[Kard API] Error matching transaction:", error);
      return { matched: false };
    }
  }

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Merchant Name Matching (Bidirectional for better demo experience)
      const matchedOffer = MOCK_OFFERS.find(o => {
          const tName = transaction.merchantName.toLowerCase();
          const oName = o.merchantName.toLowerCase();
          return tName.includes(oName) || oName.includes(tName);
      });

      if (matchedOffer) {
        console.log(`[Mock API] Match Found! ${matchedOffer.merchantName}`);
        resolve({
            matched: true,
            offer: matchedOffer,
            rewardAmount: transaction.amount * matchedOffer.cashbackRate
        });
      } else {
        resolve({ matched: false });
      }
    }, 600);
  });
};

/**
 * [POST] /users/enroll
 * Enrolls a card into the CLO program.
 */
export const enrollCardToKard = async (cardId: string): Promise<boolean> => {
    if (!USE_MOCK_API) {
        try {
            const response = await fetch(`${API_BASE_URL}/kard/cards/${cardId}/enroll`, {
                method: 'POST'
            });
            return response.ok;
        } catch (error) {
            console.error("[Kard API] Enrollment failed:", error);
            return false;
        }
    }

    // --- MOCK IMPLEMENTATION ---
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[Mock API] Card ${cardId} enrolled.`);
            resolve(true);
        }, 1000);
    });
};
