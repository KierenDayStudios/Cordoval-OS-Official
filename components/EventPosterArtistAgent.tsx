import React, { useState } from 'react';
import { 
  ArrowLeft, Palette, Sparkles, FileText, CheckCircle2, Loader2, MapPin, Calendar, Type
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface EventPosterArtistAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const EventPosterArtistAgent: React.FC<EventPosterArtistAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [eventName, setEventName] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [vibe, setVibe] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generatePoster = async () => {
    if (!eventName || !vibe) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `
        You are "The Event Poster Artist" AI agent. 
        TASK: Research the target band/event style and generate a high-fidelity Nano poster concept complete with accurate artistic styling cues and layout data.
        
        - EVENT/BAND NAME: ${eventName}
        - EVENT DETAILS (Date/Venue/Info): ${eventDetails}
        - TARGET VIBE/STYLE: ${vibe}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "Poster Design: [Event Name]",
          "scriptContent": "Full markdown document analyzing the artistic style, typography choices, color palette, and visual motifs.",
          "poster": {
            "conceptName": "Name of the aesthetic approach",
            "prompt": "Highly detailed visual generation prompt for an AI image generator to create the background art for this poster",
            "seedKeyword": "A single word for a placeholder image seed (e.g., 'concert', 'neon', 'abstract', 'grunge')",
            "typographyStyle": "Suggested font style (e.g., 'Bold Helvetica', 'Flowing Script', 'Distressed Gothic')",
            "colorPalette": "Brief color palette description",
            "headline": "The main text to overlay (usually event name)",
            "subHeadline": "Secondary text overlay (dates/venue/tagline)"
          }
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
        tags: ['design', 'event', 'poster'],
        folderId: 'root',
        history: []
      };
      
      onSaveDoc(newDoc);
    } catch (err) {
      console.error(err);
      alert("Failed to generate poster concept. Please try again.");
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
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
              <Palette size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The Event Poster Artist</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">High-Fidelity Nano Posters</p>
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
        <div className="max-w-5xl mx-auto space-y-6">
          {!result ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Type size={12} /> Event / Band Name
                   </label>
                   <input 
                     type="text" 
                     value={eventName}
                     onChange={e => setEventName(e.target.value)}
                     placeholder="e.g. Neon Horizon Tour, Tech Conference 2026..."
                     className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-fuchsia-500/50 transition-colors"
                   />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4 flex items-center gap-2">
                     <MapPin size={12} /> Event Details (Date, Venue, Tagline)
                   </label>
                   <textarea 
                     value={eventDetails}
                     onChange={e => setEventDetails(e.target.value)}
                     placeholder="e.g. October 15th @ The Grand Arena | 'Experience the future of sound'"
                     className="w-full h-24 bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-fuchsia-500/50 transition-colors resize-none"
                   />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4 flex items-center gap-2">
                     <Palette size={12} /> Artistic Style / Vibe
                   </label>
                   <input 
                     type="text" 
                     value={vibe}
                     onChange={e => setVibe(e.target.value)}
                     placeholder="e.g. 80s Synthwave, Swiss Typography minimalism, 90s Grunge..."
                     className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-fuchsia-500/50 transition-colors"
                   />
                 </div>
              </div>

              <button 
                onClick={generatePoster}
                disabled={isGenerating || !eventName || !vibe}
                className="w-full py-5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:hover:bg-fuchsia-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-fuchsia-600/20 flex items-center justify-center gap-3"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'Designing Poster...' : 'Generate Nano Poster'}
              </button>
            </div>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                     <CheckCircle2 size={20} />
                   </div>
                   <div>
                     <h3 className="text-emerald-400 font-bold mb-1">Design Complete</h3>
                     <p className="text-sm text-slate-400">Design rationale and layout data saved to Docs. Digital mock-up is ready below.</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => onNavigate('docs', null)}
                   className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                 >
                   <FileText size={14} /> Open Design Rationale
                 </button>
               </div>

               <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto items-start">
                  
                  {/* Poster Preview */}
                  <div className="w-full md:w-1/2 shrink-0">
                    <div className="aspect-[3/4] relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl group hover:border-fuchsia-500/50 transition-colors">
                      <img 
                        src={`https://picsum.photos/seed/${result.poster?.seedKeyword || 'poster'}/800/1066`} 
                        alt="Poster Background"
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity mix-blend-overlay"
                        referrerPolicy="no-referrer"
                      />
                      {/* Gradient Overlays for Text Readability */}
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/80 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                      
                      <div className="absolute inset-0 p-8 flex flex-col justify-between items-center text-center">
                         <div className="mt-4">
                           <div className="w-12 h-1 bg-fuchsia-500 mx-auto mb-6 transform -rotate-2" />
                           <h2 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tighter drop-shadow-xl uppercase">
                             {result.poster?.headline}
                           </h2>
                         </div>
                         <div className="w-full backdrop-blur-md bg-black/40 border border-white/10 p-4 rounded-xl mb-4">
                           <p className="text-sm sm:text-base font-bold text-slate-200 tracking-widest uppercase">
                             {result.poster?.subHeadline}
                           </p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Design Details */}
                  <div className="w-full md:w-1/2 space-y-6">
                     <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                          <Palette className="text-fuchsia-500" size={16} /> Artistic Details
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Concept Name</span>
                            <span className="text-white font-bold">{result.poster?.conceptName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Typography Approach</span>
                            <span className="text-fuchsia-200 bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1 rounded-lg text-sm font-medium inline-block">{result.poster?.typographyStyle}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Color Palette</span>
                            <span className="text-slate-300 text-sm">{result.poster?.colorPalette}</span>
                          </div>
                        </div>
                     </div>

                     <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">AI Image Generation Prompt</span>
                       <div className="bg-slate-950 border border-white/5 p-4 rounded-xl">
                          <p className="text-xs text-slate-400 font-mono italic leading-relaxed">
                            "{result.poster?.prompt}"
                          </p>
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
