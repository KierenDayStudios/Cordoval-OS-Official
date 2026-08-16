import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Maximize, Image as ImageIcon, Download, Loader2, Info } from 'lucide-react';

export const ImageUpscaler: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  // Simulated upscaling logic
  const processImage = () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Simulating the upscale by just drawing it larger and applying some smoothing
        // In a real app this would call an AI backend API
        canvas.width = img.width * upscaleFactor;
        canvas.height = img.height * upscaleFactor;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          setResultUrl(canvas.toDataURL('image/png'));
        }
        setIsProcessing(false);
      };
      img.src = previewUrl;
    }, 2500); 
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
               <Maximize size={16} />
             </div>
             <h1 className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-4">Image Upscaler</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Controls */}
          <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Input Image</h2>
              
              {!selectedFile ? (
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload size={32} className="text-slate-400 mb-3" />
                  <p className="text-sm font-medium text-slate-700">Click or drag image to upload</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG (Max 5MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <ImageIcon size={18} className="text-purple-500 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{selectedFile.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResultUrl(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase ml-2"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Scale Factor</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[2, 4, 8].map(factor => (
                         <button
                           key={factor}
                           onClick={() => {
                             setUpscaleFactor(factor);
                             setResultUrl(null);
                           }}
                           className={`py-2 rounded-lg text-sm font-bold transition-colors border ${upscaleFactor === factor ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                         >
                           {factor}x
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 text-amber-800 text-xs mt-4">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p>Higher scale factors take longer to process and use more memory.</p>
                  </div>

                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {isProcessing ? (
                       <>
                         <Loader2 size={16} className="animate-spin" /> Processing...
                       </>
                    ) : (
                       <>
                         <Maximize size={16} /> Upscale Image
                       </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
             
             {!previewUrl ? (
                <div className="text-center flex flex-col items-center justify-center h-full text-slate-400">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p className="font-medium text-slate-600">No Image Selected</p>
                  <p className="text-sm mt-1">Upload an image to preview and upscale.</p>
                </div>
             ) : (
                <div className="flex flex-col h-full items-center justify-center gap-6">
                  <div className="relative w-full h-full max-h-[60vh] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    {resultUrl ? (
                      <>
                        <img 
                          src={resultUrl} 
                          alt="Upscaled result" 
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute top-4 left-4 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                          {upscaleFactor}x Upscaled
                        </div>
                      </>
                    ) : (
                      <>
                        <img 
                          src={previewUrl} 
                          alt="Original preview" 
                          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isProcessing ? 'opacity-30' : 'opacity-100'}`}
                        />
                        <div className="absolute top-4 left-4 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                          Original
                        </div>
                        {isProcessing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 font-medium">
                            <Loader2 size={32} className="animate-spin mb-4 text-purple-600" />
                            <p>Enhancing Resolution...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {resultUrl && (
                    <a 
                      href={resultUrl}
                      download={`upscaled-${upscaleFactor}x-${selectedFile?.name || 'image.png'}`}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Download size={18} /> Download High-Res Image
                    </a>
                  )}
                </div>
             )}

          </div>
        </div>
      </div>
    </div>
  );
};
