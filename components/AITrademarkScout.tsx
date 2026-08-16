import React, { useState } from 'react';
import { ArrowLeft, Search, Copy, Check, RefreshCw, AlertTriangle, ShieldCheck, Tag, Target } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type } from '@google/genai';

interface AITrademarkScoutProps {
  onBack: () => void;
}

interface TrademarkResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  potentialConflicts: { name: string; domain: string; similarity: string }[];
  suggestions: string[];
  analysis: string;
}

export const AITrademarkScout: React.FC<AITrademarkScoutProps> = ({ onBack }) => {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState<TrademarkResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleScout = async () => {
    if (!brandName.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a trademark analysis scout.
        Evaluate the potential brand name: "${brandName}"
        Operating in the industry/niche: "${industry || 'General'}"
        
        Tasks:
        1. Rate the trademark risk level (LOW, MEDIUM, HIGH) based on likelihood of confusion or existing massive brands.
        2. Provide an analysis summary detailing the strength of the mark (descriptive, suggestive, arbitrary, etc.).
        3. List up to 3 potential conflicting known names/brands in similar or overlapping spaces.
        4. Suggest 3 alternative brand name variations that might be safer or stronger.
        
        Return the result in JSON format with the following structure:
        {
          "riskLevel": "LOW" | "MEDIUM" | "HIGH",
          "analysis": "string",
          "potentialConflicts": [
            { "name": "string", "domain": "string", "similarity": "string" }
          ],
          "suggestions": ["string"]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING },
              analysis: { type: Type.STRING },
              potentialConflicts: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: {
                    name: { type: Type.STRING },
                    domain: { type: Type.STRING },
                    similarity: { type: Type.STRING }
                  }
                } 
              },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["riskLevel", "analysis", "potentialConflicts", "suggestions"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `TRADEMARK SCOUT REPORT: ${brandName.toUpperCase()}\nRISK LEVEL: ${result.riskLevel}\n\nANALYSIS:\n${result.analysis}\n\nPOTENTIAL CONFLICTS:\n${result.potentialConflicts.map(c => `- ${c.name} (${c.domain}): ${c.similarity}`).join('\n')}\n\nSUGGESTED ALTERNATIVES:\n${result.suggestions.map(s => `• ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans">
      <header className="h-16 px-4 md:px-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-emerald-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter truncate">Trademark Scout</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden md:block">Brand Defense & IP Analysis</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full">
          {/* Input Section */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brand Parameters</h3>
            </div>
            
            <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Brand Name Idea</label>
                 <input
                   type="text"
                   placeholder="e.g. Acme Corp"
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                   value={brandName}
                   onChange={(e) => setBrandName(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Industry / Niche / Product (Optional)</label>
                 <input
                   type="text"
                   placeholder="e.g. Software, Cloud Computing"
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                   value={industry}
                   onChange={(e) => setIndustry(e.target.value)}
                 />
               </div>
            </div>
            
            <button
              onClick={handleScout}
              disabled={isGenerating || !brandName.trim()}
              className="h-14 md:h-16 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 disabled:opacity-20 shrink-0"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Search size={18} />}
              {isGenerating ? 'Scouting...' : 'Scout Brand'}
            </button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2 mt-4 lg:mt-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scout Report</h3>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[400px] md:min-h-[500px] bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="text-emerald-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Analyzing Global Registries...</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-8 md:p-12">
                  <Tag size={48} className="md:w-16 md:h-16 mb-6 opacity-20" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest italic max-w-sm">Enter a proposed brand name to check for potential collisions and gauge strength.</p>
                </div>
              )}

              {result && (
                <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className={`p-4 md:p-6 border rounded-2xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4
                    ${result.riskLevel === 'HIGH' ? 'bg-rose-500/10 border-rose-500/30' : 
                      result.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30' : 
                      'bg-emerald-500/10 border-emerald-500/30'}`}
                  >
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Calculated Risk Level</span>
                        <span className={`text-2xl font-black italic tracking-tighter
                           ${result.riskLevel === 'HIGH' ? 'text-rose-500' : 
                             result.riskLevel === 'MEDIUM' ? 'text-amber-500' : 
                             'text-emerald-500'}`}>
                           {result.riskLevel}
                        </span>
                     </div>
                     <p className="text-xs font-medium text-slate-300 max-w-md w-full leading-relaxed">{result.analysis}</p>
                  </div>

                  {result.potentialConflicts.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                        <AlertTriangle size={14} /> Potential Conflicts
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.potentialConflicts.map((conflict, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl">
                            <div className="font-black text-white text-sm mb-1">{conflict.name}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">{conflict.domain}</div>
                            <div className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2">{conflict.similarity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <ShieldCheck size={14} /> Safer Alternatives
                      </div>
                      <ul className="space-y-3 pl-2">
                        {result.suggestions.map((item, i) => (
                          <li key={i} className="flex gap-4 text-sm font-bold text-slate-200">
                            <span className="text-emerald-500 font-black">→</span>
                            {item}
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
