# Diet Plan PDF Table And Guidelines

## Goal

Refine the downloadable diet plan PDF so the weekly table is easier to read and the second page gives patient-facing guidance.

## Requirements

- Export only these PDF table columns: Day, Breakfast, Lunch, Evening Snack, Dinner.
- Keep early morning and mid-morning data available in the app draft, but do not print those columns in the PDF.
- Add a styled second page with clear meal timing, hydration, medical safety, and follow-up guidelines.
- Include custom dietitian instructions and day notes in a separate notes panel.
- Keep the branded NutriGuide logo, light colors, and consistent footers.

## Verification

- `node --experimental-strip-types --test tests/dietPlan.test.mjs`
- `npx tsc --noEmit`
- `npm run build`
- Sample PDF generated at `/tmp/nutriguide-table-guidelines.pdf`
