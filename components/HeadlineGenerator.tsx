
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Type, Zap, Layout, Megaphone } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type as SchemaType } from '@google/genai';

interface HeadlineGeneratorProps {
  onBack: () => void;
}

interface HeadlineResult {
  headlines: string[];
  seoOptimized: string;
  clickWorthy: string;
}

export const HeadlineGenerator: React.FC<HeadlineGeneratorProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<HeadlineResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate high-impact headlines for the following topic or content: "${input}"
        
        Requirements:
        1. Provide 10 strong, varied headline options.
        2. Provide one specifically SEO-optimized version.
        3. Provide one click-worthy but professional version.
        
        Return the result in JSON format with the following structure:
        {
          "headlines": ["string"],
          "seoOptimized": "string",
          "clickWorthy": "string"
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              headlines: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              seoOptimized: { type: SchemaType.STRING },
              clickWorthy: { type: SchemaType.STRING }
            },
            required: ["headlines", "seoOptimized", "clickWorthy"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error('Headline generation failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
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
              <Megaphone size={14} className="text-indigo-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter">Headline Generator</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Attention Synthesis</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic or Context</h3>
            </div>
            <textarea
              placeholder="Enter your article topic, a paragraph, or a brief description of your content..."
              className="flex-1 min-h-[300px] bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-lg font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="h-16 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-20"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Zap size={18} />}
              {isGenerating ? 'Synthesizing Hooks...' : 'Generate Headlines'}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Hooks</h3>
            </div>

            <div className="flex-1 min-h-[500px] bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col gap-8">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="text-indigo-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Analyzing Attention Patterns</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-12">
                  <Layout size={64} className="mb-6 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest italic">Input context to generate high-impact headlines</p>
                </div>
              )}

              {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Featured Headlines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl group relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">SEO Optimized</span>
                        <button onClick={() => copyToClipboard(result.seoOptimized, 'seo')} className="text-indigo-400 hover:text-white transition-colors">
                          {copied === 'seo' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white leading-tight">{result.seoOptimized}</p>
                    </div>
                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Click-Worthy</span>
                        <button onClick={() => copyToClipboard(result.clickWorthy, 'click')} className="text-emerald-400 hover:text-white transition-colors">
                          {copied === 'click' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white leading-tight">{result.clickWorthy}</p>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">Alternative Variations</span>
                    <div className="space-y-2">
                      {result.headlines.map((headline, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
                          <p className="text-sm font-medium text-slate-300 pr-4">{headline}</p>
                          <button 
                            onClick={() => copyToClipboard(headline, `h-${i}`)}
                            className="shrink-0 text-slate-600 group-hover:text-white transition-colors"
                          >
                            {copied === `h-${i}` ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
