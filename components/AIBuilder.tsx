
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Send, Download, RefreshCw, 
  MessageSquare, Layout, Eye, Code, X, 
  Zap, Wand2, Terminal, History, ChevronRight, Layers, Key, ShieldCheck, ExternalLink, Archive, CreditCard
} from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import JSZip from 'jszip';
import { AIBuilderProject } from '../types';

interface AIBuilderProps {
  activeProject?: AIBuilderProject;
  savedProjects: AIBuilderProject[];
  onSave: (project: AIBuilderProject) => void;
  onBack: () => void;
}

export const AIBuilder: React.FC<AIBuilderProps> = ({ activeProject, savedProjects, onSave, onBack }) => {
  const [currentProject, setCurrentProject] = useState<AIBuilderProject | null>(activeProject || null);
  const [prompt, setPrompt] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [showChat, setShowChat] = useState(true);
  
  // Removed local API key state as it must be obtained from process.env.API_KEY

  const handleInitialGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are an elite full-stack web developer. Build a complete, modern, responsive, and highly advanced website or web app based on this prompt: "${prompt}". 
        Output ONLY the full source code (HTML, CSS, JS) combined into a single standalone HTML file. 
        Ensure the design is professional, using modern UI patterns (glassmorphism, animations, responsive grid). 
        Include any necessary CSS frameworks via CDN if needed (like Tailwind). 
        Do not include explanations or markdown formatting tags, just the raw code.`,
        config: {
          temperature: 0.7,
        }
      });

      const generatedCode = response.text || '';
      
      const newProject: AIBuilderProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: prompt.slice(0, 20) + '...',
        updatedAt: Date.now(),
        tags: ['ai-generated'],
        folderId: null,
        history: [],
        prompt: prompt,
        generatedCode: cleanCode(generatedCode),
        chatHistory: [{ role: 'assistant', text: "Project initialized. How should we refine it?" }]
      };
      
      setCurrentProject(newProject);
      onSave(newProject);
    } catch (err: any) {
      console.error('Generation failed:', err);
      alert('AI Generation failed. Please check system configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!chatMessage.trim() || !currentProject) return;
    
    const userMsg = chatMessage;
    setChatMessage('');
    setIsGenerating(true);

    const updatedHistory = [...currentProject.chatHistory, { role: 'user' as const, text: userMsg }];
    
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are refining an existing web project. 
        Current Code: 
        ${currentProject.generatedCode}
        
        User Request for Changes: 
        "${userMsg}"
        
        Output ONLY the NEW UPDATED full source code for the entire standalone HTML file. 
        Do not include explanations or markdown formatting tags, just the raw code.`
      });

      const newCode = cleanCode(response.text || '');
      const finalProject = {
        ...currentProject,
        generatedCode: newCode,
        chatHistory: [...updatedHistory, { role: 'assistant' as const, text: "I've applied those changes. What's next?" }],
        updatedAt: Date.now()
      };

      setCurrentProject(finalProject);
      onSave(finalProject);
    } catch (err: any) {
      console.error('Refinement failed:', err);
      alert('Refinement failed. Please check system configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanCode = (code: string) => {
    return code.replace(/```html|```/g, '').trim();
  };

  const downloadProjectZip = async () => {
    if (!currentProject) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      zip.file("index.html", currentProject.generatedCode);
      zip.file("README.md", `# ${currentProject.name}\n\nThis project was architected by KDS AI Builder.\n\n## Original Prompt\n${currentProject.prompt}\n\n## Context\nGenerated at: ${new Date().toLocaleString()}\nIterations: ${currentProject.chatHistory.length}`);
      zip.file("metadata.json", JSON.stringify({
        id: currentProject.id,
        name: currentProject.name,
        prompt: currentProject.prompt,
        historyCount: currentProject.chatHistory.length,
        engine: 'Gemini 3.1 Pro'
      }, null, 2));
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '_')}-ai-artifact.zip`;
      a.click();
    } catch (err) {
      console.error("Failed to package AI project:", err);
    }
    setIsExporting(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FC] overflow-hidden">
      
      {/* Removed local API Key modal as management is handled via environment variables */}

      {!currentProject ? (
        <div className="flex-1 flex flex-col bg-[#F8F9FC] overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-8 py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-violet-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-12 animate-bounce">
              <Sparkles size={40} />
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6">
              Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Pure Magic.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mb-12">
              Describe your vision in plain English. Our AI architect will code, style, and deploy a high-fidelity web app instantly using the Gemini Engine.
            </p>
            
            <div className="w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col gap-6 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                 <Wand2 size={120} />
               </div>
               <textarea 
                 placeholder="Example: Build a modern task management dashboard with a dark theme, glassmorphism cards, and interactive charts using Tailwind CSS..." 
                 className="w-full h-40 bg-slate-50 border-none rounded-[2rem] p-8 text-lg font-medium text-slate-700 outline-none focus:ring-4 focus:ring-violet-500/5 transition-all resize-none placeholder:text-slate-300"
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
               />
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Zap size={14} className="text-amber-500" /> ENGINE_READY
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      disabled={isGenerating || !prompt.trim()}
                      onClick={handleInitialGenerate}
                      className="h-16 px-12 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all hover:bg-slate-800 disabled:opacity-20 active:scale-95"
                    >
                      {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
                      {isGenerating ? 'Architecting...' : 'Build Project'}
                    </button>
                  </div>
               </div>
            </div>

            {savedProjects.length > 0 && (
              <div className="mt-20 w-full text-left">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Restore Recent Artifacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedProjects.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setCurrentProject(p)}
                      className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-violet-200 transition-all cursor-pointer group flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                          <Layout size={20} />
                        </div>
                        <ChevronRight size={20} className="text-slate-200 group-hover:text-violet-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 tracking-tight">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Modified {new Date(p.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full bg-[#0D1117] overflow-hidden">
          <header className="h-16 px-6 bg-[#161B22] border-b border-slate-800 flex items-center justify-between shrink-0 z-50 shadow-lg">
            <div className="flex items-center gap-6">
               <button onClick={onBack} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all"><ArrowLeft size={20} /></button>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500" />
                    <span className="text-sm font-black text-white italic">{currentProject.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">High Fidelity Engine Session</span>
               </div>
            </div>

            <div className="flex items-center bg-[#010409] p-1 rounded-xl border border-slate-800">
              <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Eye size={14} /> Preview</button>
              <button onClick={() => setViewMode('code')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'code' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Code size={14} /> Source</button>
            </div>

            <div className="flex items-center gap-3">
               <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-xl transition-all ${showChat ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
                  <MessageSquare size={18} />
               </button>
               <button 
                onClick={downloadProjectZip} 
                disabled={isExporting}
                className="h-10 px-6 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
               >
                  {isExporting ? <Archive size={14} className="animate-pulse" /> : <Download size={14} />}
                  {isExporting ? 'Archiving...' : 'Export ZIP'}
               </button>
               <button onClick={() => onSave(currentProject)} className="h-10 px-6 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 active:scale-95 transition-all">
                  Commit Artifact
               </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 bg-[#010409] relative flex flex-col">
              {isGenerating && (
                <div className="absolute inset-0 z-50 bg-[#010409]/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-20">
                   <div className="w-24 h-24 relative mb-12">
                      <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse" />
                      <RefreshCw className="text-violet-500 animate-spin absolute inset-0 m-auto" size={48} />
                   </div>
                   <h3 className="text-2xl font-black text-white italic mb-4">Re-imagining the Architecture...</h3>
                   <p className="text-slate-500 max-w-md font-medium">Gemini 3.1 Pro is rewriting the source code based on your latest feedback. Paid tier rendering in progress.</p>
                </div>
              )}

              {viewMode === 'preview' ? (
                <iframe 
                  srcDoc={currentProject.generatedCode}
                  className="w-full h-full border-none bg-white"
                  title="AI Project Preview"
                />
              ) : (
                <div className="flex-1 overflow-auto p-12 bg-[#010409] font-mono text-sm">
                   <pre className="text-emerald-400 leading-relaxed">
                      {currentProject.generatedCode}
                   </pre>
                </div>
              )}
            </div>

            {showChat && (
              <aside className="w-[450px] bg-[#0D1117] border-l border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300">
                 <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Terminal size={14} className="text-violet-500" /> Iterative Evolution
                    </h3>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    {currentProject.chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                         <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-[#161B22] text-slate-300 rounded-tl-none border border-slate-800'}`}>
                            {msg.text}
                         </div>
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">{msg.role === 'user' ? 'You' : 'Architect'}</span>
                      </div>
                    ))}
                 </div>

                 <div className="p-6 border-t border-slate-800 bg-[#161B22]">
                    <div className="relative">
                       <textarea 
                        placeholder="Refine design? Add features? Describe changes..." 
                        className="w-full h-32 bg-[#0D1117] border border-slate-800 rounded-3xl p-5 pr-14 text-sm font-medium text-slate-300 outline-none focus:ring-4 focus:ring-violet-500/5 transition-all resize-none placeholder:text-slate-600"
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
                        className="absolute bottom-4 right-4 p-3 bg-violet-600 text-white rounded-2xl shadow-xl hover:bg-violet-500 disabled:opacity-20 transition-all active:scale-90"
                       >
                          <Send size={18} />
                       </button>
                    </div>
                    <p className="text-[8px] font-black text-slate-700 uppercase text-center mt-4 tracking-tighter">Gemini 3.1 Pro Engine • Multi-turn Code Mutation</p>
                 </div>
              </aside>
            )}
          </div>

          <footer className="h-8 bg-[#161B22] border-t border-slate-800 px-6 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest shrink-0">
             <div className="flex gap-8 items-center">
                <span className="flex items-center gap-1.5"><History size={12} className="text-violet-500" /> {currentProject.chatHistory.length} ITERATIONS</span>
                <span className="flex items-center gap-1.5"><Layers size={12} className="text-slate-700" /> STANDALONE ARTIFACT</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                VAULT_BRIDGE_ACTIVE
             </div>
          </footer>
        </div>
      )}
    </div>
  );
};
