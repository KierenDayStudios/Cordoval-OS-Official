
import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, List, Save, Undo, Redo, Maximize2, History, ChevronLeft, Clock, RotateCcw, 
  Type, Palette, ListOrdered, Hash, Scissors, Copy, Clipboard, Search, Layout, HelpCircle, ChevronDown, Check, Minimize2, FileText,
  Strikethrough, Image as ImageIcon, Minus, Eye, Edit3, Heading1, Heading2, Heading3, Link as LinkIcon, Quote, Code as CodeIcon
} from 'lucide-react';
import { Document, Version } from '../types';
import Markdown from 'react-markdown';

interface WordEditorProps {
  docId: string | null;
  existingDoc?: Document;
  onSave: (doc: Document) => void;
  onBack: () => void;
}

export const WordEditor: React.FC<WordEditorProps> = ({ docId, existingDoc, onSave, onBack }) => {
  const [docName, setDocName] = useState(existingDoc?.name || 'Untitled Document');
  const [content, setContent] = useState(existingDoc?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [historySidebar, setHistorySidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [versions, setVersions] = useState<Version[]>(existingDoc?.history || []);

  useEffect(() => {
    if (existingDoc) {
      setContent(existingDoc.content);
      setDocName(existingDoc.name);
    }
  }, [existingDoc]);

  const handleSave = () => {
    setIsSaving(true);
    
    const newVersion: Version = { timestamp: Date.now(), content, name: `Snapshot ${versions.length + 1}` };
    const updatedHistory = [newVersion, ...versions].slice(0, 10);
    setVersions(updatedHistory);

    const doc: Document = {
      id: docId || existingDoc?.id || Math.random().toString(36).substring(2, 9),
      name: docName,
      content,
      updatedAt: Date.now(),
      tags: existingDoc?.tags || [],
      folderId: existingDoc?.folderId || null,
      history: updatedHistory
    };
    
    onSave(doc);
    setTimeout(() => setIsSaving(false), 800);
  };

  const revertToVersion = (v: Version) => {
    if (confirm('Revert to this version? Current changes will be lost.')) {
      setContent(v.content);
      setHistorySidebar(false);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + prefix + selectedText + suffix + after;
    setContent(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] transition-all duration-500 overflow-hidden">
      
      {/* Top Title Bar */}
      {!isFocusMode && (
        <div className="h-10 bg-rose-700 flex items-center justify-between px-2 md:px-4 text-white shrink-0">
          <div className="flex items-center gap-1 md:gap-3">
            <button onClick={onBack} className="hover:bg-white/10 p-1 rounded transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <FileText size={16} className="hidden sm:block" />
              <input 
                value={docName} 
                onChange={e => setDocName(e.target.value)} 
                className="bg-transparent border-none outline-none font-bold text-sm w-32 sm:w-64 text-white focus:bg-white/10 px-2 rounded" 
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-[10px] font-bold uppercase tracking-widest">
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              {isSaving ? 'Syncing...' : 'Saved to Local'}
            </div>
            <button onClick={handleSave} className="hover:bg-white/10 px-2 md:px-3 py-1 rounded">Sync</button>
          </div>
        </div>
      )}

      {/* Ribbon Toolbar */}
      {!isFocusMode && (
        <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-30">
          <div className="p-2 px-4 md:px-8 flex items-center gap-4 md:gap-6 overflow-x-auto select-none bg-slate-50/50 min-h-[60px] scrollbar-hide">
            {/* View Modes */}
            <div className="flex bg-slate-200 p-1 rounded-lg gap-1">
              <button 
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-2 transition-all ${viewMode === 'edit' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Eye size={14} /> Preview
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-2 transition-all ${viewMode === 'split' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Layout size={14} /> Split
              </button>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-2" />

            {/* Markdown Tools */}
            <div className="flex items-center gap-1">
              <ToolBtn icon={<Heading1 size={16} />} onClick={() => insertMarkdown('# ')} title="Heading 1" />
              <ToolBtn icon={<Heading2 size={16} />} onClick={() => insertMarkdown('## ')} title="Heading 2" />
              <ToolBtn icon={<Heading3 size={16} />} onClick={() => insertMarkdown('### ')} title="Heading 3" />
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <ToolBtn icon={<Bold size={16} />} onClick={() => insertMarkdown('**', '**')} title="Bold" />
              <ToolBtn icon={<Italic size={16} />} onClick={() => insertMarkdown('_', '_')} title="Italic" />
              <ToolBtn icon={<Strikethrough size={16} />} onClick={() => insertMarkdown('~~', '~~')} title="Strikethrough" />
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <ToolBtn icon={<List size={16} />} onClick={() => insertMarkdown('- ')} title="Bullet List" />
              <ToolBtn icon={<ListOrdered size={16} />} onClick={() => insertMarkdown('1. ')} title="Numbered List" />
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <ToolBtn icon={<Quote size={16} />} onClick={() => insertMarkdown('> ')} title="Quote" />
              <ToolBtn icon={<CodeIcon size={16} />} onClick={() => insertMarkdown('`', '`')} title="Inline Code" />
              <ToolBtn icon={<LinkIcon size={16} />} onClick={() => insertMarkdown('[', '](url)')} title="Link" />
              <ToolBtn icon={<ImageIcon size={16} />} onClick={() => insertMarkdown('![alt text](', ')')} title="Image" />
            </div>

            {/* History & Modes */}
            <div className="flex items-center gap-4 ml-auto">
              <button onClick={() => setHistorySidebar(!historySidebar)} className={`h-9 px-4 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${historySidebar ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                <History size={14} /> History
              </button>
              <button onClick={() => setIsFocusMode(true)} className="h-9 px-4 rounded-lg bg-white text-slate-600 border border-slate-200 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                <Maximize2 size={14} /> Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {isFocusMode && (
          <button 
            onClick={() => setIsFocusMode(false)}
            className="fixed top-6 right-6 p-3 bg-slate-900 text-white rounded-full opacity-20 hover:opacity-100 transition-all z-[100]"
          >
            <Minimize2 size={20} />
          </button>
        )}

        {historySidebar && (
          <aside className="absolute md:relative w-full md:w-80 h-full bg-white border-r border-slate-200 p-6 overflow-y-auto animate-in slide-in-from-left duration-300 z-40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-rose-500" /> Snapshots
              </h3>
              <button className="md:hidden p-2 text-slate-400" onClick={() => setHistorySidebar(false)}>
                <ChevronLeft size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {versions.length === 0 ? (
                <p className="text-xs text-slate-300 italic">No history yet.</p>
              ) : (
                versions.map((v, i) => (
                  <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all cursor-default">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-700">{v.name}</span>
                      <button onClick={() => revertToVersion(v)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all" title="Revert">
                        <RotateCcw size={14} />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400">{new Date(v.timestamp).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        <div className={`flex-1 flex overflow-hidden ${isFocusMode ? 'p-0' : 'p-2 md:p-6 bg-slate-100'}`}>
          <div className={`flex-1 flex flex-col md:flex-row gap-4 md:gap-6 max-w-7xl mx-auto w-full h-full`}>
            {/* Editor Pane */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
                <textarea
                  id="markdown-editor"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your markdown here..."
                  className="flex-1 p-4 md:p-8 outline-none resize-none font-mono text-sm leading-relaxed text-slate-700"
                  spellCheck="false"
                />
              </div>
            )}

            {/* Preview Pane */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto ${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
                <div className="p-4 md:p-12 prose max-w-none">
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isFocusMode && (
        <footer className="h-8 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
          <div className="flex gap-4 md:gap-8 items-center">
            <span className="flex items-center gap-1.5"><Type size={12} className="text-rose-500" /> {wordCount} <span className="hidden sm:inline">WORDS</span></span>
            <span className="hidden md:flex items-center gap-1.5"><FileText size={12} className="text-slate-300" /> MARKDOWN DOCUMENT</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <span className="hidden sm:inline">SYNCED TO SECURE VAULT</span>
          </div>
        </footer>
      )}
    </div>
  );
};

const ToolBtn = ({ icon, onClick, title, active }: any) => (
  <button 
    onClick={onClick} 
    title={title}
    className={`p-2 rounded-lg transition-all ${active ? 'bg-rose-100 text-rose-600' : 'hover:bg-white border border-transparent hover:border-slate-200 text-slate-600'}`}
  >
    {icon}
  </button>
);
