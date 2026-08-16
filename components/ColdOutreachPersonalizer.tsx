
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Zap,
  Target,
  MessageSquare,
  X,
  User,
  Building,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface ColdOutreachPersonalizerProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Tone = 'formal' | 'casual' | 'bold';
type Length = 'short' | 'medium' | 'detailed';
type Focus = 'achievement' | 'pain-point' | 'interest';
type Variations = 1 | 2 | 3;

export const ColdOutreachPersonalizer: React.FC<ColdOutreachPersonalizerProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [prospectName, setProspectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [guidance, setGuidance] = useState('');
  const [tone, setTone] = useState<Tone>('formal');
  const [length, setLength] = useState<Length>('medium');
  const [focus, setFocus] = useState<Focus>('pain-point');
  const [variations, setVariations] = useState<Variations>(1);
  const [includeFollowUp, setIncludeFollowUp] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const generateOutreach = async () => {
    if (!prospectName || !companyName) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3.1-pro-preview";
      
      const prompt = `
        You are "The Cold Outreach Personalizer", an expert in high-conversion sales outreach.
        
        TASK: Generate personalized cold outreach email(s) based on the following parameters:
        
        - PROSPECT NAME: ${prospectName}
        - COMPANY: ${companyName}
        - TONE: ${tone}
        - LENGTH: ${length}
        - PERSONALIZATION FOCUS: ${focus}
        - NUMBER OF VARIATIONS: ${variations}
        - INCLUDE FOLLOW-UP (Step 2): ${includeFollowUp ? 'Yes' : 'No'}
        - ADDITIONAL GUIDANCE: ${guidance || 'None'}
        ${sourceFile ? `- SOURCE MATERIAL: ${sourceFile}` : ''}
        
        STRUCTURE REQUIREMENTS:
        1. For each variation, include:
           - A high-impact, curiosity-driven Subject Line.
           - The email body with placeholders like [Name] or [Company] clearly marked.
        2. If a follow-up is requested, provide a "Step 2" email to be sent 3 days later.
        3. Ensure the personalization feels authentic and researched, matching the ${focus} focus.
        4. Use clear markdown headers for each version and section.
        
        Output the entire content in clean Markdown format.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const content = response.text || "Failed to generate outreach.";
      
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Outreach: ${prospectName} @ ${companyName}`,
        content: content,
        updatedAt: Date.now(),
        tags: ['outreach', 'sales', companyName.toLowerCase()],
        folderId: 'root',
        history: []
      };

      onSaveDoc(newDoc);
      onNavigate('docs', newDoc.id);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate outreach. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Mail size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">The Cold Outreach Personalizer</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High-Conversion Sales Architect</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">System Ready</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} /> Prospect Name
                </label>
                <input 
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Building size={12} /> Company
                </label>
                <input 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">The "Big Idea" or Offer</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="Specific product, service, or the core message you want to convey..."
                className="w-full px-4 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[100px] md:min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Tone Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <OptionCard 
                    active={tone === 'formal'} 
                    onClick={() => setTone('formal')} 
                    label="Formal" 
                    desc="Respectful"
                  />
                  <OptionCard 
                    active={tone === 'casual'} 
                    onClick={() => setTone('casual')} 
                    label="Casual" 
                    desc="Peer-to-Peer"
                  />
                  <OptionCard 
                    active={tone === 'bold'} 
                    onClick={() => setTone('bold')} 
                    label="Bold" 
                    desc="Direct"
                  />
                </div>
              </div>

              {/* Length Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Length</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={length === 'short'} 
                    onClick={() => setLength('short')} 
                    label="Short" 
                    desc="< 100 words"
                  />
                  <OptionCard 
                    active={length === 'medium'} 
                    onClick={() => setLength('medium')} 
                    label="Medium" 
                    desc="Balanced"
                  />
                  <OptionCard 
                    active={length === 'detailed'} 
                    onClick={() => setLength('detailed')} 
                    label="Detailed" 
                    desc="Value Prop"
                  />
                </div>
              </div>

              {/* Personalization Focus */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personalization Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={focus === 'achievement'} 
                    onClick={() => setFocus('achievement')} 
                    label="Achievement" 
                    desc="Recent Win"
                  />
                  <OptionCard 
                    active={focus === 'pain-point'} 
                    onClick={() => setFocus('pain-point')} 
                    label="Pain Point" 
                    desc="Common Issue"
                  />
                  <OptionCard 
                    active={focus === 'interest'} 
                    onClick={() => setFocus('interest')} 
                    label="Interest" 
                    desc="Shared Hobby"
                  />
                </div>
              </div>

              {/* Variations Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Variations</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={variations === 1} 
                    onClick={() => setVariations(1)} 
                    label="1 Version" 
                    desc="Standard"
                  />
                  <OptionCard 
                    active={variations === 2} 
                    onClick={() => setVariations(2)} 
                    label="2 Versions" 
                    desc="A/B Test"
                  />
                  <OptionCard 
                    active={variations === 3} 
                    onClick={() => setVariations(3)} 
                    label="3 Versions" 
                    desc="Multi-Test"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Include Follow-up</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Generate a "Step 2" email (3 days later)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIncludeFollowUp(!includeFollowUp)}
                  className={`w-12 h-6 rounded-full transition-all relative ${includeFollowUp ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeFollowUp ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Prospect Intelligence</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">LinkedIn PDF, website screenshot, or case study</p>
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
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full py-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${fileName ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={32} className="text-emerald-500" />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-900">{fileName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Loaded</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-300" />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-900">Drop prospect data here</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <button 
              onClick={generateOutreach}
              disabled={!prospectName || !companyName || isGenerating}
              className={`group relative px-12 py-6 rounded-[2rem] flex items-center gap-4 transition-all overflow-hidden ${!prospectName || !companyName || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl shadow-slate-900/20'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Analyzing Prospect...</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Generate Outreach</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <Mail size={32} className="absolute inset-0 m-auto text-blue-600 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Analyzing Background...</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Matching prospect data to your offer</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-lg shadow-blue-600/5' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
