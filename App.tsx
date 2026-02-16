import React, { useState } from 'react';
import { BMIResult } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
const Services = React.lazy(() => import('./components/Services'));
const BMICalculator = React.lazy(() => import('./components/BMICalculator'));
const HealthyGames = React.lazy(() => import('./components/HealthyGames'));
const AIAssistant = React.lazy(() => import('./components/AIAssistant'));
const Testimonials = React.lazy(() => import('./components/Testimonials'));
const Contact = React.lazy(() => import('./components/Contact'));
const Footer = React.lazy(() => import('./components/Footer'));

const App: React.FC = () => {
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  return (
    <div className="min-h-screen font-sans selection:bg-leaf-200 selection:text-leaf-900">
      <Header />
      <main>
        <Hero />
        <React.Suspense fallback={
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <Services />
          <BMICalculator onBMIChange={setBmiResult} />
          <HealthyGames />
          <AIAssistant bmiResult={bmiResult} />
          <Testimonials />
          <Contact />
        </React.Suspense>
      </main>
      <React.Suspense fallback={null}>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default App;
