# Direct PDF Diet Plan Spec

## Problem
The exported diet plan PDF still looks bad because it comes from browser print, so the app needs a real generated PDF file instead of printing the webpage.

## Approach
Use client-side PDF generation with `jsPDF` and `jspdf-autotable` to create a landscape A4 diet-plan table directly from plan data. Replace the print button with a direct PDF download action, keep only the table and core patient metadata in the PDF, and remove the browser print layout.

## Success Criteria
`npm run build`

## Out of Scope
- Server-side PDF rendering.
- Recreating the entire website in PDF form.
- Embedding logos or signatures unless explicitly requested later.

## Files to Modify
- `package.json` and `package-lock.json` - add direct PDF generation dependencies.
- `utils/dietPlanPdf.ts` - build and export the PDF table.
- `components/DietPlanCreator.tsx` - replace print flow with download PDF flow.
- `tests/dietPlan.test.mjs` - cover PDF table helper output.
- `src/index.css` - remove obsolete print CSS.

## Risks
- PDF library bundle size can grow; mitigation: isolate it to the diet-plan page chunk.
- Long meal text can still wrap heavily; mitigation: fixed-width table columns and line wrapping inside cells.
