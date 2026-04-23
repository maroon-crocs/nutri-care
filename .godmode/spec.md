# Diet Plan Creator Spec

## Problem
Dietitian Iram needs a separate page where she can create a full-week patient diet plan with four daily meal slots and send it without rewriting the same structure manually.

## Approach
Use a client-side creator page inside the existing Vite React app. The page will store the current draft in localStorage, offer starter weekly templates plus day-copy helpers, generate a formatted patient-facing plan, and provide copy, print, and WhatsApp send actions. This avoids backend scope while still removing the repetitive manual formatting work.

## Success Criteria
`npm run build`

## Out of Scope
- Server-side patient records or authentication.
- PDF generation with a new dependency.
- Medical automation or AI-generated prescription decisions.

## Files to Modify
- `App.tsx` - add route-aware rendering for home and diet-plan page.
- `components/Header.tsx` - add navigation link and active page behavior.
- `types.ts` - add diet plan domain types.

## Files to Create
- `components/DietPlanCreator.tsx` - page UI, editing workflow, preview, copy, print, WhatsApp send.
- `utils/dietPlan.ts` - data factories, formatting, persistence constants, phone normalization.
- `tests/dietPlan.test.mjs` - lightweight Node test coverage for helper behavior.

## Risks
- WhatsApp links can become long for detailed plans; mitigation: keep a copy action beside direct send.
- Static hosting may not rewrite deep links; mitigation: keep navigation route-aware in the SPA and allow direct home fallback.
