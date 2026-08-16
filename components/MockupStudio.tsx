import React, { useState, useRef } from 'react';
import { ArrowLeft, MonitorSmartphone, Upload, Smartphone, Monitor, Download, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export const MockupStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [device, setDevice] = useState<'laptop' | 'phone'>('laptop');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshot(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadMockup = async () => {
    if (mockupRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(mockupRef.current, { backgroundColor: 'transparent', pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `mockup-${device}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export mockup', err);
        alert('Failed to export mockup.');
      }
    }
  };

  return (
    <div className="flex h-full bg-[#f8fafc] text-slate-800">
      {/* Sidebar Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-xl">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <MonitorSmartphone size={16} />
            </div>
            <h1 className="font-bold text-slate-900">Mockup Studio</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">1. Target Device</label>
             <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => setDevice('laptop')}
                   className={`px-4 py-6 flex flex-col items-center gap-3 rounded-2xl border-2 transition-all ${device === 'laptop' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'}`}
                 >
                   <Monitor size={32} />
                   <span className="text-xs font-black uppercase tracking-widest">Laptop</span>
                 </button>
                 <button 
                   onClick={() => setDevice('phone')}
                   className={`px-4 py-6 flex flex-col items-center gap-3 rounded-2xl border-2 transition-all ${device === 'phone' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'}`}
                 >
                   <Smartphone size={32} />
                   <span className="text-xs font-black uppercase tracking-widest">Phone</span>
                 </button>
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Screenshot Image</label>
             <label className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-pink-500 hover:bg-pink-50 transition-colors cursor-pointer text-slate-500 hover:text-pink-600 group">
               {screenshot ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Image Loaded</span>
                    <span className="text-[10px] font-medium text-slate-400">Click to replace</span>
                  </div>
               ) : (
                 <div className="flex flex-col items-center gap-2">
                   <Upload size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                   <span className="text-xs font-black uppercase tracking-widest text-slate-700">Upload Image</span>
                   <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">PNG, JPG, WEBP</span>
                 </div>
               )}
               <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </label>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <button 
               onClick={downloadMockup}
               disabled={!screenshot}
               className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-slate-900/10"
             >
               <Download size={18} /> Export Transparent PNG
             </button>
          </div>

        </div>
      </div>

      {/* Main Canvas Area */}
      {/* We use an explicit width/height wrapper for htmlToImage to work robustly without clipping */}
      <div className="flex-1 overflow-auto bg-[#e2e8f0] relative flex items-center justify-center p-8 lg:p-12">
          
          <div className="absolute inset-0 pattern-dots text-slate-300 opacity-50 bg-[length:24px_24px] pointer-events-none" />

          {/* The export container */}
          <div ref={mockupRef} className="p-16 flex items-center justify-center relative z-10">
            
            {device === 'laptop' && (
              <div className="flex flex-col items-center filter drop-shadow-2xl">
                 {/* Laptop Screen */}
                 <div className="w-[800px] h-[500px] bg-slate-900 border-[16px] border-slate-900 rounded-t-3xl rounded-b-md relative overflow-hidden flex items-center justify-center shadow-inner">
                    {/* Camera */}
                    <div className="absolute top-[-10px] w-2 h-2 rounded-full bg-slate-700 mx-auto left-0 right-0 z-20" />
                    
                    {screenshot ? (
                      <img src={screenshot} alt="Screenshot" className="w-full h-full object-cover object-top z-10" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-600 gap-2">
                        <ImageIcon size={48} className="opacity-20" />
                        <span className="text-sm font-bold opacity-50 uppercase tracking-widest">Screen Area</span>
                      </div>
                    )}
                 </div>
                 {/* Laptop Base */}
                 <div className="w-[950px] h-6 bg-slate-300 rounded-b-3xl rounded-t-sm relative shadow-xl">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-400 rounded-b-md" />
                 </div>
              </div>
            )}

            {device === 'phone' && (
              <div className="filter drop-shadow-2xl">
                 {/* Phone Frame */}
                 <div className="w-[320px] h-[650px] bg-slate-900 border-[14px] border-slate-900 rounded-[3rem] relative overflow-hidden flex flex-col shadow-inner">
                    {/* Dynamic Island / Notch Mock */}
                    <div className="absolute top-2 w-24 h-6 bg-black rounded-full mx-auto left-0 right-0 z-20" />
                    
                    {screenshot ? (
                      <img src={screenshot} alt="Screenshot" className="w-full h-full object-cover object-top z-10" />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 bg-slate-800">
                        <ImageIcon size={32} className="opacity-20" />
                        <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Screen</span>
                      </div>
                    )}
                 </div>
                 {/* Fake buttons */}
                 <div className="absolute right-[-2px] top-32 w-1 h-12 bg-slate-700 rounded-r-md" />
                 <div className="absolute left-[-2px] top-24 w-1 h-8 bg-slate-700 rounded-l-md" />
                 <div className="absolute left-[-2px] top-36 w-1 h-12 bg-slate-700 rounded-l-md" />
              </div>
            )}

          </div>
      </div>
    </div>
  );
};
