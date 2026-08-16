import React, { useState } from 'react';
import { 
  ArrowLeft, Film, Sparkles, FileText, CheckCircle2, Loader2, Play, Download, Copy
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { AppView, Document } from '../types';

interface DocumentaryFilmmakerAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Vibe = 'ken-burns' | 'bbc-earth' | 'true-crime' | 'cyberpunk';
type Pacing = 'slow' | 'fast' | 'dynamic';

export const DocumentaryFilmmakerAgent: React.FC<DocumentaryFilmmakerAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [subject, setSubject] = useState('');
  const [vibe, setVibe] = useState<Vibe>('ken-burns');
  const [pacing, setPacing] = useState<Pacing>('dynamic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  const generateDocumentary = async () => {
    if (!subject) return;

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
    setLoadingMessage("Researching Subject & Writing Script...");

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are "The Documentary Filmmaker" AI agent. 
        TASK: Research a historical event or person, write a script, and generate prompts for exactly 2 cinematic Veo video clips (to keep processing times reasonable during demos).
        
        - SUBJECT: ${subject}
        - VIBE/STYLE: ${vibe}
        - PACING: ${pacing}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "Title of the Documentary",
          "scriptContent": "Full script formatted cleanly in markdown. Include voiceover (VO) and visual cues.",
          "veoClips": [
            {
              "prompt": "Cinematic prompt for Veo video generator",
              "visualDescription": "Brief description of what the user will see",
              "duration": 5,
              "seedKeyword": "A single word for a placeholder image seed (e.g., 'war', 'city', 'nature')"
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

      setLoadingMessage("Directing Veo Engine to generate shots. This usually takes 2-4 minutes...");

      // Generate actual videos for each clip concurrently
      const enhancedClips = await Promise.all(parsed.veoClips.map(async (clip: any, index: number) => {
        try {
          let operation = await ai.models.generateVideos({
            model: 'veo-3.1-lite-generate-preview',
            prompt: clip.prompt,
            config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: '16:9'
            }
          });

          let checkCount = 0;
          while (!operation.done) {
            checkCount++;
            setLoadingMessage(`Rendering Shot ${index + 1}/${parsed.veoClips.length}... (approx ${checkCount * 10}s elapsed)`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({operation: operation});
          }

          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (downloadLink) {
            const videoResponse = await fetch(downloadLink, {
              method: 'GET',
              headers: { 'x-goog-api-key': apiKey },
            });
            const videoBlob = await videoResponse.blob();
            clip.videoUrl = URL.createObjectURL(videoBlob);
          }
        } catch (e) {
          console.error(`Error generating clip ${index}:`, e);
        }
        return clip;
      }));

      parsed.veoClips = enhancedClips;
      setResult(parsed);

    } catch (err) {
      console.error(err);
      alert("Failed to generate documentary clips. Please try again.");
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Film size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The Documentary Filmmaker</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Veo Video + Script Agent</p>
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
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. The Apollo 11 Moon Landing, Fall of Rome, Ada Lovelace..."
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Cinematic Vibe</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ken-burns', 'bbc-earth', 'true-crime', 'cyberpunk'] as Vibe[]).map(v => (
                      <button 
                        key={v}
                        onClick={() => setVibe(v)}
                        className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${vibe === v ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/5 bg-slate-950 text-slate-400 hover:border-white/20'}`}
                      >
                        {v.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Pacing</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['slow', 'dynamic', 'fast'] as Pacing[]).map(p => (
                      <button 
                        key={p}
                        onClick={() => setPacing(p)}
                        className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${pacing === p ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/5 bg-slate-950 text-slate-400 hover:border-white/20'}`}
                      >
                         {p === 'slow' ? 'Slow & Emotional' : p === 'fast' ? 'Fast & Action-Packed' : 'Dynamic & Balanced'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={generateDocumentary}
                disabled={isGenerating || !subject}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Film size={20} />}
                {loadingMessage || 'Produce Documentary'}
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
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start flex-col gap-4">
                 <div className="flex gap-4 items-center">
                   <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                     <CheckCircle2 size={20} />
                   </div>
                   <div>
                     <h3 className="text-emerald-400 font-bold mb-1">Production Complete</h3>
                     <p className="text-sm text-slate-400 mb-0">Your script and generated Veo shots are ready below.</p>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Script Column */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl shadow-xl flex flex-col h-[800px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                         <FileText size={18} className="text-indigo-400"/> Generated Script
                      </h3>
                      <button 
                        onClick={() => navigator.clipboard.writeText(result.scriptContent)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 text-slate-300"
                      >
                         <Copy size={14}/> Copy
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 prose prose-invert prose-indigo max-w-none text-sm">
                       <ReactMarkdown>{result.scriptContent}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Video Column */}
                  <div className="space-y-6 overflow-y-auto h-[800px] pr-2 custom-scrollbar">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 sticky top-0 bg-slate-950 py-2 z-10">
                      <Sparkles className="text-indigo-500" size={20} /> Directed Veo Clips
                    </h3>
                    <div className="flex flex-col gap-6">
                       {result.veoClips.map((clip: any, idx: number) => (
                         <div key={idx} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl group">
                           <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5 pointer-events-auto">
                             {clip.videoUrl ? (
                               <video 
                                 src={clip.videoUrl} 
                                 controls
                                 className="w-full h-full object-cover transition-all duration-700"
                               />
                             ) : (
                               <img 
                                 src={`https://picsum.photos/seed/${clip.seedKeyword || idx}/800/450`} 
                                 alt={clip.visualDescription}
                                 className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                                 referrerPolicy="no-referrer"
                               />
                             )}
                             {!clip.videoUrl && (
                               <>
                                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-2xl">
                                      <Play size={24} fill="currentColor" className="ml-1" />
                                   </div>
                                 </div>
                                 <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-[10px] font-black text-white px-2 py-1 rounded-md tracking-widest border border-white/10 pointer-events-none">
                                   VEO FAIL OR MOCK
                                 </div>
                               </>
                             )}
                           </div>
                           <div className="p-4 bg-slate-900">
                             <div className="flex justify-between items-start mb-3">
                               <p className="text-xs text-slate-400 font-medium leading-relaxed mb-0"><span className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Visual</span> {clip.visualDescription}</p>
                               {clip.videoUrl && (
                                 <a href={clip.videoUrl} download={`shot_${idx+1}.mp4`} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white shrink-0 ml-4">
                                   <Download size={14}/>
                                 </a>
                               )}
                             </div>
                             <p className="text-[10px] text-slate-600 font-mono italic">Prompt: "{clip.prompt}"</p>
                           </div>
                         </div>
                       ))}
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
