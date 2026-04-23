import type {
  DietPlan,
  DietPlanGenerationResult,
  DietPlanTemplate,
  DietPlanTemplateId,
  MealSlot,
  MealSlotKey,
} from '../types';

export const DIET_PLAN_STORAGE_KEY = 'nutriguide:diet-plan-draft';

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MEAL_SLOTS: MealSlot[] = [
  { id: 'earlyMorning', label: 'Early Morning', time: '6:30 AM' },
  { id: 'breakfast', label: 'Breakfast', time: '8:00 AM' },
  { id: 'midMorning', label: 'Mid-Morning', time: '11:00 AM' },
  { id: 'lunch', label: 'Lunch', time: '1:00 PM' },
  { id: 'eveningSnack', label: 'Evening Snack', time: '5:00 PM' },
  { id: 'dinner', label: 'Dinner', time: '8:00 PM' },
];

const emptyMeals = (): Record<MealSlotKey, string> => ({
  earlyMorning: '',
  breakfast: '',
  midMorning: '',
  lunch: '',
  eveningSnack: '',
  dinner: '',
});

type CoreMealPlan = Record<
  Exclude<MealSlotKey, 'earlyMorning' | 'midMorning'>,
  string
>;

const withTableMealSlots = (
  meals: CoreMealPlan[],
  earlyMorning: string[],
  midMorning: string[],
): Array<Record<MealSlotKey, string>> =>
  meals.map((meal, index) => ({
    earlyMorning:
      earlyMorning[index] ||
      'Warm water with soaked nuts or seeds as advised',
    breakfast: meal.breakfast,
    midMorning:
      midMorning[index] ||
      'Seasonal fruit or light hydrating snack',
    lunch: meal.lunch,
    eveningSnack: meal.eveningSnack,
    dinner: meal.dinner,
  }));

const balancedVegetarianMeals = withTableMealSlots([
  {
    breakfast: 'Vegetable poha with curd and 5 soaked almonds',
    lunch: '2 phulkas, dal, seasonal sabzi, salad, and plain curd',
    eveningSnack: 'Fruit bowl with roasted chana',
    dinner: 'Vegetable dalia or khichdi with cucumber salad',
  },
  {
    breakfast: 'Besan chilla with mint chutney and buttermilk',
    lunch: 'Brown rice, rajma, salad, and sauteed greens',
    eveningSnack: 'Sprouts chaat with lemon',
    dinner: '2 phulkas with paneer bhurji and mixed vegetables',
  },
  {
    breakfast: 'Oats porridge with seeds and one seasonal fruit',
    lunch: 'Millet roti, dal tadka, vegetable raita, and salad',
    eveningSnack: 'Coconut water and makhana',
    dinner: 'Moong dal khichdi with carrot-beet salad',
  },
  {
    breakfast: 'Idli with sambar and coconut chutney',
    lunch: '2 phulkas, chole, salad, and curd',
    eveningSnack: 'Herbal tea with peanut chaat',
    dinner: 'Vegetable soup with grilled paneer tikka',
  },
  {
    breakfast: 'Stuffed vegetable paratha with curd',
    lunch: 'Lemon rice with dal, salad, and curd',
    eveningSnack: 'Apple slices with peanut butter',
    dinner: '2 phulkas with lauki chana dal and salad',
  },
  {
    breakfast: 'Ragi dosa with sambar',
    lunch: 'Quinoa pulao with dal and salad',
    eveningSnack: 'Buttermilk with roasted seeds',
    dinner: 'Vegetable stir fry with tofu and 1 phulka',
  },
  {
    breakfast: 'Upma with vegetables and sprouts',
    lunch: '2 phulkas, kadhi, bhindi sabzi, and salad',
    eveningSnack: 'Fruit smoothie without added sugar',
    dinner: 'Clear vegetable soup with dal cheela',
  },
], [
  'Warm lemon water and 5 soaked almonds',
  'Jeera water with 2 soaked walnuts',
  'Warm water with chia seeds',
  'Methi water and 4 soaked almonds',
  'Cinnamon water with 2 dates',
  'Plain warm water and soaked raisins',
  'Fennel water with 5 soaked almonds',
], [
  'One seasonal fruit',
  'Coconut water',
  'Guava or apple slices',
  'Buttermilk',
  'Papaya bowl',
  'Cucumber and carrot sticks',
  'Pomegranate bowl',
]);

