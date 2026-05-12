import assert from 'node:assert/strict';
import test from 'node:test';

import { jsPDF } from 'jspdf';

import {
  applyDietPlanTemplate,
  buildInstagramProfileUrl,
  buildWhatsAppDietPlanUrl,
  createEmptyDietPlan,
  DIET_PLAN_GUIDELINE_OPTIONS,
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
  buildDietPlanPdfGeneralGuidelines,
  buildDietPlanPdfMetaLines,
  buildDietPlanPdfNoteLines,
  buildDietPlanPdfSummaryItems,
  buildDietPlanPdfTableData,
} from '../utils/dietPlanPdf.ts';
import {
  buildDietPlanAccessResponse,
  buildDietPlanAccessUrl,
  containsDietPlanAccessCode,
  DIET_PLAN_ACCESS_CODE,
} from '../utils/dietPlanAccess.ts';
import {
  buildClientIntakeMessage,
  createAdminClient,
  createDietPlanFromAdminClient,
  normalizeAdminClients,
  normalizeAdminDietPlanRecords,
} from '../utils/adminPanel.ts';

test('createEmptyDietPlan creates seven days with printable meal slots', () => {
  const plan = createEmptyDietPlan();

  assert.equal(plan.days.length, 7);
  assert.equal(MEAL_SLOTS.length, 6);
  assert.equal(plan.patient.height, '');
  assert.equal(plan.patient.weight, '');
  assert.equal(plan.patient.dietType, '');
  assert.equal(plan.patient.workoutStatus, '');
  assert.deepEqual(plan.selectedGuidelines, []);

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
    selectedGuidelines: ['hydration', 'not-a-guideline'],
  });

  assert.equal(normalized.title, 'Old Draft');
  assert.equal(normalized.patient.name, 'Aarav');
  assert.equal(normalized.patient.instagramHandle, '');
  assert.equal(normalized.patient.height, '');
  assert.equal(normalized.patient.allergies, '');
  assert.equal(normalized.patient.medicinesSupplements, '');
  assert.equal(normalized.days[0].meals.breakfast, 'Poha');
  assert.equal(normalized.days[0].meals.earlyMorning, '');
  assert.equal(normalized.days[0].meals.midMorning, '');
  assert.deepEqual(normalized.selectedGuidelines, ['hydration']);
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
  plan.patient.age = '34';
  plan.patient.height = '170 cm';
  plan.patient.weight = '76 kg';
  plan.patient.dietType = 'Veg';
  plan.patient.goal = 'Blood sugar control';
  plan.patient.healthIssues = 'Diabetes';
  plan.patient.workoutStatus = 'Yes';
  plan.patient.workoutType = 'Brisk walking';

  const message = formatDietPlanForSharing(plan);

  assert.match(message, /\*Patient:\* Rahul/);
  assert.match(message, /\*Height:\* 170 cm/);
  assert.match(message, /\*Diet Type:\* Veg/);
  assert.match(message, /\*Workout:\* Yes - Brisk walking/);
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
  plan.patient.dietType = 'Eggetarian';
  plan.patient.workoutStatus = 'No';
  plan.days[0].meals.breakfast = 'Vegetable poha with curd';

  const text = formatDietPlanForInstagram(plan);

  assert.equal(normalizeInstagramHandle(' @sana.health!! '), 'sana.health');
  assert.equal(
    buildInstagramProfileUrl('@sana.health'),
    'https://www.instagram.com/sana.health/',
  );
  assert.match(text, /Patient: Sana/);
  assert.match(text, /Diet Type: Eggetarian/);
  assert.match(text, /Workout: No/);
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

