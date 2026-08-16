import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Users, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIInterviewQuestionGenProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIInterviewQuestionGen: React.FC<AIInterviewQuestionGenProps> = ({ onBack, onNavigate }) => {
  const [role, setRole] = useState('');
  const [companyCulture, setCompanyCulture] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!role || !companyCulture) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const ai = createAIInstance();
      const prompt = `You are a world-class HR expert. The user is hiring for the role of: "${role}". Their company culture is: "${companyCulture}".
Generate 5 behavioral interview questions aimed at testing cultural fit based on these values.
Return the output as a JSON object with a key 'questions' which is an array of 5 objects. 
Each object should have:
- question: (string) The behavioral interview question.
- purpose: (string) A concise explanation of what this question reveals about the candidate.
- ideal_indicator: (string) A short note on what good candidate responses look like.

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
        setResult(parsed.questions || parsed);
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
        
        <header className="flex items-center gap-4 mb-8 md:mb-12">
          <button 
            onClick={onBack}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users size={16} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Interview Gen</h1>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Behavioral questions for cultural fit</p>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Role to hire for</label>
              <input 
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Company Culture & Values</label>
              <textarea 
                value={companyCulture}
                onChange={(e) => setCompanyCulture(e.target.value)}
                placeholder="e.g., We value extreme ownership, rapid iteration, and radical transparency..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-24"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !role || !companyCulture}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? <><Sparkles size={16} className="animate-spin" /> Generating Questions...</> : <><Sparkles size={16} /> Generate Questions</>}
            </button>
          </div>
        </div>

        {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-300 font-medium">{error}</p>
            </div>
        )}

        {result && (
          <div className="space-y-6">
             {result.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative group border border-white/10">
                   <button onClick={() => copyToClipboard(item.question, idx)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                     {copiedIndex === idx ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   </button>
                   <h4 className="text-lg font-black text-white mb-2 pr-8">{item.question}</h4>
                   <p className="text-xs text-slate-400 mb-2"><span className="text-emerald-500">Purpose:</span> {item.purpose}</p>
                   <p className="text-xs text-slate-400"><span className="text-emerald-500">Ideal Indicator:</span> {item.ideal_indicator}</p>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
