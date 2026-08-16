
import React, { useState, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Upload, RefreshCw, Download, Trash2, Sparkles, Wand2, Zap, X, Check } from 'lucide-react';
import { createAIInstance } from '../utils/ai';

interface BackgroundRemoverProps {
  onBack: () => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ onBack }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    
    try {
      const ai = createAIInstance();
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Please remove the background from this image and return ONLY the subject on a transparent or solid white background if transparency is not possible. Return the result as an image.',
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setResultImage(`data:image/png;base64,${base64EncodeString}`);
        }
      }
    } catch (err) {
      console.error('Background removal failed:', err);
      alert('Neural link error during image mutation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `removed_bg_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans">
      <header className="h-16 px-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-indigo-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter">Background Remover</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Image Mutation</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-12 h-full">
          
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Source Viewport */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Artifact</h3>
                {sourceImage && (
                  <button onClick={() => setSourceImage(null)} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div 
                onClick={() => !sourceImage && fileInputRef.current?.click()}
                className={`aspect-square bg-white/5 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden transition-all ${!sourceImage ? 'border-white/10 hover:border-indigo-500/50 cursor-pointer' : 'border-transparent'}`}
              >
                {!sourceImage ? (
                  <div className="flex flex-col items-center gap-4 p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-2">
                      <Upload size={32} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Drop image or click to upload</p>
                  </div>
                ) : (
                  <img src={sourceImage} className="w-full h-full object-contain" alt="Source" />
                )}
              </div>
            </div>

            {/* Result Viewport */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Output</h3>
                {resultImage && (
                  <button onClick={downloadResult} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors">
                    <Download size={12} /> Download PNG
                  </button>
                )}
              </div>

              <div className="aspect-square bg-slate-900/50 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden">
                {isProcessing && (
                  <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="text-indigo-500 animate-spin" size={48} />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Mutating Pixels</p>
                  </div>
                )}

                {!resultImage && !isProcessing && (
                  <div className="flex flex-col items-center gap-4 p-12 text-center opacity-20">
                    <Sparkles size={48} className="text-slate-700" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-700 italic">Initialize mutation to see result</p>
                  </div>
                )}

                {resultImage && (
                  <div className="w-full h-full p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]">
                    <img src={resultImage} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="Result" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-md flex flex-col gap-6">
            <button
              onClick={handleRemoveBackground}
              disabled={isProcessing || !sourceImage}
              className="h-20 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all hover:bg-indigo-600 hover:text-white hover:scale-105 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
            >
              {isProcessing ? <RefreshCw className="animate-spin" /> : <Wand2 size={24} />}
              {isProcessing ? 'Processing Neural Layers...' : 'Remove Background'}
            </button>
            <p className="text-[9px] font-black text-slate-700 uppercase text-center tracking-[0.3em]">Powered by Gemini 2.5 Flash Image Synthesis</p>
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
        </div>
      </main>
    </div>
  );
};
