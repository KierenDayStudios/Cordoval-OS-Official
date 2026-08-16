
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Zap,
  ChevronRight,
  X,
  Megaphone,
  Clock,
  Globe,
  Quote,
  Share2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { storage } from '../storage';
import { SaveLoadControls } from './SaveLoadControls';

interface PressReleaseProfessionalProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Tone = 'corporate' | 'innovative' | 'authoritative';

export const PressReleaseProfessional: React.FC<PressReleaseProfessionalProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [announcement, setAnnouncement] = useState(() => localStorage.getItem('cordoval_pr_announcement') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_pr_guidance') || '');
  const [timing, setTiming] = useState('For Immediate Release');
  const [targetMedia, setTargetMedia] = useState('Tech Journals');
  const [tone, setTone] = useState<Tone>('innovative');
  const [quotes, setQuotes] = useState(() => localStorage.getItem('cordoval_pr_quotes') || '');
  const [socialHook, setSocialHook] = useState(true);

  useEffect(() => {
//     localStorage.setItem('cordoval_pr_announcement', announcement);
//     localStorage.setItem('cordoval_pr_guidance', guidance);
//     localStorage.setItem('cordoval_pr_quotes', quotes);
  }, [announcement, guidance, quotes]);

  const handleSave = () => {
    const backup = { announcement, guidance, timing, targetMedia, tone, quotes, socialHook };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "press_release_backup.json");
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
        if (parsed.announcement !== undefined) setAnnouncement(parsed.announcement);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.quotes !== undefined) setQuotes(parsed.quotes);
        if (parsed.timing !== undefined) setTiming(parsed.timing);
        if (parsed.targetMedia !== undefined) setTargetMedia(parsed.targetMedia);
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

  const generatePR = async () => {
    if (!announcement) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        You are "The Press Release Professional", an expert PR strategist and writer.
        
        TASK: Write a professional press release following standard AP (Associated Press) style.
        
        INPUTS:
        - CORE ANNOUNCEMENT: ${announcement}
        - GUIDANCE: ${guidance || 'None'}
        - RELEASE TIMING: ${timing}
        - TARGET MEDIA: ${targetMedia}
        - TONE: ${tone}
        - QUOTES TO INCLUDE: ${quotes || 'None'}
        - SOCIAL HOOK REQUESTED: ${socialHook}
        - SOURCE DATA: ${sourceFile || 'None'}
        
        REQUIREMENTS:
        1. Structure the narrative according to standard AP style.
        2. Include:
           - A Punchy Headline
           - The Dateline
           - A Compelling Lead
           - Body paragraphs with the provided quotes integrated naturally
           - A Media Contact section
           - An "About Us" Boilerplate at the bottom
        3. If socialHook is true, also generate a "Social Media Teaser" strategy for LinkedIn and X.
        
        OUTPUT FORMAT: You must return a JSON object with the following structure:
        {
          "prDoc": {
            "title": "Press Release: [Headline]",
            "content": "Full Markdown formatted press release."
          },
          "socialDoc": {
            "title": "Social Strategy: [Headline]",
            "content": "Markdown formatted social media teaser strategy."
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a world-class PR professional. Write in perfect AP style. Return valid JSON only."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      // 1. Save Press Release Doc
      const prDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.prDoc?.title || `PR - ${announcement.slice(0, 20)}`,
        content: result.prDoc?.content || "No PR generated.",
        updatedAt: Date.now(),
        tags: ['press-release', 'marketing', 'pr'],
        folderId: null,
        history: []
      };
      onSaveDoc(prDoc);

      // 2. Save Social Strategy if requested
      if (socialHook && result.socialDoc) {
        const socialDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: result.socialDoc.title || `Social Strategy - ${announcement.slice(0, 20)}`,
          content: result.socialDoc.content || "No strategy generated.",
          updatedAt: Date.now(),
          tags: ['social-strategy', 'marketing', 'pr-launch'],
          folderId: null,
          history: []
        };
        // We'll save this one too, but navigate to the PR doc
        await storage.save('docs', { id: socialDoc.id, name: socialDoc.name, type: 'docs', data: socialDoc, updatedAt: socialDoc.updatedAt });
      }

      // 3. Navigate to PR Doc
      onNavigate('docs', prDoc.id);

    } catch (error) {
      console.error("PR generation failed:", error);
      alert("Failed to generate press release. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10 shrink-0">
              <Globe size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tight italic truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The Press Release Professional</h1>
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">AP Style Narrative Architect</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Press Release" compact />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
            <Megaphone size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Media Ready</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Core Announcement or News</label>
              <input 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g., Launching our new sustainable energy initiative"
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-emerald-500/50 outline-none transition-all text-sm md:text-lg font-bold text-white placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Make this sound like a major industry disruption..."
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-emerald-500/50 outline-none transition-all text-xs md:text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Release Timing</label>
                <input 
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  placeholder="e.g., For Immediate Release"
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-emerald-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Target Media</label>
                <input 
                  value={targetMedia}
                  onChange={(e) => setTargetMedia(e.target.value)}
                  placeholder="e.g., Tech Journals, Local News"
                  className="w-full px-4 md:px-8 py-3 md:py-4 bg-slate-950 border border-white/5 rounded-xl md:rounded-2xl focus:border-emerald-500/50 outline-none transition-all text-xs md:text-sm font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Tone</label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <OptionCard 
                  active={tone === 'corporate'} 
                  onClick={() => setTone('corporate')} 
                  label="Corporate" 
                  desc="Formal"
                />
                <OptionCard 
                  active={tone === 'innovative'} 
                  onClick={() => setTone('innovative')} 
                  label="Innovative" 
                  desc="Exciting"
                />
                <OptionCard 
                  active={tone === 'authoritative'} 
                  onClick={() => setTone('authoritative')} 
                  label="Authority" 
                  desc="Leader"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Quotes to Include</label>
              <textarea 
                value={quotes}
                onChange={(e) => setQuotes(e.target.value)}
                placeholder="e.g., John Doe, CEO: 'This is a game changer for the industry...'"
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-emerald-500/50 outline-none transition-all text-xs md:text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            <div className="pt-2 md:pt-4">
              <button 
                onClick={() => setSocialHook(!socialHook)}
                className={`w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between ${socialHook ? 'border-emerald-500 bg-emerald-500/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <Share2 size={16} className={`md:w-5 md:h-5 ${socialHook ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <div className="text-left">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Social Media Hook</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Generate Teaser Strategy Automatically</p>
                  </div>
                </div>
                {socialHook && <CheckCircle2 size={14} className="md:w-4 md:h-4 text-emerald-500" />}
              </button>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/10 text-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tight">PR Source Material</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Fact sheets, white papers, or transcripts</p>
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
              <div className={`w-full py-10 md:py-16 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={32} className="md:w-10 md:h-10 text-emerald-500" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-white truncate max-w-[200px] md:max-w-none">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Source Intelligence Ingested</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="md:w-10 md:h-10 text-slate-800" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-400">Drop PR intelligence here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">PDF, DOCX, or TXT supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Start Button */}
          <button 
            onClick={generatePR}
            disabled={!announcement || isGenerating}
            className={`w-full h-16 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center gap-3 md:gap-4 transition-all ${!announcement || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Structuring Narrative...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Generate Press Release</span>
                <ChevronRight size={16} className="md:w-5 md:h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <FileText size={32} className="absolute inset-0 m-auto text-emerald-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Drafting AP-Style Release...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is crafting your media announcement</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/5' : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/10'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
