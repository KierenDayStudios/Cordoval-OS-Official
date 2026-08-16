
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Code, Zap, MessageSquare, Shield, Wand2, BookOpen } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface CodeExplainerProps {
  onBack: () => void;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({ onBack }) => {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [level, setLevel] = useState<'beginner' | 'technical'>('beginner');

  const handleExplain = async () => {
    if (!code.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain the following code in plain English for a ${level} audience.
        Code:
        \`\`\`
        ${code}
        \`\`\`
        
        Requirements:
        1. Break down what the code does step-by-step.
        2. Use analogies if it's a beginner explanation.
        3. Mention specific libraries or patterns if it's a technical explanation.
        4. Keep it concise but thorough.`,
      });

      setExplanation(response.text || 'Failed to generate explanation.');
    } catch (err) {
      console.error(err);
      setExplanation('Error: Neural link failed to process code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(explanation);
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
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Code Explainer</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Neural Logic Translation</p>
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
                <Code size={160} />
              </div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Source Code</h3>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setLevel('beginner')}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${level === 'beginner' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Beginner
                  </button>
                  <button 
                    onClick={() => setLevel('technical')}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${level === 'technical' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Technical
                  </button>
                </div>
              </div>

              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="flex-1 bg-transparent text-slate-300 font-mono text-sm outline-none resize-none placeholder:text-slate-700 relative z-10"
              />

              <button 
                onClick={handleExplain}
                disabled={isGenerating || !code.trim()}
                className="mt-6 h-14 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 relative z-10"
              >
                {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                {isGenerating ? 'Synthesizing...' : 'Explain Logic'}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Sparkles size={160} />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Explanation</h3>
                {explanation && (
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide relative z-10">
                {explanation ? (
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {explanation}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Wand2 size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Code Input</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 relative z-10">
                <Shield size={14} className="text-indigo-500" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  Neural synthesis is optimized for {level} comprehension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
