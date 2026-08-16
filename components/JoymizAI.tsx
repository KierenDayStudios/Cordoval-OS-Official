
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Send, Download, RefreshCw, 
  MessageSquare, Layout, Eye, Code as CodeIcon, X, 
  Zap, Wand2, Terminal, History, ChevronRight, Layers, Key, 
  ShieldCheck, ExternalLink, Archive, CreditCard, Play,
  Maximize2, Share2, PanelLeft, FileCode, CheckCircle2,
  Rocket, Lock, Shield, Info, AlertTriangle
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { createAIInstance, getAIKey } from '../utils/ai';
import JSZip from 'jszip';
import { AIBuilderProject } from '../types';

interface JoymizAIProps {
  activeProject?: AIBuilderProject;
  onSave: (project: AIBuilderProject) => void;
  onBack: () => void;
}

export const JoymizAI: React.FC<JoymizAIProps> = ({ activeProject, onSave, onBack }) => {
  const [currentProject, setCurrentProject] = useState<AIBuilderProject | null>(activeProject || null);
  const [prompt, setPrompt] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setShowChat(false);
  }, [isMobile]);
  
  // BYOK Modal State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if key is already saved locally
  const savedKey = getAIKey();

  const handleInitialGenerateClick = () => {
    if (!prompt.trim()) return;
    
    if (!savedKey) {
      setShowKeyModal(true);
    } else {
      executeGeneration();
    }
  };

  const handleSaveKeyAndBuild = () => {
    if (!tempKey.startsWith('AIza')) {
      alert("Invalid API Key format. Gemini keys usually start with 'AIza'.");
      return;
    }

    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      localStorage.setItem('GEMINI_API_KEY', tempKey);
      setShowKeyModal(false);
      setIsVerifying(false);
      executeGeneration();
    }, 1200);
  };

  const executeGeneration = async () => {
    setIsGenerating(true);
    try {
      const ai = createAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are Joymiz AI, an elite professional website architect. 
        Build a high-fidelity, complete, and stunning web project based on this prompt: "${prompt}".
        
        ARCHITECTURE REQUIREMENTS:
        1. Output ONLY the full source code (HTML, CSS, JS) combined into a single standalone HTML file. 
        2. Use Tailwind CSS via CDN for styling.
        3. Use Lucide-react icons (via CDN) or similar if needed.
        4. Design must be modern, mobile-first responsive, and production-ready.
        5. CRITICAL: Include <meta name="viewport" content="width=device-width, initial-scale=1.0">.
        6. Ensure all elements scale perfectly on small screens using Tailwind's responsive utilities.
        7. Include animations (CSS or basic JS).
        8. Do not include markdown code blocks or explanations, just the raw code.`,
        config: {
          temperature: 0.7,
        }
      });

      const generatedCode = response.text || '';
      
      const newProject: AIBuilderProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Joymiz - ${prompt.slice(0, 20)}...`,
        updatedAt: Date.now(),
        tags: ['joymiz-ai', 'web-architect'],
        folderId: null,
        history: [],
        prompt: prompt,
        generatedCode: cleanCode(generatedCode),
        chatHistory: [{ role: 'assistant', text: "Architecture initialized. The Engine Room is ready for refinements. What should we adjust?" }]
      };
      
      setCurrentProject(newProject);
      onSave(newProject);
    } catch (err: any) {
      console.error('Joymiz Engine Failure:', err);
      alert('Generation failed. Ensure your system neural link is stable.');
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
        contents: `You are Joymiz AI Architect. Refine the existing web project based on the user's feedback.
        
        CURRENT PROJECT ARCHITECTURE:
        ${currentProject.generatedCode}
        
        USER MODIFICATION REQUEST:
        "${userMsg}"
        
        INSTRUCTION:
        1. Refactor the code to incorporate the requested changes while maintaining the existing quality and logic.
        2. Ensure the design remains mobile-first and fully responsive.
        3. Output ONLY the full updated code for the entire project. No explanations.`
      });

      const newCode = cleanCode(response.text || '');
      const finalProject = {
        ...currentProject,
        generatedCode: newCode,
        chatHistory: [...updatedHistory, { role: 'assistant' as const, text: "I've applied the modifications to the project architecture. Preview updated." }],
        updatedAt: Date.now()
      };

      setCurrentProject(finalProject);
      onSave(finalProject);
    } catch (err: any) {
      console.error('Refinement failed:', err);
      alert('Engine error during refinement.');
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanCode = (code: string) => {
    return code.replace(/```html|```/g, '').trim();
  };

  const downloadProjectZip = async () => {
    if (!currentProject) return;
    const zip = new JSZip();
    zip.file("index.html", currentProject.generatedCode);
    zip.file("README.md", `# ${currentProject.name}\n\nGenerated by Joymiz AI Architect.\n\nPrompt: ${currentProject.prompt}`);
    
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joymiz_artifact_${Date.now()}.zip`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans relative">
      
      {/* API Key Modal Overlay */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6">
           <div className="bg-slate-900 rounded-[3.5rem] w-full max-w-xl p-12 shadow-[0_0_100px_rgba(79,70,229,0.3)] border border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                 <ShieldCheck size={300} />
              </div>

              <div className="flex items-center gap-5 mb-12 relative z-10">
                 <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                    <Key size={32} />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter italic leading-none uppercase">Neural Bridge</h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2">Bring Your Own Key System</p>
                 </div>
              </div>

              <div className="space-y-8 relative z-10">
                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gemini API Key</label>
                       <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-black text-indigo-400 uppercase hover:text-white flex items-center gap-1.5 transition-colors">
                          Get Key <ExternalLink size={10} />
                       </a>
                    </div>
                    <div className="relative">
                       <input 
                        type="password"
                        placeholder="AIzaSy..." 
                        className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-mono text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                        value={tempKey}
                        onChange={e => setTempKey(e.target.value)}
                        autoFocus
                       />
                       <Lock size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700" />
                    </div>
                 </div>

                 <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20 flex items-start gap-4">
                    <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-[11px] text-indigo-200/80 font-medium leading-relaxed">
                       <span className="text-white font-black">BILLING REQUIRED:</span> Ensure your Google Cloud Project has billing enabled. Joymiz AI utilizes high-reasoning Gemini 3.1 Pro models which require active quota.
                    </p>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleSaveKeyAndBuild}
                      disabled={isVerifying || !tempKey}
                      className="w-full h-16 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-indigo-500 hover:text-white active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
                    >
                       {isVerifying ? <RefreshCw className="animate-spin" /> : <ShieldCheck size={20} />}
                       {isVerifying ? 'Verifying Neural Link...' : 'Authorize & Start Build'}
                    </button>
                    <button 
                      onClick={() => setShowKeyModal(false)}
                      className="w-full h-12 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Return to Workspace
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {!currentProject ? (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto scrollbar-hide relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[600px] bg-indigo-600/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-12 md:py-24 flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.3)] mb-8 md:mb-12 animate-in fade-in zoom-in duration-1000">
              <Sparkles size={32} className="md:w-10 md:h-10" />
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] md:leading-[0.85] mb-6 md:mb-8 uppercase italic">
               Joymiz <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-600">AI Architect.</span>
            </h1>
            
            <p className="text-sm md:text-lg text-slate-400 font-bold uppercase tracking-widest max-w-2xl mb-10 md:mb-16 opacity-80 px-4">
              The high-fidelity professional website builder powered by Google's Gemini 3.1 Intelligence. No templates. Just architecture.
            </p>
            
            <div className="w-full bg-white/5 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-white/10 shadow-2xl flex flex-col gap-6 md:gap-8 group">
               <textarea 
                 placeholder="Describe your vision (e.g. 'A dark-themed obsidian portfolio for a creative agency with a parallax hero and interactive contact form using Tailwind CSS')..." 
                 className="w-full h-32 md:h-48 bg-black/40 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-lg md:text-xl font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-700"
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 autoFocus
               />
               
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex flex-col items-start">
                       <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Synthesis Mode</span>
                       <span className="text-[10px] md:text-xs font-black text-indigo-400 uppercase italic">High-Reasoning v3.1</span>
                    </div>
                    <div className="w-px h-6 md:h-8 bg-white/10" />
                    <div className="flex flex-col items-start">
                       <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Link</span>
                       <span className={`text-[10px] md:text-xs font-black uppercase ${savedKey ? 'text-emerald-400' : 'text-amber-400'}`}>{savedKey ? 'Linked' : 'Ready'}</span>
                    </div>
                  </div>

                  <button 
                    disabled={isGenerating || !prompt.trim()}
                    onClick={handleInitialGenerateClick}
                    className="w-full md:w-auto h-16 md:h-20 px-10 md:px-16 bg-white text-slate-900 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-2xl transition-all hover:bg-indigo-600 hover:text-white hover:scale-105 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
                  >
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Rocket size={18} className="md:w-5 md:h-5" />}
                    {isGenerating ? 'Architecting...' : 'Build Project'}
                  </button>
               </div>
            </div>

            <div className="mt-12 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 w-full max-w-5xl">
               <FeatureCard icon={<CodeIcon size={18} />} label="Native Code" desc="100% scratch built logic" />
               <FeatureCard icon={<Layout size={18} />} label="Tailwind Hub" desc="Modern high-fidelity CSS" />
               <FeatureCard icon={<MessageSquare size={18} />} label="Iterative" desc="Natural language refinement" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
          {/* Editor Header */}
          <header className="h-auto md:h-16 px-4 md:px-6 py-3 md:py-0 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex flex-col md:flex-row items-center justify-between shrink-0 z-50 shadow-2xl gap-4 md:gap-0">
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
               <div className="flex items-center gap-3 md:gap-6">
                  <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"><ArrowLeft size={18} /></button>
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                       <Sparkles size={12} className="text-indigo-400" />
                       <span className="text-xs md:text-sm font-black text-white italic uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">{currentProject.name}</span>
                     </div>
                     <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Engine Room Active</span>
                  </div>
               </div>
               
               {isMobile && (
                 <div className="flex items-center gap-2">
                   <button 
                    onClick={() => setShowChat(!showChat)} 
                    className={`p-2.5 rounded-xl transition-all border ${showChat ? 'bg-white/10 text-white border-indigo-500/50 shadow-lg' : 'text-slate-500 border-transparent hover:bg-white/5'}`}
                   >
                      <MessageSquare size={18} />
                   </button>
                   <button 
                    onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')} 
                    className="p-2.5 bg-white/5 text-white rounded-xl border border-white/10"
                   >
                      {viewMode === 'preview' ? <FileCode size={18} /> : <Eye size={18} />}
                   </button>
                 </div>
               )}
            </div>

            {!isMobile && (
              <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-white/5 shadow-inner">
                <button 
                  onClick={() => setViewMode('preview')} 
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Eye size={14} /> Preview
                </button>
                <button 
                  onClick={() => setViewMode('code')} 
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'code' ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <FileCode size={14} /> Architect
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
               {!isMobile && (
                 <button 
                  onClick={() => setShowChat(!showChat)} 
                  className={`p-3 rounded-xl transition-all border ${showChat ? 'bg-white/10 text-white border-indigo-500/50 shadow-lg' : 'text-slate-500 border-transparent hover:bg-white/5'}`}
                  title="Toggle AI Architect"
                 >
                    <MessageSquare size={18} />
                 </button>
               )}
               <button 
                onClick={downloadProjectZip} 
                className="flex-1 md:flex-none h-10 px-4 md:px-6 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
               >
                  <Archive size={14} /> {isMobile ? 'ZIP' : 'Export ZIP'}
               </button>
               <button 
                onClick={() => { onSave(currentProject); alert('Artifact synced to local vault.'); }} 
                className="flex-1 md:flex-none h-10 px-4 md:px-8 bg-indigo-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-900/40 active:scale-95 transition-all hover:bg-indigo-500"
               >
                  Commit {isMobile ? '' : 'Project'}
               </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 bg-black relative flex flex-col">
              {isGenerating && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 md:p-20 animate-in fade-in duration-500">
                   <div className="w-20 h-20 md:w-32 md:h-32 relative mb-8 md:mb-12">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                      <RefreshCw className="text-indigo-500 animate-spin absolute inset-0 m-auto md:w-16 md:h-16" size={48} />
                   </div>
                   <h3 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Mutating Core Architecture...</h3>
                   <p className="text-slate-500 max-w-md font-bold uppercase text-[10px] md:text-xs tracking-widest">Gemini 3.1 Pro is refactoring the source files to incorporate your refinements.</p>
                </div>
              )}

              {viewMode === 'preview' ? (
                <div className="w-full h-full bg-white relative">
                   <iframe 
                    srcDoc={currentProject.generatedCode}
                    className="w-full h-full border-none"
                    title="Joymiz Artifact Preview"
                   />
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-6 md:p-12 bg-slate-950 font-mono text-xs md:text-sm group">
                   <div className="max-w-5xl mx-auto">
                      <div className="flex items-center gap-3 mb-6 md:mb-8 text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 border-l border-indigo-500/30">
                         <Terminal size={14} /> Source Viewport
                      </div>
                      <pre className="text-emerald-400/90 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/40">
                        {currentProject.generatedCode}
                      </pre>
                   </div>
                </div>
              )}
            </div>

            {showChat && (
              <aside className={`fixed inset-0 z-[70] md:relative md:inset-auto md:z-auto md:w-[480px] bg-black/95 md:bg-black/60 backdrop-blur-2xl border-l border-white/5 flex flex-col shrink-0 animate-in slide-in-from-right-full md:slide-in-from-right-12 duration-500`}>
                 <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><MessageSquare size={20} className="text-white" /></div>
                       <div>
                          <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Architect</h3>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Neural Bridge Connected</p>
                       </div>
                    </div>
                    <button onClick={() => setShowChat(false)} className="p-2 text-slate-600 hover:text-white transition-colors"><X size={24} /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 md:space-y-10 scrollbar-hide">
                    {currentProject.chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                         <div className={`max-w-[90%] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] text-xs md:text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-2xl shadow-indigo-900/20' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'}`}>
                            {msg.text}
                         </div>
                         <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2 md:mt-3 mx-2">{msg.role === 'user' ? 'You' : 'Architect'}</span>
                      </div>
                    ))}
                 </div>

                 <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.02]">
                    <div className="relative">
                       <textarea 
                        placeholder="Request changes..." 
                        className="w-full h-28 md:h-36 bg-black border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 pr-16 text-xs md:text-sm font-medium text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-800"
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
                        className="absolute bottom-4 right-4 md:bottom-5 md:right-5 p-3 md:p-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl shadow-2xl hover:bg-indigo-500 disabled:opacity-20 transition-all active:scale-90"
                       >
                          <Send size={18} className="md:w-5 md:h-5" />
                       </button>
                    </div>
                    <p className="text-[8px] font-black text-slate-700 uppercase text-center mt-4 md:mt-6 tracking-[0.3em]">Joymiz High-Fidelity Design Engine</p>
                 </div>
              </aside>
            )}
          </div>

          <footer className="h-8 bg-black/60 border-t border-white/5 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest shrink-0">
             <div className="flex gap-6 md:gap-10 items-center">
                <span className="flex items-center gap-1.5"><History size={10} className="text-indigo-500 md:w-3 md:h-3" /> {currentProject.history.length} Snapshots</span>
                <span className="hidden sm:flex items-center gap-1.5"><Layers size={12} className="text-slate-800" /> Standalone Artifact Protocol</span>
             </div>
             <div className="flex items-center gap-3 md:gap-4 text-emerald-500">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VAULT_SYNCED
             </div>
          </footer>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, label, desc }: any) => (
  <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-4 group hover:border-indigo-500/20 transition-all">
     <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <div>
        <h4 className="text-xs font-black text-white uppercase tracking-widest">{label}</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{desc}</p>
     </div>
  </div>
);
