
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Send, Bot, User, Sparkles, 
  Zap, Shield, Terminal, Cpu, Loader2,
  AlertCircle, CheckCircle2, Play, Image as ImageIcon,
  Paperclip, X, History, Plus, Trash2, ChevronLeft, ChevronRight,
  MessageSquare, Download, FileText, Presentation, Table, Globe, Layers
} from 'lucide-react';
import { Agent, BusinessPlan, ChatSession, ChatMessage } from '../types';
import { createAIInstance } from '../utils/ai';
import { cordovalTools, toolHandlers } from '../utils/toolRegistry';
import Markdown from 'react-markdown';
import { ChatTimer } from './ChatTimer';
import { storage } from '../storage';
import { motion, AnimatePresence } from 'motion/react';
import { NewsletterAgentUI } from './NewsletterAgentUI';
import { VideoScriptSpecialist } from './VideoScriptSpecialist';
import { ColdOutreachPersonalizer } from './ColdOutreachPersonalizer';
import { CustomerReplyBot } from './CustomerReplyBot';
import { ProductDescriptionAgent } from './ProductDescriptionAgent';
import { AdCopyGenerator } from './AdCopyGenerator';
import { FinanceForensic } from './FinanceForensic';
import { SocialMediaStrategist } from './SocialMediaStrategist';
import { PressReleaseProfessional } from './PressReleaseProfessional';
import { WhitePaperEngineer } from './WhitePaperEngineer';
import { SOPCreator } from './SOPCreator';
import { QuizCreator } from './QuizCreator';
import { CustomerPersonaProfiler } from './CustomerPersonaProfiler';
import { DocumentaryFilmmakerAgent } from './DocumentaryFilmmakerAgent';
import { ViralAdProducerAgent } from './ViralAdProducerAgent';
import { ProductDemoSpecialistAgent } from './ProductDemoSpecialistAgent';
import { TikTokTrendClonerAgent } from './TikTokTrendClonerAgent';
import { EcomLifestylePhotographerAgent } from './EcomLifestylePhotographerAgent';
import { BookCoverVisionaryAgent } from './BookCoverVisionaryAgent';
import { EventPosterArtistAgent } from './EventPosterArtistAgent';
import { WhitePaperResearcherAgent } from './WhitePaperResearcherAgent';
import { Spreadsheet } from '../types';

interface AgentRuntimeProps {
  agent: Agent;
  onBack: () => void;
  onAgentForged?: () => void;
  onStartPodcast?: () => void;
  onStartBusinessPlan?: (plan?: BusinessPlan) => void;
  onArtifactCreated?: () => void;
  onOpenDoc?: (docId: string) => void;
  onOpenSheet?: (sheetId: string) => void;
  onSaveSheet?: (sheet: Spreadsheet) => void;
}

