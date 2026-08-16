import React, { useState } from 'react';
import { 
  ArrowLeft, Megaphone, Sparkles, FileText, Upload, CheckCircle2, Loader2, Play
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface ViralAdProducerAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Emotion = 'fomo' | 'aspirational' | 'trust' | 'curiosity';

export const ViralAdProducerAgent: React.FC<ViralAdProducerAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [product, setProduct] = useState('');
  const [trend, setTrend] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('fomo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateAd = async () => {
    if (!product || !trend) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `
        You are "The Viral Ad Producer" AI agent. 
        TASK: Research competitor trends, draft a psychological script, and generate prompts for an 8-second Veo video with high-impact Nano thumbnails.
        
        - PRODUCT/SERVICE: ${product}
        - LATEST AD TREND: ${trend}
        - TARGET PSYCHOLOGY/EMOTION: ${emotion}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "Title of the Ad Script",
          "scriptContent": "Full script formatted cleanly in markdown. Include fast-paced hooks, visual cuts, and psychological triggers.",
          "veoVideoPrompt": "A highly detailed visual prompt to generate an 8-second high-impact Veo video",
          "nanoThumbnails": [
            {
              "caption": "Punchy hook text for the thumbnail",
              "visualDescription": "What the thumbnail looks like",
              "seedKeyword": "A single word for a placeholder image seed (e.g., 'shock', 'money', 'happy')"
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const parsed = JSON.parse(text);
      setResult(parsed);

      const newDoc: Document = {
        id: 'doc-' + Date.now(),
        name: parsed.documentTitle,
        content: parsed.scriptContent,
        updatedAt: Date.now(),
        tags: ['ad-copy', 'script'],
        folderId: 'root',
        history: []
      };
      
      onSaveDoc(newDoc);
    } catch (err) {
      console.error(err);
      alert("Failed to generate ad. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Megaphone size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The Viral Ad Producer</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Hooks + Veo Ads + Nano Thumbnails</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setResult(null)} 
             className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
             style={{ display: result ? 'block' : 'none' }}
           >
             Reset
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {!result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Product / Service</label>
                  <input 
                    type="text" 
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                    placeholder="e.g. A new AI writing tool, Fitness App..."
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Trend</label>
                  <input 
                    type="text" 
                    value={trend}
                    onChange={e => setTrend(e.target.value)}
                    placeholder="e.g. UGC unboxing, TikTok dances, POV..."
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Psychological Trigger</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['fomo', 'aspirational', 'trust', 'curiosity'] as Emotion[]).map(e => (
                    <button 
                      key={e}
                      onClick={() => setEmotion(e)}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${emotion === e ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-white/5 bg-slate-950 text-slate-400 hover:border-white/20'}`}
                    >
                       {e === 'fomo' ? 'FOMO' : e}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={generateAd}
                disabled={isGenerating || !product || !trend}
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-3"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Megaphone size={20} />}
                {isGenerating ? 'Producing Ad...' : 'Generate Viral Ad'}
              </button>
            </div>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
                 <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                   <CheckCircle2 size={20} />
                 </div>
                 <div>
                   <h3 className="text-emerald-400 font-bold mb-1">Production Complete</h3>
                   <p className="text-sm text-slate-400 mb-4">Your psychological script has been saved to Docs. Simulated Veo video and Nano thumbnails are ready.</p>
                   <button 
                     onClick={() => onNavigate('docs', null)}
                     className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                   >
                     <FileText size={14} /> Open Ad Script
                   </button>
                 </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-rose-500" size={20} /> Highlight: 8s Veo Video
                  </h3>
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl group max-w-2xl">
                     <div className="aspect-[9/16] md:aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5">
                       <img 
                         src={`https://picsum.photos/seed/${result.nanoThumbnails?.[0]?.seedKeyword || 'ad'}/800/800`} 
                         alt="Main Ad"
                         className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-2xl">
                            <Play size={24} fill="currentColor" className="ml-1" />
                         </div>
                       </div>
                       <div className="absolute top-3 right-3 bg-rose-600 text-[10px] font-black text-white px-2 py-1 rounded-md tracking-widest border border-rose-500">
                         8S VEO AD
                       </div>
                     </div>
                     <div className="p-4 bg-slate-900 border-t border-white/10">
                       <p className="text-xs text-slate-400 font-medium leading-relaxed"><span className="text-rose-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Veo Generation Prompt</span> {result.veoVideoPrompt}</p>
                     </div>
                  </div>
               </div>

               {result.nanoThumbnails && result.nanoThumbnails.length > 0 && (
                 <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Nano Thumbnails (A/B Test)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {result.nanoThumbnails.map((thumb: any, idx: number) => (
                         <div key={idx} className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-md">
                           <div className="aspect-[4/5] relative bg-slate-950">
                             <img 
                               src={`https://picsum.photos/seed/${thumb.seedKeyword || idx + 'thumb'}/400/500`} 
                               alt={thumb.caption}
                               className="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all"
                               referrerPolicy="no-referrer"
                             />
                             <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                               <p className="text-white font-black text-xs leading-tight drop-shadow-md">{thumb.caption}</p>
                             </div>
                           </div>
                           <div className="p-3">
                             <p className="text-[9px] text-slate-500 leading-relaxed font-medium">{thumb.visualDescription}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

             </div>
          )}
        </div>
      </div>
    </div>
  );
};
