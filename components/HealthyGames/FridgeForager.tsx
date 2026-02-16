import React, { useState } from 'react';
import { ChefHat, Loader2, Refrigerator, Sparkles } from 'lucide-react';
import { generateLeftoverRecipe } from '../../services/geminiService';

const FridgeForager: React.FC = () => {
    const [fridgeInput, setFridgeInput] = useState('');
    const [fridgeResult, setFridgeResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFridge = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!fridgeInput.trim()) return;
        setLoading(true);
        setFridgeResult(null);
        const result = await generateLeftoverRecipe(fridgeInput);
        setFridgeResult(result);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                    <Refrigerator className="text-green-500" /> The Fridge Forager
                </h2>
                <p className="text-slate-600">Enter 3 random ingredients you have, and we'll invent a gourmet recipe.</p>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row">
                <div className="p-6 md:p-8 md:w-1/2 bg-green-50">
                        <form onSubmit={handleFridge} className="h-full flex flex-col justify-center">
                        <label className="block text-sm font-bold text-green-800 uppercase mb-3">Your Inventory</label>
                        <textarea 
                            value={fridgeInput}
                            onChange={(e) => setFridgeInput(e.target.value)}
                            placeholder="e.g. 2 eggs, stale bread, half a tomato..."
                            className="w-full h-32 p-4 rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-0 mb-6 resize-none text-base"
                        />
                        <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <ChefHat />}
                            Invent Recipe
                        </button>
                        </form>
                </div>
                
                <div className="p-6 md:p-8 md:w-1/2 bg-white min-h-[300px] md:min-h-[400px] flex flex-col justify-center">
                    {!fridgeResult && !loading && (
                        <div className="text-center text-slate-400">
                            <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Ready to alchemize your leftovers.</p>
                        </div>
                    )}

                        {loading && <Loader2 className="animate-spin mx-auto text-green-500" size={40} />}

                        {fridgeResult && !loading && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                                    {fridgeResult.difficulty} • {fridgeResult.time} • {fridgeResult.calories}
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">{fridgeResult.title}</h3>
                                
                                <div className="mb-6">
                                    <h4 className="font-bold text-slate-700 text-sm uppercase mb-2">Instructions</h4>
                                    <ol className="list-decimal pl-4 space-y-2 text-sm text-slate-600">
                                        {fridgeResult.instructions?.map((step:string, i:number) => <li key={i}>{step}</li>)}
                                    </ol>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default FridgeForager;
