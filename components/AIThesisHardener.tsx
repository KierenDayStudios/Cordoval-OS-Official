import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, ShieldAlert, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIThesisHardenerProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIThesisHardener: React.FC<AIThesisHardenerProps> = ({ onBack, onNavigate }) => {
  const [argument, setArgument] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!argument) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const ai = createAIInstance();
      const prompt = `Critique and harden the following argument to make it debate-proof.
Argument: "${argument}"
Return JSON:
{
  "weaknesses": ["list of weak points"],
  "hardenedThesis": "the improved debate-proof version",
  "defensiveArguments": ["list of defensive arguments"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const parsed = JSON.parse(response.text || "{}");
      setResult(parsed);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Thesis Hardener</h1>
        </header>
        
        <div className="bg-white/5 p-6 rounded-2xl mb-8">
          <textarea value={argument} onChange={(e) => setArgument(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white" placeholder="Type your weak argument here..." />
          <button onClick={handleGenerate} className="w-full mt-4 py-4 bg-red-500 rounded-xl text-xs font-black uppercase text-white">Harden Thesis</button>
        </div>

        {result && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-white">Hardened Version:</h2>
              <p className="p-4 bg-slate-900 border border-white/10 rounded-xl text-sm italic">{result.hardenedThesis}</p>
              <h2 className="text-sm font-black text-white">Weaknesses Addressed:</h2>
              <ul className="list-disc pl-5 text-xs text-slate-400">
                  {result.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
        )}
      </div>
    </div>
  );
};
