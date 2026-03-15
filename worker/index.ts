interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

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

const MODEL = 'gemini-2.5-flash';

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (url.pathname !== '/api/gemini' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found.' }, 404, corsHeaders);
    }

    if (origin && !isAllowedOrigin(origin, env.ALLOWED_ORIGINS)) {
      return jsonResponse({ error: 'Origin not allowed.' }, 403, corsHeaders);
    }

    try {
      const body = (await request.json()) as {
        action?: GeminiAction;
        payload?: GeminiRequestMap[GeminiAction];
      };

      const data = await handleGeminiAction(body, env);
      return jsonResponse({ data }, 200, corsHeaders);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: getFriendlyGeminiError(error) }, 500, corsHeaders);
    }
  },
};

async function handleGeminiAction(
  body: { action?: GeminiAction; payload?: GeminiRequestMap[GeminiAction] },
  env: Env
) {
  const action = body.action;
  const payload = body.payload;

  switch (action) {
    case 'chat':
      return sendMessageToGemini(payload as GeminiRequestMap['chat'], env);
    case 'bmiAdvice':
      return generateBMIAdvice(payload as GeminiRequestMap['bmiAdvice'], env);
    case 'analyzeMeal':
      return analyzeMeal(payload as GeminiRequestMap['analyzeMeal'], env);
    case 'cravingHack':
      return generateCravingHack(payload as GeminiRequestMap['cravingHack'], env);
    case 'leftoverRecipe':
      return generateLeftoverRecipe(payload as GeminiRequestMap['leftoverRecipe'], env);
    case 'moodSnack':
      return generateMoodSnack(payload as GeminiRequestMap['moodSnack'], env);
    default:
      throw new Error('Unknown Gemini action.');
  }
}

async function sendMessageToGemini(payload: GeminiRequestMap['chat'], env: Env) {
  const history = payload.history || [];
  const conversationContext = history
    .map((entry) => `${entry.role === 'user' ? 'User' : 'NutriGuide'}: ${entry.text}`)
    .join('\n');
  const finalPrompt = conversationContext
    ? `${conversationContext}\nUser: ${payload.message}\nNutriGuide:`
    : payload.message;

  return generateText(finalPrompt, env, { systemInstruction: SYSTEM_INSTRUCTION });
}

async function generateBMIAdvice(payload: GeminiRequestMap['bmiAdvice'], env: Env) {
  const prompt = `My BMI is ${payload.bmi.toFixed(1)}, which is considered ${payload.status}.
Please provide 3 "Daily Quests" or "Challenges" to help me improve or maintain my health.
Make them sound like game objectives (e.g., "Quest 1: The Hydration Hero - Drink 2L of water").
Keep them short, actionable, and exciting.`;

  return generateText(prompt, env, { systemInstruction: SYSTEM_INSTRUCTION });
}

async function analyzeMeal(payload: GeminiRequestMap['analyzeMeal'], env: Env) {
  const prompt = `Analyze the following meal: "${payload.mealDescription}".
Provide a nutritional assessment in JSON format with the following structure:
{
  "score": number (0-100, where 100 is perfectly healthy),
  "tier": string (one of "S", "A", "B", "C", "D", "F"),
  "title": string (a short, catchy title for the meal, e.g., "Protein Powerhouse" or "Sugar Bomb"),
  "commentary": string (a short, 2-sentence witty critique or praise. Be slightly humorous but helpful.),
  "calories": string (estimated range, e.g., "400-500 kcal"),
  "macros": {
    "protein": string (estimated, e.g., "25g"),
    "carbs": string (estimated, e.g., "45g"),
    "fats": string (estimated, e.g., "15g")
  }
}
Return ONLY valid JSON.`;

  return generateJson(prompt, env);
}

async function generateCravingHack(payload: GeminiRequestMap['cravingHack'], env: Env) {
  const prompt = `User is craving: "${payload.craving}".
Provide a "Healthy Cheat Code" recipe request.
Return JSON format:
{
  "originalCalories": string (e.g. "850 kcal"),
  "hackCalories": string (e.g. "420 kcal"),
  "savedCalories": string (e.g. "430 kcal"),
  "hackTitle": string (catchy name for healthy version),
  "ingredients": string[],
  "instructions": string[]
}
Return ONLY valid JSON.`;

  return generateJson(prompt, env);
}

async function generateLeftoverRecipe(payload: GeminiRequestMap['leftoverRecipe'], env: Env) {
  const prompt = `Use these ingredients: "${payload.ingredients}" (plus standard pantry staples like oil, salt, spices) to create a healthy recipe.
Return JSON format:
{
  "title": string (Gourmet sounding name),
  "difficulty": string (Easy/Medium/Hard),
  "time": string (e.g. "20 mins"),
  "calories": string (estimated),
  "ingredients": string[],
  "instructions": string[]
}
Return ONLY valid JSON.`;

  return generateJson(prompt, env);
}

async function generateMoodSnack(payload: GeminiRequestMap['moodSnack'], env: Env) {
  const prompt = `The user is feeling "${payload.mood}".
Suggest a healthy, culturally relevant Indian snack or drink that scientifically helps with this mood.
Return JSON format:
{
  "name": string (e.g. "Masala Chai with Jaggery" or "Roasted Makhana"),
  "benefit": string (Scientific reason, e.g. "Spices aid digestion and warmth reduces stress"),
  "calories": string (e.g. "120 kcal"),
  "ingredients": string[],
  "time": string (e.g. "5 mins")
}
Return ONLY valid JSON.`;

  return generateJson(prompt, env);
}

async function generateText(
  prompt: string,
  env: Env,
  config: Record<string, unknown> = {}
) {
  const response = await callGemini(prompt, env, config);
  const text = extractText(response);

  if (!text) {
    throw new Error('No response text received from Gemini.');
  }

  return text;
}

async function generateJson(prompt: string, env: Env) {
  const response = await callGemini(prompt, env, {
    responseMimeType: 'application/json',
  });
  const text = extractText(response);

  if (!text) {
    throw new Error('No response received.');
  }

  return JSON.parse(text);
}

async function callGemini(
  prompt: string,
  env: Env,
  config: Record<string, unknown>
) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('The AI assistant is offline because `GEMINI_API_KEY` is not configured on the Worker.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          thinkingConfig: { thinkingBudget: 0 },
        },
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        ...mapConfig(config),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini request failed.';
    throw new Error(message);
  }

  return data;
}

function mapConfig(config: Record<string, unknown>) {
  const mapped: Record<string, unknown> = {};

  if (config.responseMimeType) {
    mapped.generationConfig = {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: config.responseMimeType,
    };
  }

  if (config.systemInstruction) {
    mapped.systemInstruction = {
      parts: [{ text: String(config.systemInstruction) }],
    };
  }

  return mapped;
}

function extractText(data: any) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}

function getFriendlyGeminiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('reported as leaked')) {
      return 'The AI assistant is offline because the configured Gemini API key was reported as leaked. Rotate the key and redeploy the Worker.';
    }

    return error.message;
  }

  return 'The AI assistant is offline right now. Please try again in a moment.';
}

function getCorsHeaders(origin: string | null, allowedOriginsRaw?: string) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  if (origin && isAllowedOrigin(origin, allowedOriginsRaw)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  return headers;
}

function isAllowedOrigin(origin: string, allowedOriginsRaw?: string) {
  const allowedOrigins = (allowedOriginsRaw || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return allowedOrigins.length === 0 || allowedOrigins.includes(origin);
}

function jsonResponse(payload: unknown, status: number, headers: Headers) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
}
