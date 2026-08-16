
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Code, Zap, MessageSquare, Shield, Wand2, GitCommit, Terminal } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface CommitMsgGenProps {
  onBack: () => void;
}

export const CommitMsgGen: React.FC<CommitMsgGenProps> = ({ onBack }) => {
  const [changes, setChanges] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'standard' | 'conventional'>('conventional');

  const handleGenerate = async () => {
    if (!changes.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a clean Git commit message based on the following code changes:
        Changes:
        ${changes}
        
        Requirements:
        1. Use the ${format} commit format.
        2. Provide a concise subject line.
        3. Provide a brief body if necessary.
        4. Return ONLY the commit message.`,
      });

      setOutput(response.text || 'Failed to generate commit message.');
    } catch (err) {
      console.error(err);
      setOutput('Error: Neural link failed to process request.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      <header className="h-20 px-8 flex items-center justify-between bg-white/5 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <GitCommit size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Commit Message Generator</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Version Control Synthesis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <Terminal size={160} />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Code Changes / Diff</h3>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setFormat('standard')}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${format === 'standard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setFormat('conventional')}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${format === 'conventional' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Conventional
                </button>
              </div>
            </div>

            <textarea 
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Paste your code changes or diff here..."
              className="w-full h-48 bg-transparent text-slate-300 font-mono text-sm outline-none resize-none placeholder:text-slate-700 relative z-10 mb-6"
            />

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !changes.trim()}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 relative z-10"
            >
              {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
              {isGenerating ? 'Synthesizing...' : 'Generate Commit Message'}
            </button>
          </div>

          {output && (
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Output</h3>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Message'}
                </button>
              </div>
              
              <div className="text-emerald-400 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-black/20 p-8 rounded-3xl border border-white/5">
                {output}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
