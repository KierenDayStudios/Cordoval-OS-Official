import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, ArrowLeft, Stamp, Image as ImageIcon, Trash2 } from 'lucide-react';

export const WatermarkTool: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [position, setPosition] = useState<string>('bottom-right');
  const [scale, setScale] = useState<number>(20); // 1-100 percentage of base image width
  const [opacity, setOpacity] = useState<number>(80); // 1-100 percentage
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBaseImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setWatermarkImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const drawCanvas = async () => {
      if (!canvasRef.current || !baseImage) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const base = new Image();
      base.src = baseImage;
      await new Promise(r => base.onload = r);

      // Set canvas dimensions to base image
      canvasRef.current.width = base.width;
      canvasRef.current.height = base.height;

      // Draw base image
      ctx.clearRect(0, 0, base.width, base.height);
      ctx.drawImage(base, 0, 0);

      // Draw watermark if exists
      if (watermarkImage) {
        const wm = new Image();
        wm.src = watermarkImage;
        await new Promise(r => wm.onload = r);

        const wmWidth = base.width * (scale / 100);
        const wmHeight = wm.height * (wmWidth / wm.width);

        let x = 0;
        let y = 0;
        const padding = base.width * 0.05; // 5% padding relative to width

        switch (position) {
          case 'top-left': x = padding; y = padding; break;
          case 'top-center': x = (base.width - wmWidth) / 2; y = padding; break;
          case 'top-right': x = base.width - wmWidth - padding; y = padding; break;
          case 'center-left': x = padding; y = (base.height - wmHeight) / 2; break;
          case 'center': x = (base.width - wmWidth) / 2; y = (base.height - wmHeight) / 2; break;
          case 'center-right': x = base.width - wmWidth - padding; y = (base.height - wmHeight) / 2; break;
          case 'bottom-left': x = padding; y = base.height - wmHeight - padding; break;
          case 'bottom-center': x = (base.width - wmWidth) / 2; y = base.height - wmHeight - padding; break;
          case 'bottom-right': x = base.width - wmWidth - padding; y = base.height - wmHeight - padding; break;
          default: x = base.width - wmWidth - padding; y = base.height - wmHeight - padding;
        }

        ctx.globalAlpha = opacity / 100;
        ctx.drawImage(wm, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;
      }
    };

    drawCanvas();
  }, [baseImage, watermarkImage, position, scale, opacity]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked-${Date.now()}.png`;
    a.click();
  };

  const gridPositions = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#F8F9FB]">
      
      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shrink-0 custom-scrollbar z-10 shadow-sm relative">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Watermark</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Brand Artifacts</p>
            </div>
          </div>
          {baseImage && (
             <button 
               onClick={handleDownload}
               className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
               title="Download Result"
             >
               <Download size={18} />
             </button>
          )}
        </header>

        <div className="p-6 space-y-8">

          {/* Uploads */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Base Image</h3>
            {!baseImage ? (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group text-slate-500 hover:text-indigo-600">
                <ImageIcon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Upload Background</span>
                <input type="file" accept="image/*" onChange={handleBaseUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex justify-center items-center">
                 <img src={baseImage} alt="Base" className="max-h-full object-contain" />
                 <button onClick={() => setBaseImage(null)} className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                   <Trash2 size={16} />
                 </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Watermark Logo</h3>
            {!watermarkImage ? (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group text-slate-500 hover:text-indigo-600 opacity-80">
                <Stamp size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center px-4">Upload Transparent PNG</span>
                <input type="file" accept="image/*" onChange={handleWatermarkUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex justify-center items-center p-4 checkerboard-bg">
                 <img src={watermarkImage} alt="Watermark" className="max-h-full max-w-full object-contain" />
                 <button onClick={() => setWatermarkImage(null)} className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                   <Trash2 size={16} />
                 </button>
              </div>
            )}
          </div>

          {/* Controls */}
          {baseImage && watermarkImage && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Position</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 aspect-square">
                   {gridPositions.map((pos) => (
                      <button 
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`rounded-xl border transition-all flex items-center justify-center ${position === pos ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        aria-label={`Position ${pos}`}
                      >
                         <div className={`w-3 h-3 rounded-sm ${position === pos ? 'bg-white' : 'bg-slate-300'}`} />
                      </button>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold tracking-wider uppercase text-slate-400">
                   <span>Scale / Size</span>
                   <span className="text-indigo-600">{scale}%</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold tracking-wider uppercase text-slate-400">
                   <span>Opacity</span>
                   <span className="text-indigo-600">{opacity}%</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
              </div>

            </div>
          )}
          
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 p-4 md:p-8 bg-[#F8F9FB] flex flex-col items-center justify-center overflow-auto custom-scrollbar relative">
        <style>{`.checkerboard-bg { background-image: linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }`}</style>
        
        {baseImage ? (
          <div className="w-full max-w-5xl bg-white shadow-xl shadow-slate-200/50 rounded-lg overflow-hidden border border-slate-200 p-2 checkerboard-bg">
            <canvas 
              ref={canvasRef}
              className="w-full h-auto object-contain rounded drop-shadow-sm"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        ) : (
          <div className="text-center p-8 max-w-sm">
             <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-indigo-400 transform -rotate-6">
                <Stamp size={32} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Watermark App</h2>
             <p className="text-slate-500 font-medium">Upload a base background image and a watermark logo to visually compose and instantly download branded assets securely.</p>
          </div>
        )}

      </main>

    </div>
  );
};
