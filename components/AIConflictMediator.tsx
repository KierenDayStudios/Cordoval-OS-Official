import React, { useState } from 'react';
import { ArrowLeft, SplitSquareHorizontal, Copy, Check, RefreshCw, Handshake, Scale, MessageSquare } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type } from '@google/genai';

interface AIConflictMediatorProps {
  onBack: () => void;
}

interface MediationResult {
  commonGround: string[];
  perspectiveA: string;
  perspectiveB: string;
  proposedResolution: string;
  nextSteps: string[];
}

export const AIConflictMediator: React.FC<AIConflictMediatorProps> = ({ onBack }) => {
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [result, setResult] = useState<MediationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMediate = async () => {
    if (!sideA.trim() || !sideB.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a professional workplace mediator.
        Analyze the conflict between two perspectives:
        Side A/Party 1: "${sideA}"
        Side B/Party 2: "${sideB}"
        
        Tasks:
        1. Empathize and summarize Perspective A neutrally in one sentence.
        2. Empathize and summarize Perspective B neutrally in one sentence.
        3. Identify 2-3 areas of Common Ground between both parties.
        4. Draft a "Middle Ground" proposed resolution that addresses core needs of both sides.
        5. Suggest 2 immediate, actionable Next Steps.
        
        Return the result in JSON format with the following structure:
        {
          "perspectiveA": "string",
          "perspectiveB": "string",
          "commonGround": ["string"],
          "proposedResolution": "string",
          "nextSteps": ["string"]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              perspectiveA: { type: Type.STRING },
              perspectiveB: { type: Type.STRING },
              commonGround: { type: Type.ARRAY, items: { type: Type.STRING } },
              proposedResolution: { type: Type.STRING },
              nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["perspectiveA", "perspectiveB", "commonGround", "proposedResolution", "nextSteps"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error('Mediation failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `MEDIATION RESOLUTION\n\nCOMMON GROUND:\n${result.commonGround.map(b => `• ${b}`).join('\n')}\n\nPROPOSED RESOLUTION:\n${result.proposedResolution}\n\nNEXT STEPS:\n${result.nextSteps.map(a => `• ${a}`).join('\n')}`;
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
              <Scale size={14} className="text-cyan-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter truncate">Conflict Mediator</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden md:block">Neutral Dispute Resolution</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full">
          {/* Input Section */}
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Perspectives</h3>
            </div>
            
            <div className="flex flex-col gap-4">
               <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl md:rounded-[2rem] p-4 md:p-6 focus-within:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                     <MessageSquare size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Side A / Party 1</span>
                  </div>
                  <textarea
                    placeholder="Describe the problem from the first perspective..."
                    className="w-full min-h-[140px] md:min-h-[180px] bg-transparent text-sm font-medium text-white outline-none resize-none placeholder:text-slate-700"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                  />
               </div>

               <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl md:rounded-[2rem] p-4 md:p-6 focus-within:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-amber-400">
                     <MessageSquare size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Side B / Party 2</span>
                  </div>
                  <textarea
                    placeholder="Describe the counter-argument or second perspective..."
                    className="w-full min-h-[140px] md:min-h-[180px] bg-transparent text-sm font-medium text-white outline-none resize-none placeholder:text-slate-700"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                  />
               </div>
            </div>
            
            <button
              onClick={handleMediate}
              disabled={isGenerating || !sideA.trim() || !sideB.trim()}
              className="h-14 md:h-16 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-cyan-500 hover:text-white transition-all active:scale-95 disabled:opacity-20 shrink-0"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <SplitSquareHorizontal size={18} />}
              {isGenerating ? 'Mediating...' : 'Find Middle Ground'}
            </button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2 mt-4 lg:mt-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution Proposal</h3>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Proposal'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[400px] md:min-h-[500px] bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="text-cyan-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Drafting Compromise...</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-8 md:p-12">
                  <Handshake size={48} className="md:w-16 md:h-16 mb-6 opacity-20" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest italic max-w-sm">Enter two opposing viewpoints to generate an unbiased, constructive resolution plan.</p>
                </div>
              )}

              {result && (
                <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                  
                  {/* Validated Perspectives */}
                  <div className="flex flex-col gap-3">
                     <h4 className="text-[9px] font-black tracking-widest uppercase text-slate-500">Acknowledged Positions</h4>
                     <div className="p-4 bg-blue-500/10 border-l-2 border-blue-500 rounded-r-xl">
                        <p className="text-sm font-medium text-blue-100">{result.perspectiveA}</p>
                     </div>
                     <div className="p-4 bg-amber-500/10 border-l-2 border-amber-500 rounded-r-xl">
                        <p className="text-sm font-medium text-amber-100">{result.perspectiveB}</p>
                     </div>
                  </div>

                  {/* Common Ground */}
                  <div className="space-y-4">
                    <div className="flex flex-col">
                       <h4 className="text-[9px] font-black tracking-widest uppercase text-slate-500 mb-1">Step 1</h4>
                       <div className="flex items-center gap-2 text-sm font-black text-emerald-400 italic">
                         <Handshake size={16} /> Shared Interests Identified
                       </div>
                    </div>
                    <ul className="space-y-2 pl-2">
                       {result.commonGround.map((item, i) => (
                         <li key={i} className="flex gap-3 text-sm font-medium text-emerald-100/80 leading-relaxed">
                           <span className="text-emerald-500 font-black">✓</span>
                           {item}
                         </li>
                       ))}
                    </ul>
                  </div>

                  {/* The Proposal */}
                  <div className="space-y-4">
                     <div className="flex flex-col">
                         <h4 className="text-[9px] font-black tracking-widest uppercase text-slate-500 mb-1">Step 2</h4>
                         <div className="flex items-center gap-2 text-xl font-black text-white uppercase tracking-tighter">
                           The Middle Ground
                         </div>
                     </div>
                     <div className="p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                        <p className="text-base font-bold text-cyan-100 leading-relaxed">{result.proposedResolution}</p>
                     </div>
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-4">
                    <div className="flex flex-col">
                       <h4 className="text-[9px] font-black tracking-widest uppercase text-slate-500 mb-1">Step 3</h4>
                       <div className="flex items-center gap-2 text-sm font-black text-white italic">
                         Next Actions
                       </div>
                    </div>
                    <ul className="space-y-3 pl-2">
                       {result.nextSteps.map((item, i) => (
                         <li key={i} className="flex gap-4 text-sm font-bold text-slate-200">
                           <span className="w-5 h-5 rounded-md bg-white/10 text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                           {item}
                         </li>
                       ))}
                    </ul>
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
