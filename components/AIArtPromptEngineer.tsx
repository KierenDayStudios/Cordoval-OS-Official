import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Image as ImageIcon, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIArtPromptEngineerProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIArtPromptEngineer: React.FC<AIArtPromptEngineerProps> = ({ onBack, onNavigate }) => {
  const [idea, setIdea] = useState('');
  const [styleMode, setStyleMode] = useState('Photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!idea) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const ai = createAIInstance();
      const prompt = `You are a master AI prompt engineer for tools like Midjourney, Stable Diffusion, and DALL-E 3. The user wants to generate an image based on this core idea: "${idea}". 
The desired overall style/mood is: "${styleMode}".
Generate 3 distinct, hyper-detailed prompt variations. 
Return the output as a JSON object with a key 'prompts' which is an array of 3 objects. 
Each object should have:
- approach: (string) A short name for the variation (e.g., 'Cinematic Close-up', 'Cyberpunk Wide Shot')
- prompt: (string) The actual hyper-detailed prompt ready to be copied (include camera angles, lighting, medium, camera settings, etc if applicable).
- aspect_ratio: (string) Suggested aspect ratio (e.g. '--ar 16:9').

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
        setResult(parsed.prompts || parsed);
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
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ImageIcon size={16} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Art Prompt Engineer</h1>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Generate hyper-detailed image prompts</p>
          </div>
        </header>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Core Idea / Subject</label>
              <textarea 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g., A futuristic ninja drinking coffee on a rainy neon street..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none h-24"
              />
            </div>
            
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Desired Style</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Photorealistic', 'Digital Art', 'Anime', 'Oil Painting'].map(style => (
                  <button
                    key={style}
                    onClick={() => setStyleMode(style)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${styleMode === style ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-cyan-500/30'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !idea}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Sparkles size={16} className="animate-spin text-cyan-200" /> Engineering Prompts...</>
              ) : (
                <><Sparkles size={16} /> Generate Prompts</>
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
               <ImageIcon size={16} className="text-cyan-400" /> Engineered Prompts
             </h3>
             {result.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-cyan-500/10 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition-all">
                   <button 
                     onClick={() => copyToClipboard(`${item.prompt} ${item.aspect_ratio}`, idx)}
                     className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                   >
                     {copiedIndex === idx ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   </button>
                   
                   <div className="flex items-center gap-3 mb-4 pr-8">
                      <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">{item.approach}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.aspect_ratio}</span>
                   </div>
                   
                   <p className="text-sm text-slate-300 leading-relaxed font-mono bg-black/30 p-4 rounded-xl border border-white/5 break-words">
                     {item.prompt} <span className="text-cyan-400">{item.aspect_ratio}</span>
                   </p>
                </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
};
