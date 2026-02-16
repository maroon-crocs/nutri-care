import{G as d}from"./vendor-ai-CuKG3KbF.js";let o=null;const i=()=>{if(!o){const r="AIzaSyANVTirpaq-zPQ4pdWa7HTgmEEDmShT6os";o=new d({apiKey:r})}return o},l=`
You are NutriGuide, a professional, empathetic, and knowledgeable nutritionist AI assistant. 
Your goal is to provide general wellness guidance, healthy eating tips, and explain nutritional concepts based on science.

Guidelines:
1. Tone: Encouraging, professional, clear, and friendly.
2. Limitations: Do NOT provide specific medical prescriptions or diagnose diseases. Always advise users to consult a doctor for medical conditions.
3. Content: Focus on balanced diets, whole foods, hydration, and sustainable lifestyle changes.
4. Brevity: Keep answers concise and easy to read (use bullet points if helpful).
5. Context: The user is browsing a nutrition website offering services like weight management, disease management (Diabetes, PCOD), and kids nutrition.
`,h=async(r,e=[])=>{try{const t=i(),s="gemini-2.5-flash",n=e.map(c=>`${c.role==="user"?"User":"NutriGuide"}: ${c.text}`).join(`
`),g=n?`${n}
User: ${r}
NutriGuide:`:r,a=(await t.models.generateContent({model:s,contents:g,config:{systemInstruction:l,thinkingConfig:{thinkingBudget:0}}})).text;if(!a)throw new Error("No response text received from Gemini.");return a}catch(t){return console.error("Gemini API Error:",t),"I'm having a little trouble connecting to my nutrition knowledge base right now. Please try again in a moment."}},p=async(r,e)=>{try{const t=i(),s=`My BMI is ${r.toFixed(1)}, which is considered ${e}. 
    Please provide 3 "Daily Quests" or "Challenges" to help me improve or maintain my health. 
    Make them sound like game objectives (e.g., "Quest 1: The Hydration Hero - Drink 2L of water"). 
    Keep them short, actionable, and exciting.`;return(await t.models.generateContent({model:"gemini-2.5-flash",contents:s,config:{systemInstruction:l,thinkingConfig:{thinkingBudget:0}}})).text||`Quest 1: Eat a rainbow of vegetables!
Quest 2: Drink 8 glasses of water.
Quest 3: Walk for 20 minutes.`}catch(t){return console.error("Gemini Advice Error:",t),`Quest 1: Focus on balanced meals.
Quest 2: Stay hydrated today.
Quest 3: Move your body for 30 mins.`}},f=async r=>{try{const e=i(),t=`Analyze the following meal: "${r}".
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
    Return ONLY valid JSON.`,n=(await e.models.generateContent({model:"gemini-2.5-flash",contents:t,config:{responseMimeType:"application/json",thinkingConfig:{thinkingBudget:0}}})).text;if(!n)throw new Error("No response");return JSON.parse(n)}catch(e){return console.error("Meal Analysis Error:",e),{score:50,tier:"C",title:"Mystery Meal",commentary:"I couldn't quite figure out what that was. Maybe try being more specific? Make sure you're connected to the internet!",calories:"Unknown",macros:{protein:"?",carbs:"?",fats:"?"}}}},y=async r=>{try{const e=i(),t=`User is craving: "${r}".
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
    Return ONLY valid JSON.`,n=(await e.models.generateContent({model:"gemini-2.5-flash",contents:t,config:{responseMimeType:"application/json",thinkingConfig:{thinkingBudget:0}}})).text;if(!n)throw new Error("No response");return JSON.parse(n)}catch(e){return console.error("Craving Hack Error:",e),null}},w=async r=>{try{const e=i(),t=`Use these ingredients: "${r}" (plus standard pantry staples like oil, salt, spices) to create a healthy recipe.
    Return JSON format:
    {
      "title": string (Gourmet sounding name),
      "difficulty": string (Easy/Medium/Hard),
      "time": string (e.g. "20 mins"),
      "calories": string (estimated),
      "ingredients": string[],
      "instructions": string[]
    }
    Return ONLY valid JSON.`,n=(await e.models.generateContent({model:"gemini-2.5-flash",contents:t,config:{responseMimeType:"application/json",thinkingConfig:{thinkingBudget:0}}})).text;if(!n)throw new Error("No response");return JSON.parse(n)}catch(e){return console.error("Leftover Recipe Error:",e),null}},k=async r=>{try{const e=i(),t=`The user is feeling "${r}". 
    Suggest a healthy, culturally relevant Indian snack or drink that scientifically helps with this mood.
    Return JSON format:
    {
      "name": string (e.g. "Masala Chai with Jaggery" or "Roasted Makhana"),
      "benefit": string (Scientific reason, e.g. "Spices aid digestion and warmth reduces stress"),
      "calories": string (e.g. "120 kcal"),
      "ingredients": string[],
      "time": string (e.g. "5 mins")
    }
    Return ONLY valid JSON.`,n=(await e.models.generateContent({model:"gemini-2.5-flash",contents:t,config:{responseMimeType:"application/json",thinkingConfig:{thinkingBudget:0}}})).text;if(!n)throw new Error("No response");return JSON.parse(n)}catch(e){return console.error("Mood Snack Error:",e),null}};export{f as a,y as b,k as c,w as d,p as g,h as s};
