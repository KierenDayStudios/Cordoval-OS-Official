import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Wand2, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIMetaphorMachineProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIMetaphorMachine: React.FC<AIMetaphorMachineProps> = ({ onBack, onNavigate }) => {
  const [concept, setConcept] = useState('');
  const [audience, setAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!concept || !audience) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const ai = createAIInstance();
      const prompt = `You are a brilliant copywriter known for making complex ideas simple. The user has a boring or complex business concept: "${concept}". Their target audience is: "${audience}".
Translate this concept into 3 powerful, memorable metaphors that the target audience will instantly understand.`;

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
        setResult(parsed.metaphors || parsed);
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
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Wand2 size={16} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Metaphor Machine</h1>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Make boring concepts unforgettable</p>
          </div>
        </header>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">What is your boring concept?</label>
              <textarea 
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., API Gateway that handles rate limiting and load balancing..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none h-24"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Who is your target audience?</label>
              <input 
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., Non-technical startup founders..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !concept || !audience}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Sparkles size={16} className="animate-spin text-indigo-300" /> Crafting Metaphors...</>
              ) : (
                <><Sparkles size={16} /> Generate Metaphors</>
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
               <Wand2 size={16} className="text-indigo-400" /> Synthesized Metaphors
             </h3>
             {result.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-indigo-500/10 rounded-2xl p-6 relative group hover:border-indigo-500/40 transition-all">
                   <button 
                     onClick={() => copyToClipboard(item.metaphor, idx)}
                     className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                   >
                     {copiedIndex === idx ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   </button>
                   
                   <h4 className="text-base md:text-lg font-black text-indigo-400 mb-2 pr-8">{item.title}</h4>
                   <p className="text-sm md:text-base text-white leading-relaxed font-medium italic mb-6">"{item.metaphor}"</p>
                   
                   <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Why it works</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.why_it_works}</p>
                   </div>
                </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
};
