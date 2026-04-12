import React from 'react';
import { Quote } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Shehnaz',
    role: 'Lucknow',
    quote: "Struggling with hormonal issues made it difficult to conceive. Following a simple, customized plan with regular ingredients, I lost 7 kg in 30 days and finally conceived successfully. Truly grateful for the guidance!",
    image: 'https://picsum.photos/150/150?random=11',
    result: 'Conceived & Healthy Weight Loss'
  },
  {
    id: '2',
    name: 'Shweta Singh',
    role: 'Mohali',
    quote: "Being prediabetic at 28 was a wake-up call. NutriCare4U's practical and easy-to-cook plans helped me reverse my sugar levels naturally within 3 months. I feel more active and positive than ever!",
    image: 'https://picsum.photos/150/150?random=13',
    result: 'Prediabetes Reversal'
  },
  {
    id: '3',
    name: 'Sneha Chauhan',
    role: 'Varanasi',
    quote: "Managing uncontrolled gestational diabetes was incredibly stressful. The expert guidance and personalized support ensured a healthy journey and the safe delivery of my baby. Highly recommended!",
    image: 'https://picsum.photos/150/150?random=14',
    result: 'Safe Pregnancy & Diabetes Control'
  },
  {
    id: '4',
    name: 'Charan Singh',
    role: 'Orissa',
    quote: "My weight was stuck for months despite trying many diets. NutriCare4U's balanced approach changed everything—I lost 10 kgs in just 45 days without ever feeling like I was starving!",
    image: 'https://picsum.photos/150/150?random=10',
    result: 'Lost 10kg in 45 Days'
  },
  {
    id: '5',
    name: 'Sushmita',
    role: 'Varanasi',
    quote: "My thyroid was out of control, leaving me exhausted and struggling with weight. With a natural, customized diet plan, my thyroid levels improved in 3 months, and I feel energetic and healthy again.",
    image: 'https://picsum.photos/150/150?random=12',
    result: 'Thyroid & Fatigue Management'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-leaf-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Success Stories</h2>
          <p className="text-slate-600 text-lg">Real people, real results. Join our community of health transformations.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative group">
              <Quote className="absolute top-6 right-6 text-leaf-100 fill-current group-hover:text-leaf-200 transition-colors" size={48} />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-leaf-100 group-hover:border-leaf-300 transition-colors"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
              
              <p className="text-slate-600 italic mb-6 leading-relaxed">"{t.quote}"</p>
              
              <div className="mt-auto">
                <div className="inline-block bg-leaf-50 text-leaf-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-leaf-100">
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
