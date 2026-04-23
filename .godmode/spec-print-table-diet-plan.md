# Printable Diet Plan Table Spec

## Problem
Dietitian Iram needs the diet-plan print/PDF output to look like a weekly table with days as rows and meal columns, matching the shared reference.

## Approach
Add Early Morning and Mid-Morning meal slots to the diet plan model, normalize older saved drafts, and replace the printed text preview with a dedicated landscape A4 table. Keep the editor and sharing flows unchanged, while the `Print PDF` button uses the browser print dialog for saving as PDF.

## Success Criteria
`npm run build`

## Out of Scope
- Adding a PDF-generation dependency.
- Server-side document storage.
- Custom PDF download service.

## Files to Modify
- `types.ts` - add printable table meal slot keys.
- `utils/dietPlan.ts` - add new meal slots, template values, and saved-draft normalization.
- `tests/dietPlan.test.mjs` - cover six-slot printable plan shape and migration.
- `components/DietPlanCreator.tsx` - add print-only table layout and print PDF button label.
- `src/index.css` - add landscape print table styling.
- `worker/index.ts` - update AI JSON prompt schema to generate all printable columns.

## Risks
- Existing saved drafts may lack new meal slots; mitigation: normalize drafts on load.
- Long text may overflow printed cells; mitigation: landscape A4, fixed table layout, wrapping cell text.
