
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Table, Presentation, Search, Zap, Clock, 
  Globe, PenTool, HardDrive, Calendar, Command, Bell, 
  Briefcase, Code, ImageIcon, Grid3X3, Palette, LayoutList, 
  FolderCheck, LayoutGrid, Filter, Settings, MoreHorizontal, 
  Calculator, CalendarDays, Wallet, Users, BrainCircuit, Database,
  StickyNote, Radio, Book, CheckCircle2, Target, Timer as TimerIcon, GraduationCap,
  StopCircle, Bot, MessageSquare, Shield, Video, Mail, MessageCircle, FileSignature, Receipt, Scissors, ScrollText, Stamp, Layers, CreditCard, Monitor, Sliders, Library, BarChart, MonitorSmartphone, Maximize, FileEdit, Map, CalendarClock,
  Sparkles, Rocket, FileCode, Wand2, RefreshCw, Type, ShieldCheck, Megaphone, Camera, AlertTriangle, ShieldAlert, ShoppingCart, Eye, TrendingUp, Phone,
  Smartphone, Film, ShoppingBag, PieChart, Share2, BookOpen, ClipboardList, Package, ChevronRight, GitGraph, Star, Link,
  AlarmClock, UserSearch, Send, Newspaper, UserPlus, HelpCircle, Layout, Music, Mic, Image, Tv, MousePointer2, Terminal, BarChart3, FileSpreadsheet, Scroll, Play, Info
} from 'lucide-react';
import { AppView, Note } from '../types';
import { AppHowToGuideModal } from './AppHowToGuideModal';

interface DashboardProps {
  onNavigate: (view: AppView, id: string | null) => void;
  recentFiles: any[];
  pinnedFiles: any[];
  onSaveNote: (note: Note) => void;
  isWorkspaceConnected: boolean;
  onConnectWorkspace: () => void;
  stats: { 
    docs: number; sheets: number; slides: number; notes: number; sites: number; 
    canvas: number; plans?: number; code?: number; ai?: number; pixel?: number; 
    projects?: number; ledger?: number; clients?: number; decisions?: number;
    journal?: number; habits?: number; goals?: number; passwords?: number;
    aiProjects?: number; workLogs?: number;
  };
  activeTag: string | null;
  onClearTag: () => void;
}