export const AgentRuntime: React.FC<AgentRuntimeProps> = ({ 
  agent, onBack, onAgentForged, onStartPodcast, onStartBusinessPlan, onArtifactCreated, onOpenDoc, onOpenSheet, onSaveSheet
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastGeneratedImage = useRef<string | null>(null);

  // Load sessions on mount or agent change
  useEffect(() => {
    loadSessions();
  }, [agent.id]);

  const loadSessions = async () => {
    try {
      const results = await storage.list('chat-sessions');
      const sortedSessions = results
        .map(r => r.data as ChatSession)
        .filter(s => s.agentId === agent.id)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      
      setSessions(sortedSessions);
      
      if (sortedSessions.length > 0) {
        selectSession(sortedSessions[0]);
      } else {
        createNewSession();
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const createNewSession = async () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New ${agent.title} Link`,
      messages: [
        { 
          role: 'model', 
          content: `I am **${agent.title}**. ${agent.description}\n\nHow can I assist your mission today?` 
        }
      ],
      agentId: agent.id,
      updatedAt: Date.now(),
      tags: ['agent-session'],
      folderId: null,
      history: []
    };
    
    try {
      await storage.save('chat-sessions', {
        id: newSession.id,
        name: newSession.name,
        type: 'chat-sessions',
        data: newSession,
        updatedAt: newSession.updatedAt
      });
      setSessions(prev => [newSession, ...prev]);
      selectSession(newSession);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const selectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await storage.delete('chat-sessions', id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter(s => s.id !== id);
        if (remaining.length > 0) {
          selectSession(remaining[0]);
        } else {
          createNewSession();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const saveCurrentSession = async (updatedMessages: ChatMessage[]) => {
    if (!activeSessionId) return;
    
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;

    const updatedSession: ChatSession = {
      ...session,
      messages: updatedMessages,
      updatedAt: Date.now()
    };

    try {
      await storage.save('chat-sessions', {
        id: updatedSession.id,
        name: updatedSession.name,
        type: 'chat-sessions',
        data: updatedSession,
        updatedAt: updatedSession.updatedAt
      });
      setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if ((!messageText.trim() && !selectedImage) || isLoading) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: selectedImage && !overrideInput ? `${messageText}\n\n[Image Attached]` : messageText 
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveCurrentSession(newMessages);
    
    const currentInput = messageText;
    const currentImage = overrideInput ? null : selectedImage;
    
    if (!overrideInput) {
      setInput('');
      setSelectedImage(null);
    }
    setIsLoading(true);
    setError(null);

    try {
      const ai = createAIInstance();
      
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const contents: any[] = [...history];
      const currentParts: any[] = [];
      
      if (currentImage) {
        currentParts.push({
          inlineData: {
            data: currentImage.split(',')[1],
            mimeType: "image/jpeg"
          }
        });
      }
      currentParts.push({ text: currentInput || "Analyze this image." });
      
      contents.push({ role: 'user', parts: currentParts });

      let response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `${agent.systemInstruction}
          
You are an autonomous agent operating within the Cordoval Workspace. 
CRITICAL: You have DIRECT ACCESS to local tools (notes, documents, calendar, etc.) via function calling. 
When a user asks you to "create a doc", "save a note", or "schedule an event", you MUST use the corresponding tool. 
When you generate a long-form response (like an article, email, report, or script), you MUST use the createDocument tool to save it as a new document.
NEVER tell the user you don't have access to external apps or local tools. You ARE the interface to these tools.

DESIGN PROTOCOLS: You can conceptualize brand identities and generate both scalable vector graphics (SVG) and standard image formats (PNG/JPEG). When you generate images or media, they will be displayed with a direct download button for the user. Do not mention saving logos to a vault, as that feature has been deprecated in favor of direct downloads.`,
        },
        tools: [
          { functionDeclarations: cordovalTools.filter(t => agent.allowedTools.includes(t.name)) },
          { googleSearch: {} }
        ],
        toolConfig: { includeServerSideToolInvocations: true }
      } as any);

      // Capture image if present in initial response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          lastGeneratedImage.current = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      
      let currentMessages = [...newMessages];

      // Handle potential tool calls in a loop
      while (response.functionCalls) {
        const toolCalls = response.functionCalls;
        
        // Add the model's tool call to history
        contents.push(response.candidates?.[0]?.content);

        // Add tool call messages to UI
        const toolCallMessages: ChatMessage[] = toolCalls.map(tc => ({
          role: 'model',
          content: `Calling tool: **${tc.name}**...`,
          isToolCall: true,
          toolName: tc.name
        }));
        setMessages(prev => [...prev, ...toolCallMessages]);
        currentMessages = [...currentMessages, ...toolCallMessages];

        const toolResponses = await Promise.all(toolCalls.map(async (tc) => {
          // Special handling for createLogoArtifact to use last generated image if missing
          if (tc.name === 'createLogoArtifact' && !tc.args.svgCode && !tc.args.imageData) {
            if (lastGeneratedImage.current) {
              tc.args.imageData = lastGeneratedImage.current;
            } else {
              // Look back through history for the most recent image
              const lastImageMsg = [...messages].reverse().find(m => m.image);
              if (lastImageMsg?.image) {
                tc.args.imageData = lastImageMsg.image;
              }
            }
          }

          const handler = (toolHandlers as any)[tc.name];
          if (handler) {
            try {
              const result = await handler(tc.args);
              if (tc.name === 'createDocument' && result.id && onOpenDoc) {
                onOpenDoc(result.id);
              }
              if (onArtifactCreated) {
                onArtifactCreated();
              }
              if (tc.name === 'forgeAgent' && onAgentForged) {
                onAgentForged();
              }
              if (tc.name === 'startPodcastRecording' && onStartPodcast) {
                onStartPodcast();
              }
              if (tc.name === 'createBusinessPlan' && onStartBusinessPlan) {
                onStartBusinessPlan();
              }
              if (tc.name === 'startTimer') {
                const timerMsg: ChatMessage = {
                  role: 'model',
                  content: `Timer started for ${tc.args.duration}s.`,
                  timerData: { duration: tc.args.duration as number, label: tc.args.label as string }
                };
                setMessages(prev => [...prev, timerMsg]);
                currentMessages = [...currentMessages, timerMsg];
              }
              return {
                functionResponse: {
                  name: tc.name,
                  response: result,
                  id: tc.id
                }
              };
            } catch (err) {
              return {
                functionResponse: {
                  name: tc.name,
                  response: { error: String(err) },
                  id: tc.id
                }
              };
            }
          }
          return {
            functionResponse: {
              name: tc.name,
              response: { error: "Tool handler not found" },
              id: tc.id
            }
          };
        }));

        contents.push({ role: 'user', parts: toolResponses });

        // Send tool results back to Gemini
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
          config: {
            systemInstruction: `${agent.systemInstruction}
          
You are an autonomous agent operating within the Cordoval Workspace. 
CRITICAL: You have DIRECT ACCESS to local tools (notes, documents, calendar, etc.) via function calling. 
When a user asks you to "create a doc", "save a note", or "schedule an event", you MUST use the corresponding tool. 
When you generate a long-form response (like an article, email, report, or script), you MUST use the createDocument tool to save it as a new document.
NEVER tell the user you don't have access to external apps or local tools. You ARE the interface to these tools.

DESIGN PROTOCOLS: You can conceptualize brand identities and generate both scalable vector graphics (SVG) and standard image formats (PNG/JPEG). When you generate images or media, they will be displayed with a direct download button for the user. Do not mention saving logos to a vault, as that feature has been deprecated in favor of direct downloads.`,
          },
          tools: [
            { functionDeclarations: cordovalTools.filter(t => agent.allowedTools.includes(t.name)) },
            { googleSearch: {} }
          ],
          toolConfig: { includeServerSideToolInvocations: true }
        } as any);
      }

      // Final response from AI
      let modelContent = "";
      let modelImage = undefined;

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.text) {
          modelContent += part.text;
        } else if (part.inlineData) {
          modelImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          lastGeneratedImage.current = modelImage;
        }
      }

      if (modelContent || modelImage) {
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          modelContent += "\n\n**Sources:**\n" + chunks.map((c: any) => `- [${c.web?.title || c.web?.uri}](${c.web?.uri})`).join("\n");
        }
        const finalModelMessage: ChatMessage = { role: 'model', content: modelContent, image: modelImage };
        const finalMessages = [...currentMessages, finalModelMessage];
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);
      }

    } catch (err: any) {
      console.error("Agent Runtime Error:", err);
      setError(err.message || "An unexpected error occurred in the neural link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (type: string, content: string) => {
    const typeMap: Record<string, string> = {
      doc: 'createDocument',
      slide: 'createPresentation',
      sheet: 'createSpreadsheet',
      site: 'createSite'
    };
    const toolName = typeMap[type] || type;
    const prompt = `SYSTEM COMMAND: Use the ${toolName} tool to save the following content as a new artifact. Do not just repeat it; you MUST call the tool to persist the data.
    
    Content to save:
    ${content}`;
    
    handleSend(prompt);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex h-full bg-[#020617] text-slate-300 font-sans overflow-hidden relative">
      {/* Session Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed md:relative z-50 h-full w-[280px] sm:w-[320px] md:w-[300px] border-r border-white/5 bg-slate-950 flex flex-col shrink-0 overflow-hidden shadow-2xl md:shadow-none"
            >
              <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-blue-500" /> Neural History
                </h2>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      createNewSession();
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-xl transition-all active:scale-95"
                    title="New Session"
                  >
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setShowSidebar(false)}
                    className="md:hidden p-2 hover:bg-white/5 text-slate-400 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 scrollbar-hide">
                {sessions.length === 0 && (
                  <div className="py-12 text-center">
                    <MessageSquare size={32} className="mx-auto text-slate-800 mb-4" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active links</p>
                  </div>
                )}
                {sessions.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => {
                      selectSession(session);
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    className={`w-full p-3 md:p-4 rounded-2xl text-left transition-all group cursor-pointer border ${activeSessionId === session.id ? 'bg-blue-600/10 border-blue-500/30' : 'hover:bg-white/5 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare size={14} className={activeSessionId === session.id ? 'text-blue-400' : 'text-slate-600'} shrink-0 />
                        <span className={`text-xs font-bold truncate ${activeSessionId === session.id ? 'text-white' : 'text-slate-400'}`}>
                          {session.name}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => deleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2 flex items-center justify-between">
                      <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                      {activeSessionId === session.id && <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Cyber Header */}
        <header className="h-16 md:h-20 px-3 md:px-8 flex items-center justify-between bg-slate-900/50 border-b border-white/5 backdrop-blur-xl z-30 shrink-0">
          <div className="flex items-center gap-1 md:gap-6">
            <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"><ArrowLeft size={20} /></button>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-xl transition-all ${showSidebar ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-slate-500'}`}
            >
              {showSidebar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="flex items-center gap-2 md:gap-4 ml-1 md:ml-0 overflow-hidden">
               <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)] shrink-0">
                 <Bot size={18} className="md:w-6 md:h-6" />
               </div>
               <div className="min-w-0">
                 <h1 className="text-sm md:text-lg font-black text-white tracking-tighter uppercase italic leading-none truncate">{agent.title}</h1>
                 <div className="flex items-center gap-1.5 mt-1 md:mt-1.5">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <p className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">Neural Link: Active</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Local First</span>
                <span className="text-[10px] font-black text-blue-400 uppercase italic">Local Execution Mode</span>
             </div>
             <button 
               onClick={() => {
                 createNewSession();
                 if (window.innerWidth < 768) setShowSidebar(false);
               }}
               className="md:hidden w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 active:scale-95"
             >
               <Plus size={18} />
             </button>
             <div className="hidden md:flex w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 items-center justify-center text-slate-500 shrink-0">
                <Shield size={16} className="md:w-[18px] md:h-[18px]" />
             </div>
          </div>
        </header>

        {/* Chat Space */}
        {agent.id === 'newsletter-ninja' ? (
          <NewsletterAgentUI onGenerated={(id) => onOpenDoc?.(id)} />
        ) : agent.id === 'video-script-specialist' ? (
          <VideoScriptSpecialist 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'cold-outreach-personalizer' ? (
          <ColdOutreachPersonalizer 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'customer-reply-bot' ? (
          <CustomerReplyBot 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'product-description-agent' ? (
          <ProductDescriptionAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'ad-copy-generator' ? (
          <AdCopyGenerator 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'finance-forensic' ? (
          <FinanceForensic 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onSaveSheet={(sheet) => {
              storage.save('sheets', { id: sheet.id, name: sheet.name, type: 'sheets', data: sheet, updatedAt: sheet.updatedAt });
              onOpenSheet?.(sheet.id);
            }}
            onNavigate={(view, id) => {
              if (view === 'sheets') onOpenSheet?.(id || '');
              else onOpenDoc?.(id || '');
            }}
            onBack={onBack}
          />
        ) : agent.id === 'social-media-strategist' ? (
          <SocialMediaStrategist 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'press-release-professional' ? (
          <PressReleaseProfessional 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'white-paper-engineer' ? (
          <WhitePaperEngineer 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'sop-creator' ? (
          <SOPCreator 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'quiz-creator' ? (
          <QuizCreator 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'customer-persona-profiler' ? (
          <CustomerPersonaProfiler 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'documentary-filmmaker' ? (
          <DocumentaryFilmmakerAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'viral-ad-producer' ? (
          <ViralAdProducerAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'product-demo-specialist' ? (
          <ProductDemoSpecialistAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'tiktok-trend-cloner' ? (
          <TikTokTrendClonerAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'ecom-lifestyle-photographer' ? (
          <EcomLifestylePhotographerAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'book-cover-visionary' ? (
          <BookCoverVisionaryAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'event-poster-artist' ? (
          <EventPosterArtistAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : agent.id === 'white-paper-researcher' ? (
          <WhitePaperResearcherAgent 
            onSaveDoc={(doc) => {
              storage.save('docs', { id: doc.id, name: doc.name, type: 'docs', data: doc, updatedAt: doc.updatedAt });
              onOpenDoc?.(doc.id);
            }}
            onNavigate={(view, id) => onOpenDoc?.(id || '')}
            onBack={onBack}
          />
        ) : (
          <>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-8 scrollbar-hide"
            >
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-2 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-white/5'}`}>
                  {msg.role === 'user' ? <User size={14} className="md:w-[18px] md:h-[18px]" /> : <Bot size={14} className="md:w-[18px] md:h-[18px]" />}
                </div>
                
                <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`p-3 md:p-6 rounded-2xl md:rounded-[2rem] text-xs md:text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : msg.role === 'tool' 
                        ? 'bg-slate-900 border border-blue-500/20 text-blue-400 italic rounded-tl-none flex items-center gap-2 md:gap-3'
                        : 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none shadow-xl'
                  }`}>
                    {msg.role === 'tool' && <Zap size={14} className="animate-pulse shrink-0" />}
                    <div className="markdown-body text-xs md:text-sm overflow-x-auto">
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {msg.role === 'model' && !msg.isToolCall && (
                      <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-1.5 md:gap-2 border-t border-white/5 pt-3 md:pt-4">
                        <button 
                          onClick={() => handleAction('doc', msg.content)}
                          className="p-1.5 md:p-2 hover:bg-white/5 text-slate-500 hover:text-blue-400 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                          title="Add to Document"
                        >
                          <FileText size={12} className="md:w-3.5 md:h-3.5" /> Doc
                        </button>
                        <button 
                          onClick={() => handleAction('slide', msg.content)}
                          className="p-1.5 md:p-2 hover:bg-white/5 text-slate-500 hover:text-amber-400 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                          title="Create Presentation"
                        >
                          <Presentation size={12} className="md:w-3.5 md:h-3.5" /> Slide
                        </button>
                        <button 
                          onClick={() => handleAction('sheet', msg.content)}
                          className="p-1.5 md:p-2 hover:bg-white/5 text-slate-500 hover:text-emerald-400 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                          title="Create Spreadsheet"
                        >
                          <Table size={12} className="md:w-3.5 md:h-3.5" /> Sheet
                        </button>
                        <button 
                          onClick={() => handleAction('site', msg.content)}
                          className="p-1.5 md:p-2 hover:bg-white/5 text-slate-500 hover:text-indigo-400 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                          title="Build Webpage"
                        >
                          <Globe size={12} className="md:w-3.5 md:h-3.5" /> Site
                        </button>
                      </div>
                    )}

                    {msg.image && (
                      <div className="mt-3 md:mt-4 flex flex-col gap-2">
                        <div className="rounded-xl overflow-hidden border border-white/10">
                          <img src={msg.image} alt="AI Generated" className="w-full h-auto" referrerPolicy="no-referrer" />
                        </div>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = msg.image!;
                            link.download = `artifact-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all w-fit"
                        >
                          <Download size={12} className="md:w-3.5 md:h-3.5" /> Download Artifact
                        </button>
                      </div>
                    )}
                    {msg.timerData && (
                      <div className="mt-3 md:mt-4">
                        <ChatTimer 
                          duration={msg.timerData.duration} 
                          label={msg.timerData.label} 
                          onClose={() => {
                            // Optionally remove the timer from the message or just hide it
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1.5 px-1.5">
                    {msg.role === 'user' ? 'Local User' : agent.title}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && !messages.some(m => m.role === 'tool' && messages.indexOf(m) === messages.length - 1) && (
              <div className="flex gap-2 md:gap-6 animate-pulse">
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 border border-white/5 shrink-0">
                  <Bot size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div className="bg-slate-900 border border-white/5 p-3 md:p-6 rounded-2xl md:rounded-[2rem] rounded-tl-none">
                  <Loader2 size={14} className="md:w-[18px] md:h-[18px] animate-spin text-blue-500" />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 md:p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-4 text-rose-400 text-[10px] md:text-sm font-medium">
                <AlertCircle size={14} className="md:w-5 md:h-5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
        </>
        )}

        {/* Input Matrix */}
        {![
          'newsletter-ninja', 
          'video-script-specialist', 
          'cold-outreach-personalizer', 
          'customer-reply-bot', 
          'product-description-agent', 
          'ad-copy-generator',
          'finance-forensic',
          'social-media-strategist',
          'press-release-professional',
          'white-paper-engineer',
          'sop-creator',
          'quiz-creator',
          'customer-persona-profiler'
        ].includes(agent.id) && (
          <div className="p-3 md:p-8 bg-slate-900/50 border-t border-white/5 backdrop-blur-xl shrink-0">
          <div className="max-w-4xl mx-auto relative">
            {selectedImage && (
              <div className="absolute -top-16 md:-top-24 left-2 md:left-8 p-1 md:p-2 bg-slate-950 border border-white/10 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 animate-in slide-in-from-bottom-4">
                <img src={selectedImage} className="w-10 h-10 md:w-16 md:h-16 object-cover rounded-lg md:rounded-xl border border-white/5" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-1 hover:bg-white/5 rounded-full text-slate-500 hover:text-white"
                >
                  <X size={12} className="md:w-4 md:h-4" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 text-slate-500 hover:text-blue-400 transition-colors"
            >
              <Paperclip size={18} className="md:w-5 md:h-5" />
            </button>
            <textarea 
              className="w-full bg-slate-950 border border-white/10 rounded-2xl md:rounded-[2.5rem] py-3 md:py-6 px-10 md:px-16 pr-12 md:pr-20 text-xs md:text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none shadow-2xl"
              placeholder={`Command ${agent.title}...`}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-30 disabled:hover:bg-blue-600 active:scale-90 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? <Loader2 size={16} className="md:w-5 md:h-5 animate-spin" /> : <Send size={16} className="md:w-5 md:h-5" />}
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2 md:mt-4 flex flex-col md:flex-row items-center justify-between px-2 md:px-6 gap-2 md:gap-0">
             <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-1.5 md:gap-2">
                   <Terminal size={10} className="text-slate-600 md:w-3 md:h-3" />
                   <span className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol: BYOK_SECURE</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                   <Cpu size={10} className="text-slate-600 md:w-3 md:h-3" />
                   <span className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Model: Gemini-3-Flash</span>
                </div>
             </div>
             <div className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest hidden md:block">
                Shift + Enter for new line
             </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
