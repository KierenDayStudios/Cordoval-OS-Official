
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  X,
  BookOpen,
  Layers,
  ShieldCheck,
  Target
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface WhitePaperEngineerProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const WhitePaperEngineer: React.FC<WhitePaperEngineerProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [topic, setTopic] = useState('');
  const [guidance, setGuidance] = useState('');
  const [depth, setDepth] = useState('Technical Deep-Dive');
  const [tone, setTone] = useState('Authoritative/Academic');
  const [visualStructure, setVisualStructure] = useState('Include placeholders for charts');
  const [brandMentions, setBrandMentions] = useState('Primary Solution');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceFile(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const generateWhitePaper = async () => {
    if (!topic) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        You are "The White Paper Engineer", an expert technical writer and researcher.
        
        TASK: Write a professional white paper.
        
        INPUTS:
        - RESEARCH TOPIC/PROBLEM: ${topic}
        - GUIDANCE: ${guidance || 'None'}
        - DEPTH: ${depth}
        - TONE: ${tone}
        - VISUAL STRUCTURE: ${visualStructure}
        - BRAND POSITIONING: ${brandMentions}
        - SOURCE DATA: ${sourceFile || 'None'}
        
        REQUIREMENTS:
        1. Professional Title
        2. Table of Contents
        3. Executive Summary
        4. Analysis Sections (based on depth)
        5. Conclusion with a Call to Action
        6. Formatted for high-level business distribution.
        
        OUTPUT FORMAT: Return a JSON object:
        {
          "title": "White Paper: [Title]",
          "content": "Full Markdown formatted white paper."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a world-class technical writer. Return valid JSON only."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      const doc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.title || `White Paper - ${topic.slice(0, 20)}`,
        content: result.content || "No content generated.",
        updatedAt: Date.now(),
        tags: ['white-paper', 'research', 'technical'],
        folderId: null,
        history: []
      };
      onSaveDoc(doc);
      onNavigate('docs', doc.id);

    } catch (error) {
      console.error("White paper generation failed:", error);
      alert("Failed to generate white paper. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden">
      <div className="bg-slate-900/50 border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg md:rounded-xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10 shrink-0">
              <BookOpen size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tight italic truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The White Paper Engineer</h1>
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Technical Narrative Architect</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Research Topic or Problem Statement</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Impact of AI on Cybersecurity in 2026"
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-blue-500/50 outline-none transition-all text-sm md:text-lg font-bold text-white placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Focus on the economic impact or make this appeal to CTOs..."
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-blue-500/50 outline-none transition-all text-xs md:text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Depth</label>
                <select 
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-blue-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>Executive Brief</option>
                  <option>Technical Deep-Dive</option>
                  <option>Industry Overview</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-blue-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>Authoritative/Academic</option>
                  <option>Investigative</option>
                  <option>Visionary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Visual Structure</label>
                <select 
                  value={visualStructure}
                  onChange={(e) => setVisualStructure(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-blue-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>Include placeholders for charts</option>
                  <option>Sidebars for key stats</option>
                  <option>Abstract included</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Brand Mentions</label>
                <select 
                  value={brandMentions}
                  onChange={(e) => setBrandMentions(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-blue-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>Primary Solution</option>
                  <option>Remain Neutral</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 text-blue-500 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tight">Source Material</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Raw data, spreadsheets, or technical PDFs</p>
                </div>
              </div>
              {fileName && (
                <button onClick={() => { setSourceFile(null); setFileName(null); }} className="text-rose-500 hover:text-rose-600 p-1">
                  <X size={14} className="md:w-4 md:h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full py-10 md:py-16 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={32} className="md:w-10 md:h-10 text-blue-500" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-white truncate max-w-[200px] md:max-w-none">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Data Ingested</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="md:w-10 md:h-10 text-slate-800" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-400">Drop research data here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">PDF, CSV, or TXT supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <button 
            onClick={generateWhitePaper}
            disabled={!topic || isGenerating}
            className={`w-full h-16 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center gap-3 md:gap-4 transition-all ${!topic || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-400 shadow-2xl shadow-blue-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Synthesizing Narrative...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="md:w-6 md:h-6 shrink-0" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Generate White Paper</span>
                <ChevronRight size={16} className="md:w-5 md:h-5 shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <Layers size={32} className="absolute inset-0 m-auto text-blue-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Structuring Argument...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is analyzing evidence and logic</p>
          </div>
        </div>
      )}
    </div>
  );
};
