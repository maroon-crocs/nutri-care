import React from 'react';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row">
            
            {/* Info Side */}
            <div className="lg:w-5/12 p-10 lg:p-16 bg-leaf-600 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">Get in Touch</h2>
                <p className="text-leaf-50 mb-10 leading-relaxed">
                  Ready to start your health journey? Book a consultation with our expert nutritionists or drop us a message.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone className="shrink-0 mt-1 text-leaf-200" />
                    <div>
                      <h4 className="font-semibold">Call Us</h4>
                      <p className="text-leaf-50">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="shrink-0 mt-1 text-leaf-200" />
                    <div>
                      <h4 className="font-semibold">Email Us</h4>
                      <p className="text-leaf-50">hello@nutriguide.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="shrink-0 mt-1 text-leaf-200" />
                    <div>
                      <h4 className="font-semibold">Visit Us</h4>
                      <p className="text-leaf-50">123 Wellness Blvd, Health City, HC 90210</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-leaf-500">
                <div className="flex gap-4">
                  {/* Social placeholders */}
                  <div className="w-10 h-10 rounded-full bg-leaf-500 flex items-center justify-center hover:bg-white hover:text-leaf-600 transition-colors cursor-pointer">
                    <span className="font-bold">in</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-leaf-500 flex items-center justify-center hover:bg-white hover:text-leaf-600 transition-colors cursor-pointer">
                    <span className="font-bold">fb</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-leaf-500 flex items-center justify-center hover:bg-white hover:text-leaf-600 transition-colors cursor-pointer">
                    <span className="font-bold">ig</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:w-7/12 p-10 lg:p-16 bg-white">
               <h3 className="text-2xl font-bold text-slate-800 mb-8">Book an Appointment</h3>
               <form className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                     <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                     <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:outline-none" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                   <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:outline-none" />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Service Interested In</label>
                   <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:outline-none">
                     <option>Weight Management</option>
                     <option>Disease Management</option>
                     <option>Kids Nutrition</option>
                     <option>Sports Nutrition</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                   <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:outline-none"></textarea>
                 </div>

                 <button className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all">
                   <Calendar size={20} />
                   Schedule Consultation
                 </button>
               </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
