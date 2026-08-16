import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, Sparkles, Key, CheckCircle2, ChevronRight, ChevronLeft, 
  Download, Copy, RefreshCw, Eye, Code as CodeIcon, MessageSquare, 
  ExternalLink, Layers, ArrowRight, Play, FileText, Check, AlertCircle,
  Laptop, Tablet, Smartphone, Maximize2, Minimize2, Trash2, Plus, 
  FolderOpen, HelpCircle, Zap, ShieldCheck, ArrowUpRight, Share2, CornerDownLeft,
  Monitor, ShieldAlert
} from 'lucide-react';
import { FastTrackPlan, FastTrackPhase, FastTrackPhaseField } from '../../types';
import { DEFAULT_PHASES_TEMPLATE, SAMPLE_FAST_TRACK_PLANS, createNewFastTrackPlan } from '../../data/fastTrackDefault';
import { useIsMobile } from '../../useIsMobile';

interface FastTrackTabProps {
  onNavigate?: (view: any) => void;
  onSelectTab?: (tabId: string) => void;
}

export const FastTrackTab: React.FC<FastTrackTabProps> = ({ onNavigate, onSelectTab }) => {
  const isMobile = useIsMobile(1024);

  // Return to home handler for mobile blocker
  const handleReturnHome = () => {
    if (onSelectTab) {
      onSelectTab('home');
    } else if (onNavigate) {
      onNavigate('dashboard');
    } else {
      window.location.href = '/';
    }
  };

  // API Key State & Gate
  const [apiKey, setApiKey] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Active Plan & Mode
  const [currentPlan, setCurrentPlan] = useState<FastTrackPlan>(() => {
    const saved = localStorage.getItem('cordoval_fast_track_active_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved Fast Track plan', e);
      }
    }
    // Default to the first sample plan or fresh plan
    return SAMPLE_FAST_TRACK_PLANS[0]?.plan || createNewFastTrackPlan();
  });

  const [activeMode, setActiveMode] = useState<'wizard' | 'coder'>('wizard');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // AI Assist State for Wizard
  const [activeAssistField, setActiveAssistField] = useState<FastTrackPhaseField | null>(null);
  const [assistPrompt, setAssistPrompt] = useState<string>('');
  const [assistLoading, setAssistLoading] = useState<boolean>(false);
  const [assistResult, setAssistResult] = useState<string>('');
  const [phaseAutoLoading, setPhaseAutoLoading] = useState<boolean>(false);

  // AI Coder State
  const [codeModeView, setCodeModeView] = useState<'preview' | 'code'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [prototypeCode, setPrototypeCode] = useState<string>(() => {
    return currentPlan.generatedPrototypeCode || '';
  });
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [coderPrompt, setCoderPrompt] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; timestamp: number }[]>(() => {
    return currentPlan.prototypeChatHistory || [];
  });
  const [chatInput, setChatInput] = useState<string>('');
  const [isIteratingCode, setIsIteratingCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check stored API key on mount
  useEffect(() => {
    const stored = localStorage.getItem('GEMINI_API_KEY') || '';
    setApiKey(stored);
    if (stored) {
      setInputKey(stored);
    }
  }, []);

  // Save plan to localStorage on changes
  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('cordoval_fast_track_active_plan', JSON.stringify(currentPlan));
    }
  }, [currentPlan]);

  // Sync prototype code changes to active plan
  useEffect(() => {
    if (prototypeCode !== currentPlan.generatedPrototypeCode) {
      setCurrentPlan(prev => ({
        ...prev,
        generatedPrototypeCode: prototypeCode,
        updatedAt: Date.now()
      }));
    }
  }, [prototypeCode]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSaveApiKey = (keyToSave: string) => {
    const cleaned = keyToSave.trim();
    if (cleaned) {
      localStorage.setItem('GEMINI_API_KEY', cleaned);
      setApiKey(cleaned);
      setIsKeySaved(true);
      setTimeout(() => {
        setIsKeySaved(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  const handleFieldChange = (phaseId: number, fieldId: string, value: string) => {
    setCurrentPlan(prev => {
      const updatedPhases = prev.phases.map(ph => {
        if (ph.id === phaseId) {
          return {
            ...ph,
            fields: ph.fields.map(f => {
              if (f.id === fieldId) {
                return { ...f, value };
              }
              return f;
            })
          };
        }
        return ph;
      });
      return {
        ...prev,
        phases: updatedPhases,
        updatedAt: Date.now()
      };
    });
  };

  // Calculate overall wizard progress
  const totalFields = currentPlan.phases.reduce((acc, p) => acc + p.fields.length, 0);
  const completedFields = currentPlan.phases.reduce((acc, p) => {
    return acc + p.fields.filter(f => f.value && f.value.trim().length > 0).length;
  }, 0);
  const progressPercent = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  // AI Assist Call for Single Field
  const handleRunAIAssist = async () => {
    if (!activeAssistField) return;
    setAssistLoading(true);
    setAssistResult('');

    try {
      const currentPhase = currentPlan.phases[currentPhaseIndex];
      const planSummary = currentPlan.phases
        .map(p => `[${p.title}]: ${p.fields.map(f => `${f.label}: ${f.value || 'Not specified'}`).join('; ')}`)
        .join('\n\n');

      const response = await fetch('/api/fast-track/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: assistPrompt || `Generate a refined, compelling, high-converting response for "${activeAssistField.label}". Context: ${activeAssistField.description}`,
          fieldLabel: activeAssistField.label,
          phaseTitle: currentPhase.title,
          planSummary,
          apiKey: apiKey || localStorage.getItem('GEMINI_API_KEY')
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errJson.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setAssistResult(data.suggestion || '');
    } catch (err: any) {
      console.error('AI Assist error:', err);
      setAssistResult(`AI Assist error: ${err.message || 'Failed to communicate with AI service. Please check your Gemini API key in settings.'}`);
    } finally {
      setAssistLoading(false);
    }
  };

  const applyAIAssistResult = () => {
    if (!activeAssistField || !assistResult) return;
    const currentPhase = currentPlan.phases[currentPhaseIndex];
    handleFieldChange(currentPhase.id, activeAssistField.id, assistResult);
    setActiveAssistField(null);
    setAssistResult('');
    setAssistPrompt('');
  };

  // AI Auto-Complete Current Phase
  const handleAutoCompletePhase = async () => {
    const currentPhase = currentPlan.phases[currentPhaseIndex];
    setPhaseAutoLoading(true);

    try {
      const planSummary = currentPlan.phases
        .map(p => `[${p.title}]: ${p.fields.map(f => `${f.label}: ${f.value || 'Not specified'}`).join('; ')}`)
        .join('\n\n');

      for (const field of currentPhase.fields) {
        if (!field.value || field.value.trim().length === 0) {
          const res = await fetch('/api/fast-track/assist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Synthesize a sharp, professional answer for the field: "${field.label}" (${field.description}).`,
              fieldLabel: field.label,
              phaseTitle: currentPhase.title,
              planSummary,
              apiKey: apiKey || localStorage.getItem('GEMINI_API_KEY')
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.suggestion) {
              handleFieldChange(currentPhase.id, field.id, data.suggestion);
            }
          }
        }
      }
    } catch (e) {
      console.error('Auto complete error:', e);
    } finally {
      setPhaseAutoLoading(false);
    }
  };

  // AI Coder Generate Frontend Prototype from Wizard Plan
  const handleGeneratePrototype = async (customInstruction?: string) => {
    setIsGeneratingCode(true);

    try {
      const planSummary = currentPlan.phases
        .map(p => `== ${p.title} (${p.subtitle}) ==\n` + p.fields.map(f => `• ${f.label}: ${f.value || 'Not specified'}`).join('\n'))
        .join('\n\n');

      const response = await fetch('/api/fast-track/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planSummary,
          customPrompt: customInstruction || coderPrompt || `Build a high-conversion, interactive, polished web app and landing page prototype for "${currentPlan.title}". Include full hero, interactive demo/calculator widget, pricing tier toggles, customer booking/intake modal, testimonials, and FAQ.`,
          existingCode: prototypeCode,
          apiKey: apiKey || localStorage.getItem('GEMINI_API_KEY')
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errJson.error || `Generation failed (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data.code) {
        setPrototypeCode(data.code);
        setActiveMode('coder');
        setCodeModeView('preview');

        const newMsg = {
          role: 'assistant' as const,
          text: `I've generated the complete frontend prototype for **${currentPlan.title}** based on your Fast Track 8-Phase plan! Check the live interactive preview. What would you like to refine next?`,
          timestamp: Date.now()
        };
        const updatedChat = [...chatMessages, newMsg];
        setChatMessages(updatedChat);
        setCurrentPlan(prev => ({
          ...prev,
          generatedPrototypeCode: data.code,
          prototypeChatHistory: updatedChat,
          updatedAt: Date.now()
        }));
      }
    } catch (err: any) {
      console.error('Prototype generation error:', err);
      alert(`Prototype generation notice: ${err.message || 'The AI service is experiencing a temporary delay. Please try again.'}`);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // AI Coder Chat Iteration
  const handleSendChatIteration = async () => {
    if (!chatInput.trim() || isIteratingCode) return;
    const userText = chatInput.trim();
    setChatInput('');
    setIsIteratingCode(true);

    const userMsg = { role: 'user' as const, text: userText, timestamp: Date.now() };
    const newChatList = [...chatMessages, userMsg];
    setChatMessages(newChatList);

    try {
      const response = await fetch('/api/fast-track/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: `App Name: ${currentPlan.title}\nTagline: ${currentPlan.tagline}`,
          customPrompt: `Update the existing prototype code to fulfill this user request: "${userText}". Keep the whole code self-contained in a single executable HTML document with Tailwind CSS.`,
          existingCode: prototypeCode,
          apiKey: apiKey || localStorage.getItem('GEMINI_API_KEY')
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }
      const data = await response.json();

      if (data.code) {
        setPrototypeCode(data.code);
        const assistantMsg = {
          role: 'assistant' as const,
          text: `Applied: "${userText}". Updated the live prototype!`,
          timestamp: Date.now()
        };
        const finalChat = [...newChatList, assistantMsg];
        setChatMessages(finalChat);
        setCurrentPlan(prev => ({
          ...prev,
          generatedPrototypeCode: data.code,
          prototypeChatHistory: finalChat,
          updatedAt: Date.now()
        }));
      }
    } catch (err: any) {
      console.error('Chat iteration error:', err);
      const errMsg = {
        role: 'assistant' as const,
        text: `Failed to update code: ${err.message}`,
        timestamp: Date.now()
      };
      setChatMessages([...newChatList, errMsg]);
    } finally {
      setIsIteratingCode(false);
    }
  };

  const handleCopyPlanMarkdown = () => {
    let md = `# ${currentPlan.title}\n*${currentPlan.tagline}*\n\n`;
    currentPlan.phases.forEach(p => {
      md += `## ${p.title}\n*${p.subtitle}*\n\n`;
      p.fields.forEach(f => {
        md += `### ${f.label}\n${f.value || '_Not answered yet_'}\n\n`;
      });
    });
    navigator.clipboard.writeText(md);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!prototypeCode) return;
    const blob = new Blob([prototypeCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPlan.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_prototype.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!prototypeCode) return;
    navigator.clipboard.writeText(prototypeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLoadSample = (sample: typeof SAMPLE_FAST_TRACK_PLANS[0]) => {
    if (window.confirm(`Load sample blueprint "${sample.name}"? This will replace the current active form.`)) {
      setCurrentPlan(JSON.parse(JSON.stringify(sample.plan)));
      setCurrentPhaseIndex(0);
      if (sample.plan.generatedPrototypeCode) {
        setPrototypeCode(sample.plan.generatedPrototypeCode);
      }
    }
  };

  const handleResetNewPlan = () => {
    if (window.confirm("Start a fresh new Fast Track plan?")) {
      const fresh = createNewFastTrackPlan("Untitled Venture");
      setCurrentPlan(fresh);
      setCurrentPhaseIndex(0);
      setPrototypeCode('');
      setChatMessages([]);
    }
  };

  // MOBILE BLOCKER POPUP: Restrict Fast Track on mobile due to complex design and features
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600 blur-[100px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Monitor size={38} strokeWidth={2.2} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] font-black uppercase tracking-wider text-amber-400">
            <ShieldAlert size={14} /> Desktop Experience Required
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Desktop Only Area
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed px-2 font-normal">
              This area is only available on desktop because of the complex design, 8-phase venture engine, and interactive frontend prototype code editor.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleReturnHome}
            className="w-full h-13 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Okay, Take Me Home</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  // GATE SCREEN: If user has not connected Gemini API Key, require it before access
  if (!apiKey) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-900 text-white overflow-y-auto p-4 sm:p-8 lg:p-12 items-center justify-center relative">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Rocket size={26} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Cordoval Fast Track
                </span>
                <span className="text-[10px] font-bold text-slate-400">Idea to Launch</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Connect Neural Link (Gemini API)
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Fast Track uses Gemini AI to formulate your 8-Phase Startup Documentation and compile high-converting, fully interactive frontend prototypes. 
            Connect your Gemini API Key to unlock access.
          </p>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Paste your Gemini API key (AIzaSy...)"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-all pr-24"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const clip = await navigator.clipboard.readText();
                    if (clip) setInputKey(clip);
                  } catch (e) {}
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Paste
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
              >
                Get a free Gemini API Key <ExternalLink size={12} />
              </a>
              <span className="text-slate-500 text-[10px]">Stored strictly in your local browser</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleSaveApiKey(inputKey)}
              disabled={!inputKey.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isKeySaved ? (
                <>
                  <Check size={18} />
                  <span>Key Connected! Launching...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>Connect & Enter Fast Track</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  if (onSelectTab) onSelectTab('home');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Return to Hub
              </button>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('settings');
                }}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                Open System Settings →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentPhase = currentPlan.phases[currentPhaseIndex];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-sm shrink-0">
            <Rocket size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Cordoval Fast Track</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                Idea → Launch
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentPlan.title}
                onChange={e => setCurrentPlan(prev => ({ ...prev, title: e.target.value }))}
                className="text-xs font-bold text-slate-600 bg-transparent hover:bg-slate-100 focus:bg-white rounded px-1.5 py-0.5 outline-none transition-colors border border-transparent focus:border-slate-300 w-48 sm:w-64 truncate"
                placeholder="Enter Venture Name..."
              />
            </div>
          </div>
        </div>

        {/* Mode Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
          {/* Mode Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 shadow-inner">
            <button
              onClick={() => setActiveMode('wizard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'wizard'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} className={activeMode === 'wizard' ? 'text-amber-600' : ''} />
              <span>1. Startup Documentation</span>
            </button>
            <button
              onClick={() => setActiveMode('coder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'coder'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={14} className={activeMode === 'coder' ? 'text-amber-600' : ''} />
              <span>2. AI Coder Prototype</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyPlanMarkdown}
              title="Copy Executive Plan Markdown"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold border border-slate-200/60"
            >
              {copiedDoc ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copiedDoc ? 'Copied' : 'Export'}</span>
            </button>

            {/* Presets & Templates Dropdown */}
            <button
              onClick={() => handleLoadSample(SAMPLE_FAST_TRACK_PLANS[0])}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-xs font-bold border border-slate-200/60 flex items-center gap-1"
              title="Load AI UX Consultancy Blueprint"
            >
              <Layers size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>

            <button
              onClick={handleResetNewPlan}
              title="Start New Plan"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-slate-200/60"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeMode === 'wizard' ? (
          /* ========================================================================= */
          /* MODE 1: 8-PHASE STARTUP DOCUMENTATION WIZARD                             */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Phase Navigation Sidebar */}
            <aside className="w-full md:w-80 bg-white border-r border-slate-200/80 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Plan Completion</span>
                  <span className="text-amber-600 font-black">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {completedFields} of {totalFields} fields answered
                </p>
              </div>

              {/* Phase Step List */}
              <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
                {currentPlan.phases.map((phase, idx) => {
                  const isCurrent = idx === currentPhaseIndex;
                  const phaseCompleted = phase.fields.every(f => f.value && f.value.trim().length > 0);
                  const answeredCount = phase.fields.filter(f => f.value && f.value.trim().length > 0).length;

                  return (
                    <button
                      key={phase.id}
                      onClick={() => setCurrentPhaseIndex(idx)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500/10 border-2 border-amber-500/40 text-slate-900 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                        phaseCompleted 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isCurrent 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {phaseCompleted ? <Check size={14} strokeWidth={3} /> : phase.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black tracking-tight truncate ${isCurrent ? 'text-amber-950' : 'text-slate-800'}`}>
                            {phase.title.split(':')[1]?.trim() || phase.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {answeredCount}/{phase.fields.length} filled
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Callout to AI Coder */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => handleGeneratePrototype()}
                  disabled={isGeneratingCode}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{isGeneratingCode ? 'Compiling Prototype...' : 'Build Frontend Prototype'}</span>
                </button>
              </div>
            </aside>

            {/* Active Phase Content Area */}
            <main className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
              <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-8 flex-1">
                {/* Phase Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                      Step {currentPhase.id} of 8
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      {currentPhase.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      {currentPhase.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoCompletePhase}
                      disabled={phaseAutoLoading}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <Sparkles size={14} className={phaseAutoLoading ? 'animate-spin text-amber-600' : 'text-amber-600'} />
                      <span>{phaseAutoLoading ? 'Synthesizing...' : 'AI Auto-Fill Phase'}</span>
                    </button>
                  </div>
                </div>

                {/* Field Cards */}
                <div className="space-y-6">
                  {currentPhase.fields.map(field => {
                    const isFieldAssisting = activeAssistField?.id === field.id;

                    return (
                      <div
                        key={field.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 group hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">
                              {field.label}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {field.description}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setActiveAssistField(field);
                              setAssistPrompt(`Generate a high-impact, refined answer for "${field.label}".`);
                              setAssistResult('');
                            }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-600 border border-slate-200 hover:border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                          >
                            <Sparkles size={13} className="text-amber-500" />
                            <span>AI Assist</span>
                          </button>
                        </div>

                        {/* Inline AI Assist Drawer if active for this field */}
                        {isFieldAssisting && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-gradient-to-br from-amber-50/80 to-indigo-50/50 rounded-2xl border border-amber-200 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                                <Sparkles size={12} /> AI Strategy Assist
                              </span>
                              <button
                                onClick={() => setActiveAssistField(null)}
                                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                              >
                                Close
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={assistPrompt}
                                onChange={e => setAssistPrompt(e.target.value)}
                                placeholder="Tell Gemini what to emphasize or ask for suggestions..."
                                className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 font-medium"
                              />
                              <button
                                onClick={handleRunAIAssist}
                                disabled={assistLoading}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                              >
                                {assistLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                                <span>{assistLoading ? 'Thinking...' : 'Generate'}</span>
                              </button>
                            </div>

                            {assistResult && (
                              <div className="space-y-2 pt-2 border-t border-amber-200/60">
                                <div className="p-3 bg-white rounded-xl border border-amber-100 text-xs text-slate-800 whitespace-pre-line max-h-48 overflow-y-auto">
                                  {assistResult}
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={applyAIAssistResult}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                  >
                                    <Check size={14} />
                                    <span>Apply Suggestion</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        <textarea
                          rows={4}
                          value={field.value}
                          onChange={e => handleFieldChange(currentPhase.id, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-y leading-relaxed font-medium"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Phase Navigation Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 pb-12">
                  <button
                    onClick={() => setCurrentPhaseIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentPhaseIndex === 0}
                    className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-all shadow-xs"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous Phase</span>
                  </button>

                  {currentPhaseIndex < currentPlan.phases.length - 1 ? (
                    <button
                      onClick={() => setCurrentPhaseIndex(prev => Math.min(currentPlan.phases.length - 1, prev + 1))}
                      className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <span>Next Phase</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleGeneratePrototype();
                        setActiveMode('coder');
                      }}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
                    >
                      <Sparkles size={16} />
                      <span>Finish & Build Prototype</span>
                    </button>
                  )}
                </div>
              </div>
            </main>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 2: AI CODER (INTERACTIVE FRONTEND PROTOTYPE BUILDER)                */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left/Main Workspace: Live Preview & Code Inspector */}
            <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden border-r border-slate-200/80">
              {/* Prototype Toolbar */}
              <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
                    <button
                      onClick={() => setCodeModeView('preview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        codeModeView === 'preview'
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye size={14} />
                      <span>Live Preview</span>
                    </button>
                    <button
                      onClick={() => setCodeModeView('code')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        codeModeView === 'code'
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CodeIcon size={14} />
                      <span>Code Inspector</span>
                    </button>
                  </div>

                  {codeModeView === 'preview' && (
                    <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                      <button
                        onClick={() => setViewportMode('desktop')}
                        className={`p-1.5 rounded-lg text-xs transition-all ${
                          viewportMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Desktop View (100%)"
                      >
                        <Laptop size={14} />
                      </button>
                      <button
                        onClick={() => setViewportMode('tablet')}
                        className={`p-1.5 rounded-lg text-xs transition-all ${
                          viewportMode === 'tablet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Tablet View (768px)"
                      >
                        <Tablet size={14} />
                      </button>
                      <button
                        onClick={() => setViewportMode('mobile')}
                        className={`p-1.5 rounded-lg text-xs transition-all ${
                          viewportMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Mobile View (375px)"
                      >
                        <Smartphone size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (iframeRef.current) {
                        iframeRef.current.srcdoc = prototypeCode;
                      }
                    }}
                    title="Reload Preview"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200/60"
                  >
                    <RefreshCw size={14} />
                  </button>

                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied' : 'Copy HTML'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCode}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* View Container */}
              <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
                {prototypeCode ? (
                  codeModeView === 'preview' ? (
                    <div 
                      className={`h-full bg-white shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border border-slate-300 flex flex-col ${
                        viewportMode === 'mobile' 
                          ? 'w-[375px]' 
                          : viewportMode === 'tablet' 
                            ? 'w-[768px]' 
                            : 'w-full'
                      }`}
                    >
                      <iframe
                        ref={iframeRef}
                        title="Fast Track Interactive Prototype"
                        srcDoc={prototypeCode}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-popups"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-2xl p-4 overflow-auto border border-slate-800 text-xs font-mono text-slate-200">
                      <textarea
                        value={prototypeCode}
                        onChange={e => setPrototypeCode(e.target.value)}
                        className="w-full h-full bg-transparent text-slate-100 font-mono outline-none resize-none leading-relaxed"
                        spellCheck={false}
                      />
                    </div>
                  )
                ) : (
                  <div className="max-w-md text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">No Prototype Compiled Yet</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Generate a complete standalone interactive web application & landing page prototype directly from your Fast Track 8-Phase Startup Plan.
                      </p>
                    </div>
                    <button
                      onClick={() => handleGeneratePrototype()}
                      disabled={isGeneratingCode}
                      className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Sparkles size={16} />
                      <span>{isGeneratingCode ? 'Compiling Prototype...' : 'Generate Frontend Prototype Now'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: AI Iteration Chat */}
            <aside className="w-full md:w-96 bg-white border-l border-slate-200/80 flex flex-col shrink-0 h-full">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 tracking-tight">AI Coder Assistant</h3>
                    <p className="text-[10px] text-slate-400">Iterate & Refine Live</p>
                  </div>
                </div>

                <button
                  onClick={() => handleGeneratePrototype()}
                  disabled={isGeneratingCode}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Regenerate from full plan"
                >
                  <RefreshCw size={11} className={isGeneratingCode ? 'animate-spin' : ''} />
                  <span>Re-compile</span>
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2 mt-4">
                    <p className="text-xs font-bold text-slate-700">Prompt the AI Coder</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ask to change the color scheme, add an ROI calculator, modify pricing tiers, or add customer testimonials!
                    </p>
                    <div className="flex flex-col gap-1.5 pt-2">
                      {[
                        "Add an interactive pricing calculator",
                        "Change color palette to obsidian dark mode",
                        "Add a customer intake modal form"
                      ].map((promptSuggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setChatInput(promptSuggestion)}
                          className="p-2 text-left bg-white hover:bg-amber-50 text-[10px] font-medium text-slate-600 hover:text-amber-900 rounded-xl border border-slate-200/60 transition-colors"
                        >
                          "{promptSuggestion}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                {isIteratingCode && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-medium">
                    <RefreshCw size={14} className="animate-spin text-amber-600" />
                    <span>Updating prototype code with Gemini...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-100 bg-slate-50">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendChatIteration();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Tell AI Coder what to edit..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 transition-colors font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isIteratingCode}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                  >
                    <CornerDownLeft size={14} />
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
