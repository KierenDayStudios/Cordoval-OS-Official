
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Play, Pause, StopCircle, Plus, 
  Trash2, Download, Clock, DollarSign, 
  Briefcase, Calendar, ChevronRight, Save,
  AlertCircle, CheckCircle2, History, User,
  FileSpreadsheet, FileText as FileIcon
} from 'lucide-react';
import { WorkLogProject, TimeEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { SaveLoadControls } from './SaveLoadControls';

interface WorkLogProps {
  activeProject?: WorkLogProject;
  onSave: (project: WorkLogProject) => void;
  onExportToSheets: (project: WorkLogProject) => void;
  onBack: () => void;
}

export const WorkLog: React.FC<WorkLogProps> = ({ activeProject, onSave, onExportToSheets, onBack }) => {
  const [entries, setEntries] = useState<TimeEntry[]>(activeProject?.entries || []);
  const [projectName, setProjectName] = useState(activeProject?.name || 'New Timesheet');
  const [clientName, setClientName] = useState(activeProject?.clientName || '');
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry> | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleSaveFile = () => {
    const backup = { projectName, clientName, entries };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `worklog_${projectName.replace(/\s+/g, '_').toLowerCase()}.json`);
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
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.entries) setEntries(parsed.entries);
      } catch (err) {
        alert("Invalid WorkLog JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (isTracking) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentEntry({
      id: Math.random().toString(36).substr(2, 9),
      startTime: Date.now(),
      projectName: projectName,
      clientName: clientName,
      isBillable: true,
      duration: 0
    });
    setElapsedTime(0);
  };

  const stopTracking = () => {
    if (!currentEntry) return;
    
    const newEntry: TimeEntry = {
      ...(currentEntry as TimeEntry),
      endTime: Date.now(),
      duration: elapsedTime,
      description: currentEntry.description || 'No description'
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    setIsTracking(false);
    setCurrentEntry(null);
    setElapsedTime(0);
    
    saveProject(updatedEntries);
  };

  const saveProject = (updatedEntries: TimeEntry[]) => {
    const project: WorkLogProject = {
      id: activeProject?.id || Math.random().toString(36).substr(2, 9),
      name: projectName,
      clientName: clientName,
      entries: updatedEntries,
      totalSeconds: updatedEntries.reduce((acc, curr) => acc + curr.duration, 0),
      updatedAt: Date.now(),
      tags: ['timesheet'],
      folderId: null,
      history: []
    };
    onSave(project);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Project', 'Client', 'Description', 'Duration', 'Billable', 'Rate', 'Amount'];
    const rows = entries.map(e => [
      new Date(e.startTime).toLocaleDateString(),
      e.projectName,
      e.clientName || '',
      e.description,
      formatDuration(e.duration),
      e.isBillable ? 'Yes' : 'No',
      e.hourlyRate || 50,
      ((e.duration / 3600) * (e.hourlyRate || 50)).toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_timesheet.csv`;
    a.click();
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveProject(updated);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalBillable = entries
    .filter(e => e.isBillable)
    .reduce((acc, curr) => acc + (curr.duration / 3600) * (curr.hourlyRate || 50), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] text-slate-300 font-sans overflow-hidden">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 md:h-20 flex flex-col md:flex-row md:items-center justify-between bg-slate-900/50 border-b border-white/5 backdrop-blur-xl z-50 shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
               <Clock size={20} className="md:w-6 md:h-6" />
             </div>
             <div>
               <input 
                 value={projectName}
                 onChange={e => setProjectName(e.target.value)}
                 className="bg-transparent border-none text-base md:text-lg font-black text-white tracking-tighter uppercase italic leading-none outline-none focus:ring-0 p-0 w-full"
               />
               <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">Work Log Active</p>
               </div>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto">
           <div className="flex flex-col items-start md:items-end">
              <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Total Billable</span>
              <span className="text-base md:text-lg font-black text-emerald-400 tracking-tighter italic">${totalBillable.toFixed(2)}</span>
           </div>
           <div className="flex items-center gap-2">
             <SaveLoadControls onSave={handleSaveFile} onLoad={handleLoadFile} label="WorkLog" compact />
             <button 
               onClick={exportToCSV}
               className="p-2.5 md:p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
               title="Export to CSV"
             >
                <Download size={16} className="md:w-[18px] md:h-[18px]" />
             </button>
             <button 
               onClick={() => saveProject(entries)}
               className="p-2.5 md:p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
               title="Save Changes"
             >
                <Save size={16} className="md:w-[18px] md:h-[18px]" />
             </button>
             <button 
               onClick={() => onExportToSheets(activeProject || {
                 id: Math.random().toString(36).substr(2, 9),
                 name: projectName,
                 clientName: clientName,
                 entries: entries,
                 totalSeconds: entries.reduce((acc, curr) => acc + curr.duration, 0),
                 updatedAt: Date.now(),
                 tags: ['timesheet'],
                 folderId: null,
                 history: []
               })}
               className="p-2.5 md:p-3 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all"
               title="Transfer to Sheets"
             >
                <FileSpreadsheet size={16} className="md:w-[18px] md:h-[18px]" />
             </button>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Tracker Card */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock size={120} className="text-emerald-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Play size={14} />
                  </div>
                  <h2 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Active Session</h2>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
                  <div className="text-5xl md:text-7xl font-black text-white tracking-tighter tabular-nums italic">
                    {formatDuration(elapsedTime)}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {!isTracking ? (
                      <button 
                        onClick={startTracking}
                        className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 md:gap-3 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                      >
                        <Play size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
                        Start Session
                      </button>
                    ) : (
                      <button 
                        onClick={stopTracking}
                        className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-rose-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 md:gap-3 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 active:scale-95 animate-pulse"
                      >
                        <StopCircle size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
                        Stop Session
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 md:mt-8">
                  <input 
                    placeholder="What are you working on?"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
                    value={currentEntry?.description || ''}
                    onChange={e => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <History size={16} className="text-slate-500" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recent Logs</h3>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{entries.length} Entries</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {entries.map((entry) => (
                    <motion.div 
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-slate-900/30 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-white/5 transition-all gap-4 sm:gap-0"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-slate-800 flex flex-col items-center justify-center border border-white/5 shrink-0">
                          <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase text-center leading-tight">
                            {new Date(entry.startTime).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).replace(' ', '\n')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs md:text-sm font-bold text-white truncate">{entry.description}</h4>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                            <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[100px]">{entry.projectName}</span>
                            {entry.clientName && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                                <span className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest truncate max-w-[80px]">{entry.clientName}</span>
                              </>
                            )}
                            <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest shrink-0">
                              {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="text-xs md:text-sm font-black text-white italic">{formatDuration(entry.duration)}</p>
                          <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {entry.isBillable ? `$${((entry.duration / 3600) * (entry.hourlyRate || 50)).toFixed(2)}` : 'Non-billable'}
                          </p>
                        </div>
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {entries.length === 0 && (
                  <div className="py-12 md:py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-[2rem] md:rounded-[2.5rem]">
                    <Clock size={40} className="mb-4 opacity-20" />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">No work logged yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 md:mb-8">Performance Matrix</h3>
              
              <div className="space-y-4 md:space-y-6">
                <div className="p-4 md:p-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Time</span>
                    <Clock size={14} className="text-blue-400" />
                  </div>
                  <p className="text-xl md:text-2xl font-black text-white italic">{formatDuration(entries.reduce((acc, curr) => acc + curr.duration, 0))}</p>
                </div>

                <div className="p-4 md:p-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg. Session</span>
                    <Activity size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-xl md:text-2xl font-black text-white italic">
                    {entries.length > 0 ? formatDuration(Math.floor(entries.reduce((acc, curr) => acc + curr.duration, 0) / entries.length)) : '00:00:00'}
                  </p>
                </div>

                <div className="p-4 md:p-6 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Project Value</span>
                    <DollarSign size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-xl md:text-2xl font-black text-emerald-400 italic">${totalBillable.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 md:mb-6">Settings</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400">Client / Customer</span>
                  <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-lg px-3 py-2">
                    <User size={14} className="text-slate-500" />
                    <input 
                      className="flex-1 bg-transparent border-none text-xs text-white p-0 outline-none" 
                      placeholder="Enter client name..."
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Hourly Rate</span>
                  <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-slate-500">$</span>
                    <input className="w-12 bg-transparent border-none text-xs text-white p-0 outline-none" defaultValue="50" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Auto-Save</span>
                  <div className="w-10 h-5 bg-emerald-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Activity = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
