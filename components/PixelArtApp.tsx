
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Pencil, MousePointer2, 
  Trash2, Plus, Play, Pause, Download, Save, ZoomIn, ZoomOut, 
  Grid3X3, Eraser, Move, Image as ImageIcon, Copy, Trash, Sparkles, Palette
} from 'lucide-react';
import * as PIXI from 'pixi.js';
import { PixelArtProject } from '../types';

interface PixelArtAppProps {
  activeProject?: PixelArtProject;
  onSave: (project: PixelArtProject) => void;
  onBack: () => void;
}

type Mode = 'pen' | 'spray' | 'rect' | 'circle' | 'select' | 'move' | 'eraser';

export const PixelArtApp: React.FC<PixelArtAppProps> = ({ activeProject, onSave, onBack }) => {
  const GRID_SIZE = 32;
  const PIXEL_SCALE = 16;
  
  const [project, setProject] = useState<PixelArtProject>(activeProject || {
    id: Math.random().toString(36).substr(2, 9),
    name: 'New Art Piece',
    width: GRID_SIZE,
    height: GRID_SIZE,
    frames: [Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#00000000'))],
    palette: ['#000000', '#FFFFFF', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
    updatedAt: Date.now(),
    tags: ['pixel-art'],
    folderId: null,
    history: []
  });

  const [activeFrame, setActiveFrame] = useState(0);
  const [mode, setMode] = useState<Mode>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(8);
  const [showGrid, setShowGrid] = useState(true);
  const [onionSkin, setOnionSkin] = useState(true);

  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const onionGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const playbackTimer = useRef<number | null>(null);

  // Initialize PixiJS
  useEffect(() => {
    if (!pixiContainerRef.current) return;

    const app = new PIXI.Application({
      width: project.width * PIXEL_SCALE,
      height: project.height * PIXEL_SCALE,
      backgroundColor: 0xffffff,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundAlpha: 0,
    });

    pixiContainerRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;

    const onionGfx = new PIXI.Graphics();
    onionGfx.alpha = 0.2;
    app.stage.addChild(onionGfx);
    onionGraphicsRef.current = onionGfx;

    const gfx = new PIXI.Graphics();
    app.stage.addChild(gfx);
    graphicsRef.current = gfx;

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  const renderFrame = useCallback(() => {
    const gfx = graphicsRef.current;
    const onionGfx = onionGraphicsRef.current;
    if (!gfx || !onionGfx) return;

    gfx.clear();
    const frameData = project.frames[activeFrame];
    for (let y = 0; y < project.height; y++) {
      for (let x = 0; x < project.width; x++) {
        const color = frameData[y][x];
        if (color !== '#00000000') {
          // Pixi v7 color conversion
          const hex = PIXI.utils.string2hex(color.startsWith('#') ? color : '#000000');
          gfx.beginFill(hex);
          gfx.drawRect(x * PIXEL_SCALE, y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
          gfx.endFill();
        }
      }
    }

    onionGfx.clear();
    if (onionSkin && activeFrame > 0) {
      const prevFrame = project.frames[activeFrame - 1];
      for (let y = 0; y < project.height; y++) {
        for (let x = 0; x < project.width; x++) {
          const color = prevFrame[y][x];
          if (color !== '#00000000') {
            const hex = PIXI.utils.string2hex(color.startsWith('#') ? color : '#000000');
            onionGfx.beginFill(hex);
            onionGfx.drawRect(x * PIXEL_SCALE, y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
            onionGfx.endFill();
          }
        }
      }
    }
  }, [project.frames, activeFrame, onionSkin, project.width, project.height]);

  useEffect(() => {
    renderFrame();
  }, [project.frames, activeFrame, renderFrame]);

  useEffect(() => {
    if (isPlaying) {
      playbackTimer.current = window.setInterval(() => {
        setActiveFrame(prev => (prev + 1) % project.frames.length);
      }, 1000 / fps);
    } else if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
    }
    return () => { if (playbackTimer.current) clearInterval(playbackTimer.current); };
  }, [isPlaying, fps, project.frames.length]);

  const getGridPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = appRef.current?.view;
    if (!canvas) return { x: 0, y: 0 };
    const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const scaleX = (canvas as HTMLCanvasElement).width / rect.width;
    const scaleY = (canvas as HTMLCanvasElement).height / rect.height;
    
    const x = Math.floor(((clientX - rect.left) * scaleX) / (PIXEL_SCALE * (window.devicePixelRatio || 1)));
    const y = Math.floor(((clientY - rect.top) * scaleY) / (PIXEL_SCALE * (window.devicePixelRatio || 1)));
    
    return { x, y };
  };

  const setPixel = (x: number, y: number, color: string) => {
    if (x < 0 || x >= project.width || y < 0 || y >= project.height) return;
    if (project.frames[activeFrame][y][x] === color) return;

    setProject(prev => {
      const newFrames = [...prev.frames];
      const newFrame = newFrames[activeFrame].map(row => [...row]);
      newFrame[y][x] = color;
      newFrames[activeFrame] = newFrame;
      return { ...prev, frames: newFrames, updatedAt: Date.now() };
    });
  };

  const handlePointerAction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getGridPos(e);
    
    if (mode === 'pen') setPixel(x, y, currentColor);
    if (mode === 'eraser') setPixel(x, y, '#00000000');
    if (mode === 'spray') {
      for (let i = 0; i < 3; i++) {
        const rx = x + Math.floor(Math.random() * 3 - 1);
        const ry = y + Math.floor(Math.random() * 3 - 1);
        setPixel(rx, ry, currentColor);
      }
    }
  };

  const addFrame = () => {
    const emptyFrame = Array(project.height).fill(null).map(() => Array(project.width).fill('#00000000'));
    setProject(prev => ({ ...prev, frames: [...prev.frames, emptyFrame] }));
    setActiveFrame(project.frames.length);
  };

  const duplicateFrame = () => {
    const current = project.frames[activeFrame].map(row => [...row]);
    setProject(prev => ({ ...prev, frames: [...prev.frames.slice(0, activeFrame + 1), current, ...prev.frames.slice(activeFrame + 1)] }));
    setActiveFrame(activeFrame + 1);
  };

  const exportArt = (format: 'png' | 'jpeg') => {
    const exportCanvas = document.createElement('canvas');
    const scale = 20; 
    exportCanvas.width = project.width * scale;
    exportCanvas.height = project.height * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    
    const frame = project.frames[activeFrame];
    for (let y = 0; y < project.height; y++) {
      for (let x = 0; x < project.width; x++) {
        const color = frame[y][x];
        if (color !== '#00000000') {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        } else if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    const dataUrl = exportCanvas.toDataURL(`image/${format}`);
    const link = document.createElement('a');
    link.download = `${project.name}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F1F3F9] text-slate-800 overflow-hidden select-none font-sans">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 bg-white z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex flex-col truncate">
            <input 
              value={project.name} 
              onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))} 
              className="bg-transparent font-black text-slate-900 text-xs md:text-sm outline-none w-24 md:w-48 border-b-2 border-transparent focus:border-blue-500 transition-all truncate" 
              placeholder="Untitled Masterpiece"
            />
            <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={10} className="text-blue-500" /> <span className="hidden sm:inline">PixiJS Engine v2.0</span><span className="sm:hidden">PIXI v2</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="p-2 text-slate-400 hover:text-slate-900"><ZoomOut size={16} /></button>
              <span className="text-[10px] font-black w-12 text-center text-slate-500">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="p-2 text-slate-400 hover:text-slate-900"><ZoomIn size={16} /></button>
           </div>
           <div className="hidden md:block h-10 w-px bg-slate-200" />
           <button onClick={() => exportArt('png')} className="h-9 md:h-10 px-3 md:px-4 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-2 shadow-sm shrink-0">
             <Download size={14} /> <span className="hidden sm:inline">Export PNG</span><span className="sm:hidden">PNG</span>
           </button>
           <button onClick={() => onSave(project)} className="h-9 md:h-10 px-4 md:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all shrink-0">
             <span className="hidden sm:inline">Commit to Vault</span><span className="sm:hidden">Save</span>
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-6 gap-4 shrink-0">
          <ToolBtn icon={<Pencil size={20} />} active={mode === 'pen'} onClick={() => setMode('pen')} label="Pen" />
          <ToolBtn icon={<Eraser size={20} />} active={mode === 'eraser'} onClick={() => setMode('eraser')} label="Eraser" />
          <ToolBtn icon={<Sparkles size={20} />} active={mode === 'spray'} onClick={() => setMode('spray')} label="Spray" />
          <div className="w-10 h-px bg-slate-100 my-2" />
          <ToolBtn icon={<MousePointer2 size={20} />} active={mode === 'select'} onClick={() => setMode('select')} label="Pick" />
          <ToolBtn icon={<Move size={20} />} active={mode === 'move'} onClick={() => setMode('move')} label="Move" />
          <div className="mt-auto flex flex-col gap-4">
             <ToolBtn icon={<Grid3X3 size={20} />} active={showGrid} onClick={() => setShowGrid(!showGrid)} label="Grid" />
          </div>
        </aside>

        {/* Mobile Tool Floating Bar */}
        <div className="md:hidden fixed bottom-48 left-4 z-50 flex flex-col gap-2">
           <ToolBtn icon={<Pencil size={18} />} active={mode === 'pen'} onClick={() => setMode('pen')} isMobile />
           <ToolBtn icon={<Eraser size={18} />} active={mode === 'eraser'} onClick={() => setMode('eraser')} isMobile />
           <ToolBtn icon={<Sparkles size={18} />} active={mode === 'spray'} onClick={() => setMode('spray')} isMobile />
           <ToolBtn icon={<MousePointer2 size={18} />} active={mode === 'select'} onClick={() => setMode('select')} isMobile />
        </div>

        <main className="flex-1 relative flex flex-col bg-slate-100/30 overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <div 
              className="relative bg-white shadow-2xl transition-transform duration-200 ring-1 ring-slate-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <div 
                className="absolute inset-0 z-0" 
                style={{ 
                  backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)', 
                  backgroundSize: '16px 16px', 
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px', 
                  backgroundColor: '#ffffff' 
                }} 
              />
              
              <div 
                ref={pixiContainerRef}
                className="relative z-10 touch-none"
                style={{ 
                  width: project.width * PIXEL_SCALE, 
                  height: project.height * PIXEL_SCALE 
                }}
                onMouseDown={(e) => { setIsDrawing(true); handlePointerAction(e); }}
                onMouseMove={handlePointerAction}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                onTouchStart={(e) => { setIsDrawing(true); handlePointerAction(e); }}
                onTouchMove={handlePointerAction}
                onTouchEnd={() => setIsDrawing(false)}
              />

              {showGrid && (
                <div 
                  className="absolute inset-0 z-20 pointer-events-none opacity-10" 
                  style={{ 
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: `${PIXEL_SCALE}px ${PIXEL_SCALE}px`
                  }} 
                />
              )}
            </div>
          </div>

          <div className="h-36 md:h-44 bg-white border-t border-slate-200 flex flex-col shrink-0 shadow-inner z-40">
             <div className="h-10 px-4 md:px-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-6">
                   <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Frames</span>
                   <div className="flex items-center gap-2 md:gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className={`p-1.5 rounded-lg transition-all ${isPlaying ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <div className="hidden sm:flex items-center gap-2">
                        <input 
                          type="range" min="1" max="24" value={fps} onChange={(e) => setFps(parseInt(e.target.value))}
                          className="w-16 md:w-24 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-[8px] md:text-[9px] font-black text-slate-400 w-10 md:w-12">{fps} FPS</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                   <button onClick={() => setOnionSkin(!onionSkin)} className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all ${onionSkin ? 'bg-blue-50 text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>Onion</button>
                   <button onClick={addFrame} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Plus size={16} /></button>
                   <button onClick={duplicateFrame} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Copy size={16} /></button>
                </div>
             </div>
             <div className="flex-1 flex items-center gap-3 md:gap-4 px-4 md:px-6 overflow-x-auto scrollbar-hide py-3 md:py-4">
                {project.frames.map((frame, idx) => (
                  <FrameThumbnail 
                    key={idx} 
                    frame={frame} 
                    idx={idx} 
                    active={activeFrame === idx} 
                    width={project.width}
                    height={project.height}
                    onClick={() => setActiveFrame(idx)}
                    onDelete={() => {
                       setProject(prev => ({ ...prev, frames: prev.frames.filter((_, i) => i !== idx) }));
                       setActiveFrame(0);
                    }}
                    canDelete={project.frames.length > 1}
                  />
                ))}
             </div>
          </div>
        </main>

        {/* Palette Sidebar (Desktop) / Bottom Bar (Mobile) */}
        <aside className="hidden lg:flex w-80 bg-white border-l border-slate-200 p-8 flex-col gap-10 shrink-0 overflow-y-auto">
           <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Chromatic</h3>
              <div className="bg-slate-50 rounded-[2rem] p-6 flex flex-col items-center gap-4 border border-slate-100 shadow-sm relative overflow-hidden group">
                 <input 
                  type="color" 
                  value={currentColor} 
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-full h-14 bg-transparent border-none cursor-pointer rounded-2xl overflow-hidden shadow-inner"
                 />
                 <div className="flex items-center justify-between w-full px-2">
                    <span className="text-[11px] font-black text-slate-900 tracking-tighter uppercase font-mono">{currentColor}</span>
                 </div>
              </div>
           </section>

           <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Palette</h3>
                 <button onClick={() => setProject(prev => ({ ...prev, palette: [...prev.palette, currentColor] }))} className="text-blue-500 hover:text-blue-600"><Plus size={16} /></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                 {project.palette.map((c, i) => (
                   <button 
                    key={i} 
                    onClick={() => setCurrentColor(c)}
                    className={`aspect-square rounded-2xl border-4 transition-all hover:scale-110 shadow-sm ${currentColor === c ? 'border-blue-500 scale-110' : 'border-white hover:border-slate-100'}`}
                    style={{ backgroundColor: c }}
                   />
                 ))}
              </div>
           </section>

           <div className="mt-auto p-5 bg-blue-50 rounded-3xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                Hold and drag for brush strokes. PixiJS accelerated timeline active.
              </p>
           </div>
        </aside>

        {/* Mobile Palette Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center px-4 gap-3 z-50 overflow-x-auto scrollbar-hide">
           <div className="flex items-center gap-2 shrink-0">
              <input 
                type="color" 
                value={currentColor} 
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-8 h-8 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden shrink-0"
              />
              <div className="w-px h-6 bg-slate-200 mx-1" />
           </div>
           <div className="flex items-center gap-2">
              {project.palette.map((c, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentColor(c)}
                  className={`w-8 h-8 rounded-lg border-2 shrink-0 transition-all ${currentColor === c ? 'border-blue-500 scale-110' : 'border-white'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <button 
                onClick={() => setProject(prev => ({ ...prev, palette: [...prev.palette, currentColor] }))}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"
              >
                <Plus size={14} />
              </button>
           </div>
        </div>
      </div>

      <footer className="hidden sm:flex h-8 bg-white border-t border-slate-200 px-6 items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 shadow-lg">
        <div className="flex gap-8 items-center">
           <span className="flex items-center gap-2 font-mono"><div className="w-2 h-2 rounded-full bg-blue-500" /> F{activeFrame + 1} / {project.frames.length}</span>
           <span className="text-slate-200">|</span>
           <span>RESOLVE: {project.width}x{project.height}</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-500">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           VAULT_SYNC_OK
        </div>
      </footer>
    </div>
  );
};

const FrameThumbnail = ({ frame, idx, active, onClick, onDelete, canDelete, width, height }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    for(let py=0; py<height; py++) {
      for(let px=0; px<width; px++) {
        const c = frame[py][px];
        if(c !== '#00000000') {
          ctx.fillStyle = c;
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }, [frame, width, height]);

  return (
    <div 
      onClick={onClick}
      className={`h-16 md:h-24 aspect-square rounded-xl md:rounded-2xl border-2 md:border-4 transition-all cursor-pointer relative group overflow-hidden shrink-0 flex items-center justify-center p-1 md:p-2 ${active ? 'border-blue-500 bg-blue-50/20' : 'border-white bg-slate-50 hover:border-slate-200'}`}
    >
      <div className="w-full h-full relative">
        <div 
          className="absolute inset-0 z-0 scale-[0.15] origin-top-left" 
          style={{ 
            backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)', 
            backgroundSize: '16px 16px', 
            backgroundColor: '#ffffff',
            width: width * 16,
            height: height * 16
          }} 
        />
        <canvas 
          ref={canvasRef}
          width={width} 
          height={height}
          className="w-full h-full relative z-10"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="absolute bottom-0.5 left-1 text-[7px] md:text-[8px] font-black text-slate-400 group-hover:text-blue-500">#{idx + 1}</div>
      {canDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-0.5 right-0.5 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-rose-900/10"
        >
          <Trash size={10} />
        </button>
      )}
    </div>
  );
};

const ToolBtn = ({ icon, active, onClick, label, isMobile }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center ${isMobile ? 'w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-lg border border-slate-200' : 'w-14 h-14 rounded-2xl'} transition-all relative group ${active ? (isMobile ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20') : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
  >
    <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
    {!isMobile && label && (
      <div className="absolute left-16 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-[100] translate-x-4 group-hover:translate-x-0 shadow-2xl">
        {label}
      </div>
    )}
  </button>
);
