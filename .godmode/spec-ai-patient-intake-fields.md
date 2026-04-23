# AI Diet Plan Intake Fields

## Goal
Expand the diet plan workflow so AI draft generation uses richer patient intake details and the dietitian can still edit the generated weekly plan before sharing or exporting it.

## Inputs to add
- Age, height, weight
- Diet type: Veg, Eggetarian, Non-veg
- Allergies
- Health issues
- Workout status and workout type
- Medicines / supplements
- Food preferences, dislikes, and extra notes

## Requirements
- Existing saved drafts should upgrade safely without data loss.
- AI diet generation must treat diet type, allergies, and restrictions as hard constraints.
- The weekly plan stays fully editable after AI generation.
- WhatsApp, Instagram, and PDF output should include the added patient context in a concise format.
