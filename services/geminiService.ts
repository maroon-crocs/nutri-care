import { MealAnalysisResult } from '../types';

type ChatHistoryEntry = { role: string; text: string };

type GeminiAction =
  | 'chat'
  | 'bmiAdvice'
  | 'analyzeMeal'
  | 'cravingHack'
  | 'leftoverRecipe'
  | 'moodSnack';

interface GeminiRequestMap {
  chat: { message: string; history?: ChatHistoryEntry[] };
  bmiAdvice: { bmi: number; status: string };
  analyzeMeal: { mealDescription: string };
  cravingHack: { craving: string };
  leftoverRecipe: { ingredients: string };
  moodSnack: { mood: string };
}

interface GeminiResponseMap {
  chat: string;
  bmiAdvice: string;
  analyzeMeal: MealAnalysisResult;
  cravingHack: any;
  leftoverRecipe: any;
  moodSnack: any;
}

const requestGemini = async <TAction extends GeminiAction>(
  action: TAction,
  payload: GeminiRequestMap[TAction]
): Promise<GeminiResponseMap[TAction]> => {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const response = await fetch(`${apiBaseUrl}/api/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result && typeof result.error === 'string'
        ? result.error
        : 'The AI assistant is offline right now. Please try again in a moment.';
    throw new Error(message);
  }

  return result.data as GeminiResponseMap[TAction];
};

export const sendMessageToGemini = async (
  message: string,
  history: ChatHistoryEntry[] = []
): Promise<string> => requestGemini('chat', { message, history });

export const generateBMIAdvice = async (bmi: number, status: string): Promise<string> =>
  requestGemini('bmiAdvice', { bmi, status });

export const analyzeMeal = async (mealDescription: string): Promise<MealAnalysisResult> =>
  requestGemini('analyzeMeal', { mealDescription });

export const generateCravingHack = async (craving: string): Promise<any> =>
  requestGemini('cravingHack', { craving });

export const generateLeftoverRecipe = async (ingredients: string): Promise<any> =>
  requestGemini('leftoverRecipe', { ingredients });

export const generateMoodSnack = async (mood: string): Promise<any> =>
  requestGemini('moodSnack', { mood });
