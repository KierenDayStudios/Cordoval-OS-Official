import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Calendar as CalendarIcon, FileText, 
  TrendingUp, ArrowRight, Sparkles, Clock, Star, Zap, Plus, 
  FolderOpen, LayoutGrid, CheckSquare, Gamepad2, Radio, DollarSign, Bot,
  Palette, Terminal, GraduationCap, Briefcase, Newspaper, ExternalLink, RefreshCw, Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import { CalendarEvent, Note, AppView } from '../../types';
import { CalendarApp } from '../CalendarApp';
import { NotesApp } from '../NotesApp';

interface HomeTabProps {
  events: CalendarEvent[];
  onSaveEvent: (event: CalendarEvent) => void;
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onNavigate: (view: AppView) => void;
  onSelectTab: (tabId: string) => void;
}

interface EcosystemEnvironment {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  badge: string;
  comingSoon?: boolean;
}

const ECOSYSTEM_ENVIRONMENTS: EcosystemEnvironment[] = [
  {
    id: 'fast-track',
    name: 'Fast Track',
    category: 'Venture Formulation',
    description: 'Turn your idea into a launch-ready plan with 8-phase documentation and AI Coder frontend prototypes.',
    icon: Rocket,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'Idea to Launch'
  },
  {
    id: 'work',
    name: 'Work Studio',
    category: 'Productivity & Office',
    description: 'Documents, spreadsheets, kanban boards, and project management.',
    icon: LayoutGrid,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    badge: 'Core Suite'
  },
  {
    id: 'create',
    name: 'Create Studio',
    category: 'Media & Design',
    description: 'Graphics, pixel art, podcasts, audio mixing, and video tools.',
    icon: Palette,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    badge: 'Creative'
  },
  {
    id: 'dev',
    name: 'Dev Studio',
    category: 'Engineering & AI',
    description: 'AI Coder, browser IDE, code snippet library, and site sculptor.',
    icon: Terminal,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    badge: 'Developer'
  },
  {
    id: 'agents',
    name: 'AI Agents',
    category: 'Autonomous Intelligence',
    description: 'Autonomous workflows, elevator pitch shaper, and agent runtime.',
    icon: Bot,
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    badge: 'AI Engine'
  },
  {
    id: 'play',
    name: 'Play Arcade',
    category: 'Entertainment',
    description: 'Retro arcade games, physics sandbox, and immersive play zone.',
    icon: Gamepad2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'Leisure'
  },
  {
    id: 'cast',
    name: 'Cast Broadcast',
    category: 'Live & Radio',
    description: 'Live streaming studio, podcast episodes, and audio broadcasting.',
    icon: Radio,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    badge: 'Broadcasting'
  },
  {
    id: 'learn',
    name: 'Learn Academy',
    category: 'Education',
    description: 'Interactive courses, tutorials, and sovereign knowledge base.',
    icon: GraduationCap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'Knowledge'
  },
  {
    id: 'consulting',
    name: 'Consulting',
    category: 'Advisory & Client',
    description: 'Professional advisory, client strategy, and growth sessions.',
    icon: Briefcase,
    color: 'text-slate-400',
    bg: 'bg-slate-100',
    badge: 'Coming Soon',
    comingSoon: true
  },
  {
    id: 'finance',
    name: 'Finance Hub',
    category: 'Wealth & Budgeting',
    description: 'Expense tracking, portfolio management, and financial modeling.',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'Wealth'
  },
  {
    id: 'news',
    name: 'Business News',
    category: 'Updates & Intelligence',
    description: 'Curated industry news, press releases, and ecosystem updates.',
    icon: Newspaper,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    badge: 'Updates'
  }
];

interface BlogPost {
  title: string;
  link: string;
  published: string;
  summary: string;
}

const FALLBACK_BLOGS: BlogPost[] = [
  {
    title: 'Sovereign Architecture: Building Fully Client-Side & Local-First Web Apps',
    link: 'https://learn.cordoval.work/',
    published: '2026-08-10',
    summary: 'Explore how local-first web applications protect user data, eliminate cloud latency, and deliver resilient user experiences.'
  },
  {
    title: 'Autonomous AI Coding Engines: The Future of Rapid Software Prototyping',
    link: 'https://learn.cordoval.work/',
    published: '2026-08-08',
    summary: 'A deep dive into how large language models and autonomous agent loops accelerate full-stack web architecture and design.'
  },
  {
    title: 'Mastering Tailwind CSS & Modern Component Architecture in React',
    link: 'https://learn.cordoval.work/',
    published: '2026-08-05',
    summary: 'Best practices for organizing scalable React components while maintaining pristine typography and sophisticated color tokens.'
  },
  {
    title: 'Real-Time Collaboration and WebSockets in Modern Cloud Environments',
    link: 'https://learn.cordoval.work/',
    published: '2026-08-01',
    summary: 'How multi-user real-time canvases and synchronized state managers operate across containerized Cloud Run deployments.'
  },
  {
    title: 'Designing Intuitive User Interfaces Without AI Slop',
    link: 'https://learn.cordoval.work/',
    published: '2026-07-28',
    summary: 'A manifesto on minimalist typography, mathematical spacing scales, and avoiding generic UI design clichés.'
  },
  {
    title: 'Secure Cloud Persistence with Firestore and OAuth Integrations',
    link: 'https://learn.cordoval.work/',
    published: '2026-07-22',
    summary: 'Implementing secure user authentication and cloud-hosted relational storage with zero friction.'
  }
];

