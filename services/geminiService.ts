
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_PROMPT } from "../constants";

/**
 * Sends a message to the Gemini API with conversation history and optional image data.
 */
export const sendMessage = async (history: Message[], userInput: string, imageBase64?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userMessageParts: any[] = [];
  
  if (userInput.trim()) {
    userMessageParts.push({ text: userInput });
  } else if (imageBase64) {
    userMessageParts.push({ text: "Please analyze this geological sample image." });
  }

  if (imageBase64) {
    userMessageParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  if (userMessageParts.length === 0) {
    throw new Error("Cannot send an empty message.");
  }

  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: m.parts.map(p => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { 
          inlineData: {
            mimeType: p.inlineData.mimeType,
            data: p.inlineData.data
          } 
        };
        return { text: '' };
      })
    })),
    {
      role: 'user' as const,
      parts: userMessageParts
    }
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text || "I analyzed your input but couldn't generate a textual interpretation.";
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    if (error.message?.includes("Rpc failed") || error.status === "UNKNOWN" || error.code === 500) {
      throw new Error("The Advisor connection was interrupted (RPC Error). This usually resolves within seconds.");
    }
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

/**
 * Specifically analyzes a geological image and returns structured feature descriptions.
 */
export const analyzeGeologicalImage = async (imageBase64: string, type: 'hand' | 'thin'): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const handPrompt = `Analyze this hand sample photograph. Act as a senior petrologist. 
  Provide a JSON object with these exact string fields: 
  "color", "texture", "grainSize", "structures", "fossils", "hardness", "luster", "magnetism".
  Use professional geological terminology.`;

  const thinPrompt = `Analyze this petrographic thin section photomicrograph. 
  Provide a JSON object with these fields:
  "mineralList": an array of objects like { "name": string, "percentage": number } totaling roughly 100%,
  "pplFeatures": string (plane polarized light observations),
  "xplFeatures": string (crossed polarized light observations),
  "textures": string (microscopic textures like interlocking, poikilitic, etc.).`;

  const prompt = type === 'hand' ? handPrompt : thinPrompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more consistent data extraction
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Image Analysis Error:", error);
    throw new Error("Failed to automatically describe features. Please try again or fill manually.");
  }
};
