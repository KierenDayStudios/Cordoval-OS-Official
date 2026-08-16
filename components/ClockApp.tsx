
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Timer, StopCircle, Play, Pause, 
  RotateCcw, Flag, Bell, ChevronRight, Zap,
  Volume2, VolumeX, Plus, Minus, Activity
} from 'lucide-react';

interface ClockAppProps {
  initialTab?: 'timer' | 'stopwatch';
  onBack: () => void;
}

export const ClockApp: React.FC<ClockAppProps> = ({ initialTab = 'timer', onBack }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'stopwatch'>(initialTab);

  // --- Timer State ---
  const [timerTime, setTimerTime] = useState(1500); // 25 mins in seconds
  const [initialTimerTime, setInitialTimerTime] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // --- Stopwatch State ---
  const [swTime, setSwTime] = useState(0); // in milliseconds
  const [isSwRunning, setIsSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timerTime > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning, timerTime]);

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerTime(initialTimerTime);
  };

  const setTimerDuration = (seconds: number) => {
    setIsTimerRunning(false);
    setTimerTime(seconds);
    setInitialTimerTime(seconds);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Stopwatch Logic
  useEffect(() => {
    if (isSwRunning) {
      startTimeRef.current = Date.now() - swTime;
      swIntervalRef.current = window.setInterval(() => {
        setSwTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    }
    return () => { if (swIntervalRef.current) clearInterval(swIntervalRef.current); };
  }, [isSwRunning]);

  const formatSw = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const resetSw = () => {
    setIsSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  const addLap = () => {
    setLaps(prev => [swTime, ...prev]);
  };

  const progress = (timerTime / initialTimerTime) * 100;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0D0D0F] text-white overflow-hidden font-sans">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/5 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/10 text-slate-500 hover:text-white rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/10 shrink-0">
             <button 
              onClick={() => setActiveTab('timer')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'timer' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
             >
               Timer
             </button>
             <button 
              onClick={() => setActiveTab('stopwatch')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stopwatch' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
             >
               Stopwatch
             </button>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
           <div className="h-10 px-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
              <Zap size={12} /> Core Logic Running
           </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto scrollbar-hide">
        {activeTab === 'timer' ? (
          <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
             {/* Radial Timer Visualizer */}
             <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-10 md:mb-16">
                <svg className="w-full h-full transform -rotate-90">
                   <circle 
                     cx={activeTab === 'timer' ? (window.innerWidth < 768 ? 128 : 160) : 160} 
                     cy={activeTab === 'timer' ? (window.innerWidth < 768 ? 128 : 160) : 160} 
                     r={window.innerWidth < 768 ? 110 : 140}
                     stroke="currentColor" strokeWidth="8"
                     fill="transparent" className="text-white/5"
                   />
                   <circle 
                     cx={activeTab === 'timer' ? (window.innerWidth < 768 ? 128 : 160) : 160} 
                     cy={activeTab === 'timer' ? (window.innerWidth < 768 ? 128 : 160) : 160} 
                     r={window.innerWidth < 768 ? 110 : 140}
                     stroke="currentColor" strokeWidth="8"
                     fill="transparent" className="text-emerald-500 transition-all duration-300"
                     strokeDasharray={window.innerWidth < 768 ? 690 : 880}
                     strokeDashoffset={(window.innerWidth < 768 ? 690 : 880) - ((window.innerWidth < 768 ? 690 : 880) * progress) / 100}
                     strokeLinecap="round"
                   />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums">{formatTimer(timerTime)}</span>
                   <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Remaining</p>
                </div>
             </div>

             <div className="flex flex-col gap-8 md:gap-10 w-full max-w-sm">
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                   {[300, 900, 1500, 3600].map(s => (
                     <button 
                       key={s}
                       onClick={() => setTimerDuration(s)}
                       className="py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                     >
                       {s / 60}m
                     </button>
                   ))}
                </div>

                <div className="flex items-center justify-center gap-4 md:gap-6">
                   <button 
                    onClick={resetTimer}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                   >
                     <RotateCcw size={20} className="md:w-6 md:h-6" />
                   </button>
                   <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all active:scale-95 shrink-0 ${isTimerRunning ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
                   >
                     {isTimerRunning ? <Pause size={32} className="md:w-10 md:h-10" fill="white" /> : <Play size={32} className="md:w-10 md:h-10 ml-1 md:ml-2" fill="white" />}
                   </button>
                   <button className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
                      <Volume2 size={20} className="md:w-6 md:h-6" />
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col items-center">
                <div className="relative mb-8 md:mb-12">
                   <div className="text-6xl md:text-8xl font-black tracking-tighter italic tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
                     {formatSw(swTime)}
                   </div>
                </div>
                
                <div className="flex items-center gap-6 md:gap-8">
                   <button 
                    onClick={resetSw}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                   >
                     <RotateCcw size={24} className="md:w-7 md:h-7" />
                   </button>
                   <button 
                    onClick={() => setIsSwRunning(!isSwRunning)}
                    className={`w-20 h-20 md:w-28 md:h-28 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl transition-all active:scale-95 shrink-0 ${isSwRunning ? 'bg-rose-500 shadow-rose-500/20' : 'bg-white text-slate-900 shadow-white/10'}`}
                   >
                     {isSwRunning ? <Pause size={32} className="md:w-12 md:h-12" fill="currentColor" /> : <Play size={32} className="md:w-12 md:h-12 ml-1 md:ml-2" fill="currentColor" />}
                   </button>
                   <button 
                    onClick={addLap}
                    disabled={!isSwRunning && swTime === 0}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 shrink-0"
                   >
                     <Flag size={24} className="md:w-7 md:h-7" />
                   </button>
                </div>
             </div>

             <div className="bg-white/5 rounded-[2rem] md:rounded-[3.5rem] border border-white/10 flex flex-col h-[300px] md:h-[500px] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between shrink-0">
                   <h3 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Lap Intelligence</h3>
                   <span className="text-[8px] md:text-[10px] font-black px-2 py-0.5 bg-white/10 text-white rounded-md">{laps.length} Splits</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 scrollbar-hide">
                   {laps.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                        <Activity size={32} className="md:w-12 md:h-12 mb-4" />
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">No laps recorded</p>
                     </div>
                   ) : (
                     laps.map((lap, i) => (
                       <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 animate-in slide-in-from-right-4 duration-300">
                          <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase">Lap {laps.length - i}</span>
                          <span className="text-lg md:text-xl font-black tabular-nums">{formatSw(lap)}</span>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="h-10 bg-white/5 border-t border-white/10 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">
         <div className="flex gap-4 md:gap-8 items-center">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <span className="hidden sm:inline">SYSTEM_OS: STABLE</span><span className="sm:hidden">STABLE</span></span>
            <span className="text-slate-800 hidden sm:inline">|</span>
            <span className="hidden sm:inline">ENV_LAYER: PERSONAL</span>
         </div>
         <div className="flex items-center gap-2 md:gap-4 text-emerald-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">HIGH_FIDELITY_TIME_TRACKING</span>
            <span className="sm:hidden">TRACKING_ON</span>
         </div>
      </footer>
    </div>
  );
};
