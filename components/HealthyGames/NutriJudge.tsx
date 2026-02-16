import React, { useState } from 'react';
import { Camera, Utensils, Award, TrendingUp, AlertCircle, Quote, Loader2, Star } from 'lucide-react';
import { analyzeMeal } from '../../services/geminiService';
import { MealAnalysisResult } from '../../types';

const NutriJudge: React.FC = () => {
  const [mealDescription, setMealDescription] = useState('');
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeMeal(mealDescription);
      setResult(analysis);
    } catch (err) {
      setError("Failed to analyze meal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'bg-yellow-400 text-yellow-900 border-yellow-200';
      case 'A': return 'bg-green-500 text-white border-green-400';
      case 'B': return 'bg-emerald-400 text-white border-emerald-300';
      case 'C': return 'bg-orange-400 text-white border-orange-300';
      case 'D': return 'bg-red-400 text-white border-red-300';
      case 'F': return 'bg-slate-800 text-white border-slate-700';
      default: return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <section id="nutri-judge" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-purple-600 font-semibold bg-purple-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4">
            <Award size={14} />
            AI Food Critic
          </div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
            The Nutri-Judge ⚖️
          </h2>
          <p className="text-slate-600 text-lg">
            Describe your meal honestly. Our AI will roast it, rate it, and rank it. 
            Will you get the legendary <span className="text-yellow-500 font-bold">S-Tier</span> or the dreaded <span className="text-slate-800 font-bold">F-Tier</span>?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
          
          {/* Input Side */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <form onSubmit={handleAnalyze} className="relative z-10">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                What did you eat?
              </label>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="e.g. A double cheeseburger with large fries and a diet coke..."
                className="w-full h-40 p-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:ring-0 transition-all resize-none text-slate-700 placeholder:text-slate-400 mb-6"
              />
              
              <button
                type="submit"
                disabled={isLoading || !mealDescription.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Utensils size={20} />}
                {isLoading ? 'Judgement in Progress...' : 'Judge My Meal'}
              </button>
            </form>

            {/* Decorative BG elements */}
            <Utensils className="absolute -bottom-10 -right-10 text-slate-50 transform rotate-12" size={200} />
          </div>

          {/* Result Side */}
          <div className="relative min-h-[400px]">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {!result && !isLoading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
                <Quote size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">"I'm waiting to judge your culinary choices..."</p>
                <p className="text-sm mt-2">Type your meal to begin.</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white shadow-lg border border-slate-100">
                <Loader2 size={48} className="animate-spin text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 animate-pulse">Analyzing Macros...</h3>
                <p className="text-slate-500 mt-2">Calculating shame vs. gain ratio</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                {/* Header / Tier */}
                <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-input from-purple-500/20 to-blue-500/20"></div>
                  <div className="relative z-10">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 block">Official Tier Rank</span>
                    <div className={`inline-block text-8xl font-black ${getTierColor(result.tier).split(' ')[1]} drop-shadow-2xl scale-125 transform transition-transform hover:scale-150 duration-300`}>
                      {result.tier}
                    </div>
                    <h3 className="text-white text-2xl font-bold mt-2">{result.title}</h3>
                  </div>
                </div>

                <div className="p-8">
                  {/* Score Bar */}
                  <div className="mb-8">
                     <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-bold text-slate-500 uppercase">Health Score</span>
                       <span className="text-3xl font-black text-slate-900">{result.score}<span className="text-lg text-slate-400">/100</span></span>
                     </div>
                     <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${result.score > 80 ? 'bg-green-500' : result.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${result.score}%` }}
                        ></div>
                     </div>
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Cals</span>
                      <span className="font-bold text-slate-800">{result.calories}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Protein</span>
                      <span className="font-bold text-slate-800">{result.macros.protein}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Carbs</span>
                      <span className="font-bold text-slate-800">{result.macros.carbs}</span>
                    </div>
                  </div>

                  {/* Commentary */}
                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 relative">
                    <Quote className="absolute top-4 left-4 text-purple-200" size={24} />
                    <p className="text-slate-700 italic text-center relative z-10 font-medium">
                      "{result.commentary}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default NutriJudge;
