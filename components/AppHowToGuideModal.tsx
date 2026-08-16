import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, X, ChevronRight, HelpCircle, CheckCircle2, 
  Sparkles, ExternalLink, Lightbulb, FileText, Table, Presentation, 
  Calendar, Calculator, ShieldAlert, StickyNote, Book, AlarmClock, 
  Map, CalendarClock, Wallet, Receipt, Briefcase, BrainCircuit, 
  ScrollText, FileSignature, ClipboardList, Library, Newspaper, 
  Radio, Globe, LayoutList, CalendarDays, Share2, UserSearch, 
  Megaphone, Send, Users, MessageSquare, CreditCard, TrendingUp, 
  Zap, Phone, Target, Camera, Video, Terminal, FileCode, Code, 
  Database, Layers, Link as LinkIcon, GitGraph, AlertTriangle, 
  Package, Smartphone, Mic, Sliders, Scissors, Tv, Stamp, Image, 
  Maximize, Play, MousePointer2, Palette, MonitorSmartphone, 
  Grid3X3, Monitor, PenTool
} from 'lucide-react';
import { AppView } from '../types';

export interface GuideItem {
  id: string;
  viewId?: AppView;
  title: string;
  category: string;
  icon: any;
  summary: string;
  steps: string[];
  tips: string[];
}