test('buildDietPlanPdfTableData creates a weekly table with meal columns', () => {
  const plan = createEmptyDietPlan();
  plan.days[0].meals.earlyMorning = 'Warm lemon water';
  plan.days[0].meals.breakfast = 'Vegetable poha';
  plan.days[0].meals.midMorning = 'Fruit bowl';
  plan.days[0].meals.lunch = 'Dal roti sabzi';
  plan.days[0].meals.eveningSnack = 'Roasted chana';
  plan.days[0].meals.dinner = 'Khichdi';

  const table = buildDietPlanPdfTableData(plan);

  assert.equal(table.head[0][0], 'Day');
  assert.deepEqual(table.head[0], [
    'Day',
    'Early Morning',
    'Breakfast',
    'Mid-Morning',
    'Lunch',
    'Evening Snack',
    'Dinner',
  ]);
  assert.equal(table.body.length, 7);
  assert.equal(table.body[0][0], 'Monday');
  assert.deepEqual(table.body[0], [
    'Monday',
    'Warm lemon water',
    'Vegetable poha',
    'Fruit bowl',
    'Dal roti sabzi',
    'Roasted chana',
    'Khichdi',
  ]);
});

test('buildDietPlanPdfSummaryItems includes extended intake details', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Nisha';
  plan.patient.age = '29';
  plan.patient.height = '162 cm';
  plan.patient.weight = '59 kg';
  plan.patient.dietType = 'Veg';
  plan.patient.goal = 'Fat loss';
  plan.patient.healthIssues = 'PCOS';
  plan.patient.workoutStatus = 'Yes';
  plan.patient.workoutType = 'Strength training';
  plan.patient.medicinesSupplements = 'Vitamin D';
  plan.patient.preferences = 'No mushrooms';

  const items = buildDietPlanPdfSummaryItems(plan);
  const itemMap = Object.fromEntries(
    items.map((item) => [item.label, item.value]),
  );

  assert.equal(itemMap.Patient, 'Nisha');
  assert.equal(itemMap.Height, '162 cm');
  assert.equal(itemMap.Diet, 'Veg');
  assert.equal(itemMap.Workout, 'Yes - Strength training');
  assert.equal(itemMap.Health, 'PCOS');
  assert.equal(itemMap['Medicines/Supplements'], 'Vitamin D');
});

test('buildDietPlanPdfMetaLines creates compact summary copy', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Nisha';
  plan.patient.height = '162 cm';
  plan.patient.dietType = 'Veg';
  plan.patient.goal = 'Fat loss';
  plan.patient.preferences = 'No mushrooms';

  const lines = buildDietPlanPdfMetaLines(plan);

  assert.match(lines[0], /Patient: Nisha/);
  assert.match(lines[0], /Height: 162 cm/);
  assert.match(lines[0], /Diet: Veg/);
  assert.match(lines[0], /Goal: Fat loss/);
  assert.match(lines[1], /Food Notes: No mushrooms/);
});

test('buildDietPlanPdfGeneralGuidelines only includes admin-selected points', () => {
  const plan = createEmptyDietPlan();
  plan.patient.healthIssues = 'PCOS';
  plan.patient.allergies = 'Peanuts';
  plan.patient.medicinesSupplements = 'Vitamin D';

  assert.equal(buildDietPlanPdfGeneralGuidelines(plan).length, 0);

  plan.selectedGuidelines = [
    'hydration',
    'allergenAvoidance',
    'progressTracking',
  ];

  const guidelines = buildDietPlanPdfGeneralGuidelines(plan);
  const guidanceText = guidelines.join(' ');

  assert.equal(guidelines.length, 3);
  assert.match(guidanceText, /Drink 2.5-3 liters water daily/);
  assert.match(guidanceText, /Avoid listed allergens completely: Peanuts/);
  assert.match(guidanceText, /Track hunger, cravings, sleep, bloating/);
  assert.doesNotMatch(guidanceText, /Medicine\/supplement timing noted/);
  assert.ok(DIET_PLAN_GUIDELINE_OPTIONS.length > guidelines.length);
});

