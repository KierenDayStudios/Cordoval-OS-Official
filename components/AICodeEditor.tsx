
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, FileCode, Upload, Send, RefreshCw, 
  X, ChevronRight, Terminal, MessageSquare, 
  Download, Save, FolderOpen, File, Trash2,
  Sparkles, Code as CodeIcon, Zap
} from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { CodeProject, AIProjectFile } from '../types';

interface AICodeEditorProps {
  activeProject?: CodeProject;
  onSave: (project: CodeProject) => void;
  onBack: () => void;
}

export const AICodeEditor: React.FC<AICodeEditorProps> = ({ activeProject, onSave, onBack }) => {
  const [currentProject, setCurrentProject] = useState<CodeProject | null>(activeProject || null);
  const [chatMessage, setChatMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AIProjectFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      newFiles.push({
        path: file.webkitRelativePath || file.name,
        content: content
      });
    }

    const project: CodeProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Project - ${new Date().toLocaleDateString()}`,
      updatedAt: Date.now(),
      tags: ['ai-code-editor'],
      folderId: null,
      history: [],
      files: newFiles,
      chatHistory: [{ role: 'assistant', text: "Project files uploaded. I've indexed your codebase. What edits should we perform?" }]
    };

    setCurrentProject(project);
    onSave(project);
    if (newFiles.length > 0) setSelectedFileIndex(0);
  };

  const handleRefine = async () => {
    if (!chatMessage.trim() || !currentProject) return;
    
    const userMsg = chatMessage;
    setChatMessage('');
    setIsGenerating(true);

    const updatedHistory = [...currentProject.chatHistory, { role: 'user' as const, text: userMsg }];
    
    try {
      const ai = createAIInstance();
      
      // Prepare context: list of files and their content
      const fileContext = currentProject.files.map(f => `FILE: ${f.path}\nCONTENT:\n${f.content}`).join('\n\n---\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are an expert AI Code Editor. Your task is to modify the provided codebase based on the user's request.
        
        CODEBASE CONTEXT:
        ${fileContext}
        
        USER REQUEST:
        "${userMsg}"
        
        INSTRUCTIONS:
        1. Analyze the entire codebase.
        2. Apply the requested changes.
        3. Return the UPDATED content for ALL files that were modified.
        4. Format your response as a JSON array of objects: [{"path": "string", "content": "string"}].
        5. ONLY return the JSON array. No explanations or markdown blocks.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const resultText = response.text || '[]';
      let modifiedFiles: AIProjectFile[] = [];
      try {
        modifiedFiles = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse AI response as JSON", resultText);
        // Fallback or retry logic could go here
      }

      const updatedFiles = currentProject.files.map(f => {
        const modified = modifiedFiles.find(mf => mf.path === f.path);
        return modified ? modified : f;
      });

      const finalProject = {
        ...currentProject,
        files: updatedFiles,
        chatHistory: [...updatedHistory, { role: 'assistant' as const, text: `I've analyzed the request and updated ${modifiedFiles.length} files in your project.` }],
        updatedAt: Date.now()
      };

      setCurrentProject(finalProject);
      onSave(finalProject);
    } catch (err: any) {
      console.error('AI Refinement failed:', err);
      alert('Neural link error during code synthesis.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProject = () => {
    if (!currentProject) return;
    // Simple download of the currently selected file for now, or could zip all
    const file = currentProject.files[selectedFileIndex || 0];
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans">
      
      {/* Header */}
      <header className="h-16 px-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"><ArrowLeft size={20} /></button>
           <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CodeIcon size={14} className="text-indigo-400" />
                <span className="text-sm font-black text-white italic uppercase tracking-tighter">
                  {currentProject ? currentProject.name : 'AI Code Synthesis'}
                </span>
              </div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Expert Neural Refactoring</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
           {currentProject && (
             <>
               <button 
                onClick={downloadProject} 
                className="h-10 px-6 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
               >
                  <Download size={14} /> Export
               </button>
               <button 
                onClick={() => { onSave(currentProject); alert('Project committed to vault.'); }} 
                className="h-10 px-8 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-indigo-500"
               >
                  Commit Changes
               </button>
             </>
           )}
        </div>
      </header>

      {!currentProject ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.3)] mb-12 animate-in fade-in zoom-in duration-1000">
            <Terminal size={48} />
          </div>
          
          <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6 uppercase italic text-center">
             Neural <br />
             <span className="text-indigo-500">Code Synthesis.</span>
          </h1>
          
          <p className="text-slate-400 font-bold uppercase tracking-widest max-w-xl text-center mb-16 opacity-60">
            Upload your codebase and let the AI Architect perform complex refactoring, bug fixes, and feature implementations.
          </p>

          <div className="flex gap-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-10 py-6 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
            >
              <Upload size={20} /> Upload Files
            </button>
            <button 
              onClick={() => folderInputRef.current?.click()}
              className="px-10 py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center gap-4 hover:bg-white/10 transition-all active:scale-95"
            >
              <FolderOpen size={20} /> Upload Folder
            </button>
          </div>

          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <input 
            type="file" 
            // @ts-ignore
            webkitdirectory="" 
            directory="" 
            ref={folderInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer */}
          <aside className="w-72 bg-black/40 border-r border-white/5 flex flex-col shrink-0">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Codebase</span>
                <button onClick={() => setCurrentProject(null)} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {currentProject.files.map((file, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${selectedFileIndex === idx ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                  >
                    <File size={14} />
                    <span className="text-xs font-bold truncate">{file.path.split('/').pop()}</span>
                  </button>
                ))}
             </div>
          </aside>

          {/* Editor Area */}
          <main className="flex-1 flex flex-col bg-black relative">
             {isGenerating && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-20 animate-in fade-in duration-500">
                   <RefreshCw className="text-indigo-500 animate-spin mb-8" size={64} />
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Synthesizing Logic...</h3>
                   <p className="text-slate-500 max-w-md font-bold uppercase text-xs tracking-widest">The neural engine is refactoring your codebase based on the requested modifications.</p>
                </div>
             )}

             {selectedFileIndex !== null ? (
               <div className="flex-1 flex flex-col">
                  <div className="h-12 px-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileCode size={12} /> {currentProject.files[selectedFileIndex].path}
                     </span>
                  </div>
                  <div className="flex-1 overflow-auto p-12 font-mono text-sm">
                     <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {currentProject.files[selectedFileIndex].content}
                     </pre>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-slate-700 italic text-sm font-bold uppercase tracking-widest">
                  Select a file to view source
               </div>
             )}
          </main>

          {/* AI Chat Sidebar */}
          <aside className="w-96 bg-black/60 backdrop-blur-2xl border-l border-white/5 flex flex-col shrink-0">
             <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={20} className="text-white" /></div>
                <div>
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Architect</h3>
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Neural Link Active</p>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                {currentProject.chatHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                     <div className={`max-w-[90%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'}`}>
                        {msg.text}
                     </div>
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-3 mx-2">{msg.role === 'user' ? 'You' : 'Architect'}</span>
                  </div>
                ))}
             </div>

             <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <div className="relative">
                   <textarea 
                    placeholder="Ask for code edits..." 
                    className="w-full h-32 bg-black border border-white/10 rounded-[2rem] p-6 pr-16 text-sm font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-800"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRefine();
                      }
                    }}
                   />
                   <button 
                    disabled={isGenerating || !chatMessage.trim()}
                    onClick={handleRefine}
                    className="absolute bottom-5 right-5 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:bg-indigo-500 disabled:opacity-20 transition-all active:scale-90"
                   >
                      <Send size={20} />
                   </button>
                </div>
             </div>
          </aside>
        </div>
      )}
    </div>
  );
};
