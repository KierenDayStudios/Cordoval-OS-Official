
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Code, Zap, MessageSquare, Shield, Wand2, Scale, FileText } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface LegalDraftGenProps {
  onBack: () => void;
}

export const LegalDraftGen: React.FC<LegalDraftGenProps> = ({ onBack }) => {
  const [businessType, setBusinessType] = useState('');
  const [country, setCountry] = useState('');
  const [websiteType, setWebsiteType] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!businessType.trim() || !country.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a basic Privacy Policy and Terms of Service draft for the following:
        Business Type: ${businessType}
        Country: ${country}
        Website Type: ${websiteType}
        
        Requirements:
        1. Provide a standard Privacy Policy draft.
        2. Provide a standard Terms of Service draft.
        3. Include placeholders for specific company details (e.g. [COMPANY NAME]).
        4. Add a disclaimer that this is a draft and not legal advice.
        5. Return ONLY the drafts in a clean format.`,
      });

      setOutput(response.text || 'Failed to generate drafts.');
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
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/5 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 text-emerald-400 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
              <Scale size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-black text-white uppercase tracking-widest leading-none truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">Terms & Privacy Generator</h2>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 truncate">Legal Document Synthesis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 h-full">
          {/* Input Panel */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex-1 bg-white/5 rounded-3xl md:rounded-[2.5rem] border border-white/10 p-6 md:p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity hidden md:block">
                <FileText size={160} />
              </div>
              
              <div className="space-y-4 md:space-y-6 relative z-10">
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Business Type</h4>
                  <input 
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. SaaS, E-commerce, Agency..."
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 text-slate-200 outline-none focus:border-emerald-500/50 transition-all text-xs md:text-sm"
                  />
                </div>

                <div>
                  <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Country / Jurisdiction</h4>
                  <input 
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United Kingdom, USA..."
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 text-slate-200 outline-none focus:border-emerald-500/50 transition-all text-xs md:text-sm"
                  />
                </div>

                <div>
                  <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Website / App Type</h4>
                  <input 
                    type="text"
                    value={websiteType}
                    onChange={(e) => setWebsiteType(e.target.value)}
                    placeholder="e.g. Portfolio, Mobile App..."
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 text-slate-200 outline-none focus:border-emerald-500/50 transition-all text-xs md:text-sm"
                  />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !businessType.trim() || !country.trim()}
                  className="w-full h-12 md:h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 mt-2 md:mt-0"
                >
                  {isGenerating ? <RefreshCw size={14} className="md:w-4 md:h-4 animate-spin" /> : <Zap size={14} className="md:w-4 md:h-4" />}
                  {isGenerating ? 'Synthesizing...' : 'Generate Drafts'}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex-1 bg-slate-900 rounded-3xl md:rounded-[2.5rem] border border-white/5 p-6 md:p-8 flex flex-col relative overflow-hidden group min-h-[300px] md:min-h-0">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity hidden md:block">
                <Scale size={160} />
              </div>

              <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
                <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Drafts</h3>
                {output && (
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={14} className="md:w-4 md:h-4 text-emerald-500" /> : <Copy size={14} className="md:w-4 md:h-4" />}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 md:pr-4 scrollbar-hide relative z-10">
                {output ? (
                  <div className="text-slate-300 text-[10px] md:text-xs leading-relaxed whitespace-pre-wrap font-medium bg-black/20 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                    {output}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-8 md:py-0">
                    <Sparkles size={32} className="md:w-12 md:h-12 mb-3 md:mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Awaiting Configuration</p>
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-2 md:gap-3 relative z-10">
                <Shield size={12} className="md:w-[14px] md:h-[14px] text-emerald-500 shrink-0" />
                <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  Drafts generated. Review by legal counsel recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
