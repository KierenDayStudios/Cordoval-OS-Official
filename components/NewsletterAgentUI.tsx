
import React, { useState, useRef } from 'react';
import { 
  Mail, Sparkles, FileText, ChevronRight, 
  Loader2, Type, AlignLeft, Clock, ShieldCheck,
  Paperclip, X, CheckCircle2, Search, Link as LinkIcon,
  MessageSquare, Zap
} from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { storage } from '../storage';
import { Document } from '../types';

interface NewsletterAgentUIProps {
  onGenerated: (docId: string) => void;
}

export const NewsletterAgentUI: React.FC<NewsletterAgentUIProps> = ({ onGenerated }) => {
  const [subject, setSubject] = useState('');
  const [updates, setUpdates] = useState('');
  const [tone, setTone] = useState('Casual/Friendly');
  const [sections, setSections] = useState<string[]>(['Intro only']);
  const [cta, setCta] = useState('');
  const [length, setLength] = useState('Short Update');
  const [mentionBrands, setMentionBrands] = useState(false);
  const [useAIResearch, setUseAIResearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFiles, setSourceFiles] = useState<{ name: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSourceFiles(prev => [...prev, {
            name: file.name,
            content: event.target?.result as string
          }]);
        };
        reader.readAsText(file);
      });
    }
  };

  const toggleSection = (section: string) => {
    setSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const handleStart = async () => {
    if (!subject.trim()) return;
    setIsLoading(true);

    try {
      const ai = createAIInstance();
      const prompt = `Draft a professional newsletter with the following requirements:
Subject/Theme: ${subject}
Internal Updates/Topics: ${updates || 'None provided'}
Tone: ${tone}
Sections to Include: ${sections.join(', ')}
Call to Action: ${cta || 'None provided'}
Length: ${length}
Mention External Brands/Competitors: ${mentionBrands ? 'Yes' : 'No'}
${useAIResearch ? 'Use AI Research: Yes (Please perform Google Search to find relevant, up-to-date information for this topic)' : ''}
${sourceFiles.length > 0 ? `Source Material (from ${sourceFiles.length} files):\n${sourceFiles.map(f => `--- File: ${f.name} ---\n${f.content}`).join('\n\n')}` : ''}

Please provide the newsletter in Markdown format. 
Include 3-5 Subject Line options at the very top.
Use clear headings for each section.
Ensure the Call to Action is prominent.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are 'The Newsletter Ninja', an expert email marketer and copywriter. Your goal is to create high-converting, engaging newsletters. Use Markdown for formatting. Always provide multiple subject line options at the top." + (useAIResearch ? " Use the provided Google Search tool to research the topic and ensure the content is accurate and up-to-date." : ""),
          tools: useAIResearch ? [{ googleSearch: {} }] : undefined
        }
      });

      const content = response.text || "Failed to generate newsletter content.";

      // Save to Document Tool
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Newsletter: ${subject}`,
        content: content,
        updatedAt: Date.now(),
        tags: ['newsletter', 'ai-generated'],
        folderId: null,
        history: []
      };

      await storage.save('docs', {
        id: newDoc.id,
        name: newDoc.name,
        type: 'docs',
        data: newDoc,
        updatedAt: newDoc.updatedAt
      });

      onGenerated(newDoc.id);
    } catch (error) {
      console.error("Newsletter Ninja Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-[#020617] overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-3xl space-y-6 md:space-y-10 py-6 md:py-12">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Mail size={32} className="md:w-10 md:h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">The Newsletter Ninja</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">High-Conversion Email Synthesis</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Main Inputs */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Subject / Theme</label>
              <input 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="What is this newsletter about?"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-3xl px-6 py-4 md:px-8 md:py-6 text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/50 transition-all font-bold text-base md:text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Internal Updates & Topics (Optional)</label>
              <textarea 
                value={updates}
                onChange={e => setUpdates(e.target.value)}
                placeholder="List any specific updates from your business or thoughts you want to include..."
                className="w-full h-24 md:h-32 bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-3xl px-6 py-4 md:px-8 md:py-6 text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/50 transition-all font-medium text-xs md:text-sm resize-none"
              />
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tone</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
              >
                <option>Casual/Friendly</option>
                <option>Data-Driven/Expert</option>
                <option>Short & Punchy</option>
                <option>Professional</option>
                <option>Witty</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Edition Type</label>
              <select 
                value={length}
                onChange={e => setLength(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
              >
                <option>Short Update</option>
                <option>Full Sunday Edition</option>
                <option>Monthly Digest</option>
                <option>Special Announcement</option>
              </select>
            </div>
          </div>

          {/* Sections Selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Newsletter Sections</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Intro only', 'Curated Links', 'Deep Dive', 'Tip of the Week'].map(section => (
                <button 
                  key={section}
                  onClick={() => toggleSection(section)}
                  className={`p-3 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-widest ${sections.includes(section) ? 'border-emerald-600 bg-emerald-600/10 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Call to Action (Link/Destination)</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder="e.g., https://yourstore.com/new-product"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-14 pr-8 py-4 text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/50 transition-all font-bold text-sm"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setMentionBrands(!mentionBrands)}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${mentionBrands ? 'border-emerald-600 bg-emerald-600/10 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">External Brand Mentions</span>
              {mentionBrands ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
            </button>

            <button 
              onClick={() => setUseAIResearch(!useAIResearch)}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${useAIResearch ? 'border-emerald-600 bg-emerald-600/10 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">AI Research</span>
              {useAIResearch ? <CheckCircle2 size={16} /> : <Search size={16} />}
            </button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Source Material / Transcripts</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-8 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${sourceFiles.length > 0 ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple
                accept=".txt,.md,.doc,.docx" 
                className="hidden" 
              />
              {sourceFiles.length > 0 ? (
                <>
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{sourceFiles.length} files attached</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSourceFiles([]); }}
                      className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 hover:text-rose-400"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {sourceFiles.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded text-[8px] text-slate-400 truncate max-w-[100px]">{f.name}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Paperclip size={32} className="text-slate-700" />
                  <div className="text-center">
                    <p className="text-slate-400 font-bold text-sm">Upload files or voice transcripts</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Multi-file support active</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Start Button */}
          <button 
            onClick={handleStart}
            disabled={isLoading || !subject.trim()}
            className="w-full h-20 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-emerald-600 flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Synthesizing Newsletter...
              </>
            ) : (
              <>
                <Zap size={24} />
                Initialize Generation
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
