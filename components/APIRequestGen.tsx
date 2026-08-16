
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Code, Zap, MessageSquare, Shield, Wand2, Globe, Terminal } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface APIRequestGenProps {
  onBack: () => void;
}

export const APIRequestGen: React.FC<APIRequestGenProps> = ({ onBack }) => {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!endpoint.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate API request examples for the following:
        Endpoint: ${endpoint}
        Method: ${method}
        Headers: ${headers}
        Body Description: ${body}
        
        Requirements:
        1. Provide a cURL command.
        2. Provide a JavaScript fetch example.
        3. Provide a Python requests example.
        4. Return ONLY the code examples in a clean format.`,
      });

      setOutput(response.text || 'Failed to generate examples.');
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
      <header className="h-20 px-8 flex items-center justify-between bg-white/5 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">API Request Generator</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Network Protocol Synthesis</p>
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
                <Terminal size={160} />
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4">
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-slate-200 outline-none focus:border-indigo-500/50 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  <input 
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1/resource"
                    className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-slate-200 outline-none focus:border-indigo-500/50 transition-all text-sm"
                  />
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Headers (JSON or Text)</h4>
                  <textarea 
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder="Authorization: Bearer key..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 font-mono text-xs outline-none resize-none"
                  />
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Body Description / JSON</h4>
                  <textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe the payload or paste JSON..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 font-mono text-xs outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !endpoint.trim()}
                  className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                  {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                  {isGenerating ? 'Synthesizing...' : 'Generate Requests'}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Globe size={160} />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Output</h3>
                {output && (
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide relative z-10">
                {output ? (
                  <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-black/20 p-6 rounded-2xl border border-white/5">
                    {output}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Sparkles size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Configuration</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