const diabetesFriendlyMeals = withTableMealSlots([
  {
    breakfast: 'Moong dal chilla with paneer stuffing',
    lunch: '2 small phulkas, dal, non-starchy sabzi, and salad',
    eveningSnack: 'Roasted chana with unsweetened tea',
    dinner: 'Vegetable soup with tofu and sauteed beans',
  },
  {
    breakfast: 'Greek yogurt with chia seeds and half apple',
    lunch: 'Millet roti, mixed dal, salad, and curd',
    eveningSnack: 'Sprouts salad with cucumber',
    dinner: 'Palak paneer with 1 phulka and salad',
  },
  {
    breakfast: 'Vegetable oats with flaxseed',
    lunch: 'Brown rice portion, rajma, salad, and curd',
    eveningSnack: 'Makhana roasted in 1 tsp ghee',
    dinner: 'Lauki chana dal with 2 small phulkas',
  },
  {
    breakfast: 'Besan vegetable cheela with curd',
    lunch: 'Quinoa khichdi with vegetables and salad',
    eveningSnack: 'Buttermilk and peanuts',
    dinner: 'Stir-fried vegetables with paneer cubes',
  },
  {
    breakfast: 'Ragi idli with sambar',
    lunch: '2 small phulkas, dal, tindora sabzi, and salad',
    eveningSnack: 'Cucumber sticks with hummus',
    dinner: 'Moong dal soup with vegetable tikki',
  },
  {
    breakfast: 'Paneer bhurji with 1 millet roti',
    lunch: 'Chickpea salad bowl with curd',
    eveningSnack: 'Unsweetened lemon tea and roasted seeds',
    dinner: 'Mixed vegetable dalia with salad',
  },
  {
    breakfast: 'Sprouts poha with vegetables',
    lunch: '2 phulkas, kadhi, cabbage sabzi, and salad',
    eveningSnack: 'Coconut water with 6 almonds',
    dinner: 'Clear soup with grilled tofu and sauteed greens',
  },
], [
  'Warm water with soaked methi seeds if tolerated',
  'Plain warm water with 5 soaked almonds',
  'Cinnamon water without sugar',
  'Jeera water and 2 walnuts',
  'Methi water if already tolerated',
  'Plain warm water with soaked seeds',
  'Warm water with 5 soaked almonds',
], [
  'Cucumber sticks with curd dip',
  'Half apple with chia seeds',
  'Guava slices',
  'Buttermilk without sugar',
  'Sprouts and cucumber bowl',
  'Tomato cucumber salad',
  'Papaya small bowl',
]);

const highProteinMeals = withTableMealSlots([
  {
    breakfast: 'Paneer stuffed besan chilla with curd',
    lunch: '2 phulkas, dal, paneer tikka, salad, and curd',
    eveningSnack: 'Protein smoothie with milk, banana, and seeds',
    dinner: 'Tofu stir fry with vegetable soup',
  },
  {
    breakfast: 'Oats with Greek yogurt, chia, and nuts',
    lunch: 'Rajma rice bowl with extra salad and curd',
    eveningSnack: 'Boiled chana salad',
    dinner: 'Dal cheela with paneer filling and sauteed vegetables',
  },
  {
    breakfast: 'Sprouts and paneer poha',
    lunch: 'Quinoa pulao with mixed dal and raita',
    eveningSnack: 'Makhana with buttermilk',
    dinner: 'Soya chunk curry with 2 phulkas and salad',
  },
  {
    breakfast: 'Ragi dosa with sambar and curd',
    lunch: 'Chole, 2 phulkas, salad, and cucumber raita',
    eveningSnack: 'Peanut chaat with lemon',
    dinner: 'Palak paneer with vegetable soup',
  },
  {
    breakfast: 'Tofu scramble with millet toast',
    lunch: 'Dal makhani portion, 2 phulkas, salad, and curd',
    eveningSnack: 'Fruit and seed bowl',
    dinner: 'Moong dal khichdi with paneer cubes',
  },
  {
    breakfast: 'Besan omelette-style chilla with chutney',
    lunch: 'Paneer bhurji, 2 phulkas, salad, and curd',
    eveningSnack: 'Roasted chana and coconut water',
    dinner: 'Tofu tikka with sauteed vegetables',
  },
  {
    breakfast: 'Greek yogurt parfait with fruit and nuts',
    lunch: 'Soya pulao with dal soup and salad',
    eveningSnack: 'Sprouts bhel without sev',
    dinner: 'Mixed dal soup with paneer salad',
  },
], [
  'Warm water with soaked almonds and chia',
  'Milk or soy milk as tolerated',
  'Warm water with 2 walnuts',
  'Jeera water with soaked almonds',
  'Plain warm water and pumpkin seeds',
  'Warm water with soaked peanuts',
  'Milk or curd drink without sugar',
], [
  'Greek yogurt with seeds',
  'Paneer cubes with cucumber',
  'Boiled chana small bowl',
  'Sprouts salad',
  'Roasted soybean snack',
  'Curd with flaxseed',
  'Peanut chaat',
]);

