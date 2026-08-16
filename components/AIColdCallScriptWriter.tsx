import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Phone, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIColdCallScriptWriterProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIColdCallScriptWriter: React.FC<AIColdCallScriptWriterProps> = ({ onBack, onNavigate }) => {
  const [product, setProduct] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!product) return;
    
    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const ai = createAIInstance();
      const prompt = `Write a non-awkward, 2-minute cold call script for selling: "${product}".
      Focus on value, be respectful of time, and have a clear call-to-action to book a discovery call.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      setResult(response.text || '');
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
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Cold Call Script</h1>
        </header>

        <div className="bg-white/5 p-6 rounded-2xl mb-8">
          <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white" placeholder="Describe product for outreach..." />
          <button onClick={handleGenerate} className="w-full mt-4 py-4 bg-sky-600 rounded-xl text-xs font-black uppercase text-white">Generate Script</button>
        </div>

        {result && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
