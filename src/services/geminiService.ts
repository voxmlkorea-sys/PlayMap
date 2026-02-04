
import { GoogleGenAI } from "@google/genai";
import { Transaction, ReceiptData, SearchResult, BudgetConfig } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpendingInsight = async (
    transactions: Transaction[], 
    persona: string = 'standard',
    budgetConfig?: BudgetConfig
): Promise<string> => {
  if (!process.env.API_KEY) return "API Key not configured.";

  try {
    // Calculate totals for context
    const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);

    // Summarize data for the prompt to save tokens
    const summary = transactions.map(t => 
      `- ${t.merchantName} (${t.category}): ${t.amount} ${t.currency} [${t.location ? 'Offline' : 'Online'}]`
    ).join('\n');

    let budgetContext = "";
    if (budgetConfig && budgetConfig.amount > 0) {
        const percent = Math.round((totalSpent / budgetConfig.amount) * 100);
        
        let periodText: string = budgetConfig.period;
        if (budgetConfig.period === 'custom' && budgetConfig.customStart && budgetConfig.customEnd) {
            periodText = `${budgetConfig.customStart} to ${budgetConfig.customEnd}`;
        }

        budgetContext = `
        User's Budget Goal: $${budgetConfig.amount} (${periodText}).
        Current Total Spending in View: $${totalSpent.toFixed(2)}.
        Budget Used: ${percent}%.
        If used > 100%, they are over budget. If > 80%, they are close.
        Mention this budget status in your advice.
        `;
    }

    let systemInstruction = "";

    switch (persona) {
        case 'mom':
            systemInstruction = `
              You are the user's strict but caring mother.
              Your tone should be nagging, concerned, yet affectionate.
              Scold them for spending too much on useless things (like coffee or dining out).
              Tell them to eat at home more.
              ${budgetContext ? "If they are over budget, scold them! If under, tell them to save it." : ""}
              Use phrases like "Oh my goodness", "Why do you spend so much?", "Save money for your future".
              Keep it to 1 or 2 sentences max.
            `;
            break;
        case 'robot':
            systemInstruction = `
              You are a cold, emotionless, data-driven robot analyzer.
              Output must be purely logical, objective, and statistical.
              Do not use any emotional words.
              ${budgetContext ? "State the exact budget variance percentage." : ""}
              Start sentences with "Analysis indicates...", "Data shows...", "Pattern detected...".
              Keep it to 1 or 2 sentences max.
            `;
            break;
        case 'cheerleader':
            systemInstruction = `
              You are an overly enthusiastic cheerleader!
              Your tone is high-energy, positive, and full of hype.
              Even if they spent money, find a positive spin or encourage them to do better next time!
              ${budgetContext ? "If under budget, celebrate! If over, cheer them on to do better next period!" : ""}
              Use lots of exclamation marks! Use emojis!
              Phrases like "You got this!", "Let's gooo!", "Great job tracking!".
              Keep it to 1 or 2 sentences max.
            `;
            break;
        case 'scrooge':
            systemInstruction = `
              You are Ebenezer Scrooge. You hate spending money. You love hoarding wealth and gold.
              Your tone is grumpy, stingy, and critical of any expense.
              Use old-fashioned words like "Bah Humbug!", "Wasteful!", "Penny pinching".
              ${budgetContext ? "If they are even close to the budget limit, yell at them for being reckless." : ""}
              If they spent money, criticize it harshly. If they saved (or spent little), grudgingly approve but say they could have saved more.
              Keep it to 1 or 2 sentences max.
            `;
            break;
        default: // standard
            systemInstruction = `
              You are a friendly, professional financial advisor for a fintech app.
              Provide a helpful, balanced insight about the user's spending habits.
              Focus on where they spend money (Offline vs Online) or specific categories.
              ${budgetContext ? "Incorporate their budget progress into your advice." : ""}
              Keep it to 1 or 2 sentences max.
            `;
            break;
    }

    const prompt = `
      ${systemInstruction}

      ${budgetContext}

      Here is the recent transaction history:
      ${summary}
      
      Provide the insight based on your persona.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to analyze spending history.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "AI Insights currently unavailable.";
  }
};

// Google Maps Grounding Function (Details) - KEEPS AI for Rich Details
export const getPlaceDetailsWithGrounding = async (merchantName: string, location?: { lat: number, lng: number }): Promise<{ text: string, links: any[] }> => {
  if (!process.env.API_KEY) return { text: "API Key not configured", links: [] };

  try {
    const prompt = `Tell me about "${merchantName}". What is this place known for? Is it highly rated? Be concise (max 2 sentences).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        } : undefined
      },
    });

    // Extract text
    const text = response.text || "No details found.";

    // Extract Google Maps Links (Grounding Metadata)
    const candidates = response.candidates || [];
    const groundingChunks = candidates[0]?.groundingMetadata?.groundingChunks || [];
    
    // Filter specifically for map links
    const links = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.uri.includes('google.com/maps'))
      .map((chunk: any) => ({
        title: chunk.web?.title || "View on Google Maps",
        uri: chunk.web?.uri
      }));
      
    return { text, links };

  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "Could not fetch Google Maps data.", links: [] };
  }
};

