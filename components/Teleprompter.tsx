import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Edit3, FlipHorizontal, ArrowLeft, Type, RotateCcw } from 'lucide-react';

export const Teleprompter: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [text, setText] = useState('Welcome to the Teleprompter App!\n\nPaste your script or notes right here to get started.\n\nYou can easily adjust the speed of the scroll and font size using the controls overlay.\n\nMirror the text if you are recording using a teleprompter glass rig system.\n\nTap anywhere on the prompt screen to hide or show the controls overlay while you are reading.\n\nHappy recording!');
  const [isEditing, setIsEditing] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // Speed multiplier 1-20
  const [fontSize, setFontSize] = useState(56); // 24 to 144
  const [isMirrored, setIsMirrored] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isPlaying && !isEditing) {
      const animate = () => {
        if (scrollRef.current) {
          // Tune scrolling speed logic here
          scrollRef.current.scrollTop += (speed * 0.4);
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speed, isEditing]);

  const resetScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setIsPlaying(false);
  };

  if (isEditing) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F8F9FB]">
        <header className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teleprompter</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Script Editor</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(false)} 
            className="px-6 py-3 bg-fuchsia-600 text-white rounded-xl hover:bg-fuchsia-500 transition-colors shadow-lg shadow-fuchsia-500/20 font-bold"
          >
            Start Prompting
          </button>
        </header>
        
        <main className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col max-w-5xl mx-auto w-full">
           <textarea 
             value={text}
             onChange={(e) => setText(e.target.value)}
             placeholder="Enter or paste your script here..."
             className="flex-1 w-full bg-white border border-slate-200 shadow-sm rounded-[2rem] p-6 md:p-10 text-xl font-sans resize-none focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 custom-scrollbar"
             style={{ lineHeight: 1.6 }}
           />
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white relative overflow-hidden font-sans">
      
      {/* Absolute Back Button for emergencies when playing */}
      <div className={`absolute top-6 left-6 z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => { setIsEditing(true); setIsPlaying(false); }}
          className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto scrollbar-hide pb-[50vh] pt-[50vh] px-6 md:px-20 lg:px-40 ${isMirrored ? 'scale-x-[-1]' : ''}`}
        onClick={() => setShowControls(!showControls)}
        style={{ cursor: 'pointer' }}
      >
         <div 
           className="max-w-4xl mx-auto whitespace-pre-wrap text-center transition-all duration-300 pointer-events-none text-slate-100"
           style={{ 
             fontSize: `${fontSize}px`,
             lineHeight: 1.4,
             fontWeight: 600
           }}
         >
           {text}
         </div>
      </div>

      {/* Floating Controls Grid overlay */}
      <div className={`absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-5 md:p-6 rounded-[2rem] w-[95%] md:w-auto md:min-w-[600px] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showControls ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'}`}>
         
         <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
           
           <div className="flex gap-3">
              <button 
                onClick={() => { setIsEditing(true); setIsPlaying(false); resetScroll(); }}
                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-white"
                title="Edit Script"
              >
                <Edit3 size={20} />
              </button>
              <button 
                onClick={resetScroll}
                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-white"
                title="Restart"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={() => setIsMirrored(!isMirrored)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors ${isMirrored ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                title="Mirror Text"
              >
                <FlipHorizontal size={20} />
              </button>
           </div>

           <div className="flex-1 flex flex-col gap-5 w-full bg-black/30 p-4 rounded-2xl">
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-right">Speed</span>
                 <input 
                   type="range" min="1" max="20" step="0.5" value={speed} 
                   onChange={(e) => setSpeed(Number(e.target.value))} 
                   className="flex-1 h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer outline-none" 
                 />
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-right flex justify-end"><Type size={14} /></span>
                 <input 
                   type="range" min="24" max="144" value={fontSize} 
                   onChange={(e) => setFontSize(Number(e.target.value))} 
                   className="flex-1 h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer outline-none" 
                 />
              </div>
           </div>

           <div className="w-full md:w-auto flex justify-center pb-2 md:pb-0 shrink-0">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/20 rounded-[1.25rem] flex items-center justify-center hover:scale-105 hover:bg-fuchsia-400 transition-all font-bold"
              >
                 {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-2" />}
              </button>
           </div>

         </div>
         <p className="text-center text-[9px] text-white/30 pt-3 pb-1 font-black uppercase tracking-widest hidden md:block border-t border-white/5 mt-4">Tap on the text to hide/show these controls</p>
      </div>

    </div>
  );
};
