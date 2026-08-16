
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Plus, Copy, 
  Instagram, Twitter, Linkedin, Youtube, Globe, MoreHorizontal,
  Trash2, Calendar as CalendarIcon, CheckCircle2, Clock, 
  X, ExternalLink, Zap, Info, Share2, Filter
} from 'lucide-react';
import { ContentPlan, ContentItem, ContentPlatform, ContentStatus } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface ContentCalendarProps {
  plans: ContentPlan[];
  onSavePlan: (plan: ContentPlan) => void;
  onBack: () => void;
}

const PLATFORMS: { id: ContentPlatform; icon: any; color: string; bg: string }[] = [
  { id: 'instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'twitter', icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'linkedin', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'youtube', icon: Youtube, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'tiktok', icon: Share2, color: 'text-slate-900', bg: 'bg-slate-100' },
];

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ plans, onSavePlan, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const currentPlan = useMemo(() => {
    return plans.find(p => p.monthKey === monthKey) || {
      id: Math.random().toString(36).substr(2, 9),
      name: `Content Plan ${monthKey}`,
      monthKey,
      days: {},
      updatedAt: Date.now(),
      tags: [],
      folderId: null,
      history: []
    };
  }, [plans, monthKey]);

  const handleSaveFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `content_plan_${monthKey}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.monthKey && parsed.days) {
          onSavePlan(parsed);
        }
      } catch (err) {
        alert("Invalid Content Strategy JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleAddItem = (day: number) => {
    const newItem: ContentItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Content Entry',
      platform: 'instagram',
      status: 'draft',
      notes: '',
      time: '12:00'
    };
    
    const updatedPlan = {
      ...currentPlan,
      days: {
        ...currentPlan.days,
        [day]: [...(currentPlan.days[day] || []), newItem]
      },
      updatedAt: Date.now()
    };
    onSavePlan(updatedPlan);
    setEditingItem(newItem);
    setSelectedDay(day);
  };

  const handleUpdateItem = (day: number, itemId: string, updates: Partial<ContentItem>) => {
    const updatedPlan = {
      ...currentPlan,
      days: {
        ...currentPlan.days,
        [day]: currentPlan.days[day].map(item => item.id === itemId ? { ...item, ...updates } : item)
      },
      updatedAt: Date.now()
    };
    onSavePlan(updatedPlan);
  };

  const handleRemoveItem = (day: number, itemId: string) => {
    const updatedPlan = {
      ...currentPlan,
      days: {
        ...currentPlan.days,
        [day]: currentPlan.days[day].filter(item => item.id !== itemId)
      },
      updatedAt: Date.now()
    };
    onSavePlan(updatedPlan);
    if (editingItem?.id === itemId) setEditingItem(null);
  };

  const cloneToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const nextKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const nextPlan: ContentPlan = {
      ...currentPlan,
      id: Math.random().toString(36).substr(2, 9),
      name: `Content Plan ${nextKey}`,
      monthKey: nextKey,
      updatedAt: Date.now()
    };
    
    onSavePlan(nextPlan);
    setCurrentDate(nextMonth);
    alert(`Content Strategy cloned to ${nextMonth.toLocaleString('default', { month: 'long' })}!`);
  };

  const calendarGrid = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return cells;
  }, [firstDayOfMonth, daysInMonth]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FBFBFC] overflow-hidden font-sans">
      {/* Header */}
      <header className="px-4 md:px-10 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-2 md:gap-3">
              <CalendarIcon size={20} className="text-indigo-600 md:w-6 md:h-6" />
              Content Strategy
            </h1>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Multi-Platform Lifecycle Manager</p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
           <SaveLoadControls onSave={handleSaveFile} onLoad={handleLoadFile} label="Content Plan" compact />
           <div className="flex bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200">
             <button onClick={handlePrevMonth} className="p-1.5 md:p-2 hover:bg-white hover:shadow-sm text-slate-500 rounded-lg md:rounded-xl transition-all"><ChevronLeft size={20} /></button>
             <div className="px-2 md:px-6 flex flex-col items-center justify-center min-w-[100px] md:min-w-[140px]">
                <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">{currentDate.toLocaleString('default', { month: 'short' })}</span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400">{currentDate.getFullYear()}</span>
             </div>
             <button onClick={handleNextMonth} className="p-1.5 md:p-2 hover:bg-white hover:shadow-sm text-slate-500 rounded-lg md:rounded-xl transition-all"><ChevronRight size={20} /></button>
           </div>

           <button 
             onClick={cloneToNextMonth}
             className="h-10 md:h-12 px-3 md:px-6 bg-white border border-slate-200 text-slate-600 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
             <Copy size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Clone Strategy</span><span className="sm:hidden">Clone</span>
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide bg-slate-50/50">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-full">
            <div className="grid grid-cols-7 border-b border-slate-50 select-none">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 md:py-4 text-center text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
              {calendarGrid.map((day, idx) => {
                const items = day ? currentPlan.days[day] || [] : [];
                return (
                  <div 
                    key={idx}
                    onClick={() => day && handleAddItem(day)}
                    className={`min-h-[80px] md:min-h-[140px] border-r border-b border-slate-50 p-1 md:p-4 transition-all flex flex-col gap-1 md:gap-2 group ${day ? 'hover:bg-slate-50/50 cursor-pointer' : 'bg-slate-50/20'}`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-center md:justify-between mb-1">
                          <span className="text-[10px] md:text-[11px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors">{day}</span>
                          {items.length > 0 && <span className="hidden md:inline-block text-[9px] font-black px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">{items.length}</span>}
                        </div>
                        
                        {/* Mobile Event Dots */}
                        <div className="flex md:hidden justify-center gap-0.5 flex-wrap">
                          {items.slice(0, 3).map((item, i) => {
                            const config = PLATFORMS.find(p => p.id === item.platform);
                            return <div key={i} className={`w-1.5 h-1.5 rounded-full ${config?.bg.replace('bg-', 'bg-').replace('-50', '-500') || 'bg-slate-400'}`} />;
                          })}
                          {items.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </div>

                        {/* Desktop Event List */}
                        <div className="hidden md:block space-y-1.5 overflow-hidden">
                          {items.slice(0, 3).map(item => {
                            const config = PLATFORMS.find(p => p.id === item.platform);
                            return (
                              <div 
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedDay(day); setEditingItem(item); }}
                                className={`px-2 py-1.5 rounded-lg border ${config?.bg} ${config?.color} border-current/10 truncate text-[9px] font-bold uppercase tracking-tight flex items-center gap-2 hover:scale-[1.02] transition-transform`}
                              >
                                {config && <config.icon size={10} />}
                                {item.title}
                              </div>
                            );
                          })}
                          {items.length > 3 && (
                            <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">+{items.length - 3} More</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Editing Overlay / Side Panel */}
        {selectedDay && (
          <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300" onClick={() => { setSelectedDay(null); setEditingItem(null); }}>
             <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
             <div 
              className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right-12 duration-500 flex flex-col p-6 md:p-12 overflow-y-auto relative z-10"
              onClick={e => e.stopPropagation()}
             >
                <div className="flex items-center justify-between mb-8 md:mb-12">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center font-black text-lg md:text-xl shrink-0">
                        {selectedDay}
                      </div>
                      <div>
                         <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Day Review</h2>
                         <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Planned Artifacts for {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay}</p>
                      </div>
                   </div>
                   <button onClick={() => { setSelectedDay(null); setEditingItem(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all shrink-0"><X size={20} /></button>
                </div>

                <div className="space-y-6 md:space-y-10">
                   {currentPlan.days[selectedDay]?.map((item) => (
                     <div 
                       key={item.id}
                       className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 transition-all ${editingItem?.id === item.id ? 'border-indigo-600 bg-white shadow-2xl' : 'border-slate-50 bg-slate-50/50 hover:bg-white'}`}
                       onClick={() => setEditingItem(item)}
                     >
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex gap-1 md:gap-2 flex-wrap">
                             {PLATFORMS.map(p => (
                               <button 
                                key={p.id}
                                onClick={(e) => { e.stopPropagation(); handleUpdateItem(selectedDay!, item.id, { platform: p.id }); }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.platform === p.id ? `${p.bg} ${p.color} shadow-sm` : 'text-slate-300 hover:bg-slate-100'}`}
                               >
                                 <p.icon size={14} />
                               </button>
                             ))}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(selectedDay!, item.id); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                       </div>

                       <div className="space-y-4">
                          <input 
                            className="w-full bg-transparent border-none outline-none font-black text-slate-900 text-base md:text-lg placeholder:text-slate-200"
                            placeholder="Brief Title..."
                            value={item.title}
                            onChange={e => handleUpdateItem(selectedDay!, item.id, { title: e.target.value })}
                          />
                          <div className="flex items-center gap-2 md:gap-4">
                             <div className="flex items-center bg-white rounded-lg border border-slate-100 px-2 md:px-3 py-1.5 gap-2">
                                <Clock size={12} className="text-slate-300 shrink-0" />
                                <input 
                                  type="time" 
                                  className="text-[10px] font-black bg-transparent border-none outline-none text-slate-600 w-full"
                                  value={item.time}
                                  onChange={e => handleUpdateItem(selectedDay!, item.id, { time: e.target.value })}
                                />
                             </div>
                             <select 
                               className="bg-white rounded-lg border border-slate-100 px-2 md:px-3 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none flex-1"
                               value={item.status}
                               onChange={e => handleUpdateItem(selectedDay!, item.id, { status: e.target.value as ContentStatus })}
                             >
                               <option value="draft">Draft</option>
                               <option value="scheduled">Scheduled</option>
                               <option value="published">Published</option>
                               <option value="on-hold">On Hold</option>
                             </select>
                          </div>
                          <textarea 
                            className="w-full h-24 bg-slate-100/50 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs font-medium text-slate-500 outline-none resize-none placeholder:text-slate-300"
                            placeholder="Capture post copy, hashtags, or creative notes..."
                            value={item.notes}
                            onChange={e => handleUpdateItem(selectedDay!, item.id, { notes: e.target.value })}
                          />
                       </div>
                     </div>
                   ))}

                   <button 
                    onClick={() => handleAddItem(selectedDay!)}
                    className="w-full py-4 md:py-6 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[2rem] text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 md:gap-3"
                   >
                     <Plus size={16} className="md:w-5 md:h-5" />
                     <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">Assemble Entry</span>
                   </button>
                </div>
                
                <div className="mt-auto pt-8 md:pt-10 flex flex-col gap-4">
                   <div className="p-4 md:p-6 bg-indigo-600 rounded-2xl md:rounded-3xl text-white relative overflow-hidden group">
                      <Zap size={80} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-125 transition-transform md:w-[100px] md:h-[100px] md:-bottom-6 md:-right-6" />
                      <h4 className="text-xs md:text-sm font-black italic mb-1">Productivity Tip</h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-indigo-100 leading-relaxed uppercase">High-frequency posting peaks at 11:00 AM local time for B2B engagement.</p>
                   </div>
                   <button 
                    onClick={() => { setSelectedDay(null); setEditingItem(null); }}
                    className="w-full h-12 md:h-16 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl active:scale-95 transition-all"
                   >
                     Confirm Schedule
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <footer className="h-10 bg-white border-t border-slate-100 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ENGINE: OPERATIONAL</span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="hidden sm:inline">SYNC_MODE: LOCAL_VAULT</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <CheckCircle2 size={12} className="text-emerald-500" />
             <span className="hidden sm:inline">ALL CHANGES COMMITTED</span>
             <span className="sm:hidden">COMMITTED</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
