import React, { useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { generateCravingHack } from '../../services/geminiService';

const CravingCrusher: React.FC = () => {
    const [cravingInput, setCravingInput] = useState('');
    const [cravingResult, setCravingResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCraving = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!cravingInput.trim()) return;
        setLoading(true);
        setCravingResult(null);
        const result = await generateCravingHack(cravingInput);
        setCravingResult(result);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                    <Flame className="text-red-500" /> The Craving Crusher
                </h2>
                <p className="text-slate-600">Tell us what junk food you want, and we'll "hack" it into a healthy version.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                <div className="bg-red-50 p-6 md:p-8 rounded-3xl border border-red-100">
                    <form onSubmit={handleCraving}>
                        <label className="block text-sm font-bold text-red-800 uppercase mb-2">I am craving...</label>
                        <input 
                            type="text" 
                            value={cravingInput}
                            onChange={(e) => setCravingInput(e.target.value)}
                            placeholder="e.g. Double Chocolate Brownie with Ice Cream"
                            className="w-full p-4 rounded-xl border-2 border-red-200 text-slate-900 focus:border-red-500 focus:outline-none mb-6"
                        />
                        <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Crush This Craving! 🔨'}
                        </button>
                    </form>
                </div>

                <div className="min-h-[300px]">
                    {loading && <div className="text-center pt-20 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={32}/>Hacking calories...</div>}
                    
                    {cravingResult && !loading && (
                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                            
                            <h3 className="text-xl font-bold text-red-400 mb-1 uppercase tracking-widest">Cheat Code Activated</h3>
                            <h2 className="text-3xl font-bold mb-6">{cravingResult.hackTitle}</h2>

                            <div className="flex gap-4 mb-8">
                                <div className="bg-white/10 p-3 rounded-xl text-center flex-1">
                                    <div className="text-xs text-slate-400 uppercase">Original</div>
                                    <div className="text-xl font-bold text-red-400 line-through decoration-2">{cravingResult.originalCalories}</div>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-xl text-center flex-1 border border-green-500/50">
                                    <div className="text-xs text-green-300 uppercase">The Hack</div>
                                    <div className="text-xl font-bold text-green-400">{cravingResult.hackCalories}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-slate-300 mb-2 text-sm uppercase">Ingredients</h4>
                                    <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1">
                                        {cravingResult.ingredients?.map((ing:string, i:number) => <li key={i}>{ing}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                        <div className="text-center font-bold text-green-400 text-lg">
                                        You Save: {cravingResult.savedCalories} 🔥
                                        </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CravingCrusher;
