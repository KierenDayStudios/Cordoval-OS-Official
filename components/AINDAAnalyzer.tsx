import React, { useState } from 'react';
import { ArrowLeft, FileText, Send, Copy, Check, RefreshCw, AlertTriangle, ShieldAlert, FileUp, X } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type } from '@google/genai';

interface AINDAAnalyzerProps {
  onBack: () => void;
}

interface AnalysisResult {
  foreverClauses: string[];
  broadDefinitions: string[];
  redFlags: string[];
  summary: string;
}

export const AINDAAnalyzer: React.FC<AINDAAnalyzerProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following Non-Disclosure Agreement (NDA) content.
        Content: "${inputText}"
        
        Tasks:
        1. Identify any "forever" clauses or non-expiring obligations.
        2. Identify excessively broad definitions of "Confidential Information".
        3. List any other major red flags or unusually restrictive clauses.
        4. Provide a brief 2-sentence summary of the overall risk level.
        
        Return the result in JSON format with the following structure:
        {
          "foreverClauses": ["string"],
          "broadDefinitions": ["string"],
          "redFlags": ["string"],
          "summary": "string"
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foreverClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
              broadDefinitions: { type: Type.ARRAY, items: { type: Type.STRING } },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["foreverClauses", "broadDefinitions", "redFlags", "summary"]
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    setInputText(text);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `NDA ANALYSIS\n\nSUMMARY:\n${result.summary}\n\nFOREVER CLAUSES:\n${result.foreverClauses.map(b => `• ${b}`).join('\n')}\n\nBROAD DEFINITIONS:\n${result.broadDefinitions.map(d => `• ${d}`).join('\n')}\n\nRED FLAGS:\n${result.redFlags.map(a => `• ${a}`).join('\n')}`;
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
              <ShieldAlert size={14} className="text-rose-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter truncate">NDA Analyzer</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden md:block">Legal Threat Detection</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full">
          {/* Input Section */}
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Content</h3>
              <div className="flex items-center gap-2 md:gap-4">
                <label className="cursor-pointer flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase hover:text-white transition-colors">
                  <FileUp size={12} />
                  <span className="hidden sm:inline">Upload</span> File
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
              placeholder="Paste your NDA text here to scan for aggressive terms..."
              className="flex-1 min-h-[300px] md:min-h-[500px] bg-white/5 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 text-sm font-medium text-white outline-none focus:border-rose-500/50 transition-all resize-none placeholder:text-slate-800"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <button
              onClick={handleAnalyze}
              disabled={isGenerating || !inputText.trim()}
              className="h-14 md:h-16 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-20 shrink-0"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <ShieldAlert size={18} />}
              {isGenerating ? 'Scanning...' : 'Analyze Risk'}
            </button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between px-2 mt-4 lg:mt-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Threat Report</h3>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[400px] md:min-h-[500px] bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="text-rose-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Running Legal Analysis</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-8 md:p-12">
                  <FileText size={48} className="md:w-16 md:h-16 mb-6 opacity-20" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest italic max-w-sm">Scan an NDA to reveal hidden traps, non-expiring clauses, and excessive restrictions.</p>
                </div>
              )}

              {result && (
                <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="p-4 md:p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <p className="text-sm font-medium text-rose-100">{result.summary}</p>
                  </div>

                  {result.foreverClauses.length > 0 && (
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                        <AlertTriangle size={14} /> "Forever" Clauses detected
                      </div>
                      <ul className="space-y-3">
                        {result.foreverClauses.map((item, i) => (
                          <li key={i} className="flex gap-4 text-xs md:text-sm font-medium text-slate-200 leading-relaxed">
                            <span className="text-rose-500 font-black">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.broadDefinitions.length > 0 && (
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        <AlertTriangle size={14} /> Broad Definitions
                      </div>
                      <ul className="space-y-3">
                        {result.broadDefinitions.map((item, i) => (
                          <li key={i} className="flex gap-4 text-xs md:text-sm font-medium text-slate-200 leading-relaxed">
                            <span className="text-amber-500 font-black">!</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.redFlags.length > 0 && (
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        <ShieldAlert size={14} /> Other Red Flags
                      </div>
                      <ul className="space-y-3">
                        {result.redFlags.map((item, i) => (
                          <li key={i} className="flex gap-4 text-xs md:text-sm font-medium text-slate-200 leading-relaxed">
                            <span className="text-indigo-500 font-black">-</span>
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
