import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    // Safely access process.env.API_KEY to prevent ReferenceError if process is not defined in some environments
    const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
      ? process.env.API_KEY 
      : '';
      
    // We initialize with the key (or empty string which will cause an API error later, caught by try/catch)
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
You are NutriGuide, a professional, empathetic, and knowledgeable nutritionist AI assistant. 
Your goal is to provide general wellness guidance, healthy eating tips, and explain nutritional concepts based on science.

Guidelines:
1. Tone: Encouraging, professional, clear, and friendly.
2. Limitations: Do NOT provide specific medical prescriptions or diagnose diseases. Always advise users to consult a doctor for medical conditions.
3. Content: Focus on balanced diets, whole foods, hydration, and sustainable lifestyle changes.
4. Brevity: Keep answers concise and easy to read (use bullet points if helpful).
5. Context: The user is browsing a nutrition website offering services like weight management, disease management (Diabetes, PCOD), and kids nutrition.
`;

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; text: string }[] = []
): Promise<string> => {
  try {
    const client = getAiClient();
    const model = 'gemini-3-flash-preview';
    
    // Simple conversational prompt construction
    const conversationContext = history.map(h => `${h.role === 'user' ? 'User' : 'NutriGuide'}: ${h.text}`).join('\n');
    const finalPrompt = conversationContext 
      ? `${conversationContext}\nUser: ${message}\nNutriGuide:` 
      : message;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: model,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on general queries
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a friendly fallback message
    return "I'm having a little trouble connecting to my nutrition knowledge base right now. Please try again in a moment.";
  }
};

export const generateBMIAdvice = async (bmi: number, status: string): Promise<string> => {
  try {
    const client = getAiClient();
    const prompt = `My BMI is ${bmi.toFixed(1)}, which is considered ${status}. 
    Please provide 3 "Daily Quests" or "Challenges" to help me improve or maintain my health. 
    Make them sound like game objectives (e.g., "Quest 1: The Hydration Hero - Drink 2L of water"). 
    Keep them short, actionable, and exciting.`;
    
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response
      }
    });

    return response.text || "Quest 1: Eat a rainbow of vegetables!\nQuest 2: Drink 8 glasses of water.\nQuest 3: Walk for 20 minutes.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Quest 1: Focus on balanced meals.\nQuest 2: Stay hydrated today.\nQuest 3: Move your body for 30 mins.";
  }
};
