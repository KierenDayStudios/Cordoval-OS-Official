
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Square, Circle, Type, Diamond, PenTool, MousePointer2, Trash2, Layers, Save, Share2, Plus, Minus, Move, Link, ArrowUp, ArrowDown, Maximize2
} from 'lucide-react';
import { CanvasBoard, CanvasElement, CanvasConnection } from '../types';

interface CanvasAppProps {
  activeBoard?: CanvasBoard;
  onSave: (board: CanvasBoard) => void;
  onBack: () => void;
}

type Mode = 'select' | 'connect' | 'rect' | 'circle' | 'diamond' | 'text' | 'pan';

export const CanvasApp: React.FC<CanvasAppProps> = ({ activeBoard, onSave, onBack }) => {
  const [board, setBoard] = useState<CanvasBoard>(activeBoard || {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Strategic Blueprint',
    updatedAt: Date.now(),
    tags: [],
    folderId: null,
    history: [],
    elements: [
      { id: '1', type: 'rect', x: 400, y: 200, width: 220, height: 120, content: 'Phase 1: Discovery', color: '#3b82f6', zIndex: 1 },
      { id: '2', type: 'circle', x: 750, y: 200, width: 180, height: 180, content: 'Goal: Market Fit', color: '#10b981', zIndex: 2 }
    ],
    connections: [
      { fromId: '1', toId: '2' }
    ]
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<Mode>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'nw' | 'ne' | 'sw' | 'se'
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionStartId, setConnectionStartId] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);

  const addElement = (type: CanvasElement['type']) => {
    const maxZ = Math.max(0, ...board.elements.map(e => e.zIndex));
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: (window.innerWidth / 2 - pan.x) / zoom - 100,
      y: (window.innerHeight / 2 - pan.y) / zoom - 50,
      width: type === 'rect' ? 200 : 150,
      height: type === 'rect' ? 100 : 150,
      content: 'Double click to edit',
      color: '#3b82f6',
      zIndex: maxZ + 1
    };
    setBoard(prev => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedId(newElement.id);
    setMode('select');
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (mode === 'pan') return;
    e.stopPropagation();
    
    if (mode === 'connect') {
      if (!connectionStartId) {
        setConnectionStartId(id);
      } else if (connectionStartId !== id) {
        // Create connection
        const exists = board.connections.some(c => (c.fromId === connectionStartId && c.toId === id) || (c.fromId === id && c.toId === connectionStartId));
        if (!exists) {
          setBoard(prev => ({
            ...prev,
            connections: [...prev.connections, { fromId: connectionStartId, toId: id }]
          }));
        }
        setConnectionStartId(null);
        setMode('select');
      }
      return;
    }

    setSelectedId(id);
    setIsDragging(true);
    const element = board.elements.find(el => el.id === id);
    if (element) {
      setDragOffset({ x: e.clientX / zoom - element.x, y: e.clientY / zoom - element.y });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    setIsResizing(dir);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
      return;
    }

    if (isResizing && selectedId) {
      setBoard(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (el.id !== selectedId) return el;
          const mouseX = (e.clientX - pan.x) / zoom;
          const mouseY = (e.clientY - pan.y) / zoom;
          
          let newWidth = el.width;
          let newHeight = el.height;
          let newX = el.x;
          let newY = el.y;

          if (isResizing.includes('e')) newWidth = Math.max(50, mouseX - el.x);
          if (isResizing.includes('s')) newHeight = Math.max(50, mouseY - el.y);
          if (isResizing.includes('w')) {
            const delta = el.x - mouseX;
            newWidth = Math.max(50, el.width + delta);
            if (newWidth > 50) newX = mouseX;
          }
          if (isResizing.includes('n')) {
            const delta = el.y - mouseY;
            newHeight = Math.max(50, el.height + delta);
            if (newHeight > 50) newY = mouseY;
          }

          return { ...el, width: newWidth, height: newHeight, x: newX, y: newY };
        })
      }));
      return;
    }

    if (isDragging && selectedId) {
      const newX = e.clientX / zoom - dragOffset.x;
      const newY = e.clientY / zoom - dragOffset.y;
      setBoard(prev => ({
        ...prev,
        elements: prev.elements.map(el => el.id === selectedId ? { ...el, x: newX, y: newY } : el)
      }));
    }
  }, [isDragging, isResizing, isPanning, selectedId, dragOffset, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
    setIsPanning(false);
    lastTouchRef.current = null;
  }, []);

  const lastTouchRef = useRef<{ x: number, y: number } | null>(null);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    
    if (isPanning && lastTouchRef.current) {
      const movementX = touch.clientX - lastTouchRef.current.x;
      const movementY = touch.clientY - lastTouchRef.current.y;
      setPan(prev => ({ x: prev.x + movementX, y: prev.y + movementY }));
    } else {
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        movementX: 0,
        movementY: 0
      } as any;
      handleMouseMove(fakeEvent);
    }
    
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  }, [handleMouseMove, isPanning]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchStart]);

  const deleteSelected = () => {
    if (selectedId) {
      setBoard(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== selectedId),
        connections: prev.connections.filter(c => c.fromId !== selectedId && c.toId !== selectedId)
      }));
      setSelectedId(null);
    }
  };

  const changeLayer = (dir: 'up' | 'down') => {
    if (!selectedId) return;
    setBoard(prev => {
      const el = prev.elements.find(e => e.id === selectedId);
      if (!el) return prev;
      const newZ = dir === 'up' ? el.zIndex + 1 : Math.max(0, el.zIndex - 1);
      return {
        ...prev,
        elements: prev.elements.map(e => e.id === selectedId ? { ...e, zIndex: newZ } : e)
      };
    });
  };

  const getElementCenter = (id: string) => {
    const el = board.elements.find(e => e.id === id);
    if (!el) return { x: 0, y: 0 };
    return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] overflow-hidden select-none">
      {/* Dynamic Ribbon Toolbar */}
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm z-50 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-slate-400 shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex flex-col truncate">
            <input 
              value={board.name} 
              onChange={e => setBoard(prev => ({ ...prev, name: e.target.value }))} 
              className="bg-transparent font-black text-slate-800 text-xs md:text-sm outline-none w-24 md:w-48 border-b border-transparent focus:border-slate-200 transition-all truncate" 
            />
            <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Workboard</span>
          </div>
        </div>
        
        {/* Desktop Toolbar */}
        <div className="hidden lg:flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200 backdrop-blur-md">
           <ToolIcon icon={<MousePointer2 size={18} />} label="Pick" active={mode === 'select'} onClick={() => setMode('select')} />
           <ToolIcon icon={<Move size={18} />} label="Pan" active={mode === 'pan'} onClick={() => setMode('pan')} />
           <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
           <ToolIcon icon={<Square size={18} />} label="Rect" onClick={() => addElement('rect')} />
           <ToolIcon icon={<Circle size={18} />} label="Circle" onClick={() => addElement('circle')} />
           <ToolIcon icon={<Diamond size={18} />} label="Process" onClick={() => addElement('diamond')} />
           <ToolIcon icon={<Type size={18} />} label="Label" onClick={() => addElement('text')} />
           <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
           <ToolIcon icon={<Link size={18} />} label="Link" active={mode === 'connect'} onClick={() => setMode('connect')} />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 mr-2">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 hover:text-slate-900 text-slate-400"><Minus size={14} /></button>
            <span className="text-[10px] font-black text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 hover:text-slate-900 text-slate-400"><Plus size={14} /></button>
          </div>
          <button onClick={() => onSave(board)} className="h-9 md:h-10 px-3 md:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0">
            <Save size={14} /> <span className="hidden sm:inline">Sync Vault</span><span className="sm:hidden">Sync</span>
          </button>
        </div>
      </header>

      {/* Mobile Toolbar (Bottom) */}
      <div className="lg:hidden fixed bottom-14 left-1/2 -translate-x-1/2 z-[60] flex bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 shadow-2xl gap-1">
         <ToolIcon icon={<MousePointer2 size={16} />} active={mode === 'select'} onClick={() => setMode('select')} />
         <ToolIcon icon={<Move size={16} />} active={mode === 'pan'} onClick={() => setMode('pan')} />
         <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
         <ToolIcon icon={<Square size={16} />} onClick={() => addElement('rect')} />
         <ToolIcon icon={<Circle size={16} />} onClick={() => addElement('circle')} />
         <ToolIcon icon={<Diamond size={16} />} onClick={() => addElement('diamond')} />
         <ToolIcon icon={<Type size={16} />} onClick={() => addElement('text')} />
         <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
         <ToolIcon icon={<Link size={16} />} active={mode === 'connect'} onClick={() => setMode('connect')} />
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={stageRef}
        className={`flex-1 relative overflow-hidden outline-none transition-all ${mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={(e) => {
          if (mode === 'pan' || (e.button === 1)) {
            setIsPanning(true);
            return;
          }
          setSelectedId(null);
          setConnectionStartId(null);
        }}
        onTouchStart={(e) => {
          if (mode === 'pan' || e.touches.length > 1) {
            setIsPanning(true);
            return;
          }
          setSelectedId(null);
          setConnectionStartId(null);
        }}
        style={{ 
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1.5px, transparent 1.5px)', 
          backgroundSize: '32px 32px' 
        }}
      >
        <div 
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
            transformOrigin: '0 0',
          }}
          className="w-full h-full relative"
        >
          {/* Render Connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
              </marker>
            </defs>
            {board.connections.map((conn, idx) => {
              const start = getElementCenter(conn.fromId);
              const end = getElementCenter(conn.toId);
              return (
                <line 
                  key={idx} 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="#cbd5e1" strokeWidth="2" 
                  markerEnd="url(#arrowhead)"
                  strokeDasharray="4"
                />
              );
            })}
            {connectionStartId && (
              <line 
                x1={getElementCenter(connectionStartId).x} 
                y1={getElementCenter(connectionStartId).y} 
                x2={getElementCenter(connectionStartId).x} 
                y2={getElementCenter(connectionStartId).y}
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Render Elements */}
          {board.elements.sort((a,b) => a.zIndex - b.zIndex).map(el => (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el.id)}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const fakeEvent = {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  stopPropagation: () => e.stopPropagation()
                } as any;
                handleMouseDown(fakeEvent, el.id);
              }}
              className={`absolute flex items-center justify-center transition-shadow group ${selectedId === el.id ? 'ring-2 ring-blue-500 ring-offset-4 shadow-2xl z-[1000]' : 'shadow-md hover:shadow-lg'}`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                backgroundColor: el.color,
                borderRadius: el.type === 'circle' ? '50%' : el.type === 'diamond' ? '0' : '20px',
                transform: el.type === 'diamond' ? 'rotate(45deg)' : 'none',
                color: 'white',
                cursor: mode === 'connect' ? 'crosshair' : 'move',
                zIndex: el.zIndex
              }}
            >
              <div style={{ transform: el.type === 'diamond' ? 'rotate(-45deg)' : 'none' }} className="w-full h-full p-4 flex items-center justify-center text-center">
                <textarea 
                  className="bg-transparent border-none outline-none text-center font-bold text-xs md:text-sm w-full h-full resize-none placeholder-white/50 text-white scrollbar-hide"
                  value={el.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBoard(prev => ({ ...prev, elements: prev.elements.map(item => item.id === el.id ? { ...item, content: val } : item) }));
                  }}
                  onMouseDown={e => e.stopPropagation()}
                  onTouchStart={e => e.stopPropagation()}
                />
              </div>

              {/* Selection & Action Controls */}
              {selectedId === el.id && (
                <>
                  {/* Floating Action Bar */}
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl rounded-xl p-1 shadow-2xl animate-in zoom-in-95" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
                    <button onClick={deleteSelected} className="p-2 text-rose-400 hover:bg-white/10 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button onClick={() => changeLayer('up')} className="p-2 text-white hover:bg-white/10 rounded-lg" title="Bring Forward"><ArrowUp size={16} /></button>
                    <button onClick={() => changeLayer('down')} className="p-2 text-white hover:bg-white/10 rounded-lg" title="Send Backward"><ArrowDown size={16} /></button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                      value={el.color}
                      onChange={(e) => {
                        const c = e.target.value;
                        setBoard(prev => ({ ...prev, elements: prev.elements.map(item => item.id === el.id ? { ...item, color: c } : item) }));
                      }}
                    />
                  </div>

                  {/* Resize Handles */}
                  <div className="absolute inset-0 pointer-events-none">
                    <ResizeHandle dir="nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => { e.stopPropagation(); setIsResizing('nw'); }} />
                    <ResizeHandle dir="ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => { e.stopPropagation(); setIsResizing('ne'); }} />
                    <ResizeHandle dir="sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => { e.stopPropagation(); setIsResizing('sw'); }} />
                    <ResizeHandle dir="se" onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => { e.stopPropagation(); setIsResizing('se'); }} />
                  </div>
                </>
              )}

              {/* Visual feedback for connection mode */}
              {mode === 'connect' && connectionStartId === el.id && (
                <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-6 flex items-center justify-between text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-6 items-center">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {board.elements.length} <span className="hidden sm:inline">OBJECTS</span></span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {board.connections.length} <span className="hidden sm:inline">LINKS</span></span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
           {mode === 'connect' && <span className="text-blue-600 animate-pulse hidden sm:inline">Connection Mode Active: Click target shape</span>}
           <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 hidden sm:inline">SPACE to Pan</span>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="hidden sm:inline">AUTO-RECOVERY ON</span>
             <span className="sm:hidden">AUTO-ON</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

const ToolIcon = ({ icon, label, onClick, active }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl transition-all ${active ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
  >
    <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
    {label && <span className="text-[8px] font-black uppercase mt-1 tracking-tighter hidden md:inline">{label}</span>}
  </button>
);

const ResizeHandle = ({ dir, onMouseDown, onTouchStart }: { dir: string; onMouseDown: (e: React.MouseEvent) => void; onTouchStart: (e: React.TouchEvent) => void }) => {
  const positions: Record<string, string> = {
    nw: '-top-2 -left-2 cursor-nwse-resize',
    ne: '-top-2 -right-2 cursor-nesw-resize',
    sw: '-bottom-2 -left-2 cursor-nesw-resize',
    se: '-bottom-2 -right-2 cursor-nwse-resize'
  };
  return (
    <div 
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute w-4 h-4 md:w-5 md:h-5 bg-white border-2 border-blue-500 rounded-full shadow-md z-[1100] pointer-events-auto hover:scale-125 transition-transform ${positions[dir]}`}
    />
  );
};
