
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Code, Zap, MessageSquare, Shield, Wand2, Trash2, Layout } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface CodeRefactorerProps {
  onBack: () => void;
}

export const CodeRefactorer: React.FC<CodeRefactorerProps> = ({ onBack }) => {
  const [code, setCode] = useState('');
  const [refactoredCode, setRefactoredCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefactor = async () => {
    if (!code.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Refactor the following code for better structure, variable naming, and redundancy removal.
        Code:
        \`\`\`
        ${code}
        \`\`\`
        
        Requirements:
        1. Improve structure and readability.
        2. Use better, more descriptive variable names.
        3. Remove any redundant logic.
        4. Maintain exactly the same functionality.
        5. Return ONLY the refactored code without any explanations or markdown blocks.`,
      });

      setRefactoredCode(response.text?.replace(/\`\`\`[a-z]*\n|\`\`\`/g, '').trim() || 'Failed to refactor code.');
    } catch (err) {
      console.error(err);
      setRefactoredCode('Error: Neural link failed to process code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refactoredCode);
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
              <RefreshCw size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Refactor Cleaner</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Logic Optimization Engine</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Panel */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-white/5 rounded-[2.5rem] border border-white/10 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Trash2 size={160} />
              </div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Messy Source</h3>
              </div>

              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your messy code here..."
                className="flex-1 bg-transparent text-slate-300 font-mono text-sm outline-none resize-none placeholder:text-slate-700 relative z-10"
              />

              <button 
                onClick={handleRefactor}
                disabled={isGenerating || !code.trim()}
                className="mt-6 h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 relative z-10"
              >
                {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                {isGenerating ? 'Optimizing...' : 'Clean Code'}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Layout size={160} />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Optimized Output</h3>
                {refactoredCode && (
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide relative z-10">
                {refactoredCode ? (
                  <pre className="text-emerald-400 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {refactoredCode}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Sparkles size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Input</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 relative z-10">
                <Shield size={14} className="text-emerald-500" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  Functionality preserved. Redundancy eliminated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
