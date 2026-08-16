
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, FileCode, Plus, Trash2, Play, Save, ChevronRight, 
  ChevronDown, X, Terminal, Files, Search, Settings, Bug, 
  ExternalLink, Code, Globe, Zap, Cpu, History, SplitSquareVertical, Archive, Download, Braces, RefreshCw
} from 'lucide-react';
import JSZip from 'jszip';
import { CodeProject, CodeFile } from '../types';

interface CodeEditorProps {
  activeProject?: CodeProject;
  onSave: (project: CodeProject) => void;
  onBack: () => void;
}

declare const require: any;

export const CodeEditor: React.FC<CodeEditorProps> = ({ activeProject, onSave, onBack }) => {
  const [project, setProject] = useState<CodeProject>(activeProject || {
    id: Math.random().toString(36).substr(2, 9),
    name: 'New Node App',
    updatedAt: Date.now(),
    tags: ['dev', 'js'],
    folderId: null,
    history: [],
    files: [
      { id: '1', name: 'main.js', language: 'javascript', content: '// KDS Code Studio Initialized\n\nconsole.log("System Online...");\n\nfunction calculateFuture() {\n  const now = new Date();\n  console.log("Current cycle:", now.getTime());\n  return "Optimized";\n}\n\ncalculateFuture();' },
      { id: '2', name: 'style.css', language: 'css', content: 'body {\n  background: #000;\n  color: #fff;\n  font-family: sans-serif;\n}' }
    ],
    activeFileId: '1'
  });

  const [openFileIds, setOpenFileIds] = useState<string[]>([project.activeFileId]);
  const [consoleLogs, setConsoleLogs] = useState<{ type: 'log' | 'error' | 'warn', msg: string, time: string }[]>([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'search' | 'history'>('explorer');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMonacoReady, setIsMonacoReady] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<any>(null);
  const modelsRef = useRef<Record<string, any>>({});

  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0];

  // Initialize Monaco
  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    
    const initMonaco = () => {
      if (typeof require !== 'undefined') {
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
        require(['vs/editor/editor.main'], (monaco: any) => {
          if (!editorContainerRef.current) return;

          // Initialize editor
          const editor = monaco.editor.create(editorContainerRef.current, {
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            padding: { top: 20 },
            lineNumbersMinChars: 3,
            backgroundColor: '#0D1117'
          });

          monacoEditorRef.current = editor;

          // Load models for existing files
          project.files.forEach(file => {
            const model = monaco.editor.createModel(
              file.content,
              file.language === 'javascript' ? 'javascript' : file.language === 'css' ? 'css' : 'html'
            );
            modelsRef.current[file.id] = model;
          });

          // Set initial model
          editor.setModel(modelsRef.current[project.activeFileId]);

          // Listen for changes
          editor.onDidChangeModelContent(() => {
            const content = editor.getValue();
            setProject(prev => ({
              ...prev,
              files: prev.files.map(f => f.id === prev.activeFileId ? { ...f, content } : f)
            }));
          });

          setIsMonacoReady(true);
        });
      }
    };

    if (typeof require === 'undefined') {
      script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        initMonaco();
      };
      document.body.appendChild(script);
    } else {
      initMonaco();
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, []);

  // Sync model on active file change
  useEffect(() => {
    if (monacoEditorRef.current && modelsRef.current[project.activeFileId]) {
      monacoEditorRef.current.setModel(modelsRef.current[project.activeFileId]);
    }
  }, [project.activeFileId]);

  const addFile = () => {
    const name = prompt('Enter filename (e.g. index.js):', 'script.js');
    if (!name) return;
    const language = name.endsWith('.css') ? 'css' : name.endsWith('.html') ? 'html' : 'javascript';
    const newFile: CodeFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      language,
      content: '// New file created\n'
    };

    // Create Monaco Model
    if (typeof (window as any).monaco !== 'undefined') {
      const monaco = (window as any).monaco;
      modelsRef.current[newFile.id] = monaco.editor.createModel(newFile.content, language);
    }

    setProject(prev => ({ ...prev, files: [...prev.files, newFile] }));
    switchToFile(newFile.id);
  };

  const removeFile = (id: string) => {
    if (project.files.length <= 1) return;
    
    // Dispose Monaco Model
    if (modelsRef.current[id]) {
      modelsRef.current[id].dispose();
      delete modelsRef.current[id];
    }

    setProject(prev => {
      const newFiles = prev.files.filter(f => f.id !== id);
      return {
        ...prev,
        files: newFiles,
        activeFileId: prev.activeFileId === id ? newFiles[0].id : prev.activeFileId
      };
    });
    setOpenFileIds(prev => prev.filter(fid => fid !== id));
  };

  const switchToFile = (id: string) => {
    setProject(prev => ({ ...prev, activeFileId: id }));
    if (!openFileIds.includes(id)) {
      setOpenFileIds(prev => [...prev, id]);
    }
  };

  const runCode = () => {
    if (activeFile.language !== 'javascript') {
      setConsoleLogs(prev => [...prev, { type: 'warn', msg: `Cannot execute ${activeFile.language} files directly.`, time: new Date().toLocaleTimeString() }]);
      return;
    }

    setConsoleLogs(prev => [...prev, { type: 'log', msg: `> Running ${activeFile.name}...`, time: new Date().toLocaleTimeString() }]);
    
    const originalLog = console.log;
    const originalError = console.error;
    const logs: any[] = [];

    console.log = (...args) => logs.push({ type: 'log', msg: args.join(' ') });
    console.error = (...args) => logs.push({ type: 'error', msg: args.join(' ') });

    try {
      const fn = new Function(activeFile.content);
      fn();
    } catch (err: any) {
      logs.push({ type: 'error', msg: err.message });
    }

    console.log = originalLog;
    console.error = originalError;

    setConsoleLogs(prev => [
      ...prev, 
      ...logs.map(l => ({ ...l, time: new Date().toLocaleTimeString() }))
    ]);
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave({ ...project, updatedAt: Date.now() });
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      project.files.forEach(file => {
        zip.file(file.name, file.content);
      });
      zip.file("README.md", `# ${project.name}\n\nGenerated by KDS Code Studio with Monaco Engine.\n\nCreated on: ${new Date().toLocaleString()}`);
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-source.zip`;
      a.click();
    } catch (err) {
      console.error("Failed to generate ZIP:", err);
    }
    setIsExporting(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0D1117] text-slate-300 overflow-hidden select-none font-sans">
      
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <aside className="w-16 bg-[#161B22] border-r border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0">
          <button onClick={() => setActiveSidebar('explorer')} className={`p-3 transition-all rounded-xl ${activeSidebar === 'explorer' ? 'bg-rose-500/10 text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}><Files size={24} /></button>
          <button onClick={() => setActiveSidebar('search')} className={`p-3 transition-all rounded-xl ${activeSidebar === 'search' ? 'bg-rose-500/10 text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}><Search size={24} /></button>
          <button onClick={() => setActiveSidebar('history')} className={`p-3 transition-all rounded-xl ${activeSidebar === 'history' ? 'bg-rose-500/10 text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}><History size={24} /></button>
          <div className="mt-auto space-y-6 flex flex-col items-center">
            <button className="text-slate-500 hover:text-slate-300"><Settings size={22} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </aside>

        {/* Sidebar Pane */}
        <aside className="w-64 bg-[#0D1117] border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 flex items-center justify-between">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Explorer</h2>
             <div className="flex gap-1">
               <button onClick={addFile} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white" title="New File"><Plus size={16} /></button>
               <button className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white" title="Format (Placeholder)"><Braces size={16} /></button>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
             <div className="flex items-center gap-2 px-4 py-1 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                <ChevronDown size={14} className="text-slate-600" /> Current Workspace
             </div>
             {project.files.map(file => (
               <div 
                key={file.id} 
                onClick={() => switchToFile(file.id)}
                className={`flex items-center justify-between px-6 py-1.5 cursor-pointer text-xs font-bold group border-l-2 transition-all ${project.activeFileId === file.id ? 'bg-rose-500/5 text-white border-rose-500' : 'text-slate-500 border-transparent hover:bg-slate-800/30'}`}
               >
                 <div className="flex items-center gap-2">
                    <FileCode size={14} className={file.name.endsWith('.js') ? 'text-yellow-400' : file.name.endsWith('.css') ? 'text-blue-400' : 'text-rose-400'} />
                    <span className="tracking-tight">{file.name}</span>
                 </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all"
                 >
                   <X size={12} />
                 </button>
               </div>
             ))}
          </div>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0D1117]">
           {/* Tab Bar */}
           <div className="h-10 bg-[#161B22] flex items-center overflow-x-auto scrollbar-hide shrink-0 border-b border-slate-800">
              {openFileIds.map(fid => {
                const f = project.files.find(item => item.id === fid);
                if (!f) return null;
                return (
                  <div 
                    key={fid}
                    onClick={() => switchToFile(fid)}
                    className={`h-full px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 cursor-pointer min-w-[120px] relative transition-all ${project.activeFileId === fid ? 'bg-[#0D1117] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-800/20'}`}
                  >
                    {project.activeFileId === fid && <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />}
                    <FileCode size={12} className={f.name.endsWith('.js') ? 'text-yellow-400' : 'text-blue-400'} />
                    <span className="truncate">{f.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenFileIds(prev => prev.filter(id => id !== fid)); }}
                      className="ml-auto p-1 hover:bg-slate-800 rounded transition-colors text-slate-600 hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
              <div className="ml-auto flex items-center px-4 gap-4">
                 <button 
                  onClick={handleExportZip} 
                  disabled={isExporting}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 disabled:opacity-50"
                 >
                    {isExporting ? <Archive size={12} className="animate-pulse" /> : <Download size={12} />}
                    {isExporting ? 'Packaging...' : 'Archive'}
                 </button>
                 <button onClick={handleSave} className={`text-[10px] font-black uppercase tracking-widest ${isSaving ? 'text-emerald-400 animate-pulse' : 'text-slate-500 hover:text-slate-300'}`}>
                    {isSaving ? 'Synchronizing...' : 'Sync Vault'}
                 </button>
                 <button onClick={runCode} className="h-7 px-4 bg-rose-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-rose-500 transition-all shadow-xl shadow-rose-900/10">
                    <Play size={10} fill="currentColor" /> Execute
                 </button>
              </div>
           </div>

           {/* Editor Viewport */}
           <div className="flex-1 flex overflow-hidden relative">
              {!isMonacoReady && (
                <div className="absolute inset-0 z-10 bg-[#0D1117] flex flex-col items-center justify-center text-center">
                   <RefreshCw className="text-rose-500 animate-spin mb-4" size={32} />
                   <p className="text-xs font-black uppercase tracking-widest text-slate-500">Initializing Monaco Engine...</p>
                </div>
              )}
              <div ref={editorContainerRef} className="w-full h-full" />
           </div>

           {/* Console */}
           {isConsoleVisible && (
             <div className="h-64 bg-[#010409] border-t border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-bottom-8">
                <div className="h-10 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-6">
                      <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-500 h-10 px-2">Terminal Output</button>
                      <button className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-300 transition-all h-10 px-2">System Events</button>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setConsoleLogs([])} className="p-1.5 hover:bg-slate-800 rounded text-slate-600 hover:text-white" title="Clear Console"><Trash2 size={14} /></button>
                      <button onClick={() => setIsConsoleVisible(false)} className="p-1.5 hover:bg-slate-800 rounded text-slate-600 hover:text-white"><X size={14} /></button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-1 scrollbar-hide">
                   {consoleLogs.length === 0 ? (
                     <div className="text-slate-800 italic uppercase tracking-tighter">Ready for cycle execution...</div>
                   ) : (
                     consoleLogs.map((log, i) => (
                       <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                          <span className="text-slate-700 shrink-0 font-black">[{log.time}]</span>
                          <span className={`${log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-slate-400'} break-all font-bold`}>
                            {log.msg}
                          </span>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-7 bg-[#161B22] border-t border-slate-800 px-6 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] shrink-0">
        <div className="flex items-center gap-6">
           <span className="flex items-center gap-2 text-rose-500"><Zap size={10} /> MONACO_ENGINE_READY</span>
           <span className="text-slate-700">|</span>
           <span className="flex items-center gap-2"><Cpu size={10} /> {activeFile.language.toUpperCase()}</span>
           <span className="text-slate-700">|</span>
           <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-6">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" /> LOCAL VAULT ENCRYPTED</span>
           <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition-colors" onClick={() => setIsConsoleVisible(!isConsoleVisible)}>
              <Terminal size={10} /> {isConsoleVisible ? 'MINIMIZE TRAY' : 'MAXIMIZE TRAY'}
           </div>
        </div>
      </footer>
    </div>
  );
};
