export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  result: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum BMIStatus {
  Underweight = 'Underweight',
  Normal = 'Normal',
  Overweight = 'Overweight',
  Obese = 'Obese'
}

export interface BMIResult {
  bmi: number;
  status: BMIStatus;
  color: string;
  score: number;
  badge: string;
}

export interface MealAnalysisResult {
  score: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  title: string;
  commentary: string;
  calories: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

export type MealSlotKey =
  | 'earlyMorning'
  | 'breakfast'
  | 'midMorning'
  | 'lunch'
  | 'eveningSnack'
  | 'dinner';

export interface MealSlot {
  id: MealSlotKey;
  label: string;
  time: string;
}

export interface DietPlanDay {
  id: string;
  label: string;
  meals: Record<MealSlotKey, string>;
  note: string;
}

export interface DietPlanPatient {
  name: string;
  phone: string;
  instagramHandle: string;
  age: string;
  height: string;
  weight: string;
  dietType: string;
  allergies: string;
  healthIssues: string;
  goal: string;
  workoutStatus: string;
  workoutType: string;
  medicinesSupplements: string;
  startDate: string;
  preferences: string;
}

export type DietPlanGuidelineId =
  | 'mealTiming'
  | 'portionReview'
  | 'hydration'
  | 'oilSugarControl'
  | 'postMealWalk'
  | 'medicalReview'
  | 'allergenAvoidance'
  | 'medicineTiming'
  | 'progressTracking'
  | 'followUpWeight'
  | 'stopIfUnwell';

export interface DietPlan {
  id: string;
  sourceClientId?: string;
  title: string;
  dietitianName: string;
  patient: DietPlanPatient;
  days: DietPlanDay[];
  instructions: string;
  selectedGuidelines: DietPlanGuidelineId[];
  updatedAt: string;
}

export type DietPlanTemplateId =
  | 'balancedVegetarian'
  | 'diabetesFriendly'
  | 'highProtein';

export interface DietPlanTemplate {
  id: DietPlanTemplateId;
  name: string;
  description: string;
  defaultGoal: string;
  instructions: string;
  meals: Array<Record<MealSlotKey, string>>;
}

export interface DietPlanGenerationResult {
  title: string;
  instructions: string;
  days: DietPlanDay[];
  reviewNotes: string[];
}

export type AdminClientStatus =
  | 'new'
  | 'intakeReceived'
  | 'paymentPending'
  | 'planPending'
  | 'planSent'
  | 'followUpDue'
  | 'completed';

export type AdminPaymentStatus = 'unpaid' | 'paid' | 'partial';

export interface AdminClient {
  id: string;
  name: string;
  phone: string;
  instagramHandle: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  dietType: string;
  allergies: string;
  healthIssues: string;
  goal: string;
  workoutStatus: string;
  workoutType: string;
  medicinesSupplements: string;
  preferences: string;
  wakeSleepTime: string;
  cuisinePreference: string;
  budgetPreference: string;
  currentEatingPattern: string;
  packageName: string;
  amount: string;
  paymentStatus: AdminPaymentStatus;
  status: AdminClientStatus;
  followUpDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDietPlanRecord {
  id: string;
  clientId: string;
  patientName: string;
  title: string;
  goal: string;
  status: 'draft' | 'final';
  plan: DietPlan;
  pdfPath: string;
  createdAt: string;
  updatedAt: string;
}
