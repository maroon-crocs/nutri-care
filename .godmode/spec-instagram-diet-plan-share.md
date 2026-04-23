# Instagram Diet Plan Share Spec

## Problem
Some Instagram clients want diet plans in Instagram chat and do not want to share a phone number, so the diet-plan creator needs a phone-free Instagram sharing workflow.

## Approach
Add Instagram handle capture, generate a plain-text Instagram DM version of the diet plan, split long plans into copyable chunks, and open Instagram inbox/profile for manual paste. This avoids pretending Instagram supports WhatsApp-style prefilled DM links while still making the workflow fast.

## Success Criteria
`npm run build`

## Out of Scope
- Automated Instagram DM sending through the Graph API.
- Storing Instagram messages or patient records.
- Payment collection.

## Files to Modify
- `types.ts` - add Instagram handle to patient details.
- `utils/dietPlan.ts` - add Instagram formatting, URL, handle, and chunk helpers.
- `tests/dietPlan.test.mjs` - cover Instagram helper behavior.
- `components/DietPlanCreator.tsx` - add Instagram copy/open workflow.

## Risks
- Instagram web cannot reliably prefill a DM body; mitigation: copy message first and open Instagram for paste.
- Long weekly plans may be awkward in one DM; mitigation: split into ordered copyable parts.
