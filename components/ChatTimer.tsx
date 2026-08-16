
import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, X, Play, Pause, RotateCcw } from 'lucide-react';

interface ChatTimerProps {
  duration: number;
  label?: string;
  onClose: () => void;
}

export const ChatTimer: React.FC<ChatTimerProps> = ({ duration, label, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="w-full max-w-xs bg-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TimerIcon size={14} className="text-blue-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label || 'Timer'}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * progress) / 100}
              className="text-blue-500 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black text-white tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all active:scale-90 shadow-lg shadow-blue-600/20"
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button 
            onClick={() => { setTimeLeft(duration); setIsActive(false); }}
            className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all active:scale-90"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {timeLeft === 0 && (
        <div className="mt-4 text-center animate-bounce">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Time's Up!</span>
        </div>
      )}
    </div>
  );
};
