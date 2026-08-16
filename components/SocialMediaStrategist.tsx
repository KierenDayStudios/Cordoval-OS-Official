
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Zap,
  Calendar,
  Search,
  X,
  ChevronRight,
  Instagram,
  Linkedin,
  Twitter,
  Video,
  Layout,
  Type as TypeIcon,
  Megaphone,
  Clock,
  Target
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { AppView, Document, CalendarEvent } from '../types';
import { storage } from '../storage';
import { SaveLoadControls } from './SaveLoadControls';

interface SocialMediaStrategistProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Frequency = 'daily' | '3x' | 'weekend';
type Style = 'educational' | 'bts' | 'viral';
type Direction = 'graphic' | 'video' | 'text';

export const SocialMediaStrategist: React.FC<SocialMediaStrategistProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('cordoval_social_theme') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_social_guidance') || '');
  const [platforms, setPlatforms] = useState<string[]>(['LinkedIn']);
  const [frequency, setFrequency] = useState<Frequency>('3x');
  const [style, setStyle] = useState<Style>('educational');
  const [direction, setDirection] = useState<Direction>('video');
  const [calendarSync, setCalendarSync] = useState(true);

  useEffect(() => {
//     localStorage.setItem('cordoval_social_theme', theme);
//     localStorage.setItem('cordoval_social_guidance', guidance);
  }, [theme, guidance]);

  const handleSave = () => {
    const backup = { theme, guidance, platforms, frequency, style, direction, calendarSync };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "social_media_backup.json");
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
        if (parsed.theme !== undefined) setTheme(parsed.theme);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.platforms !== undefined) setPlatforms(parsed.platforms);
        if (parsed.frequency !== undefined) setFrequency(parsed.frequency);
        if (parsed.style !== undefined) setStyle(parsed.style);
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

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const generateStrategy = async () => {
    if (!theme) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        You are "The Social Media Strategist", an expert in viral growth and brand authority.
        
        TASK: Generate a 30-day social media content strategy and calendar.
        
        INPUTS:
        - THEME/GOAL: ${theme}
        - GUIDANCE: ${guidance || 'None'}
        - PLATFORMS: ${platforms.join(', ')}
        - FREQUENCY: ${frequency}
        - STYLE: ${style}
        - VISUAL DIRECTION: ${direction}
        - SOURCE DATA: ${sourceFile || 'None'}
        
        REQUIREMENTS:
        1. Create a 30-Day Content Calendar with specific pillars and hooks.
        2. For each post, provide: Date, Platform, Headline/Hook, Visual Prompt, and Hashtags.
        3. Generate a "Master Copy" document containing full long-form captions for all posts.
        4. If Calendar Sync is on (${calendarSync}), provide a list of events to schedule.
        
        OUTPUT FORMAT: You must return a JSON object with the following structure:
        {
          "strategyDoc": {
            "title": "30-Day Strategy: ${theme}",
            "content": "Markdown formatted 30-day calendar with hooks and visual prompts."
          },
          "masterCopyDoc": {
            "title": "Master Copy - ${theme}",
            "content": "Markdown formatted full captions for all 30 days."
          },
          "calendarEvents": [
            { "title": "Post: Hook Title", "date": "2026-04-01", "description": "Platform: LinkedIn | Style: Educational" },
            ... more events ...
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a world-class social media strategist. Return valid JSON only."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      // 1. Save Strategy Doc
      const strategyDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.strategyDoc?.title || `Strategy - ${theme}`,
        content: result.strategyDoc?.content || "No strategy generated.",
        updatedAt: Date.now(),
        tags: ['strategy', 'social', theme],
        folderId: null,
        history: []
      };
      onSaveDoc(strategyDoc);

      // 2. Save Master Copy Doc
      const masterCopyDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.masterCopyDoc?.title || `Master Copy - ${theme}`,
        content: result.masterCopyDoc?.content || "No captions generated.",
        updatedAt: Date.now(),
        tags: ['captions', 'social'],
        folderId: null,
        history: []
      };
      onSaveDoc(masterCopyDoc);

      // 3. Sync to Calendar if requested
      if (calendarSync && result.calendarEvents) {
        for (const event of result.calendarEvents) {
          const newEvent: CalendarEvent = {
            id: Math.random().toString(36).substr(2, 9),
            title: event.title,
            date: event.date,
            type: 'work',
            description: event.description
          };
          await storage.save('calendar', { id: newEvent.id, name: newEvent.title, data: newEvent, updatedAt: Date.now(), type: 'calendar' });
        }
      }

      // 4. Navigate to Strategy Doc
      onNavigate('docs', strategyDoc.id);

    } catch (error) {
      console.error("Strategy generation failed:", error);
      alert("Failed to generate strategy. Please try again.");
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
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/10 shrink-0">
              <Share2 size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tight italic truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The Social Media Strategist</h1>
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Viral Growth Architect</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Social Strategy" compact />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg border border-indigo-500/20">
            <Megaphone size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Campaign Ready</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Campaign Theme or Goal</label>
              <input 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Launching my new coaching program"
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-indigo-500/50 outline-none transition-all text-sm md:text-lg font-bold text-white placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Focus on gaining newsletter subscribers..."
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-indigo-500/50 outline-none transition-all text-xs md:text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[80px] md:min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-3 md:space-y-4">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Target Platforms</label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { id: 'LinkedIn', icon: Linkedin },
                  { id: 'Instagram', icon: Instagram },
                  { id: 'TikTok', icon: Video },
                  { id: 'X', icon: Twitter }
                ].map(p => (
                  <button 
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl border-2 flex items-center gap-2 md:gap-3 transition-all ${platforms.includes(p.id) ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/10'}`}
                  >
                    <p.icon size={14} className="md:w-4 md:h-4" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{p.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {/* Frequency */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Frequency</label>
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-2">
                  <OptionCard 
                    active={frequency === 'daily'} 
                    onClick={() => setFrequency('daily')} 
                    label="Daily" 
                    desc="High Volume"
                  />
                  <OptionCard 
                    active={frequency === '3x'} 
                    onClick={() => setFrequency('3x')} 
                    label="3x / Week" 
                    desc="Balanced"
                  />
                  <OptionCard 
                    active={frequency === 'weekend'} 
                    onClick={() => setFrequency('weekend')} 
                    label="Weekend" 
                    desc="Intense"
                  />
                </div>
              </div>

              {/* Style */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Strategy Style</label>
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-2">
                  <OptionCard 
                    active={style === 'educational'} 
                    onClick={() => setStyle('educational')} 
                    label="Educational" 
                    desc="Authority"
                  />
                  <OptionCard 
                    active={style === 'bts'} 
                    onClick={() => setStyle('bts')} 
                    label="Behind Scenes" 
                    desc="Authentic"
                  />
                  <OptionCard 
                    active={style === 'viral'} 
                    onClick={() => setStyle('viral')} 
                    label="Viral / Meme" 
                    desc="Growth"
                  />
                </div>
              </div>

              {/* Direction */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Visual Direction</label>
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-2">
                  <OptionCard 
                    active={direction === 'graphic'} 
                    onClick={() => setDirection('graphic')} 
                    label="Graphic-led" 
                    desc="Design Focus"
                  />
                  <OptionCard 
                    active={direction === 'video'} 
                    onClick={() => setDirection('video')} 
                    label="Video-first" 
                    desc="Reels/Shorts"
                  />
                  <OptionCard 
                    active={direction === 'text'} 
                    onClick={() => setDirection('text')} 
                    label="Text-only" 
                    desc="X/LinkedIn"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 md:pt-4">
              <button 
                onClick={() => setCalendarSync(!calendarSync)}
                className={`w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between ${calendarSync ? 'border-indigo-500 bg-indigo-500/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <Calendar size={16} className={`md:w-5 md:h-5 ${calendarSync ? 'text-indigo-500' : 'text-slate-600'}`} />
                  <div className="text-left">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Calendar Sync</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Populate Schedule Tool Automatically</p>
                  </div>
                </div>
                {calendarSync && <CheckCircle2 size={14} className="md:w-4 md:h-4 text-indigo-500" />}
              </button>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/10 text-indigo-500 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tight">Strategy Source Material</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Mood boards, competitor links, or notes dump</p>
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
              <div className={`w-full py-10 md:py-16 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={32} className="md:w-10 md:h-10 text-indigo-500" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-white truncate max-w-[200px] md:max-w-none">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Intelligence Loaded</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="md:w-10 md:h-10 text-slate-800" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-400">Drop brand data here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Images, PDFs, or TXT supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Start Button */}
          <button 
            onClick={generateStrategy}
            disabled={!theme || isGenerating}
            className={`w-full h-16 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center gap-3 md:gap-4 transition-all ${!theme || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-2xl shadow-indigo-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Mapping Content Pillars...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Generate 30-Day Strategy</span>
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
            <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <Target size={32} className="absolute inset-0 m-auto text-indigo-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Architecting Viral Hooks...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is planning your 30-day takeover</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-lg shadow-indigo-500/5' : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/10'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
