
import React, { useState } from 'react';
import { 
  LayoutGrid, Search, Bell, Clock, 
  Wifi, Volume2, Battery, Command,
  Home, Settings, HardDrive, Shield,
  ChevronUp, User, Power
} from 'lucide-react';
import { AppView } from '../../types';

interface TaskbarProps {
  currentView: AppView;
  onNavigate: (view: AppView, id: string | null) => void;
  isWorkspaceConnected: boolean;
  currentTime: Date;
}

export const Taskbar: React.FC<TaskbarProps> = ({ 
  currentView, onNavigate, isWorkspaceConnected, currentTime 
}) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const pinnedApps = [
    { id: 'docs', icon: 'https://cdn-icons-png.flaticon.com/512/281/281760.png', label: 'Docs' },
    { id: 'sheets', icon: 'https://cdn-icons-png.flaticon.com/512/281/281761.png', label: 'Sheets' },
    { id: 'slides', icon: 'https://cdn-icons-png.flaticon.com/512/281/281762.png', label: 'Slides' },
    { id: 'file-manager', icon: 'https://cdn-icons-png.flaticon.com/512/5994/5994754.png', label: 'Files' },
    { id: 'joymiz-ai', icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png', label: 'AI' },
  ];

  return (
    <div className="h-14 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-2 z-[1000] relative font-sans">
      
      {/* Start Button & Pinned Apps */}
      <div className="flex items-center gap-1 h-full">
        <button 
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`w-12 h-11 rounded-lg flex items-center justify-center transition-all ${isStartMenuOpen ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Command size={18} className="text-white" />
          </div>
        </button>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {pinnedApps.map(app => (
          <button 
            key={app.id}
            onClick={() => onNavigate(app.id as AppView, null)}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all group relative ${currentView === app.id ? 'bg-white/10 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-400 after:rounded-full' : 'hover:bg-white/10'}`}
            title={app.label}
          >
            <img src={app.icon} className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" alt={app.label} />
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-1 h-full">
        <button className="h-11 px-3 rounded-lg hover:bg-white/10 flex items-center gap-2 transition-all">
          <ChevronUp size={14} className="text-white/40" />
        </button>

        <div className="flex items-center gap-3 px-3 h-11 rounded-lg hover:bg-white/10 transition-all text-white/80">
          <Wifi size={16} className={isWorkspaceConnected ? 'text-emerald-400' : 'text-amber-400'} />
          <Volume2 size={16} />
          <Battery size={16} className="rotate-90" />
        </div>

        <button 
          onClick={() => onNavigate('dashboard', null)}
          className="h-11 px-4 rounded-lg hover:bg-white/10 flex flex-col items-end justify-center transition-all text-white"
        >
          <span className="text-[11px] font-black tracking-tighter leading-none">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
            {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </button>

        <div className="w-[2px] h-full bg-transparent hover:bg-white/20 transition-all cursor-pointer ml-1" title="Show Desktop" onClick={() => onNavigate('dashboard', null)} />
      </div>

      {/* Start Menu Popup */}
      {isStartMenuOpen && (
        <div className="absolute bottom-16 left-2 w-[400px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-200 z-[1001]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Operator</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">System Administrator</p>
              </div>
            </div>
            <button 
              onClick={() => { setIsStartMenuOpen(false); onNavigate('landing', null); }}
              className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
            >
              <Power size={18} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { id: 'docs', label: 'Docs', icon: 'https://cdn-icons-png.flaticon.com/512/281/281760.png' },
              { id: 'sheets', label: 'Sheets', icon: 'https://cdn-icons-png.flaticon.com/512/281/281761.png' },
              { id: 'slides', label: 'Slides', icon: 'https://cdn-icons-png.flaticon.com/512/281/281762.png' },
              { id: 'calendar', label: 'Calendar', icon: 'https://cdn-icons-png.flaticon.com/512/281/281764.png' },
              { id: 'project-manager', label: 'Projects', icon: 'https://cdn-icons-png.flaticon.com/512/5994/5994754.png' },
              { id: 'client-vault', label: 'Clients', icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
              { id: 'ledger', label: 'Finance', icon: 'https://cdn-icons-png.flaticon.com/512/2454/2454282.png' },
              { id: 'settings', label: 'Settings', icon: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png' },
            ].map(app => (
              <button 
                key={app.id}
                onClick={() => { onNavigate(app.id as AppView, null); setIsStartMenuOpen(false); }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 transition-all"
              >
                <img src={app.icon} className="w-8 h-8 object-contain" alt={app.label} />
                <span className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">{app.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { onNavigate('settings', null); setIsStartMenuOpen(false); }} className="text-white/40 hover:text-white transition-colors"><Settings size={18} /></button>
              <button onClick={() => { onNavigate('file-manager', null); setIsStartMenuOpen(false); }} className="text-white/40 hover:text-white transition-colors"><HardDrive size={18} /></button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Vault Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
