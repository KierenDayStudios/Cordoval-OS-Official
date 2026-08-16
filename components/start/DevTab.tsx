import React, { useState } from 'react';
import { 
  Terminal, BookOpen, Monitor, Sparkles, Code, FileCode, 
  Plus, ExternalLink, Play, Folder, Zap, Layers, RefreshCw, ChevronRight, CheckCircle2, ArrowRight, Wand2
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';

interface DevTabProps {
  onNavigate: (view: AppView, id: string | null) => void;
}

export const DevTab: React.FC<DevTabProps> = ({ onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'ai-coder' | 'ide' | 'library' | 'sculptor'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const devApps = [
    {
      id: 'joymiz-ai',
      name: 'AI Coder & App Architect',
      category: 'Flagship Autonomous AI Engine',
      icon: Sparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      badgeColor: 'bg-indigo-600 text-white',
      description: 'Your primary intelligent coding companion. Generate full-stack app blueprints, production code, architectural components, and instant logic refactoring.',
      stats: 'Enterprise AI Engine',
      actionLabel: 'Launch AI Coder',
      view: 'joymiz-ai' as AppView,
      isFlagship: true
    },
    {
      id: 'code-editor',
      name: 'IDE',
      category: 'Development Environment',
      icon: Terminal,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      description: 'Professional browser-based development environment with live syntax highlighting, multi-file editing, and instant preview.',
      stats: '14 Active Files',
      actionLabel: 'Launch IDE Studio',
      view: 'code-editor' as AppView,
      isFlagship: false
    },
    {
      id: 'code-snippet-library',
      name: 'Library',
      category: 'Code Snippets & Logic Vault',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-700',
      description: 'Persistent vault of reusable algorithms, custom React hooks, database queries, and modular UI components.',
      stats: '48 Stored Snippets',
      actionLabel: 'Open Code Library',
      view: 'code-snippet-library' as AppView,
      isFlagship: false
    },
    {
      id: 'site-builder',
      name: 'Sculptor',
      category: 'Interface & Site Builder',
      icon: Monitor,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: 'Dynamic interface generator and visual site sculptor. Design, prototype, and export production-ready web pages instantly.',
      stats: '6 Published Sites',
      actionLabel: 'Launch Sculptor Pro',
      view: 'site-builder' as AppView,
      isFlagship: false
    }
  ];

  const filteredApps = devApps.filter(app => {
    if (activeSubTab === 'ai-coder' && app.id !== 'joymiz-ai') return false;
    if (activeSubTab === 'ide' && app.id !== 'code-editor') return false;
    if (activeSubTab === 'library' && app.id !== 'code-snippet-library') return false;
    if (activeSubTab === 'sculptor' && app.id !== 'site-builder') return false;
    if (searchQuery && !app.name.toLowerCase().includes(searchQuery.toLowerCase()) && !app.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-200">
            <Terminal size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Dev Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                Engineering & Architecture
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Sovereign development hub featuring AI Coder, IDE, Library, and Site Sculptor.</p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('joymiz-ai', null)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-300" /> Launch AI Coder
          </button>
          <button
            onClick={() => onNavigate('code-editor', null)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Terminal size={14} /> Open IDE
          </button>
        </div>
      </div>

      {/* Sub-navigation & Filters */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Dev Tools' },
            { id: 'ai-coder', label: '⭐ AI Coder (Primary)' },
            { id: 'ide', label: 'IDE Studio' },
            { id: 'library', label: 'Code Library' },
            { id: 'sculptor', label: 'Site Sculptor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search dev tools..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Flagship AI Coder Hero Banner / Featured Card */}
        {activeSubTab === 'all' && (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-500/30">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4 relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-black text-indigo-200 uppercase tracking-wider">
                <Sparkles size={16} className="text-amber-400 animate-pulse" /> Flagship Development Engine
              </div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                AI Coder & Application Architect
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                The premier and most powerful tool in your Dev stack. Build full-stack apps, generate production code blueprints, synthesize complex algorithms, and orchestrate automated refactoring instantly with autonomous intelligence.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-indigo-200 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Full-Stack Code Generation
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-200 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Instant Blueprinting
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={() => onNavigate('joymiz-ai', null)}
                className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-indigo-900/50 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <Sparkles size={20} className="text-amber-300 group-hover:scale-110 transition-transform" />
                Launch AI Coder Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => {
            const Icon = app.icon;
            return (
              <motion.div
                key={app.id}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-3xl border p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group cursor-pointer relative overflow-hidden ${
                  app.isFlagship ? 'border-indigo-500/50 ring-2 ring-indigo-500/10 bg-gradient-to-b from-indigo-50/30 to-white' : 'border-slate-200/80'
                }`}
                onClick={() => onNavigate(app.view, null)}
              >
                {app.isFlagship && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                    Primary Tool
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${app.bg} ${app.color} shadow-inner group-hover:scale-110 transition-transform`}>
                      <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.badgeColor}`}>
                      {app.stats}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{app.category}</span>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      {app.name} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 -translate-x-1 group-hover:translate-x-0" />
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-black group-hover:underline flex items-center gap-1.5 ${app.isFlagship ? 'text-indigo-600 font-black' : 'text-slate-900'}`}>
                    {app.actionLabel} <Play size={12} fill="currentColor" />
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${app.isFlagship ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'}`}>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Developer Workspace Banner */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 lg:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              <Zap size={14} className="text-amber-500" /> Sovereign Developer Workflow
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Build, test, and ship modular code entirely client-side.
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cordoval's dev stack gives you zero-latency compilation, persistent code snippet libraries, and visual site building with instant export.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('joymiz-ai', null)}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} /> Open AI Coder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
