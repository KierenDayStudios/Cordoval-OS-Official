
import React from 'react';
import { 
  MessageSquare, Mail, Phone, Users, Zap, Search, Bell, Clock, 
  ChevronRight, Command, LayoutGrid, Radio, Share2, MoreHorizontal
} from 'lucide-react';
import { AppView } from '../types';

interface CommsDashboardProps {
  onNavigate: (view: AppView, id: string | null) => void;
}

export const CommsDashboard: React.FC<CommsDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F4F8] scrollbar-hide">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* Dynamic Comms Header */}
        <header className="flex items-center justify-between mb-10 bg-white/60 backdrop-blur-xl border border-white p-5 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg ring-4 ring-white">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Communication Hub</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synaptic Connection Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search threads, contacts, or logs..."
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none w-96 transition-all text-xs font-bold"
              />
            </div>
            <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><Bell size={18} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          
          {/* Main Grid Content */}
          <div className="space-y-8">
            <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl min-h-[340px] flex flex-col justify-between">
                <div className="relative z-10">
                   <h2 className="text-5xl font-black tracking-tighter italic leading-tight uppercase">Correspondence <br /> Architecture.</h2>
                   <p className="text-slate-400 text-base font-medium mt-6 max-w-sm">Manage all high-fidelity communications from a single sovereign layer.</p>
                </div>
                <div className="relative z-10 flex gap-4 mt-8">
                   <button onClick={() => onNavigate('client-vault', null)} className="px-8 py-4 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Open CRM</button>
                   <button className="px-8 py-4 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">New Broadcast</button>
                </div>
                <Share2 className="absolute -bottom-10 -right-10 text-white/5 w-80 h-80" />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <CommsTool icon={Radio} label="Live Feed" desc="Broadcasts" color="text-rose-500" bg="bg-rose-50" />
               <CommsTool icon={Mail} label="Unified Mail" desc="Local Bridge" color="text-amber-500" bg="bg-amber-50" />
               <CommsTool icon={Users} label="Contact Vault" desc="CRM" color="text-blue-500" bg="bg-blue-50" />
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 px-4">
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Synaptic Activity</h2>
                 <button className="text-[10px] font-black text-slate-400 uppercase">View All Logs</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Mail size={24} /></div>
                       <div>
                          <div className="text-base font-black text-slate-800">Sarah Mitchell</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Draft Sent • 2 mins ago</div>
                       </div>
                    </div>
                    <MoreHorizontal className="text-slate-200 group-hover:text-slate-400" />
                 </div>
                 <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><Phone size={24} /></div>
                       <div>
                          <div className="text-base font-black text-slate-800">Operational Sync</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completed • 45 mins ago</div>
                       </div>
                    </div>
                    <MoreHorizontal className="text-slate-200 group-hover:text-slate-400" />
                 </div>
              </div>
            </section>
          </div>

        </div>
      </div>

      <footer className="max-w-[1600px] mx-auto px-6 pb-12">
         <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[2.5rem] px-10 py-5 flex items-center justify-between">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <span>KDS COMMS OS v1.0</span>
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
            <button onClick={() => onNavigate('dashboard', null)} className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors">Return to Dashboard</button>
         </div>
      </footer>
    </div>
  );
};

const CommsTool = ({ icon: Icon, label, desc, color, bg }: any) => (
  <button className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
     <div className={`w-14 h-14 ${bg} ${color} rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
     </div>
     <h4 className="text-base font-black text-slate-900 tracking-tight">{label}</h4>
     <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">{desc}</p>
  </button>
);
