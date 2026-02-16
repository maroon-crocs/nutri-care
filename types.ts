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
