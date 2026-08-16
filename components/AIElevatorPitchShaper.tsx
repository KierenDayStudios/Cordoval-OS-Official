import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, FileText, Upload, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIElevatorPitchShaperProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIElevatorPitchShaper: React.FC<AIElevatorPitchShaperProps> = ({ onBack, onNavigate }) => {
  const [businessPlanText, setBusinessPlanText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setBusinessPlanText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!businessPlanText) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    // take first 15000 chars to avoid token limits for massive pdfs/texts
    const truncatedText = businessPlanText.substring(0, 15000);

    try {
      const ai = createAIInstance();
      const prompt = `You are a startup pitching expert. The user has provided a long business plan or description:
"${truncatedText}"

Distill this down into three distinct 30-second elevator pitches based on who they might be talking to.
Return the output as a JSON object with a key 'pitches' which is an array of 3 objects. 
Each object should have:
- audience: (string) e.g., 'To an Investor', 'To a Potential Customer', 'To a Potential Hire'
- hook: (string) The opening 1-liner that catches attention.
- pitch: (string) The full 3-4 sentence elevator pitch.
- closing_ask: (string) A suggested call-to-action or question to end with.

Return only valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      try {
        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        setResult(parsed.pitches || parsed);
      } catch (parseError) {
         setError("Failed to parse the response. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 md:mb-12">
          <button 
            onClick={onBack}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Elevator Pitch Shaper</h1>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Distill long plans into 30-second hooks</p>
          </div>
        </header>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-8">
          <div className="space-y-6">
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-center">
               <input 
                 type="file" 
                 accept=".txt,.md,.json" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileUpload}
               />
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Upload size={20} className="text-slate-400" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Upload Business Plan</h3>
               <p className="text-xs text-slate-500 max-w-sm mb-4">Current limitation: TXT or MD files. Will read first ~15,000 characters.</p>
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all"
               >
                  Select File
               </button>
               {fileName && (
                  <div className="mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-mono break-all inline-flex items-center gap-2">
                    <CheckCircle2 size={14} /> {fileName} loaded
                  </div>
               )}
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OR PASTE TEXT</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div>
              <textarea 
                value={businessPlanText}
                onChange={(e) => setBusinessPlanText(e.target.value)}
                placeholder="Paste your 50-page business plan summaries, executive summaries, or scattered ideas here..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none h-32"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !businessPlanText}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Sparkles size={16} className="animate-spin text-orange-200" /> Shaping Pitches...</>
              ) : (
                <><Sparkles size={16} /> Distill into 30-Second Hooks</>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300 font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
             <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
               <FileText size={16} className="text-orange-400" /> Executive Pitches
             </h3>
             {result.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-orange-500/10 rounded-2xl p-6 relative group hover:border-orange-500/40 transition-all">
                   <button 
                     onClick={() => copyToClipboard(`${item.audience}\nHook: ${item.hook}\nPitch: ${item.pitch}\nAsk: ${item.closing_ask}`, idx)}
                     className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                   >
                     {copiedIndex === idx ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   </button>
                   
                   <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-4">{item.audience}</h4>
                   
                   <div className="space-y-4">
                      <div>
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">The Hook</span>
                        <p className="text-sm text-white font-bold italic">"{item.hook}"</p>
                      </div>
                      
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">The Pitch (30s)</span>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{item.pitch}</p>
                      </div>

                      <div>
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">The Ask</span>
                        <p className="text-xs text-orange-300">{item.closing_ask}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
};
