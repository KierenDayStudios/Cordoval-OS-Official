
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Calendar, Zap, Tag, Pin, ListChecks, Square, CheckSquare, Sparkles, ArrowLeft, Edit3, BookOpen
} from 'lucide-react';
import { Note, ChecklistItem } from '../types';
import { marked } from 'marked';

interface NotesAppProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onBack: () => void;
}

const COLORS = [
  { id: 'bg-white', label: 'White' },
  { id: 'bg-blue-50/50', label: 'Blue' },
  { id: 'bg-amber-50/50', label: 'Amber' },
  { id: 'bg-purple-50/50', label: 'Purple' },
  { id: 'bg-slate-50/50', label: 'Slate' }
];

export const NotesApp: React.FC<NotesAppProps> = ({ notes = [], onSaveNote, onDeleteNote, onBack }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [draftColor, setDraftColor] = useState('bg-white');
  const [isChecklist, setIsChecklist] = useState(false);
  const [draftChecklistItems, setDraftChecklistItems] = useState<ChecklistItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredNotes = useMemo(() => {
    return (notes || [])
      .filter(n => {
        const title = n.title || '';
        const content = n.content || '';
        return (title + content).toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, searchQuery]);

  const handleStartNew = () => {
    setActiveId('new');
    setDraftTitle('');
    setDraftContent('');
    setDraftTags('');
    setDraftColor('bg-white');
    setIsChecklist(false);
    setDraftChecklistItems([{ id: Math.random().toString(), text: '', completed: false }]);
  };

  const handleOpen = (n: Note) => {
    setActiveId(n.id);
    setDraftTitle(n.title || '');
    setDraftContent(n.content || '');
    setDraftTags((n.tags || []).join(', '));
    setDraftColor(n.color || 'bg-white');
    setIsChecklist(n.isChecklist || false);
    setDraftChecklistItems(n.checklistItems?.length ? n.checklistItems : [{ id: Math.random().toString(), text: '', completed: false }]);
  };

  const handleSave = () => {
    if (!draftContent.trim() && !draftTitle.trim() && (!isChecklist || draftChecklistItems.every(i => !i.text.trim()))) return;
    setIsSyncing(true);
    
    const tags = draftTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const existingNote = notes.find(n => n.id === activeId);
    
    const finalChecklistItems = draftChecklistItems.filter(i => i.text.trim());
    
    const note: Note = {
      id: activeId === 'new' ? Math.random().toString(36).substr(2, 9) : activeId!,
      title: draftTitle || 'Untitled Thought',
      content: isChecklist ? finalChecklistItems.map(i => i.text).join('\n') : draftContent,
      color: draftColor,
      updatedAt: Date.now(),
      tags: tags,
      isPinned: existingNote?.isPinned || false,
      isChecklist: isChecklist,
      checklistItems: isChecklist ? finalChecklistItems : [],
      history: [],
      folderId: null
    };
    
    onSaveNote(note);
    setActiveId(note.id);
    setTimeout(() => setIsSyncing(false), 600);
  };

  const togglePin = (note: Note) => {
    onSaveNote({ ...note, isPinned: !note.isPinned, updatedAt: Date.now() });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FBFBFC] overflow-hidden font-sans selection:bg-purple-100">
      <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-purple-50 z-50 shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
               <Sparkles size={16} className="md:w-5 md:h-5" />
             </div>
             <div className="hidden sm:block">
               <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tighter uppercase italic">Second Brain</h1>
               <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Capture Thoughts</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                placeholder="Search notes..."
                className="w-64 h-10 pl-11 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <button 
             onClick={handleStartNew}
             className="h-10 px-4 md:px-6 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl shadow-purple-500/10 hover:bg-purple-700 transition-all flex items-center gap-2 shrink-0"
           >
             <Plus size={14} /> <span className="hidden sm:inline">New Note</span><span className="sm:hidden">New</span>
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Archives Sidebar */}
        <aside className={`w-full md:w-80 bg-white border-r border-purple-50 flex flex-col shrink-0 absolute md:relative inset-0 z-10 transition-transform duration-300 ${activeId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-4 md:p-6 border-b border-purple-50">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Note Archive
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
             {filteredNotes.length === 0 ? (
               <div className="py-20 text-center opacity-30">
                  <BookOpen size={40} className="mx-auto text-purple-200 mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Archive Empty</p>
               </div>
             ) : (
               filteredNotes.map(n => (
                 <div 
                  key={n.id}
                  onClick={() => handleOpen(n)}
                  className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${n.color} ${activeId === n.id ? 'border-purple-200 shadow-sm' : 'border-slate-100 hover:border-purple-100'}`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(n.updatedAt).toLocaleDateString()}</span>
                       <button 
                         onClick={(e) => { e.stopPropagation(); togglePin(n); }}
                         className={`p-1.5 rounded-lg transition-colors ${n.isPinned ? 'text-purple-600 bg-purple-100' : 'text-slate-300 hover:bg-black/5'}`}
                       >
                         <Pin size={14} fill={n.isPinned ? "currentColor" : "none"} />
                       </button>
                    </div>
                    <h4 className={`text-sm font-black tracking-tight truncate ${activeId === n.id ? 'text-purple-900' : 'text-slate-700'}`}>{n.title}</h4>
                    {n.tags && n.tags.length > 0 && (
                      <div className="flex gap-1 mt-3 overflow-hidden">
                        {n.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[8px] font-black bg-white/50 px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-tight truncate">#{tag}</span>
                        ))}
                      </div>
                    )}
                 </div>
               ))
             )}
          </div>
        </aside>

        {/* Editor Pane */}
        <main className={`flex-1 bg-white overflow-y-auto scrollbar-hide flex flex-col p-6 md:p-12 absolute md:relative inset-0 z-20 md:z-0 transition-transform duration-300 ${activeId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {activeId ? (
            <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveId(null)} className="md:hidden p-2 text-slate-400 hover:text-purple-600 rounded-xl bg-slate-50"><ArrowLeft size={20} /></button>
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                      <button 
                        onClick={() => {
                          if (isChecklist) {
                            setDraftContent(draftChecklistItems.map(i => i.text).join('\n'));
                          } else {
                            setDraftChecklistItems(draftContent.split('\n').filter(l => l.trim()).map(l => ({ id: Math.random().toString(), text: l, completed: false })));
                            if (draftContent.trim() === '') {
                              setDraftChecklistItems([{ id: Math.random().toString(), text: '', completed: false }]);
                            }
                          }
                          setIsChecklist(!isChecklist);
                        }}
                        className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all ${isChecklist ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-purple-600'}`}
                        title="Toggle Checklist Mode"
                      >
                        <ListChecks size={18} />
                      </button>
                      <div className="w-px h-6 bg-slate-200 self-center mx-1" />
                      {COLORS.map(c => (
                        <button 
                          key={c.id}
                          onClick={() => setDraftColor(c.id)}
                          className={`w-10 h-10 shrink-0 rounded-2xl transition-all border-2 ${draftColor === c.id ? `${c.id} border-purple-200 shadow-lg scale-110` : `${c.id} border-transparent hover:border-slate-200`}`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={handleSave} className="flex-1 md:flex-none h-11 px-8 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2">
                        {isSyncing ? <Zap size={14} className="animate-spin" /> : <Zap size={14} />}
                        Save Thought
                     </button>
                     {activeId !== 'new' && (
                       <button onClick={() => { onDeleteNote(activeId); setActiveId(null); }} className="p-3 text-slate-300 hover:text-rose-500 rounded-xl transition-all bg-slate-50 md:bg-transparent shrink-0">
                          <Trash2 size={20} />
                       </button>
                     )}
                  </div>
               </div>

               <input 
                className="w-full text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic outline-none border-none bg-transparent placeholder:text-purple-50 mb-6 md:mb-8"
                placeholder="Note Title..."
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
               />
               
               <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl mb-6 md:mb-8">
                 <Tag size={16} className="text-slate-400" />
                 <input 
                   type="text" placeholder="Tags (e.g. Work, Ideas)" 
                   className="flex-1 text-sm font-bold bg-transparent border-none outline-none text-slate-600"
                   value={draftTags} onChange={e => setDraftTags(e.target.value)}
                 />
               </div>

               {isChecklist ? (
                 <div className="w-full min-h-[300px] md:min-h-[400px] flex flex-col gap-2">
                   {draftChecklistItems.map((item, i) => (
                     <div key={item.id} className="flex items-center gap-3 group">
                       <button 
                         onClick={() => {
                           const newItems = [...draftChecklistItems];
                           newItems[i].completed = !newItems[i].completed;
                           setDraftChecklistItems(newItems);
                         }}
                         className="shrink-0"
                       >
                         {item.completed ? <CheckSquare size={20} className="text-purple-600" /> : <Square size={20} className="text-slate-300" />}
                       </button>
                       <input 
                         type="text"
                         value={item.text}
                         onChange={(e) => {
                           const newItems = [...draftChecklistItems];
                           newItems[i].text = e.target.value;
                           setDraftChecklistItems(newItems);
                         }}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             const newItems = [...draftChecklistItems];
                             newItems.splice(i + 1, 0, { id: Math.random().toString(), text: '', completed: false });
                             setDraftChecklistItems(newItems);
                           } else if (e.key === 'Backspace' && item.text === '') {
                             e.preventDefault();
                             if (draftChecklistItems.length > 1) {
                               const newItems = [...draftChecklistItems];
                               newItems.splice(i, 1);
                               setDraftChecklistItems(newItems);
                             }
                           }
                         }}
                         className={`flex-1 bg-transparent border-none outline-none text-lg md:text-xl font-medium placeholder:text-purple-100 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                         placeholder="List item..."
                         autoFocus={i === draftChecklistItems.length - 1 && item.text === ''}
                       />
                     </div>
                   ))}
                   <button 
                     onClick={() => setDraftChecklistItems([...draftChecklistItems, { id: Math.random().toString(), text: '', completed: false }])}
                     className="text-left text-lg md:text-xl font-medium text-slate-400 hover:text-slate-600 mt-2"
                   >
                     + Add item
                   </button>
                 </div>
               ) : (
                 <textarea 
                  className="w-full min-h-[300px] md:min-h-[400px] bg-transparent border-none outline-none resize-none text-lg md:text-xl font-medium text-slate-700 leading-[1.8] placeholder:text-purple-50"
                  placeholder="Supports Markdown formatting..."
                  value={draftContent}
                  onChange={e => setDraftContent(e.target.value)}
                 />
               )}
            </div>
          ) : (
            <div className="hidden md:flex h-full flex-col items-center justify-center text-center space-y-8 opacity-40 select-none">
               <div className="w-32 h-32 bg-purple-50 rounded-[3rem] flex items-center justify-center text-purple-200">
                  <Edit3 size={64} />
               </div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Initialize thought artifact</p>
               <button onClick={handleStartNew} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">New Note</button>
            </div>
          )}
        </main>
      </div>

      <footer className="h-8 bg-white border-t border-purple-50 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> BRAIN_BRIDGE: READY</span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="hidden sm:inline">LOCAL_ARCHIVE: {notes.length} RECORDS</span>
        </div>
        <div className="flex items-center gap-2 text-purple-500">
           <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
           COMMITTED_TO_VAULT
        </div>
      </footer>
    </div>
  );
};

