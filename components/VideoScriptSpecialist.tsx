
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Video, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Youtube, 
  Smartphone, 
  Linkedin,
  Zap,
  Volume2,
  Clapperboard,
  Clock,
  Target,
  MessageSquare,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface VideoScriptSpecialistProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Platform = 'youtube' | 'tiktok' | 'linkedin';
type Tone = 'hype' | 'educational' | 'storytelling';
type Format = 'full' | 'dialogue' | 'aroll-broll';
type Length = '30s' | '60s' | '10m';

export const VideoScriptSpecialist: React.FC<VideoScriptSpecialistProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [topic, setTopic] = useState(() => localStorage.getItem('cordoval_video_topic') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_video_guidance') || '');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [tone, setTone] = useState<Tone>('educational');
  const [format, setFormat] = useState<Format>('full');
  const [length, setLength] = useState<Length>('60s');
  const [brandMentions, setBrandMentions] = useState('');
  const [includeHooks, setIncludeHooks] = useState(true);

  useEffect(() => {
//     localStorage.setItem('cordoval_video_topic', topic);
//     localStorage.setItem('cordoval_video_guidance', guidance);
  }, [topic, guidance]);

  const handleSave = () => {
    const backup = { topic, guidance, platform, tone, format, length, brandMentions, includeHooks };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "video_script_backup.json");
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
        if (parsed.topic !== undefined) setTopic(parsed.topic);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.platform !== undefined) setPlatform(parsed.platform);
        if (parsed.tone !== undefined) setTone(parsed.tone);
        if (parsed.length !== undefined) setLength(parsed.length);
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

  const generateScript = async () => {
    if (!topic) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3.1-pro-preview";
      
      const prompt = `
        You are "The Video Script Specialist", a world-class scriptwriter for digital content.
        
        TASK: Generate a professional video script based on the following parameters:
        
        - TOPIC/GOAL: ${topic}
        - PLATFORM: ${platform}
        - TONE: ${tone}
        - FORMAT: ${format}
        - TARGET LENGTH: ${length}
        - BRAND MENTIONS: ${brandMentions || 'None'}
        - INCLUDE 3 HOOK OPTIONS: ${includeHooks ? 'Yes' : 'No'}
        - ADDITIONAL GUIDANCE: ${guidance || 'None'}
        ${sourceFile ? `- SOURCE MATERIAL: ${sourceFile}` : ''}
        
        STRUCTURE REQUIREMENTS:
        1. If hooks are requested, provide 3 "Scroll-Stopping" hook options at the very beginning.
        2. Organize the script with clear markdown headers:
           - # [Video Title]
           - ## Hook
           - ## Body Content
           - ## Visual Instructions (Storyboard/B-Roll cues)
           - ## Call to Action (CTA)
        3. Use a clear, professional script format (e.g., [VISUAL: ...] [AUDIO: ...]) if "Full Script" is selected.
        4. Ensure the pacing matches the ${length} target length.
        
        Output the entire script in clean Markdown format.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const scriptContent = response.text || "Failed to generate script.";
      
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Script: ${topic.slice(0, 30)}...`,
        content: scriptContent,
        updatedAt: Date.now(),
        tags: ['video-script', platform],
        folderId: 'root',
        history: []
      };

      onSaveDoc(newDoc);
      onNavigate('docs', newDoc.id);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate script. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-slate-100 rounded-xl transition-all">
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
              <Video size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The Video Script Specialist</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">AI-Powered Content Architect</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Video Script" compact />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">System Ready</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Topic or Main Goal</label>
                <input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Why AI is changing the creative industry in 2024..."
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Guidance (Optional)</label>
                <textarea 
                  value={guidance}
                  onChange={(e) => setGuidance(e.target.value)}
                  placeholder="Specific message, key points to hit, or style references..."
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[100px] md:min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Platform Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <OptionCard 
                    active={platform === 'youtube'} 
                    onClick={() => setPlatform('youtube')} 
                    icon={<Youtube size={16} />} 
                    label="YouTube" 
                  />
                  <OptionCard 
                    active={platform === 'tiktok'} 
                    onClick={() => setPlatform('tiktok')} 
                    icon={<Smartphone size={16} />} 
                    label="TikTok/Reels" 
                  />
                  <OptionCard 
                    active={platform === 'linkedin'} 
                    onClick={() => setPlatform('linkedin')} 
                    icon={<Linkedin size={16} />} 
                    label="LinkedIn" 
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <OptionCard 
                    active={tone === 'hype'} 
                    onClick={() => setTone('hype')} 
                    icon={<Zap size={16} />} 
                    label="Hype" 
                  />
                  <OptionCard 
                    active={tone === 'educational'} 
                    onClick={() => setTone('educational')} 
                    icon={<Volume2 size={16} />} 
                    label="Educational" 
                  />
                  <OptionCard 
                    active={tone === 'storytelling'} 
                    onClick={() => setTone('storytelling')} 
                    icon={<Clapperboard size={16} />} 
                    label="Story" 
                  />
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Script Format</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <OptionCard 
                    active={format === 'full'} 
                    onClick={() => setFormat('full')} 
                    icon={<FileText size={16} />} 
                    label="Full Script" 
                  />
                  <OptionCard 
                    active={format === 'dialogue'} 
                    onClick={() => setFormat('dialogue')} 
                    icon={<MessageSquare size={16} />} 
                    label="Dialogue" 
                  />
                  <OptionCard 
                    active={format === 'aroll-broll'} 
                    onClick={() => setFormat('aroll-broll')} 
                    icon={<Clapperboard size={16} />} 
                    label="A/B Roll" 
                  />
                </div>
              </div>

              {/* Length Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Length</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <OptionCard 
                    active={length === '30s'} 
                    onClick={() => setLength('30s')} 
                    icon={<Clock size={16} />} 
                    label="30s" 
                  />
                  <OptionCard 
                    active={length === '60s'} 
                    onClick={() => setLength('60s')} 
                    icon={<Clock size={16} />} 
                    label="60s" 
                  />
                  <OptionCard 
                    active={length === '10m'} 
                    onClick={() => setLength('10m')} 
                    icon={<Clock size={16} />} 
                    label="10m+" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 pt-2 md:pt-4">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Mentions</label>
                <input 
                  value={brandMentions}
                  onChange={(e) => setBrandMentions(e.target.value)}
                  placeholder="Product names, sponsorships..."
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                />
              </div>

              <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <Target size={16} className="md:w-[18px] md:h-[18px]" />
                  </div>
                  <div>
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight">Include Hook Options</h4>
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Generate 3 scroll-stoppers</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIncludeHooks(!includeHooks)}
                  className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative shrink-0 ${includeHooks ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 md:top-1 w-4 h-4 rounded-full bg-white transition-all ${includeHooks ? 'left-5 md:left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight">Source Material</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Articles, manuals, or rough outlines</p>
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
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full py-8 md:py-12 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={24} className="md:w-8 md:h-8 text-emerald-500" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-900 truncate max-w-[200px] md:max-w-none">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">File Uploaded Successfully</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="md:w-8 md:h-8 text-slate-300" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-900">Drop source file here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="flex justify-center pt-2 md:pt-4">
            <button 
              onClick={generateScript}
              disabled={!topic || isGenerating}
              className={`group relative w-full md:w-auto px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-3 md:gap-4 transition-all overflow-hidden ${!topic || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl shadow-slate-900/20'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-center w-full">Architecting Script...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="md:w-6 md:h-6 group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-center w-full">Start Script Generation</span>
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
            <div className="w-24 h-24 border-4 border-rose-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <Video size={32} className="absolute inset-0 m-auto text-rose-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Building Storyboard...</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Gemini 3.1 Pro is crafting your dialogue</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-lg shadow-rose-500/5' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
  >
    <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
  </button>
);
