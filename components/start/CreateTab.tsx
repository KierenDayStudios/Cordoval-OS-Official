import React, { useState } from 'react';
import { 
  Palette, Grid3X3, Mic, Music, Sliders, Video, Scissors, 
  Tv, Stamp, Image, Camera, Maximize, FileText, PenTool, 
  MousePointer2, MonitorSmartphone, Sparkles, Play, ChevronRight, ArrowRight, Wand2
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';

interface CreateTabProps {
  onNavigate: (view: AppView, id: string | null) => void;
}

export const CreateTab: React.FC<CreateTabProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'visuals' | 'audio' | 'video' | 'utilities'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const creativeApps = [
    {
      id: 'canvas',
      name: 'Brainstorm',
      category: 'Visuals & Ideation',
      icon: PenTool,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      description: 'Creative canvas & freeform ideation space for mapping concepts and workflows.',
      view: 'canvas' as AppView,
      group: 'visuals'
    },
    {
      id: 'ai-collaborative-whiteboard',
      name: 'Whiteboard',
      category: 'Visuals & Ideation',
      icon: MousePointer2,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      badgeColor: 'bg-violet-100 text-violet-700',
      description: 'Real-time neural collaboration whiteboard for team brainstorming and strategy.',
      view: 'ai-collaborative-whiteboard' as AppView,
      group: 'visuals'
    },
    {
      id: 'post-designer',
      name: 'Graphics',
      category: 'Visuals & Ideation',
      icon: Palette,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-700',
      description: 'Graphic resource creation engine for stunning social banners and marketing assets.',
      view: 'post-designer' as AppView,
      group: 'visuals'
    },
    {
      id: 'mockup-studio',
      name: 'Mockups',
      category: 'Visuals & Ideation',
      icon: MonitorSmartphone,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      description: 'High-fidelity product visualizer and device mockup presentation suite.',
      view: 'mockup-studio' as AppView,
      group: 'visuals'
    },
    {
      id: 'pixel-art',
      name: 'Pixel Art',
      category: 'Visuals & Ideation',
      icon: Grid3X3,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: '8-bit aesthetic engine for retro sprite design and pixel masterpiece creation.',
      view: 'pixel-art' as AppView,
      group: 'visuals'
    },
    {
      id: 'podcast-studio',
      name: 'Podcasts',
      category: 'Audio & Voice',
      icon: Mic,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-700',
      description: 'Neural audio production studio for recording, editing, and publishing podcast episodes.',
      view: 'podcast-studio' as AppView,
      group: 'audio'
    },
    {
      id: 'audio-snippet-tool',
      name: 'Snippets',
      category: 'Audio & Voice',
      icon: Music,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-700',
      description: 'Micro-audio orchestration tool for fast sound clips and voice memos.',
      view: 'audio-snippet-tool' as AppView,
      group: 'audio'
    },
    {
      id: 'multi-track-mixer',
      name: 'Mixer',
      category: 'Audio & Voice',
      icon: Sliders,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      description: 'Multi-layer sound design and track mixing console for immersive audio.',
      view: 'multi-track-mixer' as AppView,
      group: 'audio'
    },
    {
      id: 'screen-recorder',
      name: 'Screen Record',
      category: 'Video & Production',
      icon: Video,
      color: 'text-slate-900',
      bg: 'bg-slate-100',
      badgeColor: 'bg-slate-200 text-slate-800',
      description: 'High-definition session capture and screen recording suite.',
      view: 'screen-recorder' as AppView,
      group: 'video'
    },
    {
      id: 'video-trimmer',
      name: 'Trim',
      category: 'Video & Production',
      icon: Scissors,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-700',
      description: 'Precision frame excision and video clipping utility.',
      view: 'video-trimmer' as AppView,
      group: 'video'
    },
    {
      id: 'teleprompter',
      name: 'Teleprompt',
      category: 'Video & Production',
      icon: Tv,
      color: 'text-indigo-400',
      bg: 'bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      description: 'Scripted performance guide and professional teleprompter display.',
      view: 'teleprompter' as AppView,
      group: 'video'
    },
    {
      id: 'video-script-specialist',
      name: 'Scripts',
      category: 'Video & Production',
      icon: FileText,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-700',
      description: 'Visual narrative logic and professional video scriptwriting assistant.',
      view: 'video-script-specialist' as AppView,
      group: 'video'
    },
    {
      id: 'watermark',
      name: 'Watermark',
      category: 'Utilities & Assets',
      icon: Stamp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-700',
      description: 'Brand integrity verification and image watermarking protection tool.',
      view: 'watermark' as AppView,
      group: 'utilities'
    },
    {
      id: 'stock-media',
      name: 'Vault',
      category: 'Utilities & Assets',
      icon: Image,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: 'Curated visual assets and stock media repository.',
      view: 'stock-media' as AppView,
      group: 'utilities'
    },
    {
      id: 'ai-bg-remover',
      name: 'Background Remover',
      category: 'Utilities & Assets',
      icon: Camera,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-700',
      description: 'Neural background removal tool for instant image subject isolation.',
      view: 'ai-bg-remover' as AppView,
      group: 'utilities'
    },
    {
      id: 'image-upscaler',
      name: 'Upscaler',
      category: 'Utilities & Assets',
      icon: Maximize,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      badgeColor: 'bg-violet-100 text-violet-700',
      description: 'Neural resolution synthesis and high-definition image upscaling.',
      view: 'image-upscaler' as AppView,
      group: 'utilities'
    }
  ];

  const filteredApps = creativeApps.filter(app => {
    if (activeCategory !== 'all' && app.group !== activeCategory) return false;
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
          <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-rose-200">
            <Palette size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                Media & Creative Production
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Professional creative suite: Graphics, Podcasts, Video Tools, Audio Mixing, and Visual Assets.</p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('post-designer', null)}
            className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-rose-500 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Palette size={14} /> New Graphics
          </button>
          <button
            onClick={() => onNavigate('podcast-studio', null)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Mic size={14} /> Podcast Studio
          </button>
        </div>
      </div>

      {/* Sub-navigation & Filters */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Creative Tools' },
            { id: 'visuals', label: 'Visuals & Ideation' },
            { id: 'audio', label: 'Audio & Voice' },
            { id: 'video', label: 'Video & Production' },
            { id: 'utilities', label: 'Utilities & Assets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === tab.id
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
            placeholder="Search creative tools..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => {
            const Icon = app.icon;
            return (
              <motion.div
                key={app.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group cursor-pointer"
                onClick={() => onNavigate(app.view, null)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${app.bg} ${app.color} shadow-inner group-hover:scale-110 transition-transform`}>
                      <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.badgeColor}`}>
                      Ready
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{app.category}</span>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-2">
                      {app.name} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 -translate-x-1 group-hover:translate-x-0" />
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-rose-600 group-hover:underline flex items-center gap-1.5">
                    Launch App <Play size={12} fill="currentColor" />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Creative Suite Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-rose-200">
              <Sparkles size={14} className="text-amber-400" /> Pro Media Studio
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Create professional graphics, podcasts, and media assets in seconds.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with neural upscaling, background removal, multi-track audio mixing, and precision video tools.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => onNavigate('post-designer', null)}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Palette size={16} /> Open Graphics Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
