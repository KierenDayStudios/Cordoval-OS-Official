
import React, { useState } from 'react';
import { 
  FileText, Table, Presentation, StickyNote, Trash2, Download, FolderOpen, PieChart, HardDrive, ChevronRight, Folder, ChevronDown, CheckSquare, Square, X, Plus,
  Globe, PenTool, Briefcase, Code, Grid3X3, LayoutList, Wallet, Users, BrainCircuit, Book, CheckCircle2, Target, Timer, Lock, Radio, Sparkles, FileCode, Clock
} from 'lucide-react';
import { 
  Document, Note, Presentation as PresType, Spreadsheet, STORAGE_LIMITS, Folder as FolderType,
  SitePage, CanvasBoard, BusinessPlan, CodeProject, PixelArtProject, KanbanProject,
  LedgerProject, ClientProfile, Decision, JournalEntry, Habit, Goal, PasswordEntry,
  AIBuilderProject, PodcastRecording, WorkLogProject
} from '../types';

interface FileManagerProps {
  documents: Document[];
  notes: Note[];
  presentations: PresType[];
  spreadsheets: Spreadsheet[];
  sites: SitePage[];
  canvasBoards: CanvasBoard[];
  plans: BusinessPlan[];
  codeProjects: CodeProject[];
  pixelProjects: PixelArtProject[];
  kanbanProjects: KanbanProject[];
  ledgerProjects: LedgerProject[];
  clients: ClientProfile[];
  decisions: Decision[];
  journalEntries: JournalEntry[];
  habits: Habit[];
  goals: Goal[];
  passwords: PasswordEntry[];
  aiProjects: AIBuilderProject[];
  aiCodeProjects: CodeProject[];
  podcastRecordings: PodcastRecording[];
  workLogProjects: WorkLogProject[];
  folders: FolderType[];
  onDelete: (type: string, id: string) => void;
  onOpen: (type: string, id: string) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ 
  documents, notes, presentations, spreadsheets, sites, canvasBoards, plans,
  codeProjects, pixelProjects, kanbanProjects, ledgerProjects, clients,
  decisions, journalEntries, habits, goals, passwords, aiProjects,
  aiCodeProjects, podcastRecordings, workLogProjects, folders, onDelete, onOpen 
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allFiles = [
    ...(documents || []).map(d => ({ ...d, type: 'docs', icon: FileText, color: 'text-rose-600', size: 120 })),
    ...(spreadsheets || []).map(s => ({ ...s, type: 'sheets', icon: Table, color: 'text-emerald-600', size: 85 })),
    ...(presentations || []).map(p => ({ ...p, type: 'slides', icon: Presentation, color: 'text-orange-600', size: 550 })),
    ...(notes || []).map(n => ({ ...n, name: n.title, type: 'notes', icon: StickyNote, color: 'text-purple-600', size: 10 })),
    ...(sites || []).map(s => ({ ...s, type: 'site-builder', icon: Globe, color: 'text-blue-600', size: 450 })),
    ...(canvasBoards || []).map(c => ({ ...c, type: 'canvas', icon: PenTool, color: 'text-indigo-600', size: 320 })),
    ...(plans || []).map(p => ({ ...p, type: 'plan-builder', icon: Briefcase, color: 'text-amber-600', size: 210 })),
    ...(codeProjects || []).map(c => ({ ...c, type: 'code-editor', icon: Code, color: 'text-slate-600', size: 800 })),
    ...(pixelProjects || []).map(p => ({ ...p, type: 'pixel-art', icon: Grid3X3, color: 'text-sky-600', size: 150 })),
    ...(kanbanProjects || []).map(k => ({ ...k, type: 'project-manager', icon: LayoutList, color: 'text-cyan-600', size: 280 })),
    ...(ledgerProjects || []).map(l => ({ ...l, type: 'ledger', icon: Wallet, color: 'text-emerald-600', size: 190 })),
    ...(clients || []).map(c => ({ ...c, type: 'client-vault', icon: Users, color: 'text-blue-600', size: 140 })),
    ...(decisions || []).map(d => ({ ...d, type: 'decision-log', icon: BrainCircuit, color: 'text-violet-600', size: 110 })),
    ...(journalEntries || []).map(j => ({ ...j, name: j.title, type: 'journal', icon: Book, color: 'text-amber-600', size: 60 })),
    ...(habits || []).map(h => ({ ...h, name: h.title, type: 'habits', icon: CheckCircle2, color: 'text-emerald-600', size: 40 })),
    ...(goals || []).map(g => ({ ...g, name: g.title, type: 'goals', icon: Target, color: 'text-rose-600', size: 90 })),
    ...(passwords || []).map(p => ({ ...p, name: p.service, type: 'passwords', icon: Lock, color: 'text-slate-700', size: 30 })),
    ...(aiProjects || []).map(p => ({ ...p, type: 'joymiz-ai', icon: Sparkles, color: 'text-indigo-600', size: 1200 })),
    ...(aiCodeProjects || []).map(p => ({ ...p, type: 'ai-code-editor', icon: FileCode, color: 'text-violet-600', size: 1500 })),
    ...(podcastRecordings || []).map(p => ({ ...p, name: p.title, type: 'podcast-studio', icon: Radio, color: 'text-rose-600', size: 5000 })),
    ...(workLogProjects || []).map(w => ({ ...w, type: 'work-log', icon: Clock, color: 'text-emerald-600', size: 180 })),
  ].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0);
  const typeStats = [
    { label: 'Docs', size: allFiles.filter(f => f.type === 'docs').reduce((a,b)=>a+b.size,0), color: 'bg-rose-500' },
    { label: 'Sheets', size: allFiles.filter(f => f.type === 'sheets').reduce((a,b)=>a+b.size,0), color: 'bg-emerald-500' },
    { label: 'AI', size: allFiles.filter(f => ['joymiz-ai', 'ai-code-editor'].includes(f.type)).reduce((a,b)=>a+b.size,0), color: 'bg-indigo-500' },
    { label: 'Media', size: allFiles.filter(f => ['podcast-studio', 'pixel-art'].includes(f.type)).reduce((a,b)=>a+b.size,0), color: 'bg-sky-500' },
    { label: 'Other', size: allFiles.filter(f => !['docs', 'sheets', 'joymiz-ai', 'ai-code-editor', 'podcast-studio', 'pixel-art'].includes(f.type)).reduce((a,b)=>a+b.size,0), color: 'bg-slate-400' },
  ];

  const filteredFiles = selectedFolderId ? allFiles.filter(f => f.folderId === selectedFolderId) : allFiles;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedIds.size} files permanently?`)) {
      selectedIds.forEach(id => {
        const file = allFiles.find(f => f.id === id);
        if (file) onDelete(file.type, file.id);
      });
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <header className="px-4 md:px-8 py-6 md:py-10 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 md:gap-3">
              <HardDrive size={24} className="text-indigo-600 md:w-8 md:h-8" />
              Secure Vault
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2">Hierarchical storage with offline-first persistence.</p>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between md:justify-start gap-3 bg-slate-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl animate-in slide-in-from-top-4">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{selectedIds.size} Selected</span>
              <div className="w-px h-4 bg-white/20 hidden md:block" />
              <button onClick={handleBatchDelete} className="text-rose-400 hover:text-rose-300 font-bold text-[10px] md:text-xs uppercase">Delete</button>
              <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Folders */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
          <h3 className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ecosystem Folders</h3>
          <button 
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-xs md:text-sm ${!selectedFolderId ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <FolderOpen size={16} className="md:w-[18px] md:h-[18px]" /> Root Directory
          </button>
          {folders.map(f => (
            <button 
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-xs md:text-sm ${selectedFolderId === f.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Folder size={16} className="md:w-[18px] md:h-[18px]" /> {f.name}
            </button>
          ))}
          <button className="hidden md:flex mt-4 items-center gap-2 px-4 py-2 border border-dashed border-slate-200 text-slate-300 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-all text-xs font-bold">
            <Plus size={14} /> New Folder
          </button>

          <div className="hidden md:block mt-auto pt-8 border-t border-slate-50">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Insight</span>
                <span className="text-[10px] font-black text-slate-800">{(totalSize / 1024).toFixed(1)}MB</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                {typeStats.map(stat => (
                  <div 
                    key={stat.label} 
                    className={`${stat.color} h-full transition-all`} 
                    style={{ width: `${(stat.size / (totalSize || 1)) * 100}%` }}
                    title={`${stat.label}: ${stat.size}KB`}
                  />
                ))}
             </div>
             <div className="grid grid-cols-2 gap-2 mt-4">
                {typeStats.map(stat => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase">{stat.label}</span>
                  </div>
                ))}
             </div>
          </div>
        </aside>

        {/* File List */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-4 md:px-8 py-3 md:py-4 w-12"></th>
                    <th className="px-4 md:px-8 py-3 md:py-4">Identity</th>
                    <th className="px-4 md:px-8 py-3 md:py-4">Modified</th>
                    <th className="px-4 md:px-8 py-3 md:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 md:px-8 py-12 md:py-20 text-center text-slate-300 italic text-sm md:text-base">No artifacts detected in this path.</td></tr>
                  ) : (
                    filteredFiles.map(file => (
                      <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 md:px-8 py-3 md:py-4">
                          <button onClick={() => toggleSelect(file.id)}>
                            {selectedIds.has(file.id) ? <CheckSquare size={16} className="text-rose-600 md:w-[18px] md:h-[18px]" /> : <Square size={16} className="text-slate-200 md:w-[18px] md:h-[18px]" />}
                          </button>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${file.color.replace('text', 'bg')}/10 ${file.color}`}>
                              <file.icon size={16} className="md:w-[18px] md:h-[18px]" />
                            </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{file.name}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{file.type}</span>
                              {file.tags?.map(t => <span key={t} className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">#{t}</span>)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-[11px] font-bold text-slate-400">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 md:px-8 py-3 md:py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onOpen(file.type, file.id)} className="p-2 text-slate-400 md:text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><FolderOpen size={16} className="md:w-[18px] md:h-[18px]" /></button>
                          <button onClick={() => onDelete(file.type, file.id)} className="p-2 text-slate-400 md:text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