export const DIET_PLAN_TEMPLATES: DietPlanTemplate[] = [
  {
    id: 'balancedVegetarian',
    name: 'Balanced Vegetarian',
    description: 'General wellness plan with familiar Indian meals.',
    defaultGoal: 'Balanced weekly nutrition',
    instructions:
      'Drink 2.5-3 liters of water daily. Keep oil to measured portions. Adjust roti/rice portions according to hunger, activity, and clinical needs.',
    meals: balancedVegetarianMeals,
  },
  {
    id: 'diabetesFriendly',
    name: 'Diabetes Friendly',
    description: 'Lower glycemic choices with protein at each meal.',
    defaultGoal: 'Blood sugar support',
    instructions:
      'Avoid added sugar and fruit juice. Keep meal timing consistent. Monitor blood glucose as advised and adjust portions with the dietitian.',
    meals: diabetesFriendlyMeals,
  },
  {
    id: 'highProtein',
    name: 'High Protein Vegetarian',
    description: 'Protein-focused vegetarian meals for satiety and recovery.',
    defaultGoal: 'High protein vegetarian plan',
    instructions:
      'Include protein in every meal. Keep hydration steady and adjust portions around workout intensity or medical restrictions.',
    meals: highProteinMeals,
  },
];

export const createEmptyDietPlan = (): DietPlan => ({
  id: `diet-plan-${Date.now()}`,
  title: 'Weekly Diet Plan',
  dietitianName: 'Dietitian Iram',
  patient: {
    name: '',
    phone: '',
    instagramHandle: '',
    age: '',
    goal: '',
    startDate: '',
    preferences: '',
  },
  days: WEEK_DAYS.map((label) => ({
    id: label.toLowerCase(),
    label,
    meals: emptyMeals(),
    note: '',
  })),
  instructions:
    'Follow the plan as discussed. Keep water intake steady and share progress or discomfort during follow-up.',
  updatedAt: new Date().toISOString(),
});

export const normalizeDietPlan = (value: unknown): DietPlan => {
  const basePlan = createEmptyDietPlan();
  const incomingPlan =
    value && typeof value === 'object' ? (value as Partial<DietPlan>) : {};
  const incomingPatient =
    incomingPlan.patient && typeof incomingPlan.patient === 'object'
      ? incomingPlan.patient
      : {};
  const incomingDays = Array.isArray(incomingPlan.days)
    ? incomingPlan.days
    : [];

  return {
    ...basePlan,
    ...incomingPlan,
    patient: {
      ...basePlan.patient,
      ...incomingPatient,
    },
    days: basePlan.days.map((day, index) => {
      const incomingDay =
        incomingDays.find(
          (item) =>
            item?.id === day.id ||
            item?.label?.toLowerCase() === day.label.toLowerCase(),
        ) ?? incomingDays[index];

      return {
        ...day,
        ...incomingDay,
        id: day.id,
        label: day.label,
        meals: {
          ...emptyMeals(),
          ...(incomingDay?.meals || {}),
        },
        note:
          typeof incomingDay?.note === 'string'
            ? incomingDay.note
            : day.note,
      };
    }),
    updatedAt:
      typeof incomingPlan.updatedAt === 'string'
        ? incomingPlan.updatedAt
        : basePlan.updatedAt,
  };
};

export const applyDietPlanTemplate = (
  plan: DietPlan,
  templateId: DietPlanTemplateId,
): DietPlan => {
  const template = DIET_PLAN_TEMPLATES.find((item) => item.id === templateId);

  if (!template) {
    return plan;
  }

  return {
    ...plan,
    patient: {
      ...plan.patient,
      goal: plan.patient.goal || template.defaultGoal,
    },
    instructions: template.instructions,
    days: plan.days.map((day, index) => ({
      ...day,
      meals: {
        ...template.meals[index],
      },
    })),
    updatedAt: new Date().toISOString(),
  };
};

