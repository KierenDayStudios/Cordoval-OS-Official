import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Briefcase, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIRemotePolicyCreatorProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIRemotePolicyCreator: React.FC<AIRemotePolicyCreatorProps> = ({ onBack, onNavigate }) => {
  const [style, setStyle] = useState('Remote-First');
  const [culture, setCulture] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!culture) return;
    
    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const ai = createAIInstance();
      const prompt = `Draft a remote work policy based on these preferences: Style: ${style}. Culture/Values: ${culture}. 
      Include sections on Work-from-anywhere vs. Core hours, communication tools, and meeting expectations. 
      Write it in a professional but approachable tone.`;

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
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Remote Policy Creator</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Draft company work policies</p>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Policy Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white mb-6">
            <option>Remote-First</option>
            <option>Hybrid</option>
          </select>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Company Culture/Values</label>
          <textarea value={culture} onChange={(e) => setCulture(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white h-24 mb-6" />
          <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-4 bg-blue-500 rounded-2xl text-xs font-black uppercase text-white">
            {isGenerating ? 'Drafting...' : 'Generate Policy'}
          </button>
        </div>

        {result && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative">
             <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000)}} className="absolute top-4 right-4 text-slate-500">
               {copied ? <CheckCircle2 size={16} className="text-emerald-500"/> : <Copy size={16}/>}
             </button>
             <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">{result}</pre>
            </div>
        )}
      </div>
    </div>
  );
};