test('buildDietPlanPdfNoteLines wraps notes to the visible text column', () => {
  const doc = new jsPDF({ format: 'a4', orientation: 'landscape', unit: 'mm' });
  const plan = createEmptyDietPlan();
  const pageWidth = doc.internal.pageSize.getWidth();
  const notesTextWidth = pageWidth - 20 - 41;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  plan.instructions =
    "This 7-day diet plan focuses on weight loss, incorporating both vegetarian and non-vegetarian options with practical Indian home-style meals. Ensure adequate hydration throughout day by drinking 8-10 glasses of water. Listen to your body's hunger and fullness cues.";
  plan.days[0].note = 'Start the week with a balanced mix of protein and fiber.';
  plan.days[1].note = 'Include omega-3 rich fish for heart health.';

  const lines = buildDietPlanPdfNoteLines(doc, plan, notesTextWidth);
  const notesText = lines.join(' ');

  assert.ok(lines.length > 0);
  assert.match(notesText, /Instructions:/);
  assert.doesNotMatch(notesText, /Monday:/);
  assert.doesNotMatch(notesText, /Tuesday:/);
  assert.ok(
    lines.every((line) => doc.getTextWidth(line) <= notesTextWidth + 0.1),
  );
});

test('buildDietPlanPdfFileName creates a safe downloadable file name', () => {
  const plan = createEmptyDietPlan();
  plan.patient.name = 'Mary Jane';

  assert.equal(buildDietPlanPdfFileName(plan), 'mary-jane-diet-plan.pdf');
});

test('diet plan access helper unlocks the hidden route from admin code', () => {
  assert.equal(containsDietPlanAccessCode('hello'), false);
  assert.equal(containsDietPlanAccessCode(`code ${DIET_PLAN_ACCESS_CODE}`), true);
  assert.equal(containsDietPlanAccessCode('roshan 2026'), true);

  const url = buildDietPlanAccessUrl('https://nutricare4u.com', '/');
  const response = buildDietPlanAccessResponse(
    `please unlock ${DIET_PLAN_ACCESS_CODE}`,
    'https://nutricare4u.com',
    '/',
  );

  assert.equal(url, 'https://nutricare4u.com/#/diet-plan');
  assert.match(response ?? '', /Admin workspace unlocked/);
  assert.match(response ?? '', /https:\/\/nutricare4u\.com\/#\/admin/);
  assert.match(response ?? '', /https:\/\/nutricare4u\.com\/#\/diet-plan/);
});

test('admin helpers normalize clients and create diet plan drafts', () => {
  const clients = normalizeAdminClients([
    {
      id: 'client-1',
      name: 'Sana',
      instagramHandle: '@sana.fit',
      age: '31',
      height: '160 cm',
      weight: '65 kg',
      dietType: 'Veg',
      goal: 'PCOS weight loss',
      workoutStatus: 'Yes',
      workoutType: 'Walking',
      paymentStatus: 'paid',
      status: 'planPending',
      wakeSleepTime: '7 AM to 11 PM',
      cuisinePreference: 'Indian home-style',
    },
  ]);

  assert.equal(clients.length, 1);
  assert.equal(clients[0].paymentStatus, 'paid');
  assert.equal(clients[0].status, 'planPending');

  const plan = createDietPlanFromAdminClient(clients[0]);

  assert.equal(plan.sourceClientId, 'client-1');
  assert.equal(plan.patient.name, 'Sana');
  assert.equal(plan.patient.age, '31');
  assert.match(plan.patient.preferences, /Wake\/sleep: 7 AM to 11 PM/);
  assert.match(plan.patient.preferences, /Cuisine: Indian home-style/);
});

test('admin helpers create intake copy and normalize plan records', () => {
  const client = createAdminClient({ id: 'client-2', name: 'Ayesha' });
  const plan = createDietPlanFromAdminClient(client);
  const message = buildClientIntakeMessage(client);
  const records = normalizeAdminDietPlanRecords([
    {
      id: plan.id,
      clientId: client.id,
      plan,
      status: 'final',
    },
  ]);

  assert.match(message, /Hi Ayesha/);
  assert.match(message, /Age, height, weight/);
  assert.equal(records.length, 1);
  assert.equal(records[0].clientId, 'client-2');
  assert.equal(records[0].status, 'final');
});
