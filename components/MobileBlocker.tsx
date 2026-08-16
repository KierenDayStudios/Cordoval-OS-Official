import React from 'react';
import { Smartphone, Monitor, ShieldAlert, Command } from 'lucide-react';

interface MobileBlockerProps {
  onBack?: () => void;
}

export const MobileBlocker: React.FC<MobileBlockerProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-[#0f172a] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-900 shadow-2xl mb-12 animate-bounce">
          <Smartphone size={48} />
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-8">
          <ShieldAlert size={14} /> System Restriction
        </div>

        <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none uppercase mb-6">
          Desktop Only <br />
          <span className="text-slate-500">Platform.</span>
        </h1>

        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-12 px-4">
          This advanced layer is only for PC due to the complexity and size, Try another layer.
        </p>

        {onBack && (
          <button 
            onClick={onBack}
            className="px-8 h-12 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            Back to Mission Selector
          </button>
        )}

        <p className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
          Digital Sovereignty Awaits.
        </p>
      </div>
    </div>
  );
};
