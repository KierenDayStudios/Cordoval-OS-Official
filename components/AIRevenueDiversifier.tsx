import React, { useState } from 'react';
import { ArrowLeft, Coins, Sparkles, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIRevenueDiversifierProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIRevenueDiversifier: React.FC<AIRevenueDiversifierProps> = ({ onBack, onNavigate }) => {
  const [audience, setAudience] = useState('');
  const [currentMonetization, setCurrentMonetization] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!audience || !currentMonetization) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const ai = createAIInstance();
      const prompt = `You are a business strategist. The user has an existing audience describing as: "${audience}" and they currently monetize them via: "${currentMonetization}".
Generate 3 highly specific, actionable, and creative new ways to monetize this audience. 
Return the output as a JSON object with a single key 'strategies' which is an array of 3 objects. 
Each object should have:
- title: (string) The name of the revenue stream.
- description: (string) A concise explanation of how it works.
- execution_time: (string) Estimated time to launch (e.g. '2 weeks').
- potential_impact: (string) High, Medium, or Low with a brief reason.

Return only valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      try {
        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        setResult(parsed.strategies || parsed);
      } catch (parseError) {
         setError("Failed to parse the response. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 md:mb-12">
          <button 
            onClick={onBack}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Coins size={16} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Revenue Diversifier</h1>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Discover new monetization streams</p>
          </div>
        </header>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Who is your audience?</label>
              <textarea 
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., 50k Instagram followers interested in budget travel and credit card points..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none h-24"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">How do you currently monetize them?</label>
              <textarea 
                value={currentMonetization}
                onChange={(e) => setCurrentMonetization(e.target.value)}
                placeholder="e.g., Affiliate links in bio and occasional sponsored posts..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none h-24"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !audience || !currentMonetization}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Sparkles size={16} className="animate-spin text-emerald-200" /> Generating Strategies...</>
              ) : (
                <><Sparkles size={16} /> Brainstorm 3 Revenue Streams</>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300 font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
             <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
               <Coins size={16} className="text-emerald-400" /> Recommended Revenue Streams
             </h3>
             {result.map((strategy: any, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative group hover:border-emerald-500/30 transition-all">
                   <button 
                     onClick={() => copyToClipboard(`${strategy.title}\n${strategy.description}\nExecution: ${strategy.execution_time}\nImpact: ${strategy.potential_impact}`, idx)}
                     className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                   >
                     {copiedIndex === idx ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   </button>
                   
                   <h4 className="text-lg md:text-xl font-black text-white mb-2 pr-8">{strategy.title}</h4>
                   <p className="text-sm text-slate-400 leading-relaxed mb-6">{strategy.description}</p>
                   
                   <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-4">
                      <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                         <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time to Execute</span>
                         <span className="text-xs font-bold text-white">{strategy.execution_time}</span>
                      </div>
                      <div className="flex-1 bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                         <span className="block text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Potential Impact</span>
                         <span className="text-xs font-bold text-emerald-400">{strategy.potential_impact}</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
};
