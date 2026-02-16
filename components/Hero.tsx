import React from 'react';
import { ChevronRight, Star, Leaf } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-leaf-50 to-white">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-leaf-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-sm">
              <span className="flex text-yellow-400">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Trusted by 10,000+ Clients</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-slate-900 leading-[1.1]">
              Invest in your <br />
              <span className="text-leaf-600">Health</span> today.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Personalized nutrition plans tailored to your lifestyle. Whether it's weight management, disease control, or simple healthy living, we guide you every step of the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#bmi" 
                className="inline-flex items-center justify-center gap-2 bg-leaf-600 hover:bg-leaf-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-leaf-200"
              >
                Check BMI
                <ChevronRight size={20} />
              </a>
              <a 
                href="#services" 
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold transition-all"
              >
                View Services
              </a>
            </div>

            <div className="pt-4 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-3">
                 <img className="w-10 h-10 rounded-full border-2 border-white" src="https://picsum.photos/100/100?random=1" alt="User" />
                 <img className="w-10 h-10 rounded-full border-2 border-white" src="https://picsum.photos/100/100?random=2" alt="User" />
                 <img className="w-10 h-10 rounded-full border-2 border-white" src="https://picsum.photos/100/100?random=3" alt="User" />
                 <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-bold text-slate-600">+2k</div>
              </div>
              <p>Join our community of healthy eaters.</p>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Healthy Food" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-serif text-lg font-bold text-slate-900">Daily Nutrition Plan</p>
                            <p className="text-sm text-slate-500">Customized for your metabolic rate.</p>
                        </div>
                        <div className="bg-leaf-100 text-leaf-700 p-2 rounded-lg">
                            <Leaf size={20} />
                        </div>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;