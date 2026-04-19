import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please ensure VITE_GEMINI_API_KEY is set in your .env file.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const SYSTEM_PROMPT = `You are a helpful speech and memory assistant. Your goal is to look at how people speak and help them understand if there are any common patterns that might suggest they should see a doctor about their memory.

Singapore-specific Context:
- Be sensitive to code-switching (Singlish) and transitions between English, Mandarin, Malay, Tamil, and Chinese dialects (Hokkien, Cantonese, Teochew).
- Distinguish between natural multilingual speech and real stumbles or confusion.

Focus on:
1. Meaningfulness: Are they using simple or vague words instead of specific ones?
2. Sentences: Are their sentences very short or simple?
3. Vocabulary: Do they repeat the same few words often?
4. Stumbles: Are there many unusual pauses or hesitations?
5. Voice: Is their speech unusually slow or the rhythm irregular?

IMPORTANT: 
- Use simple, everyday language that anyone can understand.
- Avoid scientific terms like "Semantic Density" or "Syntactic Complexity" in your explanations.
- Provide a summary and helpful next steps.
- This is for information only. Always include a disclaimer that this is not a medical diagnosis.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskScore: { type: Type.NUMBER, description: "Composite risk score from 0-100" },
    linguisticMetrics: {
      type: Type.OBJECT,
      properties: {
        semanticDensity: { type: Type.NUMBER, description: "0-1 score" },
        syntacticComplexity: { type: Type.NUMBER, description: "0-1 score" },
        lexicalRichness: { type: Type.NUMBER, description: "0-1 score" },
        disfluencyRate: { type: Type.NUMBER, description: "0-1 score" }
      },
      required: ["semanticDensity", "syntacticComplexity", "lexicalRichness", "disfluencyRate"]
    },
    vocalCharacteristics: {
      type: Type.OBJECT,
      properties: {
        pauseFrequency: { type: Type.NUMBER },
        speechRate: { type: Type.NUMBER },
        toneStability: { type: Type.NUMBER }
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
    language: { type: Type.STRING, description: "The detected or primary language of the recording" }
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
            { text: `Analyze this speech sample (mostly in ${selectedLanguage}) for linguistic and vocal markers of cognitive decline. 
             Note that the speaker may use Singlish or code-switch. 
             IMPORTANT: Provide the "keyFindings" and "recommendations" in ${selectedLanguage} so the user can understand the results in their primary language. 
             Provide the complete result in the specified JSON format.` },
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
        responseSchema: RESPONSE_SCHEMA
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
