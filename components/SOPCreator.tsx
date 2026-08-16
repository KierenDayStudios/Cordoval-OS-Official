
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  X,
  ClipboardList,
  Settings,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface SOPCreatorProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const SOPCreator: React.FC<SOPCreatorProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [processName, setProcessName] = useState(() => localStorage.getItem('cordoval_sop_name') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_sop_guidance') || '');
  const [format, setFormat] = useState('Numbered Steps');
  const [complexity, setComplexity] = useState('Micro-task Detail');
  const [tone, setTone] = useState('Direct/Instructional');
  const [tooling, setTooling] = useState(() => localStorage.getItem('cordoval_sop_tooling') || '');

  useEffect(() => {
//     localStorage.setItem('cordoval_sop_name', processName);
//     localStorage.setItem('cordoval_sop_guidance', guidance);
//     localStorage.setItem('cordoval_sop_tooling', tooling);
  }, [processName, guidance, tooling]);

  const handleSave = () => {
    const backup = { processName, guidance, format, complexity, tone, tooling };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "sop_creator_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.processName !== undefined) setProcessName(parsed.processName);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.tooling !== undefined) setTooling(parsed.tooling);
        if (parsed.format !== undefined) setFormat(parsed.format);
        if (parsed.complexity !== undefined) setComplexity(parsed.complexity);
        if (parsed.tone !== undefined) setTone(parsed.tone);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
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

  const generateSOP = async () => {
    if (!processName) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        You are "The SOP Creator", an expert in business process optimization and documentation.
        
        TASK: Create a structured Standard Operating Procedure (SOP).
        
        INPUTS:
        - PROCESS NAME: ${processName}
        - GUIDANCE: ${guidance || 'None'}
        - FORMAT: ${format}
        - COMPLEXITY: ${complexity}
        - TONE: ${tone}
        - TOOLING: ${tooling || 'None'}
        - SOURCE DATA: ${sourceFile || 'None'}
        
        REQUIREMENTS:
        1. Objective
        2. Prerequisites
        3. Step-by-Step Instructions (based on format and complexity)
        4. Troubleshooting Tips
        5. Ready to be handed off to a team member.
        
        OUTPUT FORMAT: Return a JSON object:
        {
          "title": "SOP: [Process Name]",
          "content": "Full Markdown formatted SOP."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert process documentation specialist. Return valid JSON only."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      const doc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.title || `SOP - ${processName.slice(0, 20)}`,
        content: result.content || "No content generated.",
        updatedAt: Date.now(),
        tags: ['sop', 'process', 'documentation'],
        folderId: null,
        history: []
      };
      onSaveDoc(doc);
      onNavigate('docs', doc.id);

    } catch (error) {
      console.error("SOP generation failed:", error);
      alert("Failed to generate SOP. Please try again.");
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
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg md:rounded-xl flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/10 shrink-0">
              <ClipboardList size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tight italic truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The SOP Creator</h1>
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Process Flow Architect</p>
            </div>
          </div>
        </div>
        <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="SOP" compact />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Process Name</label>
              <input 
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="e.g., Monthly Payroll or Client Onboarding"
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-orange-500/50 outline-none transition-all text-sm md:text-lg font-bold text-white placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Ensure this is easy for a new hire to follow..."
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-orange-500/50 outline-none transition-all text-xs md:text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Format</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-orange-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>Numbered Steps</option>
                  <option>If/Then Logic Tree</option>
                  <option>Checklist Style</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Complexity</label>
                <select 
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-orange-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>High-level Overview</option>
                  <option>Micro-task Detail</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-orange-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white appearance-none"
                >
                  <option>Direct/Instructional</option>
                  <option>Friendly/Cultural</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Tooling (Software Used)</label>
                <input 
                  value={tooling}
                  onChange={(e) => setTooling(e.target.value)}
                  placeholder="e.g., Slack, Stripe, Excel"
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-orange-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/10 text-orange-500 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tight">Process Source Material</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Voice memo transcripts, rough notes, or screenshots</p>
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
              <div className={`w-full py-10 md:py-16 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={32} className="md:w-10 md:h-10 text-orange-500" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-white truncate max-w-[200px] md:max-w-none">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Process Data Ingested</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="md:w-10 md:h-10 text-slate-800" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-400">Drop process notes here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">TXT, PDF, or DOCX supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <button 
            onClick={generateSOP}
            disabled={!processName || isGenerating}
            className={`w-full h-16 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center gap-3 md:gap-4 transition-all ${!processName || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-400 shadow-2xl shadow-orange-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Organizing Flow...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Generate SOP</span>
                <ChevronRight size={16} className="md:w-5 md:h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-orange-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <Settings size={32} className="absolute inset-0 m-auto text-orange-500 animate-spin-slow" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Organizing Chaos...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is structuring your logical flow</p>
          </div>
        </div>
      )}
    </div>
  );
};
