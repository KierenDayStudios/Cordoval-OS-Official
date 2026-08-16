import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Target, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

export const DeadlineCountdown: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [eventName, setEventName] = useState(() => localStorage.getItem('cordoval_deadline_name') || '');
  const [eventDesc, setEventDesc] = useState(() => localStorage.getItem('cordoval_deadline_desc') || '');
  const [targetDate, setTargetDate] = useState<string>(() => {
    return localStorage.getItem('cordoval_deadline_date') || (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 16);
    })();
  });

  useEffect(() => {
//     localStorage.setItem('cordoval_deadline_name', eventName);
//     localStorage.setItem('cordoval_deadline_desc', eventDesc);
//     localStorage.setItem('cordoval_deadline_date', targetDate);
  }, [eventName, eventDesc, targetDate]);

  const handleSave = () => {
    const backup = { eventName, eventDesc, targetDate };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "deadline_countdown_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.eventName) setEventName(parsed.eventName);
        if (parsed.eventDesc) setEventDesc(parsed.eventDesc);
        if (parsed.targetDate) setTargetDate(parsed.targetDate);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [timeLeft, setTimeLeft] = useState<{
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ years, months, days, hours, minutes, seconds });
    };

    calcTime();
    const int = setInterval(calcTime, 1000);
    return () => clearInterval(int);
  }, [targetDate]);

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-950 text-white relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Controls */}
      <div className="w-full md:w-80 bg-black/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
              <Timer size={16} />
            </div>
            <h1 className="font-bold text-white text-sm">Ops Countdown</h1>
          </div>
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Countdown" compact />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
             <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2 block">Event Name</label>
               <input 
                 type="text" 
                 value={eventName}
                 onChange={e => setEventName(e.target.value)}
                 className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-red-500/50 transition-colors"
               />
             </div>

             <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2 block">Description</label>
               <textarea 
                 value={eventDesc}
                 onChange={e => setEventDesc(e.target.value)}
                 className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 outline-none focus:border-red-500/50 transition-colors resize-none h-24"
               />
             </div>

             <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2 block">Target Date & Time</label>
               <input 
                 type="datetime-local" 
                 value={targetDate}
                 onChange={e => setTargetDate(e.target.value)}
                 className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-white outline-none focus:border-red-500/50 transition-colors [color-scheme:dark]"
               />
             </div>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center justify-center relative z-10">
         
         <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-black uppercase tracking-widest">
                <Target size={14} /> Mission Critical
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                {eventName}
              </h2>
              <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                {eventDesc}
              </p>
            </div>

            {timeLeft && (
               <div className="grid grid-cols-2 md:grid-cols-6 gap-4 w-full mt-12">
                 {[
                   { label: 'Years', value: timeLeft.years },
                   { label: 'Months', value: timeLeft.months },
                   { label: 'Days', value: timeLeft.days },
                   { label: 'Hours', value: timeLeft.hours },
                   { label: 'Minutes', value: timeLeft.minutes },
                   { label: 'Seconds', value: timeLeft.seconds },
                 ].map((unit, idx) => (
                   <div key={idx} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center transform transition-transform hover:scale-105 hover:border-red-500/50">
                      <span className="text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        {unit.value.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                        {unit.label}
                      </span>
                   </div>
                 ))}
               </div>
            )}

            {timeLeft && Object.values(timeLeft).every(v => v === 0) && (
              <div className="mt-8 px-8 py-4 bg-red-500 text-white rounded-2xl flex items-center gap-3 font-black text-xl uppercase tracking-widest animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                <CheckCircle2 size={28} />
                T-Zero Reached
              </div>
            )}
         </div>

      </div>
    </div>
  );
};
