
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Type, Zap, MessageSquare, Shield, Wand2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface SmartTextRewriterProps {
  onBack: () => void;
}

type RewriteMode = 'shorter' | 'professional' | 'persuasive' | 'simpler' | 'confident';

export const SmartTextRewriter: React.FC<SmartTextRewriterProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<RewriteMode>('professional');

  const handleRewrite = async (mode: RewriteMode) => {
    if (!inputText.trim()) return;
    setActiveMode(mode);
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite the following text to be ${mode}. 
        Text: "${inputText}"
        
        Return ONLY the rewritten text. No explanations.`,
      });

      setOutputText(response.text || '');
    } catch (err) {
      console.error('Rewrite failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { id: RewriteMode; label: string; icon: any }[] = [
    { id: 'shorter', label: 'Shorter', icon: Zap },
    { id: 'professional', label: 'Professional', icon: Shield },
    { id: 'persuasive', label: 'Persuasive', icon: Sparkles },
    { id: 'simpler', label: 'Simpler', icon: Type },
    { id: 'confident', label: 'Confident', icon: Wand2 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans">
      <header className="h-14 md:h-16 px-4 md:px-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <MessageSquare size={12} className="md:w-3.5 md:h-3.5 text-indigo-400" />
              <span className="text-xs md:text-sm font-black text-white italic uppercase tracking-tighter truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">Smart Text Rewriter</span>
            </div>
            <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest truncate">Neural Tone Synthesis</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 h-full">
          {/* Input Section */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Text</h3>
              <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase">{inputText.length} Characters</span>
            </div>
            <textarea
              placeholder="Paste your text here..."
              className="flex-1 min-h-[250px] md:min-h-[400px] bg-white/5 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 text-sm md:text-lg font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-800"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleRewrite(mode.id)}
                  disabled={isGenerating || !inputText.trim()}
                  className={`flex flex-col items-center justify-center gap-1 md:gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all active:scale-95 disabled:opacity-20 ${
                    activeMode === mode.id && outputText 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <mode.icon size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest truncate w-full text-center">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4 md:gap-6 relative">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Output</h3>
              {outputText && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[250px] md:min-h-[400px] bg-slate-900/50 border border-white/5 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw className="text-indigo-500 animate-spin md:w-8 md:h-8" size={24} />
                </div>
              )}
              
              {!outputText && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-8 md:p-12">
                  <Sparkles size={32} className="md:w-12 md:h-12 mb-4 md:mb-6 opacity-20" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Select a mode to synthesize output</p>
                </div>
              )}

              {outputText && (
                <div className="text-sm md:text-lg font-medium text-slate-200 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                  {outputText}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl md:rounded-3xl">
              <p className="text-[9px] md:text-[10px] text-indigo-300/60 font-medium leading-relaxed italic">
                The neural engine analyzes context, intent, and linguistic patterns to reconstruct your message while preserving core semantics.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
