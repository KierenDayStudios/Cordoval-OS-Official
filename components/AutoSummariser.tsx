
import React, { useState } from 'react';
import { ArrowLeft, FileText, Send, Copy, Check, RefreshCw, List, Target, Zap, FileUp, X } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type } from '@google/genai';

interface AutoSummariserProps {
  onBack: () => void;
}

interface SummaryResult {
  bullets: string[];
  decisions: string[];
  actions: string[];
}

export const AutoSummariser: React.FC<AutoSummariserProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following content and provide a summary.
        Content: "${inputText}"
        
        Requirements:
        1. Provide exactly 5 key bullet points.
        2. Identify key decisions made (if any).
        3. List specific action points (if any).
        
        Return the result in JSON format with the following structure:
        {
          "bullets": ["string"],
          "decisions": ["string"],
          "actions": ["string"]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
              actions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["bullets", "decisions", "actions"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error('Summarization failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    setInputText(text);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `SUMMARY:\n${result.bullets.map(b => `• ${b}`).join('\n')}\n\nDECISIONS:\n${result.decisions.map(d => `• ${d}`).join('\n')}\n\nACTION POINTS:\n${result.actions.map(a => `• ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans">
      <header className="h-16 px-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-indigo-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter">Auto Summariser</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Synthesis & Extraction</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Input Section */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Content</h3>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors">
                  <FileUp size={12} />
                  Upload File
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md,.csv" />
                </label>
                {inputText && (
                  <button onClick={() => setInputText('')} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <textarea
              placeholder="Paste long emails, articles, or meeting transcripts here..."
              className="flex-1 min-h-[500px] bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-sm font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-800"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <button
              onClick={handleSummarize}
              disabled={isGenerating || !inputText.trim()}
              className="h-16 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-20"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Zap size={18} />}
              {isGenerating ? 'Synthesizing...' : 'Generate Summary'}
            </button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence Report</h3>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Report'}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[500px] bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="text-indigo-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Processing Neural Layers</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-12">
                  <List size={64} className="mb-6 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest italic">Input content to generate a structured summary</p>
                </div>
              )}

              {result && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Bullets */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      <List size={14} /> Key Takeaways
                    </div>
                    <ul className="space-y-3">
                      {result.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-4 text-sm font-medium text-slate-200 leading-relaxed">
                          <span className="text-indigo-500 font-black">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Decisions */}
                  {result.decisions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <Target size={14} /> Key Decisions
                      </div>
                      <ul className="space-y-3">
                        {result.decisions.map((decision, i) => (
                          <li key={i} className="flex gap-4 text-sm font-medium text-slate-200 leading-relaxed">
                            <span className="text-emerald-500 font-black">✓</span>
                            {decision}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {result.actions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        <Zap size={14} /> Action Points
                      </div>
                      <ul className="space-y-3">
                        {result.actions.map((action, i) => (
                          <li key={i} className="flex gap-4 text-sm font-medium text-slate-200 leading-relaxed">
                            <span className="text-amber-500 font-black">!</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
