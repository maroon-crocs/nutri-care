import React from 'react';
import { Quote } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    quote: "I tried endless fad diets, but NutriGuide helped me understand balanced eating. I lost 12kg in 4 months without starving!",
    image: 'https://picsum.photos/150/150?random=10',
    result: 'Lost 12kg'
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Software Engineer',
    quote: "As a diabetic, I was lost. The personalized plan helped stabilize my sugar levels significantly. The AI tool is a great bonus for quick checks.",
    image: 'https://picsum.photos/150/150?random=11',
    result: 'Stable HBA1c'
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'New Mom',
    quote: "Post-pregnancy weight loss seemed impossible until I found this program. It was gentle, breastfeeding-friendly, and effective.",
    image: 'https://picsum.photos/150/150?random=12',
    result: 'Post-partum Recovery'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-leaf-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Success Stories</h2>
          <p className="text-slate-600 text-lg">Real people, real results. Join thousands of happy clients.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow relative">
              <Quote className="absolute top-6 right-6 text-leaf-100 fill-current" size={48} />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-leaf-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
              
              <p className="text-slate-600 italic mb-6 leading-relaxed">"{t.quote}"</p>
              
              <div className="inline-block bg-leaf-50 text-leaf-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                Result: {t.result}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
