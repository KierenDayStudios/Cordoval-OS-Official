import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, ShoppingCart, Copy, CheckCircle2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { AppView } from '../types';

interface AIAmazonReviewResponderProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const AIAmazonReviewResponder: React.FC<AIAmazonReviewResponderProps> = ({ onBack, onNavigate }) => {
  const [review, setReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!review) return;
    
    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const ai = createAIInstance();
      const prompt = `Craft a professional response to this negative Amazon product review.
Review: "${review}"
Strict Rules:
1. Adhere to Amazon TOS (no contact info, no promotional spam, no defensive arguments, be polite and empathetic).
2. Acknowledge the issue, apologize, and offer a solution (full refund or replacement).`;

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
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Review Responder</h1>
        </header>

        <div className="bg-white/5 p-6 rounded-2xl mb-8">
          <textarea value={review} onChange={(e) => setReview(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white" placeholder="Paste negative Amazon review here..." />
          <button onClick={handleGenerate} className="w-full mt-4 py-4 bg-yellow-600 rounded-xl text-xs font-black uppercase text-white">Draft TOS-Compliant Response</button>
        </div>

        {result && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};