export const AgentsDashboard: React.FC<DashboardProps> = ({ 
  onNavigate, recentFiles, pinnedFiles, onSaveNote, 
  isWorkspaceConnected, onConnectWorkspace, stats, activeTag, onClearTag 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedGuideAppId, setSelectedGuideAppId] = useState<string | null>(null);

  const filteredRecent = (recentFiles || []).filter(f => f.name.toLowerCase().includes(searchValue.toLowerCase()));

  const toolCategories = [
    {
      name: "AI Agents",
      tools: [
        { id: 'ai-sales-objection-crusher', label: 'Objections', icon: Target, color: 'text-rose-600', bg: 'bg-rose-600/10', desc: 'Strategic rebuttal modeling' },
        { id: 'finance-forensic', label: 'Audit', icon: Search, color: 'text-slate-600', bg: 'bg-slate-600/10', desc: 'Deep financial investigation' },
        { id: 'press-release', label: 'PR Agent', icon: Newspaper, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Linguistic narrative reach' },
        { id: 'social-media-strategist', label: 'Social AI Agent', icon: Share2, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Viral growth architecture' },
        { id: 'customer-persona', label: 'Personas', icon: UserSearch, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Neural demographic audit' },
        { id: 'ad-copy', label: 'Ad Copy', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'High-conversion copy' },
        { id: 'sales-outreach', label: 'Outreach', icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-600/10', desc: 'Personalized cold logic' },
        { id: 'customer-reply-bot', label: 'Support', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Automated engagement logic' },
        { id: 'ai-revenue-diversifier', label: 'Growth', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-600/10', desc: 'Fiscal expansion mapping' },
        { id: 'ai-elevator-pitch-shaper', label: 'Pitch', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Narrative impact synthesis' },
        { id: 'ai-tagline-engine', label: 'Taglines', icon: Sparkles, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Linguistic brand identity' },
        { id: 'ai-cold-call-script-writer', label: 'Cold Call', icon: Phone, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Conversion scripts design' },

        { id: 'ai-summariser', label: 'Summarizer', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Context-aware intelligence' },
        { id: 'ai-text-rewriter', label: 'Rewriter', icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Tone & style orchestration' },
        { id: 'ai-grammar-fixer', label: 'Grammar', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Linguistic precision engine' },
        { id: 'ai-headline-gen', label: 'Headlines', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'High-impact copy generation' },
        { id: 'ai-caption-gen', label: 'Captions', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Social engagement modeling' },
        { id: 'newsletter-agent', label: 'Newsletters', icon: Mail, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Circulation narrative AI' },
        { id: 'white-paper-researcher', label: 'White Papers', icon: Scroll, color: 'text-slate-600', bg: 'bg-slate-600/10', desc: 'Deep technical research' },
        { id: 'viral-ad-producer', label: 'Ads', icon: Play, color: 'text-indigo-600', bg: 'bg-indigo-600/10', desc: 'Viral production engine' },
        { id: 'ai-code-explainer', label: 'Explain', icon: BrainCircuit, color: 'text-indigo-400', bg: 'bg-indigo-400/10', desc: 'Technical logic verification' },
        { id: 'ai-code-refactor', label: 'Refactor', icon: Wand2, color: 'text-violet-500', bg: 'bg-violet-500/10', desc: 'Optimization & clean code' },
        { id: 'ai-regex-gen', label: 'Regex', icon: Code, color: 'text-slate-600', bg: 'bg-slate-600/10', desc: 'Pattern matching synthesis' },
        { id: 'ai-sql-builder', label: 'Query', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Query logical architecture' },
        { id: 'ai-json-tool', label: 'JSON', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Data structural formatting' },
        { id: 'ai-api-gen', label: 'API Builder', icon: Link, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Interface blueprinting' },
        { id: 'ai-commit-gen', label: 'Commits', icon: GitGraph, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Version control meta' },
        { id: 'ai-error-interpreter', label: 'Errors', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Neural stacktrace analysis' },
        { id: 'ai-test-gen', label: 'Test Gen', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-600/10', desc: 'Automated coverage synthesis' },
        { id: 'ai-legal-gen', label: 'Contracts', icon: FileSignature, color: 'text-blue-600', bg: 'bg-blue-600/10', desc: 'Automated legal drafting' },
        { id: 'ai-nda-analyzer', label: 'NDA Audit', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-600/10', desc: 'Risk & compliance detection' },
        { id: 'ai-conflict-mediator', label: 'Mediator', icon: Users, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Neutral ground orchestration' },
        { id: 'ai-thesis-hardener', label: 'Hardener', icon: Shield, color: 'text-slate-900', bg: 'bg-slate-900/10', desc: 'Argument structural audit' },
        { id: 'ai-remote-policy-creator', label: 'Policies', icon: ScrollText, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Remote workforce governance' },
        { id: 'ai-legal-draft', label: 'Drafting', icon: FileEdit, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Custom legal clause generation' },
        { id: 'product-demo-specialist', label: 'Demo Agent', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Visual demonstration automation' },
        { id: 'tiktok-trend-cloner', label: 'Trend Agent', icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-500/10', desc: 'Viral algorithm optimization' },
        { id: 'research-agent', label: 'Research Agent', icon: Library, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Institutional deep research' },
        { id: 'viral-agent', label: 'Viral Agent', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Conversion engine optimization' },
        { id: 'social-ai-agent', label: 'Social AI Agent', icon: Share2, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Growth ecosystem planning' },
        { id: 'audit-agent', label: 'Audit Agent', icon: PieChart, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Neural anomaly detection' },
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBFBFB] scrollbar-hide selection:bg-slate-900 selection:text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-10 py-8 sm:py-16">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-24"
        >
          <div className="w-full bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between min-h-[220px] sm:min-h-[320px] relative overflow-hidden group shadow-2xl gap-6 sm:gap-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-transparent blur-[100px] pointer-events-none" />
            <div className="relative z-10 max-w-2xl">

              <h2 className="text-2xl sm:text-5xl font-black tracking-tighter leading-tight uppercase">
                Replace Your Entire <br className="hidden sm:inline"/>
                <span className="text-slate-400">Tech Stack With One Platform</span>
              </h2>
            </div>

            <div className="relative z-10 shrink-0 self-start md:self-center w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              

              <button 
                onClick={onConnectWorkspace}
                className={`flex items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] border transition-all ${isWorkspaceConnected ? 'bg-white text-slate-900 border-white shadow-sm hover:shadow-md' : 'bg-white text-slate-900 border-white hover:bg-slate-100 shadow-2xl active:scale-95'}`}
              >
                {isWorkspaceConnected ? <ShieldCheck size={18} strokeWidth={2} /> : <HardDrive size={18} strokeWidth={2} />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isWorkspaceConnected ? 'Identity Verified' : 'Connect Local Folder'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 sm:gap-24">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-12 sm:space-y-24"
          >
            {toolCategories.map((cat, idx) => (
              <section key={idx} className="space-y-6 sm:space-y-12">
                <div className="flex items-center gap-4 sm:gap-6 px-2 sm:px-4">
                  <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">{cat.name}</h4>
                  <div className="h-px bg-slate-100 flex-1" />
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">{cat.tools.length} Modules</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {cat.tools.map((tool, tIdx) => {
                    const isFeatured = tIdx < 2 && idx === 0;
                    return (
                      <motion.button 
                        variants={itemVariants}
                        key={tool.id} 
                        onClick={() => {
                          if (cat.name === 'Autonomous Workforce') {
                            onNavigate('agent-runtime', tool.id);
                          } else {
                            onNavigate(tool.id as AppView, null);
                          }
                        }}
                        className={`group relative p-8 bg-white rounded-[2.5rem] border border-slate-100/60 transition-all text-left flex flex-col gap-8 hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] hover:-translate-y-2 overflow-hidden h-full ${isFeatured ? 'lg:col-span-2' : ''}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-500 shadow-sm ring-1 ring-slate-100`}>
                          <tool.icon size={32} strokeWidth={1.5} />
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-2 min-h-[80px] justify-center">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-900 text-base tracking-tight">{tool.label}</h3>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGuideAppId(tool.id);
                                setShowGuideModal(true);
                              }}
                              className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all z-10"
                              title="Information"
                            >
                              <Info size={16} />
                            </div>
                          </div>
                          <p className={`text-[11px] text-slate-400 font-bold leading-relaxed tracking-tight ${isFeatured ? 'max-w-[220px]' : 'line-clamp-2'}`}>{tool.desc}</p>
                        </div>

                        {isFeatured && (
                          <div className="absolute top-8 right-8">
                            <div className="p-2 bg-slate-900 rounded-lg text-white">
                               <Sparkles size={12} />
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-auto pt-6 flex items-center gap-3 border-t border-slate-50">
                          <div className="w-4 h-4 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                             <ChevronRight size={10} strokeWidth={3} />
                          </div>
                          <span className="text-[9px] font-black text-slate-300 group-hover:text-slate-900 uppercase tracking-widest transition-colors">Launch Module</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            ))}
          </motion.div>

          <section className="pt-12 bg-white rounded-[4rem] p-16 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <Clock size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">VAULT ACTIVITY</h2>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Historical Session Snapshots</p>
                  </div>
               </div>
               <button onClick={() => onNavigate('file-manager', null)} className="px-6 py-3 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-100 transition-all">Full Archive Explorer</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRecent.length === 0 ? (
                <div className="col-span-full py-32 bg-[#FBFBFB] rounded-[3rem] text-center flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                    <Database size={32} className="text-slate-100" />
                  </div>
                  <p className="text-slate-300 text-xs font-black uppercase tracking-[0.4em] italic">No operational history detected in current session.</p>
                </div>
              ) : (
                filteredRecent.slice(0, 4).map((file, fIdx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: fIdx * 0.1 }}
                    key={file.id} 
                    onClick={() => onNavigate(file.type, file.id)}
                    className="group bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all cursor-pointer flex flex-col gap-8 ring-1 ring-slate-100 hover:ring-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all ring-1 ring-slate-100">
                        {file.type === 'ledger' ? <Wallet size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:animate-ping" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 truncate mb-1 group-hover:text-amber-600 transition-colors">{file.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{file.type}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          {file.updatedAt ? new Date(file.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
      
      <footer className="max-w-[1600px] mx-auto px-4 md:px-6 pb-8 md:pb-12">
         <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[2.5rem] px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex flex-col sm:flex-row items-center gap-2 sm:gap-8 text-center">
               <span>CORDOVAL OS</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> All Systems Ready</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
               <button onClick={() => onNavigate('settings', null)} className="text-[9px] md:text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Legal & Terms</button>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
               <button onClick={() => onNavigate('settings', null)} className="text-[9px] md:text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">System Settings</button>
            </div>
         </div>
      </footer>

      <AppHowToGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialAppId={selectedGuideAppId}
        onNavigate={onNavigate}
      />
    </div>
  );
};