// REPLACED: Use OpenStreetMap Nominatim for FAST suggestions
export const getPlaceSuggestions = async (query: string, currentCenter?: { lat: number, lng: number }): Promise<SearchResult[]> => {
  if (query.length < 3) return [];

  try {
    // OpenStreetMap Nominatim API (Free, no key required for low volume)
    // We prioritize the viewport if possible, but Nominatim 'viewbox' is tricky without zoom levels.
    // We'll stick to a general query with address details.
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    
    const response = await fetch(url);
    const data = await response.json();

    return data.map((item: any) => ({
        name: item.name || item.display_name.split(',')[0], // Try to get a short name
        location: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: item.display_name
        },
        description: item.type // e.g., 'cafe', 'restaurant'
    }));

  } catch (error) {
    console.error("Suggestion Error (Nominatim):", error);
    return [];
  }
};

// REPLACED: Use OpenStreetMap Nominatim for FAST search
export const searchPlaceOnMap = async (query: string, currentCenter?: { lat: number, lng: number }): Promise<SearchResult | null> => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const item = data[0];
            return {
                name: item.name || item.display_name.split(',')[0],
                location: {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    address: item.display_name
                },
                description: item.type
            };
        }

        return null;
    } catch (error) {
        console.error("Search Place Error (Nominatim):", error);
        return null;
    }
};

export const analyzeReceipt = async (base64Image: string): Promise<ReceiptData | null> => {
  if (!process.env.API_KEY) return null;

  try {
    // Clean base64 string if it contains metadata
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
      Analyze this receipt image. Extract the merchant name, date, currency (default USD), subtotal, tax amount, tip amount (if any), total amount, and a list of items with their prices.
      
      CRITICAL: Return ONLY valid JSON. No markdown formatting, no code blocks.
      
      The JSON structure must be:
      {
        "merchantName": "string",
        "date": "YYYY-MM-DD",
        "currency": "USD", 
        "subtotal": number,
        "tax": number,
        "tip": number,
        "totalAmount": number,
        "items": [
          { "name": "string", "price": number, "quantity": number }
        ]
      }
      
      Rules:
      1. If tip is not visible, set "tip": 0.
      2. If tax is not listed separately, try to infer or set "tax": 0.
      3. Ensure subtotal + tax + tip is close to totalAmount.
      4. Simulate a "cheaperAlternative" logic internally: If an item looks like a common grocery item (e.g., Milk, Eggs, Bread, Cola), randomly suggest a competitor price that is slightly lower for demonstration purposes, but do NOT add it to the JSON yet. I will handle it in UI. Just return accurate OCR data.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview', // Using a vision-capable model
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      }
    });

    const text = response.text;
    if (!text) return null;

    // Clean markdown if Gemini adds it despite instructions
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanJson) as ReceiptData;
    
    // Add mock comparison data for the prototype
    if (data.items) {
      data.items = data.items.map(item => {
        // Simple heuristic for demo: 30% chance to find a cheaper price
        if (Math.random() > 0.7) {
          const competitors = ['K-Mart', 'Target', 'Aldi', 'Trader Joes'];
          const randomStore = competitors[Math.floor(Math.random() * competitors.length)];
          const discount = item.price * (0.8 + Math.random() * 0.15); // 80-95% of original price
          return {
            ...item,
            cheaperAlternative: {
              store: randomStore,
              price: parseFloat(discount.toFixed(2))
            }
          };
        }
        return item;
      });
    }

    return data;

  } catch (error) {
    console.error("Gemini Receipt OCR Error:", error);
    return null;
  }
};
