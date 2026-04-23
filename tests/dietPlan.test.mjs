import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyDietPlanTemplate,
  buildInstagramProfileUrl,
  buildWhatsAppDietPlanUrl,
  createEmptyDietPlan,
  formatDietPlanForInstagram,
  formatDietPlanForSharing,
  MEAL_SLOTS,
  mergeGeneratedDietPlan,
  normalizeDietPlan,
  normalizeInstagramHandle,
  normalizeWhatsAppNumber,
  splitTextIntoShareChunks,
} from '../utils/dietPlan.ts';
import {
  buildDietPlanPdfFileName,
  buildDietPlanPdfTableData,
} from '../utils/dietPlanPdf.ts';

test('createEmptyDietPlan creates seven days with printable meal slots', () => {
  const plan = createEmptyDietPlan();

  assert.equal(plan.days.length, 7);
  assert.equal(MEAL_SLOTS.length, 6);

  for (const day of plan.days) {
    assert.deepEqual(Object.keys(day.meals).sort(), [
      'breakfast',
      'dinner',
      'earlyMorning',
      'eveningSnack',
      'lunch',
      'midMorning',
    ]);
  }
});

test('normalizeDietPlan upgrades older saved drafts to printable meal slots', () => {
  const normalized = normalizeDietPlan({
    title: 'Old Draft',
    patient: {
      name: 'Aarav',
      phone: '98765 43210',
    },
    days: [
      {
        id: 'monday',
        label: 'Monday',
        meals: {
          breakfast: 'Poha',
          lunch: 'Dal roti',
          eveningSnack: 'Makhana',
          dinner: 'Khichdi',
        },
        note: 'Walk after dinner.',
      },
    ],
  });

  assert.equal(normalized.title, 'Old Draft');
  assert.equal(normalized.patient.name, 'Aarav');
  assert.equal(normalized.patient.instagramHandle, '');
  assert.equal(normalized.days[0].meals.breakfast, 'Poha');
  assert.equal(normalized.days[0].meals.earlyMorning, '');
  assert.equal(normalized.days[0].meals.midMorning, '');
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

test('Instagram helpers prepare profile URLs and plain text diet plans', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Sana';
  plan.patient.instagramHandle = '@sana.health';
  plan.days[0].meals.breakfast = 'Vegetable poha with curd';

  const text = formatDietPlanForInstagram(plan);

  assert.equal(normalizeInstagramHandle(' @sana.health!! '), 'sana.health');
  assert.equal(
    buildInstagramProfileUrl('@sana.health'),
    'https://www.instagram.com/sana.health/',
  );
  assert.match(text, /Patient: Sana/);
  assert.match(text, /Breakfast \(8:00 AM\): Vegetable poha with curd/);
  assert.doesNotMatch(text, /\*Patient:\*/);
});

test('splitTextIntoShareChunks keeps long Instagram messages in ordered parts', () => {
  const chunks = splitTextIntoShareChunks(
    ['Monday lunch dal roti salad', 'Tuesday dinner khichdi curd', 'Wednesday fruit bowl']
      .join('\n\n')
      .repeat(20),
    180,
  );

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 180));
  assert.match(chunks.join(' '), /Monday lunch/);
});

test('mergeGeneratedDietPlan keeps patient details and normalizes meal slots', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Ayesha';
  plan.days[0].meals.dinner = 'Existing dinner';

  const merged = mergeGeneratedDietPlan(plan, {
    title: 'AI Weekly Plan',
    instructions: 'Review portions during follow-up.',
    reviewNotes: ['Confirm medication timing.'],
    days: [
      {
        id: 'monday',
        label: 'Monday',
        meals: {
          breakfast: 'Moong dal chilla',
          lunch: 'Dal, roti, salad',
          eveningSnack: 'Roasted chana',
          dinner: '',
        },
        note: 'Walk for 20 minutes.',
      },
    ],
  });

  assert.equal(merged.patient.name, 'Ayesha');
  assert.equal(merged.title, 'AI Weekly Plan');
  assert.equal(merged.days.length, 7);
  assert.equal(merged.days[0].meals.breakfast, 'Moong dal chilla');
  assert.equal(merged.days[0].meals.dinner, 'Existing dinner');
  assert.equal(merged.days[0].note, 'Walk for 20 minutes.');
});

test('buildDietPlanPdfTableData creates table header and day rows', () => {
  const plan = createEmptyDietPlan();
  plan.days[0].meals.breakfast = 'Vegetable poha';
  plan.days[0].meals.lunch = 'Dal roti sabzi';

  const table = buildDietPlanPdfTableData(plan);

  assert.equal(table.head[0][0], 'Day');
  assert.equal(table.head[0].length, 7);
  assert.equal(table.body.length, 7);
  assert.equal(table.body[0][0], 'Monday');
  assert.equal(table.body[0][2], 'Vegetable poha');
  assert.equal(table.body[0][4], 'Dal roti sabzi');
});

test('buildDietPlanPdfFileName creates a safe downloadable file name', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Mary Jane';

  assert.equal(buildDietPlanPdfFileName(plan), 'mary-jane-diet-plan.pdf');
});