export const GUIDE_DATABASE: GuideItem[] = [
  {
    id: 'sheets',
    viewId: 'sheets',
    title: 'Spreadsheets',
    category: 'Operational Core',
    icon: Table,
    summary: 'Full data modeling, financial calculations, custom formulas, and tabular dataset management.',
    steps: [
      'Click any grid cell to enter text, numbers, or standard mathematical formulas (e.g. starting with =).',
      'Use formatting controls to style cell fills, text alignment, and currency or percentage numbers.',
      'Add or remove columns and rows dynamically as your dataset expands.',
      'Export spreadsheet artifacts to JSON or CSV for offline disk backup or spreadsheet software compatibility.'
    ],
    tips: [
      'All cell changes auto-save into your workspace local database.',
      'Use the top search bar to locate specific entries across thousands of rows instantly.'
    ]
  },
  {
    id: 'calculator',
    viewId: 'calculator',
    title: 'Calculator',
    category: 'Operational Core',
    icon: Calculator,
    summary: 'Precision financial logic, tax estimations, scientific functions, and audit logs.',
    steps: [
      'Enter mathematical expressions using on-screen keys or your device keyboard numpad.',
      'Switch between Standard math, Financial interest/mortgage logic, and Scientific modes.',
      'Review your calculation history audit log on the side panel to re-use previous result totals.',
      'Export calculation transcripts directly to your documents or notes.'
    ],
    tips: [
      'Keyboard shortcuts are enabled: press Enter for equals, Backspace for clear, and standard math operators (+, -, *, /).'
    ]
  },
  {
    id: 'calendar',
    viewId: 'calendar',
    title: 'Calendar',
    category: 'Operational Core',
    icon: Calendar,
    summary: 'Universal time orchestration, event schedules, task milestones, and meeting planning.',
    steps: [
      'Click on any calendar day or press "+ Add Event" to log a new schedule entry.',
      'Set start and end times, location tags, meeting links, and event priority colors.',
      'Toggle between Month grid, Week view, and Agenda list layouts.',
      'Filter events by category (Work, Personal, High-Priority Deals).'
    ],
    tips: [
      'Events automatically synchronize with your workspace notifications and follow-up tools.'
    ]
  },
  {
    id: 'time-zone-converter',
    viewId: 'time-zone-converter',
    title: 'World Clocks',
    category: 'Operational Core',
    icon: Map,
    summary: 'Global time synchronization, team availability overlap planner, and multi-region scheduling.',
    steps: [
      'Add global cities (e.g. London, New York, Tokyo, Sydney) to your active dashboard.',
      'Drag the main time scrub slider to observe relative local hours across all selected locations.',
      'Identify golden overlap hours where all international team members are during business hours.',
      'Click "Copy Invite Times" to paste exact multi-timezone event details into emails.'
    ],
    tips: [
      'Custom cities are automatically persisted so your international team setup is remembered.'
    ]
  },
  {
    id: 'plan-builder',
    viewId: 'plan-builder',
    title: 'Business Plan',
    category: 'Strategic Enterprise',
    icon: Briefcase,
    summary: 'Comprehensive business planning, strategic executive summaries, revenue projections, and pitch decks.',
    steps: [
      'Select sections to build (Executive Summary, Market Analysis, Operations Plan, Financial Forecasts).',
      'Fill in structured questionnaire prompts or use AI assistance to generate detailed strategies.',
      'Review and refine competitive differentiators and target customer profiles.',
      'Export formatted PDF business plans or export JSON blueprints for investor presentations.'
    ],
    tips: [
      'Use the financial calculator module to embed realistic 3-year revenue milestones.'
    ]
  },
  {
    id: 'social-media-strategist',
    viewId: 'social-media-strategist',
    title: 'Social AI Agent',
    category: 'Growth & Marketing',
    icon: Share2,
    summary: 'Viral growth architecture, multi-channel post generation, engagement hooks, and content schedules.',
    steps: [
      'Enter your core product, niche topic, or target audience focus area.',
      'Select destination platforms (Twitter/X, LinkedIn, Instagram, TikTok, YouTube).',
      'Generate high-converting hook headlines, thread breakdowns, and caption copy.',
      'Save top-performing post blueprints directly into your Content Strategy Calendar.'
    ],
    tips: [
      'Experiment with different tone options (Authoritative, Casual, Controversial, Educational).'
    ]
  },
  {
    id: 'screen-recorder',
    viewId: 'screen-recorder',
    title: 'Screen Record',
    category: 'Creative Studio',
    icon: Video,
    summary: 'High-definition browser and desktop session capture with microphone audio and instant MP4 export.',
    steps: [
      'Click "Start Recording" and grant browser permissions for screen capture and microphone.',
      'Choose whether to record your Entire Screen, a specific Application Window, or Chrome Tab.',
      'Perform your presentation or product demo while live recording indicators are active.',
      'Click "Stop Recording" to review live playback and download the video file directly to disk.'
    ],
    tips: [
      'All recording stays 100% on your local device — no media is uploaded to external video servers.'
    ]
  },
  {
    id: 'joymiz-ai',
    viewId: 'joymiz-ai',
    title: 'AI Coding',
    category: 'Cognitive AI Nexus',
    icon: Sparkles,
    summary: 'Enterprise software architecture blueprints, full-stack code generation, and AI system design.',
    steps: [
      'Describe your software application requirement, component design, or feature logic.',
      'Provide contextual parameters such as framework preference, state model, or API routes.',
      'Review generated TypeScript/React code blueprints with syntax highlighting.',
      'Copy generated code or export project files into your IDE workspace.'
    ],
    tips: [
      'Ensure your Google Gemini API key is configured in settings for unlimited AI generation.'
    ]
  },
  {
    id: 'ai-bg-remover',
    viewId: 'ai-bg-remover',
    title: 'Background Remover',
    category: 'Creative Studio',
    icon: Camera,
    summary: 'Neural background isolation for product photos, headshots, graphic design assets, and marketing visuals.',
    steps: [
      'Upload an image file (PNG, JPG, WEBP) by dragging into the dropzone or clicking upload.',
      'The neural AI algorithm isolates the main subject and cuts out background pixels.',
      'Preview transparent PNG results against light, dark, or custom backdrop colors.',
      'Download high-res transparent image files.'
    ],
    tips: [
      'High-contrast subject lighting produces optimal crisp edges.'
    ]
  },
  {
    id: 'code-editor',
    viewId: 'code-editor',
    title: 'IDE',
    category: 'Engineering & Dev',
    icon: Terminal,
    summary: 'Full browser development environment with multi-file project workspace, syntax editor, and execution.',
    steps: [
      'Browse and manage files in the left workspace file tree.',
      'Edit code in the central editor with syntax highlighting for HTML, CSS, JS, TS, and JSON.',
      'Use shortcut keys (Cmd/Ctrl + S) to save file changes.',
      'Run and inspect code outputs in the integrated preview sandbox.'
    ],
    tips: [
      'Connect a local folder to edit files directly on your computer hard drive!'
    ]
  },
  {
    id: 'docs',
    viewId: 'docs',
    title: 'Documents',
    category: 'Operational Core',
    icon: FileText,
    summary: 'Professional document authoring, executive reports, markdown drafting, and local disk storage.',
    steps: [
      'Create a new document or pick an existing draft from your documents list.',
      'Format text with headings, blockquotes, code blocks, lists, and bold text.',
      'Track word counts, reading time, and character metrics in real-time.',
      'Export documents as Markdown files, HTML, or raw text artifacts.'
    ],
    tips: [
      'Pin key documents to your dashboard for instant 1-click access.'
    ]
  },
  {
    id: 'client-vault',
    viewId: 'client-vault',
    title: 'CRM',
    category: 'Growth & Marketing',
    icon: Users,
    summary: 'Customer relationship management, deal pipeline tracking, interaction history, and lead tasks.',
    steps: [
      'Click "+ New Lead" to enter client details, deal value, company, and stage.',
      'Organize leads through sales stages (Prospect, Proposal, Negotiation, Won, Lost).',
      'Log meeting notes, call records, and follow-up tasks under each client profile.',
      'Export or import full CRM database JSON backups for total data sovereignty.'
    ],
    tips: [
      'Use priority tags (High, Medium, Low) to focus on top revenue opportunities.'
    ]
  },
  {
    id: 'ledger',
    viewId: 'ledger',
    title: 'Finance Ledger',
    category: 'Strategic Enterprise',
    icon: Wallet,
    summary: 'Double-entry bookkeeping, revenue and expense tracking, account balances, and fiscal reporting.',
    steps: [
      'Log financial transactions with date, category, amount, and account type.',
      'Track cash flows across Income, Expenses, Assets, and Liabilities.',
      'Generate monthly financial breakdowns and profitability metrics.',
      'Export ledger backups to JSON or CSV for accounting audit compliance.'
    ],
    tips: [
      'Tag recurring expenses like subscriptions for automated budget planning.'
    ]
  },
  {
    id: 'project-manager',
    viewId: 'project-manager',
    title: 'Kanban Manager',
    category: 'Strategic Enterprise',
    icon: LayoutList,
    summary: 'Agile project orchestration, custom workflow columns, task priorities, and sub-task checklists.',
    steps: [
      'Create custom workflow columns (e.g. Backlog, In Progress, Review, Completed).',
      'Add task cards with descriptions, due dates, assignees, and checklist items.',
      'Drag and drop cards across columns as work moves forward.',
      'Filter tasks by search query, due status, or priority level.'
    ],
    tips: [
      'Click on any task card to open the detailed inspector modal with sub-checklists.'
    ]
  },
  {
    id: 'notes',
    viewId: 'notes',
    title: 'Notes',
    category: 'Operational Core',
    icon: StickyNote,
    summary: 'Rapid ideation scratchpad, tag filtering, instant search, and local note storage.',
    steps: [
      'Click "+ New Note" or start typing in the main scratchpad.',
      'Assign tags (e.g. #ideas, #meeting, #todo) to categorize notes.',
      'Search instantly across note titles and body content.',
      'Color code notes for quick visual scanning.'
    ],
    tips: [
      'Notes auto-save as you type so you never lose an idea.'
    ]
  },
  {
    id: 'journal',
    viewId: 'journal',
    title: 'Journal',
    category: 'Operational Core',
    icon: Book,
    summary: 'Daily executive reflection log, focus tracking, lessons learned, and progress logs.',
    steps: [
      'Select today\'s date on the journal calendar to start a daily entry.',
      'Record energy ratings, daily achievements, challenges, and gratitude.',
      'Review past entries in the chronological timeline view.',
      'Export journal history to private local JSON backup files.'
    ],
    tips: [
      'Reflecting daily improves strategic decision-making and clarity.'
    ]
  },
  {
    id: 'password-safe',
    viewId: 'password-safe',
    title: 'Security Vault',
    category: 'Operational Core',
    icon: ShieldAlert,
    summary: 'Encrypted local credential store, master password generation, and vulnerability audit.',
    steps: [
      'Use the built-in password generator to craft unhackable 24-character credentials.',
      'Store account logins, API keys, and secret credentials locally.',
      'Copy passwords with auto-clearing clipboard timers.',
      'Check security health scores across your stored accounts.'
    ],
    tips: [
      'Data is stored 100% encrypted in your local browser sandbox or device vault.'
    ]
  },
  {
    id: 'content-calendar',
    viewId: 'content-calendar',
    title: 'Content Strategy',
    category: 'Growth & Marketing',
    icon: CalendarDays,
    summary: 'Multi-channel publication schedule, draft status tracking, and campaign timelines.',
    steps: [
      'Schedule planned content items on the monthly or weekly calendar grid.',
      'Assign channels (Blog, YouTube, LinkedIn, X, Newsletter, Podcast).',
      'Move content through status stages (Idea, In Writing, Reviewed, Scheduled, Published).',
      'Attach copy drafts, asset links, and publication notes.'
    ],
    tips: [
      'Combine with the Social AI Agent to draft copy directly into calendar slots.'
    ]
  },
  {
    id: 'podcast-studio',
    viewId: 'podcast-studio',
    title: 'Podcast Studio',
    category: 'Creative Studio',
    icon: Mic,
    summary: 'Neural audio recording, episode management, show notes drafting, and RSS distribution.',
    steps: [
      'Record audio episodes using built-in mic controls or upload audio files.',
      'Add episode titles, detailed show notes, and sponsor links.',
      'Organize episodes into seasons and track published audio files.',
      'Generate formatted RSS feed XML for podcast directories.'
    ],
    tips: [
      'Use the Multi-Track Mixer tool to add intro music and background ambient audio!'
    ]
  },
  {
    id: 'canvas',
    viewId: 'canvas',
    title: 'Brainstorm Canvas',
    category: 'Creative Studio',
    icon: PenTool,
    summary: 'Infinite visual whiteboard, node connections, mind mapping, and creative ideation.',
    steps: [
      'Click the toolbar to add text cards, sticky notes, shapes, or uploaded images.',
      'Drag elements around the infinite canvas area.',
      'Draw connector arrows between nodes to map workflow logic and mind maps.',
      'Export canvas layouts as PNG images or vector data.'
    ],
    tips: [
      'Use mouse wheel or touchpad pinch gesture to zoom in and out of the canvas.'
    ]
  },
  {
    id: 'mockup-studio',
    viewId: 'mockup-studio',
    title: 'Mockup Studio',
    category: 'Creative Studio',
    icon: MonitorSmartphone,
    summary: 'Transform flat app screenshots into 3D device mockups with custom backdrop gradients.',
    steps: [
      'Upload a screenshot of your app, website, or software UI.',
      'Select a frame (MacBook Pro, iPhone 15 Pro, iPad, Chrome Window).',
      'Customize background color, gradient mesh, tilt angles, and shadow blur.',
      'Export high-resolution PNG image mockups for presentations and marketing.'
    ],
    tips: [
      'Add a soft shadow effect for professional App Store or website hero visuals.'
    ]
  },
  {
    id: 'pixel-art',
    viewId: 'pixel-art',
    title: 'Pixel Art',
    category: 'Creative Studio',
    icon: Grid3X3,
    summary: 'Retro 8-bit sprite painter, custom color palettes, grid controls, and PNG export.',
    steps: [
      'Select grid size (16x16, 32x32, 64x64) and color palette.',
      'Use pencil, paint bucket, eraser, and color picker tools to paint grid pixels.',
      'Use undo/redo controls to refine your pixel artwork.',
      'Download your sprite as a PNG image artifact.'
    ],
    tips: [
      'Great for designing game sprites, custom app icons, and retro art.'
    ]
  },
  {
    id: 'sop-creator',
    viewId: 'sop-creator',
    title: 'SOP Creator',
    category: 'Strategic Enterprise',
    icon: ClipboardList,
    summary: 'Standard Operating Procedure documentation for team onboarding and operational governance.',
    steps: [
      'Define procedure title, department, revision version, and document owner.',
      'Add step-by-step instructions with clear titles, detailed notes, and safety warnings.',
      'Include required tools, prerequisites, and expected outcomes.',
      'Export formatted SOP documentation for internal company distribution.'
    ],
    tips: [
      'Keep steps short and numbered for maximum clarity during team training.'
    ]
  },
  {
    id: 'internal-wiki',
    viewId: 'internal-wiki',
    title: 'Internal Wiki',
    category: 'Strategic Enterprise',
    icon: Library,
    summary: 'Distributed company knowledge base, technical documentation, and team guides.',
    steps: [
      'Create articles under categories (Engineering, Product, Marketing, HR).',
      'Format wiki pages with headings, code blocks, tables, and callout boxes.',
      'Search across all knowledge base articles with real-time keyword matching.',
      'Export wiki archives to local JSON backups.'
    ],
    tips: [
      'Link related wiki articles together to create a cohesive knowledge hub.'
    ]
  },
  {
    id: 'finance-forensic',
    viewId: 'finance-forensic',
    title: 'Audit Agent',
    category: 'Strategic Enterprise',
    icon: Search,
    summary: 'Deep financial audit, anomaly detection, unexpected cost identification, and fiscal reporting.',
    steps: [
      'Upload financial transaction logs or enter ledger expense data.',
      'Run automated forensic audits to highlight duplicate billing or unexpected variance.',
      'Review risk flags and recommendations generated by the audit engine.',
      'Export comprehensive audit summary reports.'
    ],
    tips: [
      'Audit your quarterly expenses regularly to eliminate unused software subscriptions.'
    ]
  },
  {
    id: 'sales-script-library',
    viewId: 'sales-script-library',
    title: 'Playbooks',
    category: 'Growth & Marketing',
    icon: MessageSquare,
    summary: 'High-conversion sales scripts, objection handling templates, and cold outreach frameworks.',
    steps: [
      'Browse category templates (Cold Calling, Email Outreach, Objection Handling, Closing).',
      'Customize script variables (Client Name, Product Value, Pricing).',
      'One-click copy scripts directly into your email or phone dialer.',
      'Add your winning sales scripts to the custom team library.'
    ],
    tips: [
      'Keep objection rebuttals open during sales calls for instant reference.'
    ]
  },
  {
    id: 'follow-up-scheduler',
    viewId: 'follow-up-scheduler',
    title: 'Follow-Ups',
    category: 'Operational Core',
    icon: CalendarClock,
    summary: 'Automated follow-up reminders, lead check-in schedules, and communication logs.',
    steps: [
      'Add follow-up entries linked to specific clients or deals.',
      'Set due dates, reminder channels (Email, Call, Meeting), and notes.',
      'Filter follow-ups by Overdue, Today, and Upcoming status.',
      'Mark follow-ups completed to log communication activity.'
    ],
    tips: [
      'Check your follow-up dashboard every morning to maintain top sales momentum.'
    ]
  },
  {
    id: 'deadline-countdown',
    viewId: 'deadline-countdown',
    title: 'Deadlines',
    category: 'Operational Core',
    icon: AlarmClock,
    summary: 'Precision countdown timer for product launches, major contract deadlines, and release dates.',
    steps: [
      'Enter launch event title, target milestone date, and description.',
      'Watch the live real-time countdown clock (Days, Hours, Minutes, Seconds).',
      'Configure visual alert milestones as launch date approaches.',
      'Save and share deadline counters across your workspace.'
    ],
    tips: [
      'Use for product releases, sprint deadlines, or investor pitch dates.'
    ]
  },
  {
    id: 'ai-summariser',
    viewId: 'ai-summariser',
    title: 'Summarizer',
    category: 'Cognitive AI Nexus',
    icon: FileText,
    summary: 'Neural text summarization, document condensation, bullet-point extractions, and executive overviews.',
    steps: [
      'Paste long articles, meeting transcripts, or document text into the input box.',
      'Select summary length (Concise Bullets, 1-Paragraph Executive Summary, Key Insights).',
      'Click "Generate Summary" to run the neural AI processing.',
      'Copy summarized text or save it directly to your notes.'
    ],
    tips: [
      'Great for quickly digesting long legal documents, research papers, or emails.'
    ]
  },
  {
    id: 'ai-grammar-fixer',
    viewId: 'ai-grammar-fixer',
    title: 'Grammar Fixer',
    category: 'Cognitive AI Nexus',
    icon: CheckCircle2,
    summary: 'Linguistic precision engine, grammar correction, tone adjustment, and professional polishing.',
    steps: [
      'Paste your draft text into the editor.',
      'Choose desired tone (Professional, Conversational, Persuasive, Academic).',
      'Click "Fix & Polish Text" to review highlighted grammar and style improvements.',
      'Copy polished output for immediate use.'
    ],
    tips: [
      'Review inline suggestions to see exact wording adjustments made by the engine.'
    ]
  },
  {
    id: 'ai-regex-gen',
    viewId: 'ai-regex-gen',
    title: 'Regex Generator',
    category: 'Engineering & Dev',
    icon: Code,
    summary: 'Convert natural language description into regular expression patterns with test sandbox.',
    steps: [
      'Describe the pattern you want to match in plain English (e.g. "Extract all valid email addresses").',
      'Click "Generate Regex" to produce the regex expression string.',
      'Test sample text inputs live against the generated regex pattern.',
      'Copy regex code for JavaScript, Python, or SQL.'
    ],
    tips: [
      'The generated breakdown explains what each part of the regex string does.'
    ]
  },
  {
    id: 'ai-sql-builder',
    viewId: 'ai-sql-builder',
    title: 'Query Builder',
    category: 'Engineering & Dev',
    icon: Database,
    summary: 'Generate optimized SQL query statements (SELECT, JOIN, GROUP BY) from natural language.',
    steps: [
      'Specify your database dialect (PostgreSQL, MySQL, SQLite) and table schemas.',
      'Describe the data output you need in plain English.',
      'Generate optimized SQL query statements.',
      'Copy query code for your database workbench or backend codebase.'
    ],
    tips: [
      'Include table column names in your prompt for pinpoint query accuracy.'
    ]
  },
  {
    id: 'ai-legal-gen',
    viewId: 'ai-legal-gen',
    title: 'Contracts Generator',
    category: 'Strategic Logic & Legal',
    icon: FileSignature,
    summary: 'Automated legal agreement drafting, NDAs, service contracts, and governing terms.',
    steps: [
      'Select contract type (NDA, Independent Contractor Agreement, Service Level Terms).',
      'Provide party details, jurisdiction state/country, and key deal terms.',
      'Generate formatted legal agreement clauses.',
      'Review and export contract text to Documents or PDF.'
    ],
    tips: [
      'Always have official legal agreements reviewed by licensed legal counsel.'
    ]
  },
  {
    id: 'product-demo-specialist',
    viewId: 'agent-runtime',
    title: 'Demo Agent',
    category: 'Autonomous Workforce',
    icon: Package,
    summary: 'Autonomous agent that generates scene-by-scene product demonstration scripts and video outlines.',
    steps: [
      'Provide your product URL, feature list, or target customer problem.',
      'The agent crafts a structured video demo script complete with visual cues and voiceover prompts.',
      'Review suggested camera angles, screen recording highlights, and closing call-to-actions.',
      'Export script outline to the Teleprompter or Screen Record tools.'
    ],
    tips: [
      'Use along with Screen Record to shoot professional SaaS video walkthroughs.'
    ]
  },
  {
    id: 'tiktok-trend-cloner',
    viewId: 'agent-runtime',
    title: 'Trend Agent',
    category: 'Autonomous Workforce',
    icon: Smartphone,
    summary: 'Autonomous agent that analyzes short-form video trends and crafts high-engagement video concepts.',
    steps: [
      'Specify your target video niche (Tech, Business, Productivity, Creator).',
      'The agent identifies viral hooks, pacing styles, and audio formats.',
      'Receive short-form video scripts customized for TikTok, Reels, and YouTube Shorts.',
      'Save top video concepts into your Content Strategy Calendar.'
    ],
    tips: [
      'Focus heavily on the first 3 seconds of the hook for maximum algorithm reach.'
    ]
  }
];