export const HomeTab: React.FC<HomeTabProps> = ({
  events,
  onSaveEvent,
  notes,
  onSaveNote,
  onDeleteNote,
  onNavigate,
  onSelectTab
}) => {
  const [activeSubView, setActiveSubView] = useState<'overview' | 'calendar' | 'notes'>('overview');
  const [randomBlogs, setRandomBlogs] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // Fetch or shuffle blogs every time HomeTab mounts
  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        const response = await fetch('https://learn.cordoval.work/feeds/posts/default?alt=json');
        if (!response.ok) throw new Error('Failed to fetch RSS feed');
        const data = await response.json();
        const entries = data.feed?.entry || [];
        const parsed: BlogPost[] = entries.map((entry: any) => {
          const title = entry.title?.$t || 'Untitled Post';
          const linkObj = entry.link?.find((l: any) => l.rel === 'alternate');
          const link = linkObj?.href || 'https://learn.cordoval.work/';
          const published = entry.published?.$t ? new Date(entry.published.$t).toLocaleDateString() : 'Recent';
          const summary = entry.summary?.$t ? entry.summary.$t.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : 'Explore insights and updates from the Cordoval Learning Network.';
          return { title, link, published, summary };
        });

        if (parsed.length > 0 && isMounted) {
          setRandomBlogs(parsed.slice(0, 6));
          setIsLoadingBlogs(false);
          return;
        }
      } catch (err) {
        // Fallback to FALLBACK_BLOGS
      }

      if (isMounted) {
        setRandomBlogs(FALLBACK_BLOGS.slice(0, 6));
        setIsLoadingBlogs(false);
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  if (activeSubView === 'calendar') {
    return (
      <CalendarApp 
        events={events}
        onSaveEvent={onSaveEvent}
        onBack={() => setActiveSubView('overview')}
      />
    );
  }

  if (activeSubView === 'notes') {
    return (
      <NotesApp 
        notes={notes}
        onSaveNote={onSaveNote}
        onDeleteNote={onDeleteNote}
        onBack={() => setActiveSubView('overview')}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-slate-50 overflow-y-auto overflow-x-hidden scroll-smooth">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-12">
        {/* Welcome Banner */}
        <div className="relative shrink-0 w-full min-h-[140px] sm:min-h-[170px] flex flex-col justify-center overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 md:p-10 text-white shadow-lg shadow-blue-600/15">
          {/* Subtle decorative glow accents */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-sky-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-1.5 sm:space-y-2.5 max-w-2xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm leading-tight sm:leading-tight break-words">
              Welcome Home!
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 font-medium leading-relaxed">
              What will you build today?
            </p>
          </div>
        </div>

      {/* Environments Menu */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {ECOSYSTEM_ENVIRONMENTS.map(env => {
            const Icon = env.icon;
            return (
              <motion.button
                key={env.id}
                whileHover={!env.comingSoon ? { scale: 1.02, y: -2 } : undefined}
                whileTap={!env.comingSoon ? { scale: 0.97 } : undefined}
                onClick={() => {
                  if (!env.comingSoon) {
                    onSelectTab(env.id);
                  }
                }}
                disabled={env.comingSoon}
                className={`relative flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm transition-all cursor-pointer text-center group ${
                  env.comingSoon ? 'opacity-65 cursor-not-allowed bg-slate-50' : 'hover:shadow-md hover:border-indigo-200'
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${env.bg} ${env.color} shadow-inner group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon size={26} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5 w-full">
                  <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight block truncate">
                    {env.name}
                  </span>
                  {env.comingSoon ? (
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {env.badge}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Blog Posts Feed without section title */}
      <div className="pt-2 pb-6">
        {isLoadingBlogs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 h-48 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {randomBlogs.map((blog, idx) => (
              <motion.a
                key={idx}
                href={blog.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                      {blog.published}
                    </span>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {blog.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  <span>Read Article</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
