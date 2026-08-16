
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Type, Image as ImageIcon, Download, Trash2, 
  Layers, ChevronDown, Plus, Palette, Maximize2, Move,
  Square, Layout, RefreshCcw, Save, Trash, Copy, ArrowUp, ArrowDown,
  Sparkles, Instagram, Facebook, Twitter, Smartphone
} from 'lucide-react';
import { fabric } from 'fabric';

interface PostDesignerProps {
  onBack: () => void;
}

type PostFormat = 'square' | 'portrait' | 'landscape';

const FORMATS = {
  square: { width: 1080, height: 1080, label: 'Square (1:1)' },
  portrait: { width: 1080, height: 1350, label: 'Portrait (4:5)' },
  landscape: { width: 1200, height: 630, label: 'Landscape (1.91:1)' }
};

export const PostDesigner: React.FC<PostDesignerProps> = ({ onBack }) => {
  const [format, setFormat] = useState<PostFormat>('square');
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !fabric) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: FORMATS[format].width,
      height: FORMATS[format].height,
      backgroundColor: bgColor,
      preserveObjectStacking: true
    });

    setCanvas(fabricCanvas);

    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [format]);

  // Handle Resize for UI responsiveness
  useEffect(() => {
    if (!canvas || !containerRef.current) return;
    
    const updateZoom = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const padding = 80;
      const availableWidth = container.clientWidth - padding;
      const availableHeight = container.clientHeight - padding;
      const scale = Math.min(availableWidth / FORMATS[format].width, availableHeight / FORMATS[format].height);
      
      // Defensive check for internal fabric objects before setting dimensions
      if ((canvas as any).lowerCanvasEl) {
        canvas.setZoom(scale);
        canvas.setDimensions({
          width: FORMATS[format].width * scale,
          height: FORMATS[format].height * scale
        });
      }
    };
    
    window.addEventListener('resize', updateZoom);
    updateZoom();
    return () => window.removeEventListener('resize', updateZoom);
  }, [canvas, format]);

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 40,
      fill: '#333333'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data, (img) => {
        img.scaleToWidth(canvas.getWidth() / 2);
        canvas.add(img);
        canvas.setActiveObject(img);
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const changeLayer = (direction: 'front' | 'back') => {
    if (!canvas || !selectedObject) return;
    if (direction === 'front') selectedObject.bringForward();
    else selectedObject.sendBackwards();
    canvas.requestRenderAll();
  };

  const exportCanvas = (ext: 'png' | 'jpeg') => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: ext,
      quality: 1,
      multiplier: 1 / canvas.getZoom()
    });
    const link = document.createElement('a');
    link.download = `kds-post-${Date.now()}.${ext}`;
    link.href = dataURL;
    link.click();
  };

  const updateSelectedProperty = (prop: string, value: any) => {
    if (!canvas || !selectedObject) return;
    selectedObject.set(prop as any, value);
    canvas.requestRenderAll();
  };

  const resetCanvas = () => {
    if (confirm('Are you sure? This will clear all design elements permanently.')) {
      if (!canvas) return;
      canvas.clear();
      canvas.setBackgroundColor(bgColor, canvas.renderAll.bind(canvas));
    }
  };

  const loadTemplate = (type: 'quote' | 'promo') => {
    if (!canvas) return;
    resetCanvas();
    if (type === 'quote') {
      const rect = new fabric.Rect({
        left: 0, top: 0, width: canvas.getWidth(), height: canvas.getHeight(),
        fill: '#f8fafc', selectable: false
      });
      const quote = new fabric.IText('"The best way to predict the future is to create it."', {
        left: 100, top: 300, width: 800, fontFamily: 'Plus Jakarta Sans',
        fontSize: 60, fontWeight: 'bold', fill: '#1e293b', textAlign: 'center'
      });
      const author = new fabric.IText('- Peter Drucker', {
        left: 100, top: 600, fontFamily: 'Plus Jakarta Sans',
        fontSize: 30, fill: '#64748b', textAlign: 'center'
      });
      canvas.add(rect, quote, author);
      quote.center();
      author.center();
      author.set({ top: quote.top! + quote.height! + 40 });
    } else if (type === 'promo') {
      const bg = new fabric.Rect({
        left: 0, top: 0, width: canvas.getWidth(), height: canvas.getHeight(),
        fill: '#4f46e5', selectable: false
      });
      const title = new fabric.IText('MEGA SALE', {
        left: 100, top: 200, fontFamily: 'Plus Jakarta Sans',
        fontSize: 120, fontWeight: 900, fill: '#ffffff', textAlign: 'center'
      });
      const subtitle = new fabric.IText('UP TO 50% OFF', {
        left: 100, top: 350, fontFamily: 'Plus Jakarta Sans',
        fontSize: 60, fontWeight: 700, fill: '#fbbf24', textAlign: 'center'
      });
      canvas.add(bg, title, subtitle);
      title.centerH();
      subtitle.centerH();
    }
    canvas.renderAll();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] overflow-hidden select-none font-sans">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200 z-[100] shrink-0 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-slate-400 shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex flex-col truncate">
            <h2 className="font-black text-slate-900 text-xs md:text-sm tracking-tighter uppercase italic truncate">Social Post Studio</h2>
            <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={10} className="text-pink-500" /> <span className="hidden sm:inline">Fabric Engine Accelerated</span><span className="sm:hidden">Fabric Engine</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
             {Object.keys(FORMATS).map((f) => (
               <button 
                key={f} 
                onClick={() => setFormat(f as PostFormat)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${format === f ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {f}
               </button>
             ))}
          </div>
          <div className="hidden lg:block h-8 w-px bg-slate-200 mx-2" />
          <button onClick={() => exportCanvas('png')} className="h-9 md:h-10 px-3 md:px-6 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0">
            <Download size={14} /> <span className="hidden sm:inline">Export PNG</span><span className="sm:hidden">Export</span>
          </button>
          <button onClick={resetCanvas} className="h-9 md:h-10 px-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-xl transition-all shrink-0" title="Reset Canvas">
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Format Selector (Top Bar) */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-10 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 flex items-center px-4 gap-2 overflow-x-auto scrollbar-hide">
           {Object.keys(FORMATS).map((f) => (
             <button 
              key={f} 
              onClick={() => setFormat(f as PostFormat)}
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${format === f ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 bg-slate-50'}`}
             >
               {f}
             </button>
           ))}
        </div>

        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 p-6 flex-col gap-8 shrink-0 overflow-y-auto">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Library</h3>
            <div className="grid grid-cols-1 gap-3">
              <ToolBtn icon={<Type size={20} />} label="Add Text" onClick={addText} />
              <label className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all cursor-pointer group">
                <div className="p-2 rounded-xl bg-white shadow-sm group-hover:bg-pink-100 transition-colors"><ImageIcon size={18} /></div>
                <span className="text-xs font-bold uppercase tracking-tight">Upload Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canvas Background</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-bold text-slate-500">Solid Fill</span>
               <input 
                type="color" 
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  if (canvas) canvas.setBackgroundColor(e.target.value, canvas.renderAll.bind(canvas));
                }}
                className="w-10 h-8 rounded-lg overflow-hidden border-none cursor-pointer p-0"
               />
            </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Templates</h3>
             <div className="grid grid-cols-2 gap-3">
                <TemplateBtn label="Minimal Quote" onClick={() => loadTemplate('quote')} icon={<Layout size={16} />} />
                <TemplateBtn label="Promo Blast" onClick={() => loadTemplate('promo')} icon={<Sparkles size={16} />} />
             </div>
          </section>

          <div className="mt-auto p-4 bg-blue-50 rounded-2xl border border-blue-100">
             <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
               Privacy Alert: All design artifacts exist only in your browser's RAM.
             </p>
          </div>
        </aside>

        {/* Mobile Tool Bar (Bottom) */}
        <div className="lg:hidden fixed bottom-14 left-4 right-4 z-50 flex items-center justify-around bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 shadow-2xl">
           <button onClick={addText} className="flex flex-col items-center gap-1 text-slate-400 hover:text-pink-600">
              <Type size={20} />
              <span className="text-[8px] font-black uppercase">Text</span>
           </button>
           <label className="flex flex-col items-center gap-1 text-slate-400 hover:text-pink-600 cursor-pointer">
              <ImageIcon size={20} />
              <span className="text-[8px] font-black uppercase">Image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
           </label>
           <div className="w-px h-8 bg-slate-100" />
           <button onClick={() => loadTemplate('quote')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-pink-600">
              <Layout size={20} />
              <span className="text-[8px] font-black uppercase">Quote</span>
           </button>
           <button onClick={() => loadTemplate('promo')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-pink-600">
              <Sparkles size={20} />
              <span className="text-[8px] font-black uppercase">Promo</span>
           </button>
           <div className="w-px h-8 bg-slate-100" />
           <div className="relative">
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  if (canvas) canvas.setBackgroundColor(e.target.value, canvas.renderAll.bind(canvas));
                }}
                className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer p-0"
              />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-400 uppercase">BG</span>
           </div>
        </div>

        <main className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-12 bg-slate-100 overflow-hidden" ref={containerRef}>
          <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden ring-1 ring-slate-200">
            <canvas ref={canvasRef} />
          </div>
        </main>

        {/* Inspector Sidebar (Desktop) / Bottom Sheet (Mobile) */}
        <aside className={`fixed lg:relative inset-x-0 bottom-0 lg:inset-auto lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 md:p-8 flex flex-col gap-6 md:gap-10 shrink-0 overflow-y-auto z-50 transition-transform duration-300 ${selectedObject ? 'translate-y-0 lg:translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
          {selectedObject ? (
            <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300">
              <section className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspector</h3>
                  <button onClick={deleteSelected} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => changeLayer('front')} className="flex flex-col items-center gap-2 p-2 md:p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
                      <ArrowUp size={16} className="text-slate-400" />
                      <span className="text-[8px] font-black uppercase">Front</span>
                   </button>
                   <button onClick={() => changeLayer('back')} className="flex flex-col items-center gap-2 p-2 md:p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
                      <ArrowDown size={16} className="text-slate-400" />
                      <span className="text-[8px] font-black uppercase">Back</span>
                   </button>
                </div>
              </section>

              {selectedObject instanceof fabric.IText && (
                <section className="space-y-4 md:space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Typography</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Text Fill</label>
                       <input 
                        type="color" 
                        value={selectedObject.fill as string}
                        onChange={(e) => updateSelectedProperty('fill', e.target.value)}
                        className="w-full h-10 rounded-xl cursor-pointer border-none bg-slate-50"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Size</label>
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold"
                            value={selectedObject.fontSize}
                            onChange={(e) => updateSelectedProperty('fontSize', parseInt(e.target.value))}
                          />
                       </div>
                    </div>
                  </div>
                </section>
              )}
              
              <button 
                onClick={() => setSelectedObject(null)}
                className="lg:hidden w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Close Inspector
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex h-full flex-col items-center justify-center text-center opacity-30 select-none">
              <Move size={48} className="text-slate-300 mb-6" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Select element</h4>
            </div>
          )}
        </aside>
      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> <span className="hidden sm:inline">CANVAS READY</span><span className="sm:hidden">READY</span></span>
           <span className="hidden sm:inline">OUTPUT: {FORMATS[format].width} x {FORMATS[format].height}</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="hidden sm:inline">SESSION ACTIVE</span><span className="sm:hidden">ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

const ToolBtn = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all group"
  >
    <div className="p-2 rounded-xl bg-white shadow-sm group-hover:bg-pink-100 transition-colors">{icon}</div>
    <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
    <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

const TemplateBtn = ({ label, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all gap-2"
  >
    {icon}
    <span className="text-[8px] font-black uppercase text-center leading-tight">{label}</span>
  </button>
);
