
import { GoogleGenAI } from "@google/genai";
import { FinancialSnapshot } from "../types";

// Initialize the Gemini API client with the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (snapshot: FinancialSnapshot, currency: string): Promise<string> => {
  try {
    const prompt = `
      Act as a friendly, professional financial advisor.
      Analyze this personal financial snapshot:
      Currency: ${currency}
      Total Assets: ${snapshot.assets}
      Total Liabilities: ${snapshot.liabilities}
      Total Equity: ${snapshot.equity}
      Income (Period): ${snapshot.income}
      Expenses (Period): ${snapshot.expenses}
      Net Income: ${snapshot.netIncome}

      Give a short, concise, and motivating financial insight or advice (max 2 sentences). 
      If Net Income is positive, suggest a smart way to allocate the savings. 
      If negative, suggest a way to cut costs.
      Mention the "1/3 Rule" (saving 1/3 of income) if relevant.
      Do not use markdown formatting, just plain text.
    `;

    // Updated model to 'gemini-3-flash-preview' for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access the .text property directly (it's not a method)
    return response.text || "Keep tracking your expenses to gain better financial health!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at the moment. Please try again later.";
  }
};
