
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Type, Zap, AlertCircle, BarChart3, Wand2, ShieldCheck } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type as SchemaType } from '@google/genai';

interface GrammarFixerProps {
  onBack: () => void;
}

interface GrammarResult {
  correctedText: string;
  readabilityScore: number;
  flags: { type: string; description: string }[];
}

export const GrammarFixer: React.FC<GrammarFixerProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFix = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following text for grammar, clarity, and readability.
        Text: "${inputText}"
        
        Requirements:
        1. Correct all grammar and spelling errors.
        2. Tighten sentences and remove waffle/unnecessary words.
        3. Provide a readability score from 0-100.
        4. Flag weak phrasing or areas for improvement.
        
        Return the result in JSON format with the following structure:
        {
          "correctedText": "string",
          "readabilityScore": number,
          "flags": [{"type": "string", "description": "string"}]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              correctedText: { type: SchemaType.STRING },
              readabilityScore: { type: SchemaType.NUMBER },
              flags: { 
                type: SchemaType.ARRAY, 
                items: { 
                  type: SchemaType.OBJECT,
                  properties: {
                    type: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING }
                  },
                  required: ["type", "description"]
                } 
              }
            },
            required: ["correctedText", "readabilityScore", "flags"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error('Grammar fix failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedText);
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
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter">Grammar & Clarity Fixer</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Linguistic Refinement</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Draft Content</h3>
              <span className="text-[10px] font-black text-slate-700 uppercase">{inputText.split(/\s+/).filter(Boolean).length} Words</span>
            </div>
            <textarea
              placeholder="Paste your draft here. We'll remove the waffle and sharpen the logic..."
              className="flex-1 min-h-[400px] bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-lg font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-800"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <button
              onClick={handleFix}
              disabled={isGenerating || !inputText.trim()}
              className="h-16 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-20"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 size={18} />}
              {isGenerating ? 'Refining Syntax...' : 'Fix Grammar & Clarity'}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Refined Output</h3>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Corrected Text'}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[400px] bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col gap-8">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="text-indigo-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Analyzing Linguistic Patterns</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-12">
                  <Type size={64} className="mb-6 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest italic">Input text to analyze and refine</p>
                </div>
              )}

              {result && (
                <>
                  <div className="text-lg font-medium text-slate-200 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                    {result.correctedText}
                  </div>

                  <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Readability</span>
                        <BarChart3 size={14} className="text-indigo-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{result.readabilityScore}</span>
                        <span className="text-[10px] font-black text-slate-600 uppercase">/ 100</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Flags</span>
                        <AlertCircle size={14} className="text-amber-500" />
                      </div>
                      <div className="space-y-2">
                        {result.flags.slice(0, 2).map((flag, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{flag.type}</span>
                          </div>
                        ))}
                        {result.flags.length === 0 && <span className="text-[9px] font-bold text-emerald-500 uppercase">No issues detected</span>}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
