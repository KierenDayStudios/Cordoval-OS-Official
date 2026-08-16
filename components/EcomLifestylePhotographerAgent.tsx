import React, { useState } from 'react';
import { 
  ArrowLeft, Camera, Sparkles, FileText, CheckCircle2, Loader2, Image as ImageIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface EcomLifestylePhotographerAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const EcomLifestylePhotographerAgent: React.FC<EcomLifestylePhotographerAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [productDesc, setProductDesc] = useState('');
  const [aesthetic, setAesthetic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateShots = async () => {
    if (!productDesc || !aesthetic) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `
        You are "The E-Com Lifestyle Photographer" AI agent. 
        TASK: Take the product description/image, research high-end aesthetics (like Apple, Gucci, or the user's input), and map out a 10-shot Nano lifestyle photography campaign.
        
        - PRODUCT: ${productDesc}
        - TARGET AESTHETIC / BRAND REFERENCE: ${aesthetic}
        ${sourceImage ? "- THE USER PROVIDED A BASE IMAGE OF THE PRODUCT (See attached)." : ""}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "documentTitle": "E-Com Shoot Plan: [Product Name]",
          "scriptContent": "Full markdown document detailing the photography shoot, lighting, set design, and styling based on the target aesthetic.",
          "nanoShots": [
            {
              "caption": "Short, punchy caption for this shot",
              "prompt": "Highly detailed visual generation prompt for an AI image generator",
              "seedKeyword": "A single word for a placeholder image seed (e.g., 'luxury', 'sunlight', 'shadow')"
            }
          ] // MUST CONTAIN EXACTLY 10 SHOTS
        }
      `;

      const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
      if (sourceImage) {
        contents[0].parts.unshift({
          inlineData: {
            data: sourceImage.split(',')[1],
            mimeType: sourceImage.split(';')[0].split(':')[1]
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const parsed = JSON.parse(text);
      setResult(parsed);

      const newDoc: Document = {
        id: 'doc-' + Date.now(),
        name: parsed.documentTitle,
        content: parsed.scriptContent,
        updatedAt: Date.now(),
        tags: ['photography', 'e-com', 'assets'],
        folderId: 'root',
        history: []
      };
      
      onSaveDoc(newDoc);
    } catch (err) {
      console.error(err);
      alert("Failed to generate lifestyle shots. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Camera size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The E-Com Lifestyle Photographer</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">High-End Nano Asset Generation</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setResult(null)} 
             className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
             style={{ display: result ? 'block' : 'none' }}
           >
             Reset
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {!result ? (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Product Description</label>
                <textarea 
                  value={productDesc}
                  onChange={e => setProductDesc(e.target.value)}
                  placeholder="Describe your product... e.g., A sleek titanium espresso machine."
                  className="w-full h-24 bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-orange-500/50 transition-colors resize-none mb-4"
                />

                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target High-End Aesthetic</label>
                 <input 
                  type="text" 
                  value={aesthetic}
                  onChange={e => setAesthetic(e.target.value)}
                  placeholder="e.g. Apple (clean/minimal), Gucci (maximalist/luxurious), Patagonia (rugged)..."
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-orange-500/50 transition-colors mb-6"
                />
                
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Base Product Photo (Highly Recommended)</label>
                <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-slate-500 hover:text-orange-400 group">
                  <div className="flex flex-col items-center gap-2">
                    {sourceImage ? (
                      <img src={sourceImage} alt="Preview" className="h-16 object-contain rounded-md mb-2" />
                    ) : (
                      <ImageIcon size={24} className="opacity-50" />
                    )}
                    <span className="font-bold text-xs uppercase tracking-widest">{sourceImage ? 'Image Attached - Click to Replace' : 'Upload Base Product Photo'}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <button 
                onClick={generateShots}
                disabled={isGenerating || !productDesc || !aesthetic}
                className="w-full py-5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'Staging Shoot & Researching...' : 'Generate 10 Lifestyle Shots'}
              </button>
            </div>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                     <CheckCircle2 size={20} />
                   </div>
                   <div>
                     <h3 className="text-emerald-400 font-bold mb-1">Photography Plan Ready</h3>
                     <p className="text-sm text-slate-400">Shoot plan saved to Docs. 10 simulated Nano lifestyle shots generated below.</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => onNavigate('docs', null)}
                   className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                 >
                   <FileText size={14} /> Open Shoot Plan
                 </button>
               </div>

               <div className="space-y-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-orange-500" size={20} /> 10-Shot Nano Digital Campaign
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {result.nanoShots?.map((shot: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl group hover:border-orange-500/30 transition-all">
                        <div className="aspect-square relative overflow-hidden bg-slate-950 flex items-center justify-center">
                          <img 
                            src={`https://picsum.photos/seed/${shot.seedKeyword || idx + 'shot'}/600/600`} 
                            alt={shot.caption}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 shadow text-[9px] font-black text-white px-1.5 py-0.5 rounded tracking-widest border border-white/10 backdrop-blur-md">
                            #{idx + 1}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900 border-t border-white/10">
                          <p className="text-xs text-white font-bold leading-tight line-clamp-2 mb-1">{shot.caption}</p>
                          <p className="text-[9px] text-slate-500 font-mono italic line-clamp-3 leading-relaxed">
                            "{shot.prompt}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
