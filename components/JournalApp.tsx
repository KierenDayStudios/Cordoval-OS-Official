
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Edit3, Trash2, Save, Sparkles, ChevronLeft,
  Clock, Hash, Quote, X, Plus, Search, Calendar, Zap,
  CheckCircle2, BookOpen
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';

interface JournalAppProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onBack: () => void;
}

const MOODS: { id: MoodType; emoji: string; label: string; color: string; bg: string; border: string }[] = [
  { id: 'serene', emoji: '🌿', label: 'Serene', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'anxious', emoji: '🌪️', label: 'Anxious', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
  { id: 'melancholy', emoji: '☁️', label: 'Melancholy', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
];

export const JournalApp: React.FC<JournalAppProps> = ({ 
  entries = [], onSaveEntry, onDeleteEntry, onBack 
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftMood, setDraftMood] = useState<MoodType>('serene');
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredEntries = useMemo(() => {
    return (entries || [])
      .filter(e => {
        const title = e.title || '';
        const content = e.content || '';
        return (title + content).toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, searchQuery]);

  const handleStartNew = () => {
    setActiveId('new');
    setDraftTitle('');
    setDraftContent('');
    setDraftMood('serene');
  };

  const handleOpen = (e: JournalEntry) => {
    setActiveId(e.id);
    setDraftTitle(e.title || '');
    setDraftContent(e.content || '');
    setDraftMood(e.mood || 'serene');
  };

  const handleSave = () => {
    if (!draftContent.trim() && !draftTitle.trim()) return;
    setIsSyncing(true);
    const entry: JournalEntry = {
      id: activeId === 'new' ? Math.random().toString(36).substr(2, 9) : activeId!,
      title: draftTitle || `Reflection: ${new Date().toLocaleDateString()}`,
      content: draftContent,
      mood: draftMood,
      updatedAt: Date.now(),
      tags: ['journal'],
      folderId: null,
      history: [],
      name: draftTitle || 'Journal Entry'
    };
    onSaveEntry(entry);
    setActiveId(entry.id);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FCFDFB] overflow-hidden font-sans selection:bg-emerald-100">
      <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-emerald-50 z-50 shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
               <Edit3 size={16} className="md:w-5 md:h-5" />
             </div>
             <div className="hidden sm:block">
               <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tighter uppercase italic">Reflections Journal</h1>
               <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Cognitive Vault Protocol</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                placeholder="Search archive..."
                className="w-64 h-10 pl-11 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <button 
             onClick={handleStartNew}
             className="h-10 px-4 md:px-6 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl shadow-emerald-500/10 hover:bg-emerald-700 transition-all flex items-center gap-2 shrink-0"
           >
             <Plus size={14} /> <span className="hidden sm:inline">New Artifact</span><span className="sm:hidden">New</span>
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Archives Sidebar */}
        <aside className={`w-full md:w-80 bg-white border-r border-emerald-50 flex flex-col shrink-0 absolute md:relative inset-0 z-10 transition-transform duration-300 ${activeId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-4 md:p-6 border-b border-emerald-50">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Historical Timeline
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
             {filteredEntries.length === 0 ? (
               <div className="py-20 text-center opacity-30">
                  <BookOpen size={40} className="mx-auto text-emerald-200 mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Archive Empty</p>
               </div>
             ) : (
               filteredEntries.map(e => {
                 const mood = MOODS.find(m => m.id === e.mood);
                 return (
                   <div 
                    key={e.id}
                    onClick={() => handleOpen(e)}
                    className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${activeId === e.id ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-slate-50 hover:bg-emerald-50/20'}`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(e.updatedAt).toLocaleDateString()}</span>
                         <span>{mood?.emoji}</span>
                      </div>
                      <h4 className={`text-sm font-black tracking-tight truncate ${activeId === e.id ? 'text-emerald-900' : 'text-slate-700'}`}>{e.title}</h4>
                   </div>
                 );
               })
             )}
          </div>
        </aside>

        {/* Editor Pane */}
        <main className={`flex-1 bg-white overflow-y-auto scrollbar-hide flex flex-col p-6 md:p-12 absolute md:relative inset-0 z-20 md:z-0 transition-transform duration-300 ${activeId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {activeId ? (
            <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-16">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveId(null)} className="md:hidden p-2 text-slate-400 hover:text-emerald-600 rounded-xl bg-slate-50"><ArrowLeft size={20} /></button>
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                      {MOODS.map(m => (
                        <button 
                          key={m.id}
                          onClick={() => setDraftMood(m.id)}
                          className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-xl transition-all border-2 ${draftMood === m.id ? `${m.bg} ${m.border} shadow-lg scale-110` : 'bg-slate-50 border-transparent hover:border-emerald-100'}`}
                          title={m.label}
                        >
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={handleSave} className="flex-1 md:flex-none h-11 px-8 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2">
                        {isSyncing ? <Zap size={14} className="animate-spin" /> : <Save size={14} />}
                        Sync Thought
                     </button>
                     {activeId !== 'new' && (
                       <button onClick={() => { onDeleteEntry(activeId); setActiveId(null); }} className="p-3 text-slate-300 hover:text-rose-500 rounded-xl transition-all bg-slate-50 md:bg-transparent shrink-0">
                          <Trash2 size={20} />
                       </button>
                     )}
                  </div>
               </div>

               <input 
                className="w-full text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic outline-none border-none bg-transparent placeholder:text-emerald-50 mb-6 md:mb-10"
                placeholder="Entry Heading..."
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
               />
               <textarea 
                className="w-full min-h-[300px] md:min-h-[500px] bg-transparent border-none outline-none resize-none text-lg md:text-xl font-medium text-slate-700 leading-[1.8] placeholder:text-emerald-50"
                placeholder="Unfold your internal reality here..."
                value={draftContent}
                onChange={e => setDraftContent(e.target.value)}
               />
            </div>
          ) : (
            <div className="hidden md:flex h-full flex-col items-center justify-center text-center space-y-8 opacity-40 select-none">
               <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center text-emerald-200">
                  <Edit3 size={64} />
               </div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Initialize reflection artifact</p>
               <button onClick={handleStartNew} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">New Entry</button>
            </div>
          )}
        </main>
      </div>

      <footer className="h-8 bg-white border-t border-emerald-50 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> JOURNAL_BRIDGE: READY</span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="hidden sm:inline">LOCAL_ARCHIVE: {entries.length} RECORDS</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           COMMITTED_TO_VAULT
        </div>
      </footer>
    </div>
  );
};
