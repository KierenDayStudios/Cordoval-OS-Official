import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Pencil, Square, Type, Eraser, Trash2, StickyNote } from 'lucide-react';
import { fabric } from 'fabric';
import { AppView } from '../types';

interface CollaborativeWhiteboardProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const CollaborativeWhiteboard: React.FC<CollaborativeWhiteboardProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'pencil' | 'rect' | 'note'>('pencil');

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      isDrawingMode: true,
      backgroundColor: '#ffffff'
    });
    
    fabricCanvasRef.current = canvas;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
    };
  }, []);

  const setTool = (tool: 'pencil' | 'rect' | 'note') => {
    setActiveTool(tool);
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.isDrawingMode = tool === 'pencil';
    if (tool === 'note') {
      const note = new fabric.Rect({
        left: 50, top: 50, width: 100, height: 100, fill: '#fbbf24', rx: 10, ry: 10
      });
      fabricCanvasRef.current.add(note);
    }
  };

  const clearCanvas = () => {
    fabricCanvasRef.current?.clear();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Whiteboard</h1>
        <button onClick={clearCanvas} className="p-2 bg-rose-500/20 text-rose-400 rounded-xl"><Trash2 size={18} /></button>
      </header>
      
      <div className="flex-1 relative bg-white" ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-white/10 flex justify-center gap-4">
        <button onClick={() => setTool('pencil')} className={`p-4 rounded-2xl ${activeTool === 'pencil' ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}><Pencil size={20} /></button>
        <button onClick={() => setTool('rect')} className={`p-4 rounded-2xl ${activeTool === 'rect' ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}><Square size={20} /></button>
        <button onClick={() => setTool('note')} className={`p-4 rounded-2xl ${activeTool === 'note' ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}><StickyNote size={20} /></button>
      </div>
    </div>
  );
};
