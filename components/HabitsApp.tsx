
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Award, Plus, Trash2, CheckCircle2, 
  Flame, Calendar, Sparkles, X, Activity, Zap,
  BarChart3, Smile, TrendingUp, Info
} from 'lucide-react';
import { Habit } from '../types';

interface HabitsAppProps {
  habits: Habit[];
  onSaveHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onBack: () => void;
}

export const HabitsApp: React.FC<HabitsAppProps> = ({ 
  habits = [], onSaveHabit, onDeleteHabit, onBack 
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (h: Habit) => {
    const completedDays = h.completedDays || [];
    const doneToday = completedDays.includes(todayStr);
    const newDays = doneToday 
      ? completedDays.filter(d => d !== todayStr)
      : [...completedDays, todayStr];
    onSaveHabit({ ...h, completedDays: newDays, updatedAt: Date.now() });
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTitle,
      title: newTitle,
      icon: 'sparkles',
      color: 'emerald',
      completedDays: [],
      updatedAt: Date.now(),
      tags: ['ritual'],
      folderId: null,
      history: []
    };
    onSaveHabit(habit);
    setNewTitle('');
    setShowAdd(false);
  };

  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    const completedDays = habit.completedDays || [];
    const sorted = [...completedDays].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let current = new Date(todayStr);
    
    const lastCompletedStr = sorted[0];
    if (!lastCompletedStr) return 0;
    
    const lastCompleted = new Date(lastCompletedStr);
    if (isNaN(lastCompleted.getTime())) return 0;

    const diffToToday = Math.floor((new Date(todayStr).getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
    if (diffToToday > 1) return 0;

    for (let i = 0; i < sorted.length; i++) {
       const date = new Date(sorted[i]);
       if (isNaN(date.getTime())) continue;
       const diff = Math.floor((current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
       if (diff <= 1) {
          streak++;
          current = date;
       } else {
          break;
       }
    }
    return streak;
  };

  const magnitudeStats = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { bestStreak: 0, efficiency: 0, completedToday: 0, heatmap: [] };

    const streaks = habits.map(h => calculateStreak(h));
    const bestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
    const completedToday = habits.filter(h => (h.completedDays || []).includes(todayStr)).length;

    let totalPossible = totalHabits * 30;
    let totalCompleted = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    habits.forEach(h => {
      (h.completedDays || []).forEach(day => {
        const d = new Date(day);
        if (!isNaN(d.getTime()) && d >= thirtyDaysAgo) totalCompleted++;
      });
    });
    
    const efficiency = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const heatmap = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = habits.filter(h => (h.completedDays || []).includes(dStr)).length;
      heatmap.push({ date: dStr, count, percent: count / totalHabits });
    }

    return { bestStreak, efficiency, completedToday, heatmap };
  }, [habits, todayStr]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFDFB] overflow-hidden font-sans selection:bg-rose-100">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-rose-50 z-50 shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
               <Award size={16} className="md:w-5 md:h-5" />
             </div>
             <div className="truncate">
               <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tighter uppercase italic truncate">Consistency Rituals</h1>
               <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Human Magnitude Engine</p>
             </div>
          </div>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="h-9 md:h-10 px-3 md:px-6 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl hover:bg-rose-600 transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus size={14} /> <span className="hidden sm:inline">Establish Ritual</span><span className="sm:hidden">New</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-12 scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {habits.length === 0 ? (
                <div className="col-span-full py-20 md:py-40 flex flex-col items-center text-center space-y-6 opacity-30">
                   <Activity size={48} className="text-slate-300 md:w-16 md:h-16" />
                   <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em]">No Rituals Defined</p>
                </div>
              ) : (
                habits.map(h => {
                  const completedDays = h.completedDays || [];
                  const doneToday = completedDays.includes(todayStr);
                  const streak = calculateStreak(h);
                  return (
                    <div 
                      key={h.id}
                      className={`p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border-2 transition-all group relative overflow-hidden ${doneToday ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-50 hover:border-rose-100 hover:bg-rose-50/10'}`}
                    >
                       <div className="flex items-center justify-between mb-6 md:mb-8">
                          <button 
                            onClick={() => handleToggle(h)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all ${doneToday ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-300 border border-slate-100 group-hover:text-rose-50'}`}
                          >
                             {doneToday ? <CheckCircle2 size={24} className="md:w-8 md:h-8" /> : <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-current" />}
                          </button>
                          <button onClick={() => onDeleteHabit(h.id)} className="p-2 text-slate-100 hover:text-rose-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"><Trash2 size={16} /></button>
                       </div>
                       
                       <h3 className={`text-xl md:text-2xl font-black tracking-tighter mb-4 uppercase italic ${doneToday ? 'text-rose-900 line-through opacity-50' : 'text-slate-900'}`}>{h.title || h.name}</h3>
                       
                       <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                             <Flame size={16} className={streak > 0 ? 'text-amber-500' : 'text-slate-200'} />
                             <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase">{streak} Day Streak</span>
                          </div>
                          <div className="flex items-center gap-1">
                             {[...Array(5)].map((_, i) => (
                               <div key={i} className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${i < streak ? 'bg-rose-500' : 'bg-slate-100'}`} />
                             ))}
                          </div>
                       </div>

                       <Activity className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 text-rose-500/5 w-24 h-24 md:w-40 md:h-40 group-hover:scale-125 transition-transform" />
                    </div>
                  );
                })
              )}
           </div>

           <section className="bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <Zap className="absolute -bottom-10 -right-10 md:-bottom-20 md:-right-20 text-white/5 w-40 h-40 md:w-80 md:h-80" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                 <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase mb-3 md:mb-4">Magnitude Heatmap</h3>
                    <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-sm mb-6 md:mb-8">Visualization of your human output consistency across the last 28 operational cycles.</p>
                    <div className="flex items-center gap-6 md:gap-8">
                       <div className="flex flex-col">
                          <span className="text-2xl md:text-3xl font-black text-rose-500">{magnitudeStats.completedToday}</span>
                          <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Today's Resolve</span>
                       </div>
                       <div className="w-px h-8 md:h-10 bg-white/10" />
                       <div className="flex flex-col">
                          <span className="text-2xl md:text-3xl font-black text-emerald-500">{magnitudeStats.efficiency}%</span>
                          <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency Rating</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {magnitudeStats.heatmap.map((day, i) => (
                      <div 
                        key={i} 
                        title={`${day.date}: ${day.count} habits`}
                        className={`aspect-square rounded-md md:rounded-lg transition-all ${day.percent > 0.7 ? 'bg-rose-500' : day.percent > 0.4 ? 'bg-rose-400' : day.percent > 0 ? 'bg-rose-300 opacity-40' : 'bg-white/5'}`} 
                      />
                    ))}
                 </div>
              </div>
           </section>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 md:p-6">
           <div className="bg-white rounded-[2rem] md:rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl border border-white animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Establish Ritual</h2>
                 <button onClick={() => setShowAdd(false)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Identity</label>
                    <input 
                      placeholder="Meditation, Deep Work..." 
                      className="w-full h-12 md:h-14 px-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      autoFocus
                    />
                 </div>
                 <button 
                  onClick={handleAdd}
                  className="w-full h-14 md:h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all active:scale-95"
                 >
                   Deploy Ritual
                 </button>
              </div>
           </div>
        </div>
      )}

      <footer className="h-10 bg-white border-t border-rose-50 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> <span className="hidden sm:inline">RITUAL_PROTOCOL: STABLE</span><span className="sm:hidden text-[7px]">RITUAL_STABLE</span></span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="hidden sm:inline">LOCAL_VAULT_SYNC: OK</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-rose-500">
           <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
           <span className="hidden sm:inline">MAGNITUDE_TRACKING_ON</span>
           <span className="sm:hidden text-[7px]">TRACKING_ON</span>
        </div>
      </footer>
    </div>
  );
};
