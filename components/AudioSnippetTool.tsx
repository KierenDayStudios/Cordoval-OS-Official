import React, { useState } from 'react';
import { ArrowLeft, Upload, Scissors, Play, Download, Music } from 'lucide-react';

export const AudioSnippetTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:30');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Audio Snippet</h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center gap-6">
        {!file ? (
          <label className="w-full max-w-lg aspect-video border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-slate-500 hover:text-amber-400">
            <Music size={48} className="opacity-50" />
            <span className="font-bold tracking-tight">Upload Audio File</span>
            <input type="file" accept="audio/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
        ) : (
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl p-6 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                <Music size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold truncate">{file.name}</h3>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-24 bg-slate-950 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                <div className="flex items-center gap-1 opacity-20">
                   {Array.from({length: 40}).map((_, i) => (
                     <div key={i} className="w-1 bg-amber-500 rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
                   ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 block">Start Time</label>
                  <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 text-center font-mono focus:ring-2 focus:ring-amber-500/20 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 block">End Time</label>
                  <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 text-center font-mono focus:ring-2 focus:ring-amber-500/20 transition-all" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all">
                  <Play size={18} /> Preview
                </button>
                <button className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20">
                  <Scissors size={18} /> Cut & Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
