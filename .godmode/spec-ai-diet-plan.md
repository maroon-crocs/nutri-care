# AI Diet Plan Draft Spec

## Problem
Dietitian Iram needs the diet-plan page to draft a weekly plan from patient age, goal, preferences, and restrictions so she can review/edit instead of writing from a blank sheet.

## Approach
Extend the existing Gemini Worker endpoint with a `generateDietPlan` action that returns a strict JSON weekly plan. The frontend will call that action from the diet-plan creator, merge the AI draft into the current plan, show review notes, and keep the existing manual edit, preview, WhatsApp, copy, and print workflow. The AI output is treated as a draft that the dietitian reviews before sending.

## Success Criteria
`npm run build`

## Out of Scope
- Fully automated medical prescriptions or diagnosis.
- Storing patient data server-side.
- Adding a new AI provider or dependency.

## Files to Modify
- `types.ts` - add structured AI diet-plan response types.
- `utils/dietPlan.ts` - add merge/normalization helper for AI drafts.
- `tests/dietPlan.test.mjs` - cover AI draft merge behavior.
- `services/geminiService.ts` - expose a `generateDietPlanWithAI` client call.
- `worker/index.ts` - implement Gemini `generateDietPlan` action and prompt.
- `components/DietPlanCreator.tsx` - add AI draft generation UI and review notes.

## Risks
- AI can produce unsafe or mismatched medical guidance; mitigation: prompt for general nutrition, restrictions as hard constraints, and require dietitian review notes.
- Worker must be deployed for the frontend button to work in production; mitigation: keep the frontend build passing and surface Worker errors clearly.