interface AppHowToGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAppId?: string | null;
  onNavigate?: (view: AppView, id?: string | null) => void;
}

export const AppHowToGuideModal: React.FC<AppHowToGuideModalProps> = ({
  isOpen,
  onClose,
  initialAppId,
  onNavigate
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    initialAppId || 'sheets'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    if (initialAppId) {
      setSelectedGuideId(initialAppId);
      setMobileView('detail');
    }
  }, [initialAppId]);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(GUIDE_DATABASE.map(g => g.category)))];

  const filteredGuides = GUIDE_DATABASE.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeGuide = GUIDE_DATABASE.find(g => g.id === selectedGuideId) || filteredGuides[0] || GUIDE_DATABASE[0];

  const handleSelectGuide = (id: string) => {
    setSelectedGuideId(id);
    setMobileView('detail');
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-2 sm:p-8 animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col h-[95vh] sm:h-[90vh] max-h-[900px] overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 truncate">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center ring-4 sm:ring-8 ring-indigo-50/50 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight">Workspace How-To Guides</h2>
                <span className="hidden sm:inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Official Manual</span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 truncate">Step-by-step guides & workflow blueprints for every tool.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 ml-2"
            title="Close Guide"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mobile View Switcher */}
        <div className="md:hidden flex border-b border-slate-200 bg-slate-50 p-1.5 shrink-0">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${mobileView === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Browse Guides ({filteredGuides.length})
          </button>
          <button
            onClick={() => setMobileView('detail')}
            className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${mobileView === 'detail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {activeGuide ? activeGuide.title : 'Guide Details'}
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#FBFBFB]">
          
          {/* Sidebar Guide Selector */}
          <div className={`w-full md:w-80 border-r border-slate-200/60 bg-white flex-col shrink-0 overflow-hidden ${mobileView === 'list' ? 'flex flex-1' : 'hidden md:flex'}`}>
            {/* Search and Category Filter */}
            <div className="p-3 sm:p-4 space-y-3 border-b border-slate-100">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Category selector pills */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 scrollbar-thin">
              {filteredGuides.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400 italic">No guides found.</div>
              ) : (
                filteredGuides.map(guide => {
                  const Icon = guide.icon;
                  const isSelected = guide.id === activeGuide?.id;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => handleSelectGuide(guide.id)}
                      className={`w-full p-3 sm:p-3.5 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer ${isSelected ? 'bg-slate-900 text-white shadow-lg ring-1 ring-slate-900' : 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'}`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="truncate">
                          <div className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{guide.title}</div>
                          <div className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{guide.category}</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-white' : 'text-slate-300'} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Guide Inspector Main View */}
          {activeGuide && (
            <div className={`flex-1 overflow-y-auto p-4 sm:p-12 space-y-6 sm:space-y-8 scrollbar-hide ${mobileView === 'detail' ? 'block' : 'hidden md:block'}`}>
              {/* Active Guide Card Header */}
              <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg ring-4 ring-slate-100 shrink-0">
                    <activeGuide.icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{activeGuide.category}</span>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Verified Feature</span>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">{activeGuide.title} Guide</h3>
                  </div>
                </div>

                {onNavigate && activeGuide.viewId && (
                  <button
                    onClick={() => {
                      onClose();
                      if (activeGuide.category === 'Autonomous Workforce') {
                        onNavigate('agent-runtime', activeGuide.id);
                      } else {
                        onNavigate(activeGuide.viewId as AppView, null);
                      }
                    }}
                    className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 shadow-xl transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>Launch {activeGuide.title}</span>
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>

              {/* Summary Box */}
              <div className="bg-indigo-950 text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-[0.3em] mb-2 sm:mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" /> Operational Overview
                </h4>
                <p className="text-sm sm:text-lg font-bold leading-relaxed text-indigo-100">
                  {activeGuide.summary}
                </p>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" /> How to Use (Step-by-Step)
                </h4>

                <div className="space-y-3 sm:space-y-4">
                  {activeGuide.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert Pro Tips */}
              {activeGuide.tips && activeGuide.tips.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-200/60 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] space-y-3 sm:space-y-4">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-600" /> Professional Pro Tips
                  </h4>
                  <ul className="space-y-2">
                    {activeGuide.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs font-bold text-amber-900/90 leading-relaxed flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
