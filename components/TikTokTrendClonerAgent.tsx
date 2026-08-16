import React, { useState } from 'react';
import { 
  ArrowLeft, Smartphone, Sparkles, CheckCircle2, Loader2, Play, Music, Download
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface TikTokTrendClonerAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const TikTokTrendClonerAgent: React.FC<TikTokTrendClonerAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [niche, setNiche] = useState('');
  const [goal, setGoal] = useState('sell');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  const generateTikTok = async () => {
    if (!niche) return;

    // Check for API key (Required for Veo video models)
    if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      } catch (e) {
        console.warn("Failed API key check", e);
      }
    }

    setIsGenerating(true);
    setLoadingMessage("Researching Trends & Scripting...");

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are "The TikTok Trend Cloner" AI agent. 
        TASK: Research current top-trending audio/visual styles for TikTok/Reels and generate a script + a vertical Veo video prompt.
        
        - NICHE / INDUSTRY: ${niche}
        - GOAL: ${goal}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "TikTok Script: [Trend Name]",
          "veoVideoPrompt": "A highly detailed visual prompt to generate a 5-10 second vertical (9:16) Veo video that perfectly matches the trend flow.",
          "audioSuggestion": "What type of trending audio to use (e.g., 'Fast-paced phonk', 'Funny voiceover audio', 'Lofi hip hop')",
          "visualHook": "The fast opening 1-second hook visual",
          "seedKeyword": "A single word for a placeholder image seed (e.g., 'fitness', 'dance', 'tech')"
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

      setLoadingMessage("Operating Veo Engine to generate video. This usually takes 1-2 minutes...");

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: parsed.veoVideoPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      let checkCount = 0;
      while (!operation.done) {
        checkCount++;
        setLoadingMessage(`Rendering your Veo video... (approx ${checkCount * 10}s elapsed)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Failed to get video URI");

      setLoadingMessage("Finalizing video download...");

      const videoResponse = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      parsed.videoUrl = videoUrl;
      setResult(parsed);

    } catch (err) {
      console.error(err);
      alert("Failed to generate TikTok trend video. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
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
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Smartphone size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The TikTok Trend Cloner</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Vertical Veo Videos</p>
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
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Niche / Industry</label>
                  <input 
                    type="text" 
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    placeholder="e.g. Real Estate, Fitness, SaaS..."
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Primary Goal</label>
                  <select 
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-pink-500/50 transition-colors appearance-none"
                  >
                    <option value="sell">Sell a Product</option>
                    <option value="followers">Gain Followers / Virality</option>
                    <option value="educate">Educate Audience</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={generateTikTok}
                disabled={isGenerating || !niche}
                className="w-full py-5 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loadingMessage || 'Clone Trends & Generate Video'}
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </button>
              
              {isGenerating && (
                <div className="text-center text-xs text-slate-500 mt-4 animate-pulse">
                   Video generation requires heavy compute. Please do not close this window.
                </div>
              )}
            </div>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
                 <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                   <CheckCircle2 size={20} />
                 </div>
                 <div>
                   <h3 className="text-emerald-400 font-bold mb-1">Production Complete</h3>
                   <p className="text-sm text-slate-400 mb-4">Your vertical Veo video has been generated and is ready to be used for your TikTok trend.</p>
                   {result.videoUrl && (
                     <a 
                       href={result.videoUrl} 
                       download="tiktok_trend.mp4"
                       className="px-4 py-2 bg-emerald-500 border border-emerald-400 text-white hover:bg-emerald-400 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2"
                     >
                       <Download size={14} /> Download Video
                     </a>
                   )}
                 </div>
               </div>

               <div className="flex flex-col md:flex-row gap-6">
                 {/* Video Preview (Vertical) */}
                 <div className="w-full md:w-80 shrink-0">
                   <div className="bg-black border border-white/10 rounded-[3rem] overflow-hidden justify-center items-center shadow-2xl relative aspect-[9/16] ring-8 ring-slate-900 group flex pointer-events-auto">
                       {result.videoUrl ? (
                          <video 
                            src={result.videoUrl} 
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-cover transition-all duration-700"
                          />
                       ) : (
                          <img 
                            src={`https://picsum.photos/seed/${result.seedKeyword || 'phone'}/720/1280`} 
                            alt="TikTok Preview"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                       )}
                       
                       {/* Context Overlay (Only if it's an image mockup, omitted on real video for better UX) */}
                       {!result.videoUrl && (
                         <>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                           
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                <Play size={24} fill="currentColor" className="ml-1" />
                             </div>
                           </div>
                           
                           <div className="absolute top-8 left-0 right-0 flex justify-center gap-4 text-white font-bold opacity-80 text-sm shadow-black drop-shadow-md pointer-events-none">
                              <span className="opacity-60">Following</span>
                              <span className="border-b-2 border-white">For You</span>
                           </div>

                           <div className="absolute bottom-6 left-4 pr-16 text-white text-sm pointer-events-none">
                              <h4 className="font-bold mb-1 shadow-black drop-shadow-md">@viral_agent</h4>
                              <p className="line-clamp-2 text-xs mb-2 opacity-90 shadow-black drop-shadow-md">{result.visualHook} #trend #viral</p>
                              <div className="flex items-center gap-2 text-xs font-medium bg-black/40 backdrop-blur px-2 py-1 rounded-full w-max border border-white/10">
                                <Music size={12} /> {result.audioSuggestion}
                              </div>
                           </div>
                         </>
                       )}
                   </div>
                 </div>

                 {/* Information Space */}
                 <div className="flex-1 space-y-4">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl h-full">
                       <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                         <Sparkles className="text-pink-500" size={20} /> Generation Details
                       </h3>
                       
                       <div className="space-y-6">
                         <div>
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Visual Hook</label>
                           <p className="text-sm font-medium text-pink-100 bg-pink-500/10 p-4 rounded-xl border border-pink-500/20">{result.visualHook}</p>
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Audio Recommendation</label>
                           <p className="text-sm font-medium text-cyan-100 bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20 flex items-center gap-2">
                             <Music size={16} /> {result.audioSuggestion}
                           </p>
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Veo Generation Prompt</label>
                           <p className="text-sm font-mono text-slate-400 bg-slate-950 p-4 rounded-xl border border-white/5 italic">
                             "{result.veoVideoPrompt}"
                           </p>
                         </div>
                       </div>
                    </div>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
