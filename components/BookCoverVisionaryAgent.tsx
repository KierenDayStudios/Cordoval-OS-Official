import React, { useState } from 'react';
import { 
  ArrowLeft, BookOpen, Sparkles, FileText, CheckCircle2, Loader2 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface BookCoverVisionaryAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const BookCoverVisionaryAgent: React.FC<BookCoverVisionaryAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateCovers = async () => {
    if (!title || !genre || !summary) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `
        You are "The Book Cover Visionary" AI agent. 
        TASK: Read the book summary, research bestselling covers in this genre, and generate 3 high-res Nano cover design concepts.
        
        - BOOK TITLE: ${title}
        - GENRE: ${genre}
        - SYNOPSIS/SUMMARY: ${summary}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "Cover Design Strategy: [Title]",
          "scriptContent": "Full markdown document analyzing current genre trends and providing a deep rationale for the design concepts.",
          "nanoCovers": [
            {
              "conceptName": "Name of this design angle",
              "rationale": "Why this design will convert readers in this genre",
              "prompt": "Highly detailed visual generation prompt for an AI image generator to create this specific book cover idea",
              "seedKeyword": "A single word for a placeholder image seed (e.g., 'mystery', 'fantasy', 'romance')"
            }
          ] // MUST CONTAIN EXACTLY 3 CONCEPTS
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
        tags: ['design', 'publishing', 'assets'],
        folderId: 'root',
        history: []
      };
      
      onSaveDoc(newDoc);
    } catch (err) {
      console.error(err);
      alert("Failed to generate cover concepts. Please try again.");
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
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The Book Cover Visionary</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Bestseller Concept Generation</p>
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
        <div className="max-w-6xl mx-auto space-y-6">
          {!result ? (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Book Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. The Silent Echo"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Genre</label>
                    <input 
                      type="text" 
                      value={genre}
                      onChange={e => setGenre(e.target.value)}
                      placeholder="e.g. Psychological Thriller, High Fantasy..."
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4">Core Synopsis / Summary</label>
                  <textarea 
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder="Provide a blurb or outline of the book's themes and plot..."
                    className="w-full h-40 bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-violet-500/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={generateCovers}
                disabled={isGenerating || !title || !genre || !summary}
                className="w-full py-5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-3"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'Researching Trends & Designing...' : 'Generate 3 Cover Concepts'}
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
                     <h3 className="text-emerald-400 font-bold mb-1">Design Strategy Complete</h3>
                     <p className="text-sm text-slate-400">Market rationale saved to Docs. 3 distinct high-res Nano concepts generated.</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => onNavigate('docs', null)}
                   className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                 >
                   <FileText size={14} /> Open Design Rationale
                 </button>
               </div>

               <div className="space-y-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-violet-500" size={24} /> Bestseller Title Concepts
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {result.nanoCovers?.map((cover: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-violet-500/30 transition-all transform hover:-translate-y-2 duration-300">
                        <div className="aspect-[2/3] relative overflow-hidden bg-slate-950 flex items-center justify-center">
                          <img 
                            src={`https://picsum.photos/seed/${cover.seedKeyword || idx + 'cover'}/800/1200`} 
                            alt={cover.conceptName}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-all duration-1000"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-6 left-6 right-6">
                             <div className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2">Concept {idx + 1}</div>
                             <h4 className="text-xl font-black text-white leading-tight drop-shadow-md">{cover.conceptName}</h4>
                          </div>
                        </div>
                        <div className="p-6 bg-slate-900 flex-1 flex flex-col">
                          <div className="mb-4">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Market Rationale</h5>
                             <p className="text-sm text-slate-300 font-medium leading-relaxed">{cover.rationale}</p>
                          </div>
                          <div className="mt-auto pt-4 border-t border-white/5">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">AI Prompt</h5>
                             <p className="text-[10px] text-slate-500 font-mono italic line-clamp-2 hover:line-clamp-none transition-all">
                               "{cover.prompt}"
                             </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
