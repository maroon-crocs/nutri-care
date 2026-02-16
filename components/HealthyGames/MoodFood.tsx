import React, { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { generateMoodSnack } from '../../services/geminiService';

const MoodCard = ({ mood, isSelected, onClick }: { mood: any, isSelected: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl ${mood.color} cursor-pointer transition-all duration-300 border ${isSelected ? `ring-4 ring-offset-2 ring-indigo-500 scale-105 ${mood.border}` : 'border-white/20 hover:scale-105'} shadow-sm relative group overflow-hidden`}
    >
      {/* <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <BrainCircuit size={64} />
      </div> */}
      <div className="text-4xl mb-3">{mood.emoji}</div>
      <h4 className="text-xl font-bold text-slate-900 mb-1">{mood.label}</h4>
      
      {!isSelected && (
        <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:hidden animate-pulse">Click for Rx</div>
      )}
    </div>
);

const MoodFood: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<any>(null);
    const [moodResult, setMoodResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
  
    const moods = [
      { id: 'stressed', emoji: "😫", label: "Stressed", color: "bg-red-50 hover:bg-red-100", border: 'border-red-200' },
      { id: 'tired', emoji: "🥱", label: "Tired", color: "bg-yellow-50 hover:bg-yellow-100", border: 'border-yellow-200' },
      { id: 'anxious', emoji: "😰", label: "Anxious", color: "bg-purple-50 hover:bg-purple-100", border: 'border-purple-200' },
      { id: 'angry', emoji: "😡", label: "Angry", color: "bg-orange-50 hover:bg-orange-100", border: 'border-orange-200' },
      { id: 'sad', emoji: "😢", label: "Sad", color: "bg-blue-50 hover:bg-blue-100", border: 'border-blue-200' },
      { id: 'bored', emoji: "😐", label: "Bored", color: "bg-slate-50 hover:bg-slate-100", border: 'border-slate-200' }
    ];
  
    const handleMoodSelect = async (mood: any) => {
      setSelectedMood(mood);
      setMoodResult(null);
      setLoading(true);
      const result = await generateMoodSnack(mood.label);
      setMoodResult(result);
      setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                <BrainCircuit className="text-blue-500" /> Emotional Eating Rx
            </h2>
            <p className="text-slate-600 mb-10 max-w-xl mx-auto">How are you feeling right now? Click a card to get a scientifically backed snack prescription.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {moods.map((mood) => (
                    <MoodCard 
                        key={mood.id} 
                        mood={mood} 
                        isSelected={selectedMood?.id === mood.id} 
                        onClick={() => handleMoodSelect(mood)} 
                    />
                ))}
            </div>

            <div className="min-h-[200px] mt-10">
                {loading && selectedMood && (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                    <p>Consulting Ayurvedic & Modern Nutrition AI...</p>
                    </div>
                )}

                {moodResult && !loading && (
                <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8">
                        <div className="bg-blue-600 p-6 text-white text-center">
                        <h3 className="text-2xl font-bold">Try: {moodResult.name}</h3>
                        <div className="flex justify-center gap-4 mt-2 text-blue-100 text-sm font-medium">
                            <span>⏱️ {moodResult.time}</span>
                            <span>🔥 {moodResult.calories}</span>
                        </div>
                        </div>
                        <div className="p-8 text-left">
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Why this works</h4>
                            <p className="text-slate-800 text-lg font-medium leading-relaxed">
                                "{moodResult.benefit}"
                            </p>
                        </div>
                        
                        {moodResult.ingredients && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">What you need</h4>
                                <div className="flex flex-wrap gap-2">
                                {moodResult.ingredients.map((ing: string, i: number) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm hover:bg-slate-200 transition-colors">
                                    {ing}
                                    </span>
                                ))}
                                </div>
                            </div>
                        )}
                        </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default MoodFood;
