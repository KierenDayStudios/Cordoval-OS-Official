import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Type, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AITaglineEngineProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AITaglineEngine: React.FC<AITaglineEngineProps> = ({ onBack, onNavigate }) => {
  const [product, setProduct] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!product) return;
    
    setIsGenerating(true);
    setError(null);
    setResult([]);

    try {
      const ai = createAIInstance();
      const prompt = `Generate 50 punchy, memorable, short slogans (taglines) for this product/service: "${product}".`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const lines = response.text?.split('\n').filter(line => line.trim()) || [];
      setResult(lines);
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
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Tagline Engine</h1>
        </header>

        <div className="bg-white/5 p-6 rounded-2xl mb-8">
          <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white" placeholder="Describe your product..." />
          <button onClick={handleGenerate} className="w-full mt-4 py-4 bg-indigo-600 rounded-xl text-xs font-black uppercase text-white">Generate 50 Slogans</button>
        </div>

        {result.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.map((slogan, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-xl text-xs font-medium text-slate-300 border border-white/5">{slogan}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
