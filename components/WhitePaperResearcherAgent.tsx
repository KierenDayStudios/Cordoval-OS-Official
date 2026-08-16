import React, { useState } from 'react';
import { 
  ArrowLeft, Library, Sparkles, FileText, CheckCircle2, Loader2, BookOpen, Target
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface WhitePaperResearcherAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const WhitePaperResearcherAgent: React.FC<WhitePaperResearcherAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateWhitePaper = async () => {
    if (!topic || !audience) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `
        You are "The White Paper Researcher" AI agent. 
        TASK: Perform deep academic/industry research on the provided topic and produce a highly structured, data-driven report meant to represent a comprehensive 20-page white paper.
        
        - CORE TOPIC / THESIS: ${topic}
        - TARGET AUDIENCE: ${audience}
        - KEY FOCUS AREAS: ${focusArea || 'General comprehensive overview'}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "White Paper: [Topic Name]",
          "abstract": "A powerful 2-3 paragraph executive summary of the research findings.",
          "citations": [
            {
              "author": "Author or Institution Name",
              "title": "Title of the cited work / report",
              "year": "Year of publication",
              "snippet": "A brief fact or quote from this source used in the paper"
            }
          ],
          "fullContent": "A massive, highly detailed markdown document containing the white paper. Include an Executive Summary, Table of Contents, Introduction, Methodology/Data Analysis (using the citations), Industry Implications, and Conclusion. Format with professional headers and bullet points."
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
        content: parsed.fullContent,
        updatedAt: Date.now(),
        tags: ['white-paper', 'research', 'academic'],
        folderId: 'root',
        history: []
      };
      
      onSaveDoc(newDoc);
    } catch (err) {
      console.error(err);
      alert("Failed to compile white paper research. Please try again.");
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Library size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The White Paper Researcher</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Deep Academic & Industry Reports</p>
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
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <BookOpen size={12} /> Core Topic / Thesis Statement
                   </label>
                   <textarea 
                     value={topic}
                     onChange={e => setTopic(e.target.value)}
                     placeholder="e.g. The Impact of Quantum Computing on Current Cryptography Standards by 2030."
                     className="w-full h-24 bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-indigo-500/50 transition-colors resize-none"
                   />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Target size={12} /> Target Audience
                     </label>
                     <input 
                       type="text" 
                       value={audience}
                       onChange={e => setAudience(e.target.value)}
                       placeholder="e.g. Enterprise C-Suite..."
                       className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-indigo-500/50 transition-colors"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Sparkles size={12} /> Key Focus (Optional)
                     </label>
                     <input 
                       type="text" 
                       value={focusArea}
                       onChange={e => setFocusArea(e.target.value)}
                       placeholder="e.g. Economic impact, Policy..."
                       className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-indigo-500/50 transition-colors"
                     />
                   </div>
                 </div>
              </div>

              <button 
                onClick={generateWhitePaper}
                disabled={isGenerating || !topic || !audience}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {isGenerating && (
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 animate-pulse" />
                )}
                {isGenerating ? <Loader2 className="animate-spin relative z-10" size={20} /> : <Library className="relative z-10" size={20} />}
                <span className="relative z-10">{isGenerating ? 'Synthesizing Data & Drafting Paper...' : 'Compile White Paper Research'}</span>
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
                     <h3 className="text-emerald-400 font-bold mb-1">Research Compilation Complete</h3>
                     <p className="text-sm text-slate-400">Your comprehensive white paper has been fully drafted and saved directly to Docs.</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => onNavigate('docs', null)}
                   className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-black tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-500/20"
                 >
                   <FileText size={16} /> Read Full Paper
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Abstract Column */}
                 <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                       <h2 className="text-2xl font-black text-white mb-2 leading-tight">{result.documentTitle}</h2>
                       <div className="flex items-center gap-2 mb-6">
                         <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Executive Abstract</span>
                       </div>
                       
                       <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                         {result.abstract}
                       </p>
                    </div>
                 </div>

                 {/* Citations Column */}
                 <div className="md:col-span-1 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 px-2">
                       <Library className="text-indigo-500" size={16} /> Key Citations
                    </h3>
                    
                    <div className="space-y-3">
                       {result.citations?.map((cite: any, idx: number) => (
                         <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl hover:bg-slate-900 transition-colors">
                           <p className="text-xs text-white font-bold mb-1 line-clamp-2">{cite.title}</p>
                           <p className="text-[10px] text-slate-400 font-medium mb-3">{cite.author} ({cite.year})</p>
                           <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                             <p className="text-[9px] text-slate-500 font-serif italic line-clamp-3">
                               "{cite.snippet}"
                             </p>
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
