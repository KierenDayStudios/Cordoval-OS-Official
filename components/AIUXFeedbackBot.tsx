import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Eye, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIUXFeedbackBotProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIUXFeedbackBot: React.FC<AIUXFeedbackBotProps> = ({ onBack, onNavigate }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description) return;
    
    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const ai = createAIInstance();
      const prompt = `Act as a senior UI/UX auditor. The user describes their app interface as: "${description}".
      Analyze this description for potential UX friction points, confusion, or accessibility issues.
      Provide a critique and suggestions for improvement.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      setResult(response.text || '');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">UX Feedback Bot</h1>
        </header>

        <div className="bg-white/5 p-6 rounded-2xl mb-8">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white h-32" placeholder="Describe your UI/UX layout and components..." />
          <button onClick={handleGenerate} className="w-full mt-4 py-4 bg-purple-600 rounded-xl text-xs font-black uppercase text-white">Audit Interface</button>
        </div>

        {result && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
