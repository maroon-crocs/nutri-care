import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import BMICalculator from './components/BMICalculator';
import AIAssistant from './components/AIAssistant';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-sans selection:bg-leaf-200 selection:text-leaf-900">
      <Header />
      <main>
        <Hero />
        <Services />
        <BMICalculator />
        <AIAssistant />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
