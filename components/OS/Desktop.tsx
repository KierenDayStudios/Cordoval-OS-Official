
import React, { useState, useEffect } from 'react';
import { 
  Monitor, Layout, Search, Zap, Clock, 
  HardDrive, Command, Bell, 
  Settings, LayoutGrid, 
  Maximize2, Minimize2, X,
  Battery, Wifi, Volume2,
  Cpu, Activity
} from 'lucide-react';
import { AppView, Note } from '../../types';

interface DesktopProps {
  onNavigate: (view: AppView, id: string | null) => void;
  stats: any;
  isWorkspaceConnected: boolean;
  onConnectWorkspace: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ 
  onNavigate, stats, isWorkspaceConnected, onConnectWorkspace 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const desktopIcons = [
    { id: 'docs', label: 'Documents', icon: 'https://cdn-icons-png.flaticon.com/512/281/281760.png' },
    { id: 'sheets', label: 'Spreadsheets', icon: 'https://cdn-icons-png.flaticon.com/512/281/281761.png' },
    { id: 'slides', label: 'Presentations', icon: 'https://cdn-icons-png.flaticon.com/512/281/281762.png' },
    { id: 'file-manager', label: 'File Explorer', icon: 'https://cdn-icons-png.flaticon.com/512/5994/5994754.png' },
    { id: 'code-editor', label: 'Code Studio', icon: 'https://cdn-icons-png.flaticon.com/512/606/606203.png' },
    { id: 'joymiz-ai', label: 'Joymiz AI', icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png' },
    { id: 'client-vault', label: 'Client Vault', icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { id: 'ledger', label: 'Finance', icon: 'https://cdn-icons-png.flaticon.com/512/2454/2454282.png' },
  ];

  return (
    <div className="flex-1 relative overflow-hidden bg-slate-900 font-sans">
      {/* Dynamic Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          alt="Wallpaper"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-transparent to-slate-900/80" />
      </div>

      {/* Desktop Icons Grid */}
      <div className="relative z-10 p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 auto-rows-max">
        {desktopIcons.map(icon => (
          <button 
            key={icon.id}
            onClick={() => onNavigate(icon.id as AppView, null)}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/10 hover:backdrop-blur-md transition-all border border-transparent hover:border-white/10"
          >
            <div className="w-16 h-16 relative group-hover:scale-110 transition-transform">
              <img src={icon.icon} className="w-full h-full object-contain drop-shadow-2xl" alt={icon.label} />
            </div>
            <span className="text-[11px] font-bold text-white text-center drop-shadow-md tracking-tight uppercase">{icon.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop Widgets */}
      <div className="absolute top-8 right-8 z-10 flex flex-col gap-6 w-80">
        {/* System Widget */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">System Status</h3>
            <Activity size={14} className="text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-tighter">CPU Load</span>
              </div>
              <span className="text-xs font-black text-emerald-400">12%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[12%] h-full bg-emerald-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive size={16} className="text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-tighter">Vault Usage</span>
              </div>
              <span className="text-xs font-black text-blue-400">2.4 GB</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[45%] h-full bg-blue-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Quick Actions</h3>
            <Zap size={14} className="text-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onConnectWorkspace}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${isWorkspaceConnected ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            >
              <HardDrive size={20} />
              <span className="text-[9px] font-black uppercase">{isWorkspaceConnected ? 'Linked' : 'Link'}</span>
            </button>
            <button 
              onClick={() => onNavigate('settings', null)}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Settings size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center Hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-white/30 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse pointer-events-none">
        Cordoval OS Active
      </div>
    </div>
  );
};
