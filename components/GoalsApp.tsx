
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Target, Plus, Trash2, CheckCircle2, 
  X, Calendar, ChevronRight, Hash, Save, 
  Zap, Activity, Milestone, Flag, TrendingUp, Circle,
  Target as TargetIcon, Sparkles, LayoutGrid, Info
} from 'lucide-react';
import { Goal, GoalStatus, ChecklistItem } from '../types';

interface GoalsAppProps {
  goals: Goal[];
  onSaveGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onBack: () => void;
}

export const GoalsApp: React.FC<GoalsAppProps> = ({ 
  goals, onSaveGoal, onDeleteGoal, onBack 
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState<GoalStatus>('active');
  const [milestones, setMilestones] = useState<ChecklistItem[]>([]);
  const [newMilestone, setNewMilestone] = useState('');

  const activeGoal = useMemo(() => goals.find(g => g.id === activeId), [goals, activeId]);

  const handleSave = () => {
    if (!newTitle.trim()) return;
    
    const progress = milestones.length > 0 
      ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
      : 0;

    const goal: Goal = {
      id: activeId === 'new' ? Math.random().toString(36).substr(2, 9) : activeId!,
      title: newTitle,
      name: newTitle,
      description: newDesc,
      targetDate: newDate,
      status: newStatus,
      progress,
      milestones: milestones,
      updatedAt: Date.now(),
      tags: ['intention'],
      folderId: null,
      history: []
    };
    onSaveGoal(goal);
    setActiveId(null);
  };

  const startNew = () => {
    setActiveId('new');
    setNewTitle('');
    setNewDesc('');
    setNewDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setNewStatus('active');
    setMilestones([]);
  };

  const openGoal = (g: Goal) => {
    setActiveId(g.id);
    setNewTitle(g.title);
    setNewDesc(g.description);
    setNewDate(g.targetDate);
    setNewStatus(g.status);
    setMilestones(g.milestones || []);
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([...milestones, { id: Math.random().toString(), text: newMilestone, completed: false }]);
    setNewMilestone('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FBFDFF] overflow-hidden font-sans selection:bg-blue-100">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-blue-50 z-50 shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
               <Target size={16} className="md:w-5 md:h-5" />
             </div>
             <div className="truncate">
               <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tighter uppercase italic truncate">Intention Architect</h1>
               <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Strategic Manifestation Layer</p>
             </div>
          </div>
        </div>

        <button 
          onClick={startNew}
          className="h-9 md:h-10 px-3 md:px-6 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus size={14} /> <span className="hidden sm:inline">Design Intention</span><span className="sm:hidden">New</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-12 scrollbar-hide">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
           
           {/* Grid of Goals */}
           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {goals.length === 0 ? (
                <div className="col-span-full py-20 md:py-40 flex flex-col items-center justify-center space-y-6 opacity-30">
                   <Flag size={48} className="text-blue-200 md:w-16 md:h-16" />
                   <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em]">No Active Intentions</p>
                </div>
              ) : (
                goals.map(g => (
                  <div 
                    key={g.id}
                    onClick={() => openGoal(g)}
                    className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] bg-white border-2 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[280px] md:min-h-[340px] ${activeId === g.id ? 'border-blue-600 shadow-2xl scale-[1.02]' : 'border-slate-50 hover:border-blue-200 hover:shadow-xl'}`}
                  >
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                           <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-blue-100">{g.status}</span>
                           <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase">{new Date(g.targetDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight group-hover:text-blue-600 transition-colors">{g.title}</h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium line-clamp-3 mt-3 md:mt-4 leading-relaxed">{g.description}</p>
                     </div>

                     <div className="relative z-10 mt-6 md:mt-8">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">Ascension Progress</span>
                           <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase">{g.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${g.progress}%` }} />
                        </div>
                     </div>
                     <Activity className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-blue-500/5 w-40 h-40 md:w-64 md:h-64 group-hover:scale-110 transition-transform duration-[3s]" />
                  </div>
                ))
              )}
           </div>

           {/* Context Sidebar */}
           <div className="lg:col-span-4 space-y-4 md:space-y-8">
              <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                 <TargetIcon className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-white/5 w-32 h-32 md:w-48 md:h-48" />
                 <h3 className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 md:mb-6">Focus Metrics</h3>
                 <div className="space-y-6 md:space-y-8">
                    <div>
                       <span className="text-3xl md:text-4xl font-black">{goals.length}</span>
                       <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Managed Intentions</p>
                    </div>
                    <div className="w-full h-px bg-white/10" />
                    <div>
                       <span className="text-3xl md:text-4xl font-black text-emerald-500">{goals.filter(g => g.status === 'completed').length}</span>
                       <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Objectives Manifested</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-blue-50 shadow-sm">
                 <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-500 md:w-3.5 md:h-3.5" /> Philosophical Core
                 </h3>
                 <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed font-medium">
                    "Intention without architecture is merely a wish. Build the steps, manifest the reality."
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Goal Editor Overlay */}
      {activeId && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300" onClick={() => setActiveId(null)}>
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
           <div 
             className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right-12 duration-500 flex flex-col p-6 md:p-12 overflow-y-auto relative z-10"
             onClick={e => e.stopPropagation()}
           >
              <div className="flex items-center justify-between mb-8 md:mb-12">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shrink-0"><TargetIcon size={20} className="md:w-7 md:h-7" /></div>
                    <div>
                       <h2 className="text-lg md:text-2xl font-black text-slate-900 italic tracking-tighter uppercase">Objective Blueprint</h2>
                       <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Designing manifestation #ID_{activeId.slice(0, 4)}</p>
                    </div>
                 </div>
                 <button onClick={() => setActiveId(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all shrink-0"><X size={20} /></button>
              </div>

              <div className="space-y-8 md:space-y-10">
                 <div className="space-y-4 md:space-y-6">
                    <input 
                      className="w-full text-2xl md:text-4xl font-black text-slate-900 tracking-tighter italic outline-none border-none bg-transparent placeholder:text-blue-50"
                      placeholder="Goal Identity..."
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Timeline</label>
                          <input 
                            type="date" 
                            className="w-full h-12 px-6 bg-slate-50 border-none rounded-xl font-bold text-slate-800 text-xs outline-none"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Vibration</label>
                          <select 
                            className="w-full h-12 px-6 bg-slate-50 border-none rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-800 outline-none cursor-pointer appearance-none"
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value as any)}
                          >
                             <option value="active">Active</option>
                             <option value="on-hold">On Hold</option>
                             <option value="at-risk">At Risk</option>
                             <option value="completed">Completed</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <textarea 
                  className="w-full h-24 md:h-32 bg-slate-50 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-xs md:text-sm font-medium text-slate-700 outline-none resize-none placeholder:text-slate-200"
                  placeholder="The deeper context of this intention..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                 />

                 <div className="space-y-4 md:space-y-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ascension Milestones</label>
                    <div className="space-y-2 md:space-y-3">
                       {milestones.map(m => (
                         <div key={m.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl group transition-all hover:bg-white border border-transparent hover:border-slate-100">
                            <button 
                              onClick={() => setMilestones(milestones.map(x => x.id === m.id ? { ...x, completed: !x.completed } : x))}
                              className={`w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${m.completed ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 border border-slate-100'}`}
                            >
                               {m.completed ? <CheckCircle2 size={12} className="md:w-3.5 md:h-3.5" /> : <Circle size={12} className="md:w-3.5 md:h-3.5" />}
                            </button>
                            <span className={`text-[11px] md:text-xs font-bold flex-1 ${m.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{m.text}</span>
                            <button onClick={() => setMilestones(milestones.filter(x => x.id !== m.id))} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-300 hover:text-rose-500 shrink-0"><Trash2 size={14} /></button>
                         </div>
                       ))}
                       <div className="flex gap-2">
                          <input 
                            className="flex-1 h-12 px-4 md:px-6 bg-slate-50 border-none rounded-xl text-[11px] md:text-xs font-bold outline-none"
                            placeholder="Add next step..."
                            value={newMilestone}
                            onChange={e => setNewMilestone(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addMilestone()}
                          />
                          <button onClick={addMilestone} className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl shrink-0"><Plus size={20} /></button>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 md:pt-10 flex flex-col gap-3 md:gap-4">
                    <button 
                      onClick={handleSave}
                      className="w-full h-14 md:h-16 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl active:scale-95 transition-all"
                    >
                      Commit Intentions
                    </button>
                    {activeId !== 'new' && (
                      <button 
                        onClick={() => { onDeleteGoal(activeId); setActiveId(null); }}
                        className="w-full h-10 md:h-12 text-rose-500 font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-rose-50 rounded-xl transition-all"
                      >
                        Purge Artifact
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="h-10 bg-white border-t border-blue-50 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <span className="hidden sm:inline">INTENTION_MATRIX: CALIBRATED</span><span className="sm:hidden">CALIBRATED</span></span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="hidden sm:inline">LOCAL_PERSISTENCE: {goals.length} ARTIFACTS</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="hidden sm:inline">MANIFESTATION_LAYER_SYNCED</span>
           <span className="sm:hidden">SYNCED</span>
        </div>
      </footer>
    </div>
  );
};