export const formatDietPlanForSharing = (plan: DietPlan): string => {
  const patientName = plan.patient.name.trim() || 'Patient';
  const header = [
    `*${plan.title.trim() || 'Weekly Diet Plan'}*`,
    `*Patient:* ${patientName}`,
    plan.patient.age.trim() ? `*Age:* ${plan.patient.age.trim()}` : '',
    plan.patient.goal.trim() ? `*Goal:* ${plan.patient.goal.trim()}` : '',
    plan.patient.startDate
      ? `*Start Date:* ${new Date(plan.patient.startDate).toLocaleDateString('en-IN')}`
      : '',
    plan.patient.preferences.trim()
      ? `*Preferences/Restrictions:* ${plan.patient.preferences.trim()}`
      : '',
  ].filter(Boolean);

  const days = plan.days.map((day) => {
    const meals = MEAL_SLOTS.map((slot) => {
      const mealText = day.meals[slot.id].trim() || 'As discussed';
      return `- ${slot.label} (${slot.time}): ${mealText}`;
    });

    return [
      '',
      `*${day.label}*`,
      ...meals,
      day.note.trim() ? `Note: ${day.note.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  });

  const footer = [
    '',
    plan.instructions.trim() ? `*Instructions:* ${plan.instructions.trim()}` : '',
    `*Prepared by:* ${plan.dietitianName.trim() || 'Dietitian'}`,
  ].filter(Boolean);

  return [...header, ...days, ...footer].join('\n');
};

export const normalizeWhatsAppNumber = (
  value: string,
  defaultCountryCode = '91',
): string => {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  return digits;
};

export const buildWhatsAppDietPlanUrl = (plan: DietPlan): string => {
  const phone = normalizeWhatsAppNumber(plan.patient.phone);
  const message = encodeURIComponent(formatDietPlanForSharing(plan));
  return `https://wa.me/${phone}?text=${message}`;
};

export const normalizeInstagramHandle = (value: string): string =>
  value
    .trim()
    .replace(/^@+/, '')
    .replace(/[^A-Za-z0-9._]/g, '')
    .slice(0, 30);

export const buildInstagramProfileUrl = (handle: string): string => {
  const normalizedHandle = normalizeInstagramHandle(handle);
  return normalizedHandle
    ? `https://www.instagram.com/${normalizedHandle}/`
    : 'https://www.instagram.com/direct/inbox/';
};

export const formatDietPlanForInstagram = (plan: DietPlan): string => {
  const patientName = plan.patient.name.trim() || 'Patient';
  const header = [
    plan.title.trim() || 'Weekly Diet Plan',
    `Patient: ${patientName}`,
    plan.patient.age.trim() ? `Age: ${plan.patient.age.trim()}` : '',
    plan.patient.goal.trim() ? `Goal: ${plan.patient.goal.trim()}` : '',
    plan.patient.startDate
      ? `Start Date: ${new Date(plan.patient.startDate).toLocaleDateString('en-IN')}`
      : '',
    plan.patient.preferences.trim()
      ? `Preferences/Restrictions: ${plan.patient.preferences.trim()}`
      : '',
  ].filter(Boolean);

  const days = plan.days.map((day) => {
    const meals = MEAL_SLOTS.map((slot) => {
      const mealText = day.meals[slot.id].trim() || 'As discussed';
      return `${slot.label} (${slot.time}): ${mealText}`;
    });

    return [
      '',
      day.label,
      ...meals,
      day.note.trim() ? `Note: ${day.note.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  });

  const footer = [
    '',
    plan.instructions.trim() ? `Instructions: ${plan.instructions.trim()}` : '',
    `Prepared by: ${plan.dietitianName.trim() || 'Dietitian'}`,
  ].filter(Boolean);

  return [...header, ...days, ...footer].join('\n');
};

export const splitTextIntoShareChunks = (
  text: string,
  maxLength = 950,
): string[] => {
  const cleanText = text.trim();

  if (!cleanText) {
    return [];
  }

  const chunks: string[] = [];
  let remaining = cleanText;

  while (remaining.length > maxLength) {
    const splitIndex = Math.max(
      remaining.lastIndexOf('\n\n', maxLength),
      remaining.lastIndexOf('\n', maxLength),
      remaining.lastIndexOf(' ', maxLength),
    );
    const safeSplitIndex = splitIndex > maxLength * 0.55 ? splitIndex : maxLength;
    chunks.push(remaining.slice(0, safeSplitIndex).trim());
    remaining = remaining.slice(safeSplitIndex).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
};

export const mergeGeneratedDietPlan = (
  plan: DietPlan,
  generated: DietPlanGenerationResult,
): DietPlan => {
  const generatedDays = Array.isArray(generated.days) ? generated.days : [];

  return {
    ...plan,
    title: generated.title?.trim() || plan.title,
    instructions: generated.instructions?.trim() || plan.instructions,
    days: plan.days.map((day, index) => {
      const generatedDay =
        generatedDays.find(
          (item) =>
            item.id === day.id ||
            item.label?.toLowerCase() === day.label.toLowerCase(),
        ) ?? generatedDays[index];
      const meals = emptyMeals();

      MEAL_SLOTS.forEach((slot) => {
        const generatedMeal = generatedDay?.meals?.[slot.id];
        meals[slot.id] =
          typeof generatedMeal === 'string' && generatedMeal.trim()
            ? generatedMeal.trim()
            : day.meals[slot.id];
      });

      return {
        ...day,
        label: day.label,
        meals,
        note:
          typeof generatedDay?.note === 'string' && generatedDay.note.trim()
            ? generatedDay.note.trim()
            : day.note,
      };
    }),
    updatedAt: new Date().toISOString(),
  };
};
