import React, { useState } from 'react';
import { 
  ArrowLeft, Package, Sparkles, FileText, Upload, CheckCircle2, Loader2, Play, Image as ImageIcon, Download
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface ProductDemoSpecialistAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Aesthetic = 'minimalist' | 'bold-colorful' | 'luxurious' | 'tech-futuristic';

export const ProductDemoSpecialistAgent: React.FC<ProductDemoSpecialistAgentProps> = ({ 
  onSaveDoc, onNavigate, onBack 
}) => {
  const [productDesc, setProductDesc] = useState('');
  const [aesthetic, setAesthetic] = useState<Aesthetic>('minimalist');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
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

  const generateDemo = async () => {
    if (!productDesc) return;

    if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      } catch (e) {
        console.warn("Failed API key check", e);
      }
    }

    setIsGenerating(true);
    setLoadingMessage("Directing AI Demo Simulation...");

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are "The Product Demo Specialist" AI agent. 
        TASK: Research the target audience's aesthetic and generate a Veo video prompt of the product in a lifestyle setting.
        
        - PRODUCT DESCRIPTION: ${productDesc}
        - DESIRED AESTHETIC: ${aesthetic}
        ${sourceImage ? "- THE USER PROVIDED AN IMAGE OF THE PRODUCT (See attached)." : ""}
        
        Return ONLY valid JSON with no markdown wrapping. Format:
        {
          "veoVideoPrompt": "A highly detailed visual prompt to generate a 12-second Veo video showing the product in a high-end lifestyle setting matching the aesthetic.",
          "visualDescription": "What the primary lifestyle setting looks like",
          "seedKeyword": "A single word for a placeholder image seed (e.g., 'minimalist', 'luxury', 'tech')"
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
      
      setLoadingMessage("Operating Veo Engine. This usually takes 1-2 minutes...");

      let operation;

      if (sourceImage) {
         operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: parsed.veoVideoPrompt,
           image: {
             imageBytes: sourceImage.split(',')[1],
             mimeType: sourceImage.split(';')[0].split(':')[1]
           },
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });
      } else {
         operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: parsed.veoVideoPrompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });
      }

      let checkCount = 0;
      while (!operation.done) {
        checkCount++;
        setLoadingMessage(`Rendering your Veo video... (approx ${checkCount * 10}s elapsed)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Failed to get video URI");

      setLoadingMessage("Finalizing video download...");

      const videoResponse = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      parsed.videoUrl = videoUrl;

      setResult(parsed);

    } catch (err) {
      console.error(err);
      alert("Failed to generate product demo. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
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
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Package size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">The Product Demo Specialist</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Lifestyle Veo Video Generator</p>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {!result ? (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Product Description</label>
                <textarea 
                  value={productDesc}
                  onChange={e => setProductDesc(e.target.value)}
                  placeholder="Describe your product... e.g., A stylish smart water bottle that tracks hydration."
                  className="w-full h-32 bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-teal-500/50 transition-colors resize-none mb-4"
                />
                
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Product Image (Optional)</label>
                <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-slate-500 hover:text-teal-400 group">
                  <div className="flex flex-col items-center gap-2">
                    {sourceImage ? (
                      <img src={sourceImage} alt="Preview" className="h-16 object-contain rounded-md mb-2" />
                    ) : (
                      <ImageIcon size={24} className="opacity-50" />
                    )}
                    <span className="font-bold text-xs uppercase tracking-widest">{sourceImage ? 'Image Attached - Click to Replace' : 'Upload Product Photo'}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Aesthetic</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['minimalist', 'bold-colorful', 'luxurious', 'tech-futuristic'] as Aesthetic[]).map(a => (
                    <button 
                      key={a}
                      onClick={() => setAesthetic(a)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${aesthetic === a ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-slate-950 text-slate-400 hover:border-white/20'}`}
                    >
                       {a.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={generateDemo}
                disabled={isGenerating || !productDesc}
                className="w-full py-5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loadingMessage || 'Generate Demo Video'}
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </button>
              
              {isGenerating && (
                <div className="text-center text-xs text-slate-500 mt-4 animate-pulse">
                   Video generation requires heavy compute. Please do not close this window.
                </div>
              )}
            </div>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
                 <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                   <CheckCircle2 size={20} />
                 </div>
                 <div>
                   <h3 className="text-emerald-400 font-bold mb-1">Production Complete</h3>
                   <p className="text-sm text-slate-400 mb-4">Your Veo presentation video is rendered and ready to download.</p>
                   {result.videoUrl && (
                     <a 
                       href={result.videoUrl} 
                       download="product_demo.mp4"
                       className="px-4 py-2 bg-emerald-500 border border-emerald-400 text-white hover:bg-emerald-400 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2"
                     >
                       <Download size={14} /> Download Video
                     </a>
                   )}
                 </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-teal-500" size={20} /> Generated Veo Video
                  </h3>
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl group max-w-3xl">
                     <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5 pointer-events-auto">
                        {result.videoUrl ? (
                          <video 
                            src={result.videoUrl} 
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-cover transition-all duration-700"
                          />
                        ) : (
                          <img 
                            src={`https://picsum.photos/seed/${result.seedKeyword || 'product'}/1280/720`} 
                            alt="Main Ad"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        
                        {!result.videoUrl && (
                           <>
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-2xl">
                                  <Play size={24} fill="currentColor" className="ml-1" />
                               </div>
                             </div>
                             <div className="absolute top-3 right-3 bg-teal-600 text-[10px] font-black text-white px-2 py-1 rounded-md tracking-widest border border-teal-500 pointer-events-none">
                               VEO PRODUCT DEMO
                             </div>
                           </>
                        )}
                     </div>
                     <div className="p-6 bg-slate-900 border-t border-white/10">
                       <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4"><span className="text-teal-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Visual Setting</span> {result.visualDescription}</p>
                       <div className="p-4 bg-slate-950 rounded-xl border border-white/5">
                           <p className="text-[10px] text-slate-500 font-mono italic">Prompt: "{result.veoVideoPrompt}"</p>
                       </div>
                     </div>
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
