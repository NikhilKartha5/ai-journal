import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

// IMPORTANT: REPLACE 'your_api_key_here' WITH YOUR ACTUAL GEMINI API KEY
// For a real application, this key should be stored securely and not hardcoded.
// Since this is a frontend-only implementation, we'll retrieve it from an environment variable placeholder.
const API_KEY = process.env.API_KEY || 'your_api_key_here'; 

let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== 'your_api_key_here') {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    sentimentScore: {
      type: Type.NUMBER,
      description: "A numerical score from 1 (very negative) to 10 (very positive) representing the overall mood of the entry."
    },
    emotions: {
      type: Type.ARRAY,
      description: "An array of up to 5 strings representing the dominant emotions detected in the text, e.g., 'Sadness', 'Anxiety', 'Hope'.",
      items: { type: Type.STRING }
    },
    summary: {
      type: Type.STRING,
      description: "A concise, gentle, and empathetic one-sentence summary of the user's expressed feelings."
    },
    suggestions: {
      type: Type.ARRAY,
      description: "An array of 3 actionable, personalized, and supportive self-care tips based on the entry's content.",
      items: { type: Type.STRING }
    }
  },
  required: ["sentimentScore", "emotions", "summary", "suggestions"]
};

export const analyzeDiaryEntry = async (text: string): Promise<AnalysisResult> => {
  if (!ai) {
    console.error("Gemini API key is missing. Please add it to services/geminiService.ts");
    throw new Error("AI service is not configured. Please add your API Key.");
  }

  try {
    const prompt = `Analyze the following diary entry for its emotional content. The user is looking for support and understanding. Provide a sentiment score, identify dominant emotions, write a gentle summary, and suggest personalized self-care tips. The entry is: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.7,
      }
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    if (
        typeof parsedJson.sentimentScore !== 'number' ||
        !Array.isArray(parsedJson.emotions) ||
        typeof parsedJson.summary !== 'string' ||
        !Array.isArray(parsedJson.suggestions)
    ) {
        throw new Error("API response does not match the expected format.");
    }
    
    return parsedJson as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing diary entry:", error);
    throw new Error("Failed to get analysis from the AI model.");
  }
};