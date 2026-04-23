import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyDietPlanTemplate,
  buildWhatsAppDietPlanUrl,
  createEmptyDietPlan,
  formatDietPlanForSharing,
  MEAL_SLOTS,
  normalizeWhatsAppNumber,
} from '../utils/dietPlan.ts';

test('createEmptyDietPlan creates seven days with four meal slots', () => {
  const plan = createEmptyDietPlan();

  assert.equal(plan.days.length, 7);
  assert.equal(MEAL_SLOTS.length, 4);

  for (const day of plan.days) {
    assert.deepEqual(Object.keys(day.meals).sort(), [
      'breakfast',
      'dinner',
      'eveningSnack',
      'lunch',
    ]);
  }
});

test('applyDietPlanTemplate fills meals and keeps patient details', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Ayesha';

  const templated = applyDietPlanTemplate(plan, 'balancedVegetarian');

  assert.equal(templated.patient.name, 'Ayesha');
  assert.match(templated.days[0].meals.breakfast, /poha/i);
  assert.notEqual(templated.instructions, plan.instructions);
});

test('formatDietPlanForSharing creates a patient-facing weekly message', () => {
  const plan = applyDietPlanTemplate(createEmptyDietPlan(), 'diabetesFriendly');
  plan.patient.name = 'Rahul';
  plan.patient.goal = 'Blood sugar control';

  const message = formatDietPlanForSharing(plan);

  assert.match(message, /\*Patient:\* Rahul/);
  assert.match(message, /\*Monday\*/);
  assert.match(message, /Breakfast \(8:00 AM\):/);
  assert.match(message, /\*Prepared by:\*/);
});

test('normalizeWhatsAppNumber prepares Indian mobile numbers for wa.me', () => {
  assert.equal(normalizeWhatsAppNumber('+91 98765 43210'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('09876543210'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('00919876543210'), '919876543210');
});

test('buildWhatsAppDietPlanUrl encodes the plan message', () => {
  const plan = createEmptyDietPlan();
  plan.patient.phone = '98765 43210';
  plan.patient.name = 'Zoya';

  const url = buildWhatsAppDietPlanUrl(plan);

  assert.ok(url.startsWith('https://wa.me/919876543210?text='));
  assert.ok(url.includes('Zoya'));
});
