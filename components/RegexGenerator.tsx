
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Code, Zap, MessageSquare, Shield, Wand2, Search, Terminal } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface RegexGeneratorProps {
  onBack: () => void;
}

export const RegexGenerator: React.FC<RegexGeneratorProps> = ({ onBack }) => {
  const [description, setDescription] = useState('');
  const [regex, setRegex] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a regular expression (regex) based on the following description: "${description}".
        
        Requirements:
        1. Provide the regex pattern.
        2. Provide a brief explanation of how it works.
        3. Provide a few test examples.
        4. Return ONLY the regex and explanation in a clean format.`,
      });

      setRegex(response.text || 'Failed to generate regex.');
    } catch (err) {
      console.error(err);
      setRegex('Error: Neural link failed to process request.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(regex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/5 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/20 text-amber-400 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
              <Search size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-black text-white uppercase tracking-widest leading-none truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">Regex Generator</h2>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 truncate">Pattern Synthesis Engine</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-8">
          <div className="bg-white/5 rounded-3xl md:rounded-[2.5rem] border border-white/10 p-6 md:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity hidden md:block">
              <Terminal size={160} />
            </div>
            
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 md:mb-6">Requirement Description</h3>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Match UK phone numbers..."
                className="flex-1 h-12 md:h-16 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 text-slate-200 outline-none focus:border-amber-500/50 transition-all text-xs md:text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="h-12 md:h-16 px-6 md:px-10 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-amber-500/20 transition-all active:scale-95 w-full md:w-auto"
              >
                {isGenerating ? <RefreshCw size={14} className="md:w-4 md:h-4 animate-spin" /> : <Zap size={14} className="md:w-4 md:h-4" />}
                {isGenerating ? 'Synthesizing...' : 'Generate Pattern'}
              </button>
            </div>
          </div>

          {regex && (
            <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] border border-white/5 p-6 md:p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Output</h3>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all w-full sm:w-auto"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Result'}
                </button>
              </div>
              
              <div className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium bg-black/20 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 font-mono overflow-x-auto">
                {regex}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
