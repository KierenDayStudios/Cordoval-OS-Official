
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Plus, MoreVertical, Trash2, Calendar, 
  ChevronRight, LayoutList, Download, Upload, Trash, 
  CheckCircle2, X, Clock, AlertTriangle, Filter, 
  Search, Maximize2, Tag, Edit2, GripVertical, Settings,
  CheckSquare, Square, BarChart2, Hash, AlertCircle, Info, Save
} from 'lucide-react';
import Sortable from 'sortablejs';
import { KanbanProject, ProjectColumn, Task, ChecklistItem } from '../types';

interface ProjectManagerProps {
  activeProject?: KanbanProject;
  onSave: (project: KanbanProject) => void;
  onBack: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ activeProject, onSave, onBack }) => {
  // Use a stable ID for new projects to ensure they are tracked correctly in the vault
  const [project, setProject] = useState<KanbanProject>(activeProject || {
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    name: 'Strategic Workspace',
    updatedAt: Date.now(),
    tags: ['active'],
    folderId: null,
    history: [],
    columns: [
      { id: 'todo', name: 'To Do', tasks: [] },
      { id: 'doing', name: 'In Progress', tasks: [] },
      { id: 'done', name: 'Completed', tasks: [] }
    ]
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inline creation states
  const [addingTaskToColumnId, setAddingTaskToColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const columnsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const taskInputRef = useRef<HTMLTextAreaElement>(null);
  const colInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus logic
  useEffect(() => {
    if (addingTaskToColumnId && taskInputRef.current) taskInputRef.current.focus();
  }, [addingTaskToColumnId]);

  useEffect(() => {
    if (isAddingColumn && colInputRef.current) colInputRef.current.focus();
  }, [isAddingColumn]);

  // Sync to vault
  useEffect(() => {
    onSave(project);
  }, [project, onSave]);

  // SortableJS Initialization
  useEffect(() => {
    const sortables: Sortable[] = [];
    
    project.columns.forEach((col) => {
      const el = columnsRef.current[col.id];
      if (el) {
        const s = new Sortable(el, {
          group: 'tasks',
          animation: 150,
          ghostClass: 'bg-cyan-50',
          dragClass: 'opacity-50',
          handle: '.drag-handle',
          onEnd: (evt) => {
            const { from, to, oldIndex, newIndex } = evt;
            if (oldIndex === undefined || newIndex === undefined) return;

            const fromColId = from.getAttribute('data-id');
            const toColId = to.getAttribute('data-id');
            if (!fromColId || !toColId) return;

            setProject(prev => {
              const newCols = JSON.parse(JSON.stringify(prev.columns));
              const fromCol = newCols.find((c: any) => c.id === fromColId);
              const toCol = newCols.find((c: any) => c.id === toColId);
              
              if (!fromCol || !toCol) return prev;

              const [movedTask] = fromCol.tasks.splice(oldIndex, 1);
              toCol.tasks.splice(newIndex, 0, movedTask);
              
              return { ...prev, columns: newCols, updatedAt: Date.now() };
            });
          }
        });
        sortables.push(s);
      }
    });

    return () => sortables.forEach(s => s.destroy());
  }, [project.columns.length]);

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) {
      setAddingTaskToColumnId(null);
      return;
    }

    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title: newTaskTitle.trim(),
      description: '',
      priority: 'medium',
      labels: [],
      checklist: [],
      createdAt: Date.now()
    };

    setProject(prev => ({
      ...prev,
      columns: prev.columns.map(c => c.id === columnId ? { ...c, tasks: [...c.tasks, newTask] } : c),
      updatedAt: Date.now()
    }));
    setNewTaskTitle('');
    setAddingTaskToColumnId(null);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      setIsAddingColumn(false);
      return;
    }
    setProject(prev => ({
      ...prev,
      columns: [...prev.columns, { id: 'col_' + Math.random().toString(36).substr(2, 9), name: newColumnName.trim(), tasks: [] }],
      updatedAt: Date.now()
    }));
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const removeTask = (taskId: string) => {
    if (!confirm('Permanently delete this task and its metadata?')) return;
    setProject(prev => ({
      ...prev,
      columns: prev.columns.map(c => ({ ...c, tasks: c.tasks.filter(t => t.id !== taskId) })),
      updatedAt: Date.now()
    }));
    setSelectedTaskId(null);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setProject(prev => ({
      ...prev,
      columns: prev.columns.map(c => ({
        ...c,
        tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      })),
      updatedAt: Date.now()
    }));
  };

  const activeTask = useMemo(() => {
    for (const col of project.columns) {
      const t = col.tasks.find(tk => tk.id === selectedTaskId);
      if (t) return t;
    }
    return null;
  }, [selectedTaskId, project.columns]);

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    project.columns.forEach(col => {
      total += col.tasks.length;
      if (col.id === 'done' || col.name.toLowerCase().includes('done') || col.name.toLowerCase().includes('complete')) {
        completed += col.tasks.length;
      }
    });
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [project.columns]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F7FA] overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 md:h-20 flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-slate-200 shrink-0 z-50 shadow-sm gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl hover:bg-slate-50 border border-slate-100 transition-all text-slate-400 hover:text-slate-900 shrink-0"><ArrowLeft size={16} className="md:w-5 md:h-5" /></button>
          <div className="flex flex-col min-w-0">
            <input 
              value={project.name} 
              onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="bg-transparent font-black text-slate-900 text-base md:text-lg outline-none border-b-2 border-transparent focus:border-cyan-500 transition-all w-full md:w-72 truncate" 
              placeholder="Board Blueprint"
            />
            <div className="flex items-center gap-2 md:gap-3 mt-1">
              <span className="text-[8px] md:text-[9px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1 md:gap-1.5 bg-cyan-50 px-1.5 md:px-2 py-0.5 rounded-md truncate">
                <LayoutList size={10} className="shrink-0" /> <span className="hidden sm:inline">LOCAL-ONLY PERSISTENCE</span><span className="sm:hidden">LOCAL</span>
              </span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                VER: 4.1.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
           <div className="hidden lg:flex items-center gap-4 px-6 py-2 bg-slate-50 border border-slate-100 rounded-2xl mr-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Completion</span>
                <span className="text-xs font-black text-slate-900">{stats.percent}%</span>
              </div>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${stats.percent}%` }} />
              </div>
           </div>

           <div className="relative group w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                placeholder="Search board..."
                className="w-full md:w-48 h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           
           <button 
             onClick={() => { if(confirm('Factory Reset: This will destroy all project data in your local browser vault. Proceed?')) setProject({ ...project, columns: [], updatedAt: Date.now() }); }} 
             className="h-10 w-10 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm shrink-0"
             title="Wipe Local Data"
           >
             <Trash size={18} />
           </button>
        </div>
      </header>

      {/* Main Kanban Board */}
      <main className="flex-1 flex overflow-x-auto p-4 md:p-10 gap-6 md:gap-8 scrollbar-hide items-start bg-[#F8F9FC]">
        {project.columns.map((col) => (
          <div key={col.id} className="w-72 md:w-80 shrink-0 flex flex-col max-h-full">
             <div className="flex items-center justify-between mb-4 md:mb-5 px-2 md:px-3">
                <div className="flex items-center gap-3">
                   <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.2em]">{col.name}</h3>
                   <span className="text-[10px] font-black px-2 py-0.5 bg-slate-200 text-slate-600 rounded-lg">{col.tasks.length}</span>
                </div>
                <div className="flex items-center gap-1">
                   <button onClick={() => setAddingTaskToColumnId(col.id)} className="p-1.5 text-slate-300 hover:text-cyan-600 hover:bg-white rounded-lg transition-all"><Plus size={16} /></button>
                   <button onClick={() => { if(confirm('Delete column?')) setProject(prev => ({...prev, columns: prev.columns.filter(c => c.id !== col.id)})); }} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all"><MoreVertical size={16} /></button>
                </div>
             </div>

             <div 
                ref={el => { if (el) columnsRef.current[col.id] = (el as HTMLDivElement); }}
                data-id={col.id}
                className="flex-1 overflow-y-auto space-y-4 min-h-[50px] scrollbar-hide pb-4 p-1"
             >
                {col.tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="group bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-cyan-300 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                  >
                    {task.priority === 'high' && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />}
                    {task.priority === 'medium' && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />}
                    
                    <div className="flex items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                       <h4 className="font-bold text-slate-900 text-xs md:text-sm leading-snug group-hover:text-cyan-600 transition-colors">{task.title}</h4>
                       <div className="drag-handle p-1.5 md:p-2 text-slate-200 cursor-grab active:cursor-grabbing hover:text-slate-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><GripVertical size={16} /></div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <div className="flex gap-1">
                          {task.priority === 'high' && <span className="p-1 bg-rose-50 text-rose-600 rounded-md"><AlertCircle size={10} /></span>}
                          {task.checklist?.length > 0 && <span className="p-1 bg-cyan-50 text-cyan-600 rounded-md"><CheckSquare size={10} /></span>}
                       </div>
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          <Clock size={10} /> {new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                       </div>
                    </div>
                  </div>
                ))}
             </div>

             {/* Inline Task Creation Form */}
             {addingTaskToColumnId === col.id ? (
               <div className="p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                 <div className="bg-white p-3 md:p-4 rounded-[1.5rem] border-2 border-cyan-400 shadow-xl">
                   <textarea 
                     ref={taskInputRef}
                     placeholder="What needs to be done?"
                     className="w-full h-20 md:h-24 bg-transparent border-none outline-none text-xs md:text-sm font-bold text-slate-800 resize-none placeholder:text-slate-300"
                     value={newTaskTitle}
                     onChange={e => setNewTaskTitle(e.target.value)}
                     onKeyDown={e => {
                       if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddTask(col.id); }
                       if (e.key === 'Escape') setAddingTaskToColumnId(null);
                     }}
                   />
                   <div className="flex items-center justify-between mt-2">
                     <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase hidden sm:block">Press ENTER to commit</span>
                     <div className="flex gap-2 w-full sm:w-auto justify-end">
                       <button onClick={() => setAddingTaskToColumnId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                       <button onClick={() => handleAddTask(col.id)} className="px-3 py-1 bg-cyan-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600">Add</button>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <button 
                 onClick={() => setAddingTaskToColumnId(col.id)}
                 className="w-full py-3 md:py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-300 hover:text-cyan-500 hover:border-cyan-200 hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
               >
                 <Plus size={16} />
                 Add Task
               </button>
             )}
          </div>
        ))}

        {/* Inline Column Creation */}
        <div className="w-72 md:w-80 shrink-0">
          {isAddingColumn ? (
             <div className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-cyan-400 shadow-xl animate-in fade-in slide-in-from-left-2">
               <label className="text-[8px] md:text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-2 md:mb-3 block">New Column Heading</label>
               <input 
                 ref={colInputRef}
                 className="w-full h-10 bg-slate-50 border-none rounded-xl px-3 md:px-4 text-xs md:text-sm font-black text-slate-800 outline-none"
                 placeholder="e.g. Backlog"
                 value={newColumnName}
                 onChange={e => setNewColumnName(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') handleAddColumn();
                   if (e.key === 'Escape') setIsAddingColumn(false);
                 }}
               />
               <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                 <button onClick={handleAddColumn} className="flex-1 h-10 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Create</button>
                 <button onClick={() => setIsAddingColumn(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:text-slate-600 transition-all"><X size={18} /></button>
               </div>
             </div>
          ) : (
            <button 
              onClick={() => setIsAddingColumn(true)}
              className="w-full h-16 md:h-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-2 md:gap-3 text-slate-400 hover:bg-white hover:text-cyan-600 hover:border-cyan-200 transition-all group shadow-sm"
            >
              <Plus size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">Deploy Column</span>
            </button>
          )}
        </div>
      </main>

      {/* Side Drawer Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300" onClick={() => setSelectedTaskId(null)}>
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
           <div 
            className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right-12 duration-500 flex flex-col p-6 md:p-12 overflow-y-auto relative z-10"
            onClick={e => e.stopPropagation()}
           >
              <div className="flex items-center justify-between mb-8 md:mb-16">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-cyan-50 text-cyan-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0"><BarChart2 size={24} className="md:w-7 md:h-7" /></div>
                    <div className="min-w-0">
                       <h2 className="text-xl md:text-2xl font-black text-slate-900 italic tracking-tighter truncate">Objective Calibration</h2>
                       <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">ID: {activeTask.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTaskId(null)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all shrink-0"><X size={20} className="md:w-6 md:h-6" /></button>
              </div>

              <div className="space-y-8 md:space-y-12">
                 <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
                    <div className="md:col-span-8 space-y-3 md:space-y-4">
                       <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Heading</label>
                       <input 
                        className="w-full h-14 md:h-16 bg-slate-50 border-none rounded-xl md:rounded-2xl px-4 md:px-6 font-bold text-slate-800 text-base md:text-lg outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all"
                        value={activeTask.title}
                        onChange={e => updateTask(activeTask.id, { title: e.target.value })}
                       />
                    </div>
                    <div className="md:col-span-4 space-y-3 md:space-y-4">
                       <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Urgency</label>
                       <select 
                        className="w-full h-14 md:h-16 bg-slate-50 border-none rounded-xl md:rounded-2xl px-4 md:px-6 font-black text-[10px] md:text-xs uppercase tracking-widest text-slate-800 outline-none focus:ring-4 focus:ring-cyan-500/5 appearance-none cursor-pointer"
                        value={activeTask.priority}
                        onChange={e => updateTask(activeTask.id, { priority: e.target.value as any })}
                       >
                         <option value="low">Low Impact</option>
                         <option value="medium">Medium Impact</option>
                         <option value="high">Critical Path</option>
                       </select>
                    </div>
                 </section>

                 <section className="space-y-3 md:space-y-4">
                    <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Strategic Context</label>
                    <textarea 
                      placeholder="Input deep strategic context, links, or code references..."
                      className="w-full h-48 md:h-64 bg-slate-50 border-none rounded-2xl md:rounded-[2rem] p-6 md:p-8 font-medium text-slate-600 outline-none resize-none text-sm md:text-base leading-relaxed focus:ring-4 focus:ring-cyan-500/5 transition-all placeholder:text-slate-200"
                      value={activeTask.description}
                      onChange={e => updateTask(activeTask.id, { description: e.target.value })}
                    />
                 </section>

                 <div className="pt-8 md:pt-12 border-t border-slate-100 flex flex-col gap-4 md:gap-6">
                    <button 
                      onClick={() => removeTask(activeTask.id)}
                      className="w-full h-14 md:h-16 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] md:text-[11px] flex items-center justify-center gap-2 md:gap-3 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-900/5"
                    >
                       <Trash2 size={18} className="md:w-5 md:h-5" /> Purge Task Artifacts
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shrink-0 z-50">
         <div className="flex gap-4 md:gap-10 items-center">
            <span className="flex items-center gap-1 md:gap-2"><div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-500" /> {project.columns.length} <span className="hidden sm:inline">CHANNELS</span></span>
            <span className="flex items-center gap-1 md:gap-2"><div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500" /> {stats.total} <span className="hidden sm:inline">TOTAL TASKS</span></span>
            <span className="flex items-center gap-1 md:gap-2"><CheckCircle2 size={10} className="text-emerald-500 md:w-3 md:h-3" /> <span className="hidden sm:inline">SYNC_OK: VAULT_ACTIVE</span></span>
         </div>
         <div className="flex items-center gap-4 text-slate-300">
            <span className="text-slate-400 hidden sm:inline">OFFLINE_SOVEREIGNTY: ENABLED</span>
         </div>
      </footer>
    </div>
  );
};
