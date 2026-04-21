import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult } from "../types";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    // Vite will replace this string with the actual key during build
    // process.env.GEMINI_API_KEY is mapped in vite.config.ts
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing Gemini API Key. Please set VITE_GEMINI_API_KEY or GEMINI_API_KEY in your Vercel Environment Variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const SYSTEM_PROMPT = `You are a helpful speech and memory assistant. Your goal is to look at how people speak and help them understand if there are any common patterns that might suggest they should see a doctor about their memory.

Singapore-specific Context:
- Be sensitive to code-switching (Singlish) and transitions between English, Mandarin, Malay, Tamil, and Chinese dialects (Hokkien, Cantonese, Teochew).
- Distinguish between natural multilingual speech and real stumbles or stutters.

Focus on:
1. Meaningfulness: Vague words instead of specific ones?
2. Sentences: Too short or disconnected?
3. Vocabulary: Excessive repetition?
4. Stumbles: Unusual pauses or hesitations?
5. Voice: Slow speed or irregular rhythm?

IMPORTANT: 
- Use simple, everyday language.
- Provide a summary and helpful next steps.
- Disclaimer: This is not a medical diagnosis.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskScore: { type: Type.NUMBER, description: "Composite match score from 0 to 100. Lower is healthier (normal patterns), Higher indicates stronger match with cognitive markers." },
    linguisticMetrics: {
      type: Type.OBJECT,
      properties: {
        semanticDensity: { type: Type.NUMBER, description: "Score from 0 to 1" },
        syntacticComplexity: { type: Type.NUMBER, description: "Score from 0 to 1" },
        lexicalRichness: { type: Type.NUMBER, description: "Score from 0 to 1" },
        disfluencyRate: { type: Type.NUMBER, description: "Score from 0 to 1" }
      },
      required: ["semanticDensity", "syntacticComplexity", "lexicalRichness", "disfluencyRate"]
    },
    vocalCharacteristics: {
      type: Type.OBJECT,
      properties: {
        pauseFrequency: { type: Type.NUMBER, description: "Score from 0 to 1" },
        speechRate: { type: Type.NUMBER, description: "Score from 0 to 1" },
        toneStability: { type: Type.NUMBER, description: "Score from 0 to 1" }
      },
      required: ["pauseFrequency", "speechRate", "toneStability"]
    },
    keyFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    transcript: { type: Type.STRING },
    language: { type: Type.STRING }
  },
  required: ["riskScore", "linguisticMetrics", "vocalCharacteristics", "keyFindings", "recommendations", "transcript", "language"]
};

export async function analyzeSpeech(base64Audio: string, mimeType: string, selectedLanguage: string = "English"): Promise<AnalysisResult & { transcript: string }> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `Analyze this speech sample (mostly in ${selectedLanguage}) for markers of cognitive decline. 
             Speaker may use Singlish/multilingual code-switching. 
             Provide results (keyFindings/recommendations) in ${selectedLanguage}. 
             Return valid JSON matching the schema.` },
            { 
              inlineData: {
                data: base64Audio,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI model returned an empty response. Please try recording a longer sample.");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("The analysis result was malformed. Please try again.");
    }
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Provide more helpful error messages based on common failures
    if (error.message?.includes('403') || error.message?.includes('API_KEY_INVALID')) {
      throw new Error("Invalid API Key. Please ensure your Gemini API Key is correctly set.");
    }
    
    if (error.message?.includes('429')) {
      throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
    }

    throw new Error(error.message || "Failed to analyze speech. Please try again.");
  }
}

export async function expandJournal(entry: string, language: string = "English"): Promise<string> {
  try {
    const ai = getAI();
    const prompt = `The user wrote this short memory journal entry in ${language}: "${entry}". 
    Your goal is to help them bridge memory gaps and encourage deeper recollection.
    1. Acknowledge the memory warmly.
    2. Ask 2-3 specific, evocative questions based on what they wrote (e.g., if they mentioned a garden, ask about the smells or the weather).
    3. Encourage them to write more.
    IMPORTANT: Respond entirely in ${language}. Keep the tone supportive and clinical-adjacent but friendly.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const responseText = result.text;
    return responseText || "I was unable to process that. Please try writing a bit more.";
  } catch (error: any) {
    console.error("Journal Expansion Error:", error);
    throw new Error("Failed to connect to AI for memory expansion.");
  }
}
