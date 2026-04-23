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

export type MealSlotKey = 'breakfast' | 'lunch' | 'eveningSnack' | 'dinner';

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
  age: string;
  goal: string;
  startDate: string;
  preferences: string;
}

export interface DietPlan {
  id: string;
  title: string;
  dietitianName: string;
  patient: DietPlanPatient;
  days: DietPlanDay[];
  instructions: string;
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
