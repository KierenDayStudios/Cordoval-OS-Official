
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
  Users,
  UserCircle,
  Brain,
  Zap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface CustomerPersonaProfilerProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const CustomerPersonaProfiler: React.FC<CustomerPersonaProfilerProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [description, setDescription] = useState(() => localStorage.getItem('cordoval_persona_desc') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_persona_guidance') || '');
  const [count, setCount] = useState('3');
  const [detailLevel, setDetailLevel] = useState('Full Psychographic Deep-Dive');
  const [tone, setTone] = useState('Analytical/Marketing-focused');
  const [includeTriggers, setIncludeTriggers] = useState(true);

  useEffect(() => {
//     localStorage.setItem('cordoval_persona_desc', description);
//     localStorage.setItem('cordoval_persona_guidance', guidance);
  }, [description, guidance]);

  const handleSave = () => {
    const backup = { description, guidance, count, detailLevel, tone, includeTriggers };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "customer_persona_backup.json");
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
        if (parsed.description !== undefined) setDescription(parsed.description);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.count !== undefined) setCount(parsed.count);
        if (parsed.detailLevel !== undefined) setDetailLevel(parsed.detailLevel);
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

  const generatePersonas = async () => {
    if (!description) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        You are "The Customer Persona Profiler", an expert market researcher and psychologist.
        
        TASK: Create detailed customer personas.
        
        INPUTS:
        - PRODUCT/SERVICE DESCRIPTION: ${description}
        - GUIDANCE: ${guidance || 'None'}
        - NUMBER OF PERSONAS: ${count}
        - DETAIL LEVEL: ${detailLevel}
        - TONE: ${tone}
        - INCLUDE BUYING TRIGGERS: ${includeTriggers}
        - SOURCE DATA: ${sourceFile || 'None'}
        
        REQUIREMENTS:
        1. 2–3 pages of in-depth Customer Avatars.
        2. Include: Goals, Pain Points, Objections, and Daily Habits.
        3. If includeTriggers is true, include specific phrases and emotional hooks.
        4. Provide a "cheat sheet" for future marketing.
        
        OUTPUT FORMAT: Return a JSON object:
        {
          "title": "Personas: [Product]",
          "content": "Full Markdown formatted customer persona profiles."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert market researcher. Return valid JSON only."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      const doc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.title || `Personas - ${description.slice(0, 20)}`,
        content: result.content || "No content generated.",
        updatedAt: Date.now(),
        tags: ['personas', 'marketing', 'research'],
        folderId: null,
        history: []
      };
      onSaveDoc(doc);
      onNavigate('docs', doc.id);

    } catch (error) {
      console.error("Persona generation failed:", error);
      alert("Failed to generate personas. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden">
      <div className="bg-slate-900/50 border-b border-white/5 px-8 py-4 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight italic">The Persona Profiler</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer Psychology Architect</p>
            </div>
          </div>
        </div>
        <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Personas" compact />
      </div>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          <section className="bg-slate-900/30 rounded-[2.5rem] p-10 border border-white/5 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Product or Service Description</label>
              <input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., High-end organic skincare for urban professionals"
                className="w-full px-8 py-6 bg-slate-950 border border-white/5 rounded-3xl focus:border-rose-500/50 outline-none transition-all text-lg font-bold text-white placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Target high-net-worth individuals or focus on stay-at-home parents..."
                className="w-full px-8 py-6 bg-slate-950 border border-white/5 rounded-3xl focus:border-rose-500/50 outline-none transition-all text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Number of Personas</label>
                <select 
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-rose-500/50 outline-none transition-all text-sm font-bold text-white appearance-none"
                >
                  <option>1</option>
                  <option>3</option>
                  <option>5</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Detail Level</label>
                <select 
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-rose-500/50 outline-none transition-all text-sm font-bold text-white appearance-none"
                >
                  <option>Basic Demographics</option>
                  <option>Full Psychographic Deep-Dive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-rose-500/50 outline-none transition-all text-sm font-bold text-white appearance-none"
                >
                  <option>Analytical/Marketing-focused</option>
                  <option>Narrative/Story-driven</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setIncludeTriggers(!includeTriggers)}
                  className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${includeTriggers ? 'border-rose-500 bg-rose-500/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <Zap size={20} className={includeTriggers ? 'text-rose-500' : 'text-slate-600'} />
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest">Buying Triggers</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Include emotional hooks</p>
                    </div>
                  </div>
                  {includeTriggers && <CheckCircle2 size={16} className="text-rose-500" />}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/30 rounded-[2.5rem] p-10 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-tight">Market Research Data</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Existing customer data or market reports</p>
                </div>
              </div>
              {fileName && (
                <button onClick={() => { setSourceFile(null); setFileName(null); }} className="text-rose-500 hover:text-rose-600">
                  <X size={16} />
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
              <div className={`w-full py-16 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${fileName ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={40} className="text-rose-500" />
                    <div className="text-center">
                      <p className="text-sm font-black text-white">{fileName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Research Data Ingested</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={40} className="text-slate-800" />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-400">Drop research data here</p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">CSV, PDF, or TXT supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <button 
            onClick={generatePersonas}
            disabled={!description || isGenerating}
            className={`w-full h-24 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all ${!description || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-400 shadow-2xl shadow-rose-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Simulating Ideal Customer...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Generate Personas</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-rose-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <Brain size={32} className="absolute inset-0 m-auto text-rose-500 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Profiling Avatars...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is analyzing psychographic patterns</p>
          </div>
        </div>
      )}
    </div>
  );
};
