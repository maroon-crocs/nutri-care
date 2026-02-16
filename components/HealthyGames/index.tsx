import React, { useState } from 'react';
import { Gamepad2, Pizza, BrainCircuit, Refrigerator, X, Award } from 'lucide-react';
import NutriJudge from './NutriJudge';
import CravingCrusher from './CravingCrusher';
import MoodFood from './MoodFood';
import FridgeForager from './FridgeForager';

enum GameMode {
  None = 'NONE',
  NutriJudge = 'JUDGE',
  CravingCrusher = 'CRAVING',
  MoodFood = 'MOOD',
  FridgeForager = 'FRIDGE'
}

const HealthyGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameMode>(GameMode.None);

  return (
    <div id="healthy-games" className="py-20 bg-slate-100 min-h-screen">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-4 animate-bounce">
            <Gamepad2 size={16} />
            Gamified Nutrition
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6">
            Play with Your Food <span className="text-indigo-600">(Ideally)</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Nutrition doesn't have to be boring spreadsheets. Challenge our AI, hack your cravings, and turn your fridge leftovers into gold.
          </p>
        </div>

        {/* Game Selector Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-500 ${activeGame !== GameMode.None ? 'opacity-50 scale-95 pointer-events-none hidden md:grid' : ''}`}>
          
          {/* Card 1: NutriJudge */}
          <div onClick={() => setActiveGame(GameMode.NutriJudge)} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl cursor-pointer transition-all border-b-4 border-purple-500 group">
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <Award size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">The Nutri-Judge</h3>
            <p className="text-slate-500 text-sm">Get your meal roasted and rated by our ruthless AI critic.</p>
          </div>

          {/* Card 2: Craving Crusher */}
          <div onClick={() => setActiveGame(GameMode.CravingCrusher)} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl cursor-pointer transition-all border-b-4 border-red-500 group">
            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
              <Pizza size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Craving Crusher</h3>
            <p className="text-slate-500 text-sm">Turn junk food desires into healthy cheat codes instantly.</p>
          </div>

          {/* Card 3: Mood Food */}
          <div onClick={() => setActiveGame(GameMode.MoodFood)} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl cursor-pointer transition-all border-b-4 border-blue-500 group">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Mood Food</h3>
            <p className="text-slate-500 text-sm">Emotional eating? Let's make it scientific and helpful.</p>
          </div>

           {/* Card 4: Fridge Forager */}
           <div onClick={() => setActiveGame(GameMode.FridgeForager)} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl cursor-pointer transition-all border-b-4 border-green-500 group">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
              <Refrigerator size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Fridge Forager</h3>
            <p className="text-slate-500 text-sm">Leftover alchemy. Create gourmet meals from random ingredients.</p>
          </div>

        </div>

        {/* Active Game Area */}
        {activeGame !== GameMode.None && (
          <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 min-h-[600px] animate-in slide-in-from-bottom-10 fade-in duration-500 overflow-hidden">
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveGame(GameMode.None)} 
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-20"
            >
              <X size={24} />
            </button>

            {/* Game Content */}
            <div className="p-8 md:p-12">
              
              {/* NUTRI JUDGE */}
              {activeGame === GameMode.NutriJudge && <NutriJudge />}

              {/* CRAVING CRUSHER */}
              {activeGame === GameMode.CravingCrusher && <CravingCrusher />}

              {/* MOOD FOOD */}
              {activeGame === GameMode.MoodFood && <MoodFood />}

              {/* FRIDGE FORAGER */}
              {activeGame === GameMode.FridgeForager && <FridgeForager />}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HealthyGames;
