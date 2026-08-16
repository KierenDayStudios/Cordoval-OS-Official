import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Palette, CheckCircle2, Copy } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIColorPsychologistProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIColorPsychologist: React.FC<AIColorPsychologistProps> = ({ onBack, onNavigate }) => {
  const [brandDescription, setBrandDescription] = useState('');
  const [desiredEmotion, setDesiredEmotion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!brandDescription || !desiredEmotion) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const ai = createAIInstance();
      const prompt = `You are an expert brand designer and color psychologist. The user describes their brand as: "${brandDescription}". They want their customers to feel: "${desiredEmotion}".
Suggest a brand color palette consisting of 4 colors (Primary, Secondary, Accent, Background). 
Return the output as a JSON object with a key 'palette' which is an array of 4 objects. 
Each object should have:
- role: (string) e.g., 'Primary', 'Secondary', 'Accent', 'Background'
- hex: (string) The hex code of the color, e.g., '#FF5733'
- name: (string) A creative name for the color
- reasoning: (string) Psychological reasoning for why this color evokes the desired emotion for this brand.

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
        setResult(parsed.palette || parsed);
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
            className="w-10 h-10 md:w-12 h-12 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Palette size={16} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Color Psychologist</h1>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Design colors based on emotion</p>
          </div>
        </header>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">What does your brand do?</label>
              <textarea 
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                placeholder="e.g., A minimalist coffee shop for remote workers..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none h-24"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">How do you want customers to feel?</label>
              <input 
                type="text"
                value={desiredEmotion}
                onChange={(e) => setDesiredEmotion(e.target.value)}
                placeholder="e.g., Calm, focused, and inspired..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !brandDescription || !desiredEmotion}
              className="w-full py-4 bg-pink-500 hover:bg-pink-400 disabled:bg-slate-800 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Sparkles size={16} className="animate-spin text-pink-200" /> Analyzing Psychology...</>
              ) : (
                <><Sparkles size={16} /> Generate Palette</>
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
               <Palette size={16} className="text-pink-400" /> Recommended Palette
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {result.map((color: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden group">
                     {/* Color preview block */}
                     <div 
                       className="h-24 w-full relative" 
                       style={{ backgroundColor: color.hex }}
                     >
                       <button 
                         onClick={() => copyToClipboard(color.hex, idx)}
                         className="absolute top-3 right-3 bg-black/30 backdrop-blur-md p-2 rounded-lg text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                       >
                         {copiedIndex === idx ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                       </button>
                     </div>
                     <div className="p-5">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{color.role}</span>
                          <span className="text-xs font-mono font-bold text-pink-400">{color.hex}</span>
                       </div>
                       <h4 className="text-lg font-black text-white mb-2">{color.name}</h4>
                       <p className="text-xs text-slate-400 leading-relaxed">{color.reasoning}</p>
                     </div>
                  </div>
               ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
