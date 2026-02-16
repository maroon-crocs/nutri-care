import React, { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, Loader2, Activity, Trophy, Zap, Target, Award } from 'lucide-react';
import { BMIStatus, BMIResult } from '../types';
import { generateBMIAdvice } from '../services/geminiService';

interface BMICalculatorProps {
  onBMIChange?: (result: BMIResult) => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ onBMIChange }) => {
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(170);
  const [result, setResult] = useState<BMIResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti Animation Logic
  useEffect(() => {
    if (showConfetti && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.parentElement?.offsetWidth || 300;
      canvas.height = canvas.parentElement?.offsetHeight || 300;

      const particles: any[] = [];
      const colors = ['#22c55e', '#eab308', '#3b82f6', '#f43f5e'];

      for (let i = 0; i < 100; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 100
        });
      }

      const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        
        particles.forEach(p => {
          if (p.life > 0) {
            active = true;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.life--;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (active) {
          requestAnimationFrame(animate);
        } else {
          setShowConfetti(false);
        }
      };

      animate();
    }
  }, [showConfetti]);

  const calculateBMI = async () => {
    // Validation
    const w = weight;
    const h = height / 100; // convert cm to m

    if (w <= 0 || h <= 0) return;

    // BMI Logic
    const bmi = w / (h * h);
    let status = BMIStatus.Normal;
    let color = 'text-green-600';
    let badge = 'Balance Master';

    if (bmi < 18.5) {
      status = BMIStatus.Underweight;
      color = 'text-blue-600';
      badge = 'Growth Seeker';
    } else if (bmi >= 18.5 && bmi < 24.9) {
      status = BMIStatus.Normal;
      color = 'text-green-600';
      badge = 'Balance Master';
      setShowConfetti(true); // Celebrate normal weight
    } else if (bmi >= 25 && bmi < 29.9) {
      status = BMIStatus.Overweight;
      color = 'text-yellow-600';
      badge = 'Action Taker';
    } else {
      status = BMIStatus.Obese;
      color = 'text-red-600';
      badge = 'Transformation Hero';
    }

    // Health Score
    let rawScore = 100 - (Math.abs(bmi - 22) * 3); 
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    const calculatedResult: BMIResult = { bmi, status, color, score, badge };
    setResult(calculatedResult);
    if (onBMIChange) onBMIChange(calculatedResult);
    
    // Fetch AI Advice
    setIsLoading(true);
    setAiAdvice(''); // Clear previous advice
    try {
      const advice = await generateBMIAdvice(bmi, status);
      setAiAdvice(advice);
    } catch (error) {
      console.error("Error fetching advice:", error);
      setAiAdvice("Quest 1: Drink more water.\nQuest 2: Eat whole foods.\nQuest 3: Sleep well.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="bmi" className="py-20 bg-leaf-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Controls Side */}
          <div className="lg:w-5/12">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Level Up Your Health</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Adjust the sliders to find your stats. Unlock your Health Score and get personalized daily quests from our AI!
            </p>
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              {/* Weight Control */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Weight (kg)</label>
                  <div className="bg-slate-100 px-4 py-1 rounded-lg font-bold text-slate-900 text-lg">
                    {weight} kg
                  </div>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="200" 
                  value={weight} 
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-leaf-600 hover:accent-leaf-700 transition-all"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>30kg</span>
                  <span>200kg</span>
                </div>
              </div>

              {/* Height Control */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Height (cm)</label>
                  <div className="bg-slate-100 px-4 py-1 rounded-lg font-bold text-slate-900 text-lg">
                    {height} cm
                  </div>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="250" 
                  value={height} 
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-leaf-600 hover:accent-leaf-700 transition-all"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>100cm</span>
                  <span>250cm</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={calculateBMI}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Calculator size={24} />}
                {isLoading ? 'Calculating...' : 'Calculate Score'}
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:w-7/12 w-full">
            {result ? (
              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
                
                {/* Score Card */}
                <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-leaf-100 relative overflow-hidden">
                  {showConfetti && <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-10" />}
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-0">
                    {/* Gauge Visual */}
                    <div className="relative w-48 h-24 mt-4">
                      {/* Gauge Background */}
                      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                         <div className="w-48 h-48 bg-slate-100 rounded-full border-[20px] border-slate-100 box-border"></div>
                      </div>
                      
                      {/* Colored Segments (Simplified visual representation) */}
                      <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center">
                        {/* We use a conic gradient css trick for a simpler gauge or SVG */}
                         <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                            {/* Underweight */}
                            <path d="M 10 50 A 40 40 0 0 1 25 15" fill="none" stroke="#3b82f6" strokeWidth="10" /> 
                            {/* Normal */}
                            <path d="M 27 13 A 40 40 0 0 1 73 13" fill="none" stroke="#22c55e" strokeWidth="10" />
                            {/* Overweight */}
                            <path d="M 75 15 A 40 40 0 0 1 90 50" fill="none" stroke="#eab308" strokeWidth="10" />
                            
                            {/* Needle */}
                            <g style={{ 
                                transformOrigin: '50px 50px', 
                                transform: `rotate(${Math.max(-90, Math.min(90, (result.bmi - 25) * 5))}deg)`,
                                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}>
                              <path d="M 50 50 L 50 10" stroke="#1e293b" strokeWidth="2" />
                              <circle cx="50" cy="50" r="3" fill="#1e293b" />
                            </g>
                         </svg>
                      </div>
                      
                      <div className="absolute -bottom-8 left-0 w-full text-center">
                        <span className="text-sm font-bold text-slate-400">BMI</span>
                      </div>
                    </div>

                    <div className="text-center md:text-right flex-1">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full mb-2">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase">Health Score</span>
                      </div>
                      <div className="flex items-baseline justify-center md:justify-end gap-1">
                        <span className="text-6xl font-black text-slate-900">{result.score}</span>
                        <span className="text-xl font-bold text-slate-400">/100</span>
                      </div>
                      <div className={`text-lg font-bold ${result.color} mt-1`}>
                         {result.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg flex flex-col items-center justify-center text-center">
                  <div className="bg-white/20 p-3 rounded-full mb-3">
                    <Award size={32} />
                  </div>
                  <h4 className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">Current Rank</h4>
                  <h3 className="text-2xl font-bold">{result.badge}</h3>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-leaf-100 p-2 rounded-lg text-leaf-600">
                      <Activity size={20} />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-bold uppercase">BMI Value</span>
                      <span className="text-2xl font-bold text-slate-800">{result.bmi.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-leaf-500 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (result.bmi / 40) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* AI Quests */}
                <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden min-h-[200px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-leaf-500 rounded-full opacity-10 blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Zap className="text-yellow-400" size={24} />
                    <h3 className="text-xl font-bold">Daily Health Quests</h3>
                  </div>

                  {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-4 relative z-10 text-slate-400">
                       <Loader2 className="animate-spin mb-2" size={32} />
                       <span>Analyzing health data...</span>
                     </div>
                   ) : (
                     <div className="prose prose-invert prose-p:my-2 prose-strong:text-leaf-300 relative z-10">
                        {aiAdvice ? aiAdvice.split('\n').map((line, i) => (
                           line.trim() && <div key={i} className="flex items-start gap-3 bg-white/10 p-3 rounded-xl mb-2 last:mb-0 border border-white/5 animate-in slide-in-from-right-2" style={{animationDelay: `${i*100}ms`}}>
                             <Target size={18} className="mt-1 shrink-0 text-leaf-400" />
                             <span className="text-sm md:text-base">{line.replace(/[*#-]/g, '')}</span>
                           </div>
                        )) : (
                          <div className="text-slate-400 italic">Complete the calculation to get your quests!</div>
                        )}
                     </div>
                   )}
                </div>

              </div>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 animate-bounce">
                  <Calculator size={48} className="text-leaf-500" />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">Ready to Play?</h3>
                <p className="text-slate-500 max-w-xs mb-6">Enter your stats to reveal your health score, unlock badges, and get daily quests!</p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default BMICalculator;
