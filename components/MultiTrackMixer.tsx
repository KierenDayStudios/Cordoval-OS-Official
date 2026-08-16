import React, { useState } from 'react';
import { ArrowLeft, Plus, Volume2, Play, Sliders, Trash2, Pause } from 'lucide-react';

export const MultiTrackMixer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tracks, setTracks] = useState([{ id: 1, name: 'Voiceover_Take2.mp3', vol: 90 }, { id: 2, name: 'Background_Beat.wav', vol: 35 }]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Mixer</h1>
        <label className="p-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-xl hover:bg-fuchsia-500/30 transition-colors cursor-pointer">
          <Plus size={18} />
          <input 
            type="file" 
            accept="audio/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setTracks([...tracks, { id: Date.now(), name: file.name, vol: 50 }]);
              e.target.value = '';
            }}
          />
        </label>
      </header>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {tracks.map(track => (
            <div key={track.id} className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-white/5 flex flex-col md:flex-row md:items-center gap-6 shadow-xl">
              <div className="flex items-center gap-4 md:w-1/3 shrink-0">
                <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-400 rounded-2xl flex items-center justify-center shrink-0">
                  <Sliders size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold truncate text-sm">{track.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Active Track</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                <Volume2 size={16} className="text-slate-500 shrink-0" />
                <input 
                  type="range" 
                  value={track.vol} 
                  onChange={(e) => setTracks(tracks.map(t => t.id === track.id ? {...t, vol: parseInt(e.target.value)} : t))} 
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" 
                />
                <span className="text-xs font-mono font-medium text-slate-300 w-10 text-right">{track.vol}%</span>
              </div>

              <div className="flex justify-end mt-2 md:mt-0">
                <button onClick={() => setTracks(tracks.filter(t => t.id !== track.id))} className="text-slate-500 hover:text-rose-400 transition-colors p-2 bg-white/5 rounded-xl hover:bg-rose-500/10">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <label className="w-full py-6 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 font-bold hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Plus size={18} /> Add Audio Layer
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setTracks([...tracks, { id: Date.now(), name: file.name, vol: 50 }]);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-slate-900 border-t border-white/10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
           <button onClick={() => setIsPlaying(!isPlaying)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isPlaying ? 'bg-white/10 text-white' : 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:bg-fuchsia-400 hover:scale-105'}`}>
             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
           </button>
           
           <div className="flex-1 bg-slate-950 rounded-2xl border border-white/5 relative overflow-hidden flex items-center px-4 gap-[2px] h-14">
              {Array.from({length: 40}).map((_, i) => (
                <div key={i} className={`flex-1 rounded-full ${isPlaying ? 'bg-fuchsia-500' : 'bg-slate-800'}`} style={{ height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%', transition: 'height 0.15s ease-out' }} />
              ))}
           </div>

           <button className="px-6 py-4 bg-white text-slate-900 font-black tracking-tight uppercase text-xs rounded-2xl shadow-lg hover:scale-105 transition-transform shrink-0 hidden md:block">
             Export Master Mix
           </button>
        </div>
      </div>
    </div>
  );
}
