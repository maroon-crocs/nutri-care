import React, { useState } from 'react';
import { BMIResult } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import BMICalculator from './components/BMICalculator';

import HealthyGames from './components/HealthyGames';
import AIAssistant from './components/AIAssistant';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  return (
    <div className="min-h-screen font-sans selection:bg-leaf-200 selection:text-leaf-900">
      <Header />
      <main>
        <Hero />
        <Services />
        <BMICalculator onBMIChange={setBmiResult} />
        <HealthyGames />
        <AIAssistant bmiResult={bmiResult} />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
