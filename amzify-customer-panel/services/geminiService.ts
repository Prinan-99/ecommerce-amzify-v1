
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../types";
import { PRODUCTS } from "../constants";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');

const SYSTEM_INSTRUCTION = `
You are Amzify AI, an ultra-intelligent AI shopping assistant for Amzify.
Your goal is to help users find the perfect products based on their needs, style, and preferences.

Available Products:
${PRODUCTS.map(p => `- ${p.name} (₹${p.price}): ${p.description} (Category: ${p.category})`).join('\n')}

Guidelines:
1. Be professional, elegant, and helpful.
2. If a user describes a situation (e.g., "going on a trip"), suggest appropriate products from the list.
3. If the user asks about trends outside the catalog, use Google Search to provide context.
`;

const SELLER_SYSTEM_INSTRUCTION = `
You are Amzify Seller Insights, a data-driven consultant for boutique sellers on Amzify.
Analyze sales patterns and provide strategic advice on pricing, inventory, and market trends.
Always be encouraging but analytical.
`;

export const chatWithAmzify = async (userMessage: string, history: { role: 'user' | 'model', text: string }[]) => {
  try {
    console.log("API Key available:", !!process.env.API_KEY);
    console.log("API Key value:", process.env.API_KEY?.substring(0, 10) + "...");
    
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    
    // Filter history to ensure it starts with user and alternates properly
    const validHistory = history.filter((msg, index) => {
      // First message must be user
      if (index === 0) return msg.role === 'user';
      // Subsequent messages should alternate
      return true;
    }).map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));
    
    // Build chat history
    const chat = model.startChat({
      history: validHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received:", text);

    return { text, sources: [] };
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    console.error("Error message:", error?.message);
    return { text: `Sorry, I'm having trouble connecting. ${error?.message || 'Please try again.'}`, sources: [] };
  }
};

export const getSellerInsights = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const prompt = "Analyze the current catalog and sales (Zenith Headphones are trending, Silk Dress has low stock) and provide a 2-sentence strategic tip for the seller.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Seller Insights Error:", error);
    return "Inventory levels are healthy. Consider a promotion on 'Home' category items to boost mid-week sales.";
  }
};

export const generateProductDescription = async (title: string, price: string, category: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const prompt = `Write a premium, elegant product description (approx 3 sentences) for a product named "${title}" in the category "${category}" priced at ₹${price}. The tone should be luxury e-commerce.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Description Error:", error);
    return "Crafted with precision and elegance, this piece embodies the pinnacle of modern luxury.";
  }
};

export const generateMarketingCreative = async (productName: string, goal: string, vibe: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const prompt = `Create a high-end marketing campaign for "${productName}". 
    Goal: ${goal}. 
    Vibe: ${vibe}. 
    Provide: 1) A catchy luxury headline, 2) Instagram caption with hashtags, 3) A personalized email subject line.
    Return as a clean text block.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Marketing Creative Error:", error);
    return "Failed to generate campaign. Please ensure product name and goal are specified.";
  }
};

export const generateEmailAutomationContent = async (trigger: string, name: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const prompt = `Generate a high-end, luxury e-commerce email for the trigger: "${trigger}". 
    Sequence Name: "${name}". 
    The tone should be sophisticated, exclusive, and concierge-like. 
    Provide:
    1. A compelling subject line
    2. An elegant body copy (approx 100 words)
    3. A clear call to action.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Subject: Your Curated Collection Awaits\n\nBody: We noticed you left something exquisite behind. Your selection is being held in our private reserve.";
  }
};

// Implemented generateSupportReply to handle AI-suggested customer service responses
export const generateSupportReply = async (customerName: string, message: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const prompt = `Generate a professional, empathetic, and premium response for Amzify customer support.
    Customer Name: ${customerName}
    Customer Message: "${message}"
    Tone: Sophisticated, luxury concierge style. Keep it under 100 words.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Thank you for contacting Amzify. We have received your inquiry and our concierge team is reviewing it with the utmost care.";
  } catch (error) {
    console.error("AI Support Reply Error:", error);
    return "Thank you for contacting Amzify. We have received your inquiry and our concierge team is reviewing it with the utmost care.";
  }
};

export const getSmartRecommendations = async (cartItems: Product[]) => {
  if (cartItems.length === 0) return [];
  
  const prompt = `Based on these items in the cart: ${cartItems.map(i => i.name).join(', ')}, suggest 2 other products from our catalog that would complement them. Return ONLY the product names as a JSON array.`;

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestedNames: string[] = JSON.parse(response.text() || "[]");
    return PRODUCTS.filter(p => suggestedNames.includes(p.name));
  } catch (error) {
    return [];
  }
};
