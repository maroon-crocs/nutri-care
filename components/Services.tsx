import React from 'react';
import { HeartPulse, Baby, Weight, Apple, Activity, Stethoscope } from 'lucide-react';
import { ServiceItem } from '../types';

const services: ServiceItem[] = [
  {
    id: 'weight',
    title: 'Weight Management',
    description: 'Sustainable weight loss or gain programs designed around your lifestyle, not crash diets.',
    icon: 'weight',
    features: ['Personalized Diet Chart', 'Weekly Progress Tracking', 'Metabolism Boosters']
  },
  {
    id: 'disease',
    title: 'Disease Management',
    description: 'Specialized nutrition for Diabetes, Thyroid, PCOD/PCOS, Hypertension, and more.',
    icon: 'stethoscope',
    features: ['Blood Sugar Control', 'Hormonal Balance', 'Heart Health Focus']
  },
  {
    id: 'kids',
    title: 'Kids Nutrition',
    description: 'Ensure your child gets the right nutrients for optimal growth, immunity, and brain development.',
    icon: 'baby',
    features: ['Fussy Eater Solutions', 'Growth Tracking', 'Immunity Building']
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy & Lactation',
    description: 'Complete nutritional support for mothers-to-be and new moms.',
    icon: 'heartpulse',
    features: ['Trimester-wise Plans', 'Post-partum Recovery', 'Lactation Support']
  },
  {
    id: 'wellness',
    title: 'General Wellness',
    description: 'Maintain your health with balanced nutrition plans for a busy lifestyle.',
    icon: 'apple',
    features: ['Detox Plans', 'Skin & Hair Care', 'Energy Boosting']
  },
  {
    id: 'sports',
    title: 'Sports Nutrition',
    description: 'Fuel your performance with scientifically backed nutrition strategies.',
    icon: 'activity',
    features: ['Pre/Post Workout Meals', 'Muscle Recovery', 'Endurance Planning']
  }
];

const IconMap: Record<string, React.ReactNode> = {
  weight: <Weight size={32} />,
  stethoscope: <Stethoscope size={32} />,
  baby: <Baby size={32} />,
  heartpulse: <HeartPulse size={32} />,
  apple: <Apple size={32} />,
  activity: <Activity size={32} />,
};

const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-leaf-600 font-semibold tracking-wide uppercase text-sm mb-3">Our Expertise</h2>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Comprehensive Nutrition Services</h3>
          <p className="text-slate-600 text-lg">
            We don't believe in one-size-fits-all. Our plans are scientifically backed and personalized to your unique body composition and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="group bg-slate-50 hover:bg-white rounded-2xl p-8 transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-xl shadow-sm"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-leaf-600 mb-6 group-hover:scale-110 group-hover:bg-leaf-600 group-hover:text-white transition-all duration-300">
                {IconMap[service.icon]}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-leaf-400"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
