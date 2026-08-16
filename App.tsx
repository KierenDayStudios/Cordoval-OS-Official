
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';
import { HomeTab } from './components/start/HomeTab';
import { FastTrackTab } from './components/start/FastTrackTab';
import { DevTab } from './components/start/DevTab';
import { CreateTab } from './components/start/CreateTab';
import { PlayTab } from './components/start/PlayTab';
import { CastTab, Episode } from './components/start/CastTab';
import { LearnTab } from './components/start/LearnTab';
import { FinanceTab } from './components/start/FinanceTab';
import { NewsTab } from './components/start/NewsTab';
import { ESignatureTool } from './components/ESignatureTool';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { VideoTrimmer } from './components/VideoTrimmer';
import { Teleprompter } from './components/Teleprompter';
import { WatermarkTool } from './components/WatermarkTool';
import { Dashboard } from './components/Dashboard';
import { AgentsDashboard } from './components/AgentsDashboard';
import { JoymizAI } from './components/JoymizAI';
import { AICodeEditor } from './components/AICodeEditor';
import { SmartTextRewriter } from './components/SmartTextRewriter';
import { AutoSummariser } from './components/AutoSummariser';
import { GrammarFixer } from './components/GrammarFixer';
import { HeadlineGenerator } from './components/HeadlineGenerator';
import { BackgroundRemover } from './components/BackgroundRemover';
import { CaptionGenerator } from './components/CaptionGenerator';
import { CodeExplainer } from './components/CodeExplainer';
import { CodeRefactorer } from './components/CodeRefactorer';
import { RegexGenerator } from './components/RegexGenerator';
import { SQLBuilder } from './components/SQLBuilder';
import { JSONTool } from './components/JSONTool';
import { APIRequestGen } from './components/APIRequestGen';
import { CommitMsgGen } from './components/CommitMsgGen';
import { ErrorInterpreter } from './components/ErrorInterpreter';
import { TestCaseGen } from './components/TestCaseGen';
import { LegalDraftGen } from './components/LegalDraftGen';
import { AINDAAnalyzer } from './components/AINDAAnalyzer';
import { AITrademarkScout } from './components/AITrademarkScout';
import { AIConflictMediator } from './components/AIConflictMediator';
import { AIRevenueDiversifier } from './components/AIRevenueDiversifier';
import { AIColorPsychologist } from './components/AIColorPsychologist';
import { AIMetaphorMachine } from './components/AIMetaphorMachine';
import { AIArtPromptEngineer } from './components/AIArtPromptEngineer';
import { AIElevatorPitchShaper } from './components/AIElevatorPitchShaper';
import { AIInterviewQuestionGen } from './components/AIInterviewQuestionGen';
import { AIRemotePolicyCreator } from './components/AIRemotePolicyCreator';
import { AIThesisHardener } from './components/AIThesisHardener';
import { AIAmazonReviewResponder } from './components/AIAmazonReviewResponder';
import { AIUXFeedbackBot } from './components/AIUXFeedbackBot';
import { AITaglineEngine } from './components/AITaglineEngine';
import { AIPricingStrategist } from './components/AIPricingStrategist';
import { AIColdCallScriptWriter } from './components/AIColdCallScriptWriter';
import { AISalesObjectionCrusher } from './components/AISalesObjectionCrusher';
import { AIInvoiceChaser } from './components/AIInvoiceChaser';
import { CollaborativeWhiteboard } from './components/CollaborativeWhiteboard';
import { BusinessCardDesigner } from './components/BusinessCardDesigner';
import { AudioSnippetTool } from './components/AudioSnippetTool';
import { ScreenRecorder } from './components/ScreenRecorder';
import { MultiTrackMixer } from './components/MultiTrackMixer';
import { CodeSnippetLibrary } from './components/CodeSnippetLibrary';
import { SalesScriptLibrary } from './components/SalesScriptLibrary';
import { WordEditor as DocsEditor } from './components/WordEditor';
import { NotesApp } from './components/NotesApp';
import { SlidesApp } from './components/SlidesApp';
import { ExcelApp as SheetsApp } from './components/ExcelApp';
import { FileManager } from './components/FileManager';
import { CalendarApp } from './components/CalendarApp';
import { SiteBuilder } from './components/SiteBuilder';
import { CanvasApp } from './components/CanvasApp';
import { VideoScriptSpecialist } from './components/VideoScriptSpecialist';
import { ColdOutreachPersonalizer } from './components/ColdOutreachPersonalizer';
import { CustomerReplyBot } from './components/CustomerReplyBot';
import { BusinessPlanBuilder } from './components/BusinessPlanBuilder';
import { CodeEditor } from './components/CodeEditor';
import { StockMedia } from './components/StockMedia';
import { PixelArtApp } from './components/PixelArtApp';
import { PostDesigner } from './components/PostDesigner';
import { ProjectManager } from './components/ProjectManager';
import { ContentCalendar } from './components/ContentCalendar';
import { CommandPalette } from './components/CommandPalette';
import { Settings } from './components/Settings';
import { AdvancedCalculator } from './components/AdvancedCalculator';
import { LedgerApp } from './components/LedgerApp';
import { ClientVault } from './components/ClientVault';
import { DecisionLog } from './components/DecisionLog';
import { JournalApp } from './components/JournalApp';
import { HabitsApp } from './components/HabitsApp';
import { GoalsApp } from './components/GoalsApp';
import { ClockApp } from './components/ClockApp';
import { PasswordSafe } from './components/PasswordSafe';
import { PodcastStudio } from './components/PodcastStudio';
import { AgentRuntime } from './components/AgentRuntime';
import { InternalWiki } from './components/InternalWiki';
import { ChartMaker } from './components/ChartMaker';
import { DeadlineCountdown } from './components/DeadlineCountdown';
import { MockupStudio } from './components/MockupStudio';
import { MeetingRecorder } from './components/MeetingRecorder';
import { QuoteGenerator } from './components/QuoteGenerator';
import { ImageUpscaler } from './components/ImageUpscaler';
import { PDFEditor } from './components/PDFEditor';
import { RoadmapPlanner } from './components/RoadmapPlanner';
import { FollowUpScheduler } from './components/FollowUpScheduler';
import { TimeZoneConverter } from './components/TimeZoneConverter';
import { DomainPortfolio } from './components/DomainPortfolio';
import { SOPCreator } from './components/SOPCreator';
import { PressReleaseProfessional } from './components/PressReleaseProfessional';
import { QuizCreator } from './components/QuizCreator';
import { AdCopyGenerator } from './components/AdCopyGenerator';
import { CustomerPersonaProfiler } from './components/CustomerPersonaProfiler';
import { FinanceForensic } from './components/FinanceForensic';
import { SocialMediaStrategist } from './components/SocialMediaStrategist';
import { ViralAdProducerAgent } from './components/ViralAdProducerAgent';
import { TikTokTrendClonerAgent } from './components/TikTokTrendClonerAgent';
import { ProductDemoSpecialistAgent } from './components/ProductDemoSpecialistAgent';
import { WhitePaperResearcherAgent } from './components/WhitePaperResearcherAgent';
import { NewsletterAgentUI } from './components/NewsletterAgentUI';
import { BookCoverVisionaryAgent } from './components/BookCoverVisionaryAgent';
import { ProductDescriptionAgent } from './components/ProductDescriptionAgent';

import { SocialPaywallModal, useSocialPaywallLogic } from './components/SocialPaywallModal';

import { 
  LayoutGrid, Home, Shield, Settings as SettingsIcon,
  HardDrive, ShieldCheck, Lock, ChevronRight, Info, Command, Clock, X, Bot, Terminal, Palette,
  Grid3X3, FolderOpen, Database, Link, GripVertical, ShieldAlert, Gamepad2, Radio, GraduationCap, Briefcase, DollarSign, Newspaper,
  Pause, Play, SkipForward, Volume2, VolumeX, HelpCircle, Share2, Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView, Document, Note, Presentation as PresType, Spreadsheet, CalendarEvent, AppTheme, Folder, SitePage, CanvasBoard, BusinessPlan, CodeProject, PixelArtProject, KanbanProject, ContentPlan, StorageArtifact, LedgerProject, ClientProfile, Decision, JournalEntry, Habit, Goal, PasswordEntry, AIBuilderProject, PodcastRecording, Agent, WorkLogProject } from './types';
import { WorkLog } from './components/WorkLog';
import { storage } from './storage';
import { cordovalTools } from './utils/toolRegistry';
import { DEFAULT_AGENTS } from './utils/defaultAgents';
import { useIsMobile } from './useIsMobile';
import { MobileBlocker } from './components/MobileBlocker';

const getInitialTab = (): 'home' | 'fast-track' | 'work' | 'create' | 'play' | 'cast' | 'learn' | 'dev' | 'agents' | 'consulting' | 'finance' | 'news' => {
  const path = window.location.pathname;
  if (path === '/fast-track') return 'fast-track';
  if (path === '/work') return 'work';
  if (path === '/create') return 'create';
  if (path === '/dev') return 'dev';
  if (path === '/play') return 'play';
  if (path === '/ai') return 'agents';
  if (path === '/learn') return 'learn';
  if (path === '/consulting') return 'consulting';
  if (path === '/cast') return 'cast';
  if (path === '/finance') return 'finance';
  if (path === '/news') return 'news';
  return 'home';
};

const trackPageView = () => {
  const script = document.querySelector('script[src*="counter.dev"]');
  if (script) {
    const id = script.getAttribute('data-id');
    if (id) {
      navigator.sendBeacon(
        'https://t.counter.dev/trackpage',
        new URLSearchParams({ id, page: window.location.pathname })
      );
    }
  }
};

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const paywall = useSocialPaywallLogic();
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      


      if (path === '/dashboard') return 'dashboard';
    }
    return 'dashboard';
  });
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [theme, setTheme] = useState<AppTheme>('default');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAIKeyModal, setShowAIKeyModal] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Persistent Landing Tabs Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'fast-track' | 'work' | 'create' | 'play' | 'cast' | 'learn' | 'dev' | 'agents' | 'consulting' | 'finance' | 'news'>(getInitialTab());
  
  useEffect(() => {
    const handleTabPopState = () => {
      setActiveTab(getInitialTab());
      trackPageView();
    };
    window.addEventListener('popstate', handleTabPopState);
    return () => window.removeEventListener('popstate', handleTabPopState);
  }, []);

  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [showCastDisclosure, setShowCastDisclosure] = useState(false);

  const handleTabClick = (tabId: 'home' | 'fast-track' | 'work' | 'create' | 'play' | 'cast' | 'learn' | 'dev' | 'agents' | 'consulting' | 'finance' | 'news') => {
    setIsAppsMenuOpen(false);
    
    let path = '/';
    if (tabId === 'fast-track') path = '/fast-track';
    if (tabId === 'work') path = '/work';
    if (tabId === 'create') path = '/create';
    if (tabId === 'dev') path = '/dev';
    if (tabId === 'play') path = '/play';
    if (tabId === 'agents') path = '/ai';
    if (tabId === 'learn') path = '/learn';
    if (tabId === 'consulting') path = '/consulting';
    if (tabId === 'cast') path = '/cast';
    if (tabId === 'finance') path = '/finance';
    if (tabId === 'news') path = '/news';

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      trackPageView();
    }

    if (tabId === 'cast') {
      setShowCastDisclosure(true);
    } else {
      setActiveTab(tabId as any);
      if (tabId === 'work' || tabId === 'agents' || tabId === 'home' || tabId === 'dev' || tabId === 'create' || tabId === 'fast-track') {
        setCurrentView('dashboard');
      }
    }
  };

  // Global Audio Player State
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [audioProxyFailed, setAudioProxyFailed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeState, setCurrentTimeState] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [showPodcastBackgroundPlayModal, setShowPodcastBackgroundPlayModal] = useState<boolean>(false);
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'cast') {
      setIsBackgroundPlaying(false);
    }
  }, [activeTab]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch('/api/health');
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && !contentType.includes("text/html")) {
          const data = await res.json();
          if (data && data.status === 'ok') {
            setIsApiAvailable(true);
            return;
          }
        }
        setIsApiAvailable(false);
      } catch (err) {
        setIsApiAvailable(false);
      }
    };
    checkApi();
  }, []);

  // Parse Real RSS Feed dynamically for "The Cordoval Business Show"
  useEffect(() => {
    const fetchRSSFeed = async () => {
      setLoadingEpisodes(true);
      try {
        const response = await fetch('/api/podcast-rss');
        const contentType = response.headers.get("content-type") || "";
        if (response.ok && !contentType.includes("text/html")) {
          const xmlText = await response.text();
          parseAndSetXML(xmlText);
        } else {
          await fetchAndParseCordovalDirect();
        }
      } catch (err) {
        console.warn('RSS integration failed inside App.tsx, trying direct client-side RSS', err);
        await fetchAndParseCordovalDirect();
      } finally {
        setLoadingEpisodes(false);
      }
    };

    const parseAndSetXML = (xmlText: string) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      if (items && items.length > 0) {
        const fetchedEpisodes: Episode[] = [];
        items.forEach((item, idx) => {
          const getTagText = (el: Element, tagName: string): string => {
            let tag = el.querySelector(tagName);
            if (!tag) {
              const lowerName = tagName.toLowerCase();
              tag = Array.from(el.getElementsByTagName('*')).find(
                child => child.localName.toLowerCase() === lowerName
              ) || null;
            }
            return tag?.textContent || '';
          };

          const getTagAttr = (el: Element, tagName: string, attrName: string): string => {
            let tag = el.querySelector(tagName);
            if (!tag) {
              const lowerName = tagName.toLowerCase();
              tag = Array.from(el.getElementsByTagName('*')).find(
                child => child.localName.toLowerCase() === lowerName
              ) || null;
            }
            return tag?.getAttribute(attrName) || '';
          };

          const title = getTagText(item, 'title') || '';
          let description = getTagText(item, 'description') || getTagText(item, 'summary') || '';
          description = description.replace(/<[^>]*>/g, '');
          if (description.length > 180) {
            description = description.substring(0, 180) + '...';
          }
          
          const pubDateRaw = getTagText(item, 'pubDate') || '';
          const audioUrl = getTagAttr(item, 'enclosure', 'url') || '';
          
          let durationRaw = getTagText(item, 'duration') || '20:00';
          if (/^\d+$/.test(durationRaw.trim())) {
            const totalSecs = parseInt(durationRaw.trim(), 10);
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            if (hrs > 0) {
              durationRaw = `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
            } else {
              durationRaw = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
          }
          
          const imageUrlRaw = getTagAttr(item, 'image', 'href') || getTagText(item, 'image') || '';
          
          const dateObj = new Date(pubDateRaw);
          const pubDate = isNaN(dateObj.getTime()) ? pubDateRaw : dateObj.toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          });

          // Smart assign tags
          const tags: string[] = [];
          const textToScan = (title + ' ' + description).toLowerCase();
          
          if (textToScan.includes('ai') || textToScan.includes('intelligence') || textToScan.includes('machine learning')) tags.push('AI & ML');
          if (textToScan.includes('solopreneur') || textToScan.includes('freelance')) tags.push('Solopreneur');
          if (textToScan.includes('local') || textToScan.includes('offline')) tags.push('Local-First');
          if (textToScan.includes('tech') || textToScan.includes('developer') || textToScan.includes('software')) tags.push('Technology');
          if (textToScan.includes('creative') || textToScan.includes('design') || textToScan.includes('media')) tags.push('Creative & Media');
          if (textToScan.includes('science') || textToScan.includes('learn') || textToScan.includes('education')) tags.push('Science & Edu');
          if (textToScan.includes('growth') || textToScan.includes('productivity') || textToScan.includes('mindset')) tags.push('Self-Improvement');
          
          if (tags.length === 0) tags.push('Business');
          if (idx % 3 === 0 && !tags.includes('Technology')) tags.push('Technology');
          if (idx % 4 === 0 && !tags.includes('Self-Improvement')) tags.push('Self-Improvement');

          fetchedEpisodes.push({
            title,
            description,
            pubDate,
            audioUrl,
            duration: durationRaw,
            tags: Array.from(new Set(tags)).slice(0, 3),
            podcastName: 'The Cordoval Business Show',
            imageUrl: imageUrlRaw || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400'
          });
        });

        if (fetchedEpisodes.length > 0) {
          setAllEpisodes(fetchedEpisodes);
        }
      }
    };

    const fetchAndParseCordovalDirect = async () => {
      try {
        const url = 'https://media.rss.com/cordovalshow/feed.xml';
        let xmlText = '';
        try {
          const response = await fetch(url);
          if (response.ok) {
            xmlText = await response.text();
          } else {
            throw new Error('Direct fetch failed');
          }
        } catch (directErr) {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            xmlText = await response.text();
          }
        }
        if (xmlText) {
          parseAndSetXML(xmlText);
        }
      } catch (err) {
        console.error('Direct parse of Cordoval RSS failed', err);
      }
    };

    fetchRSSFeed();
  }, []);

  // Sync speed, volume, and mute globally
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handlePlayNextEpisode = () => {
    if (!currentEpisode || allEpisodes.length === 0) return;
    const currentIdx = allEpisodes.findIndex(ep => ep.audioUrl === currentEpisode.audioUrl);
    if (currentIdx !== -1) {
      const nextIdx = (currentIdx + 1) % allEpisodes.length;
      const nextEp = allEpisodes[nextIdx];
      setCurrentEpisode(nextEp);
      setIsPlaying(false);
      setCurrentTimeState(0);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => console.warn('Play interrupted/blocked', err));
        }
      }, 50);
    }
  };

  const AI_VIEWS: (AppView | string)[] = [
    'joymiz-ai', 'ai-code-editor', 'agent-builder', 'agent-runtime',
    'ai-summariser', 'ai-text-rewriter', 'ai-grammar-fixer', 'ai-headline-gen', 'ai-bg-remover',
    'ai-caption-gen', 'ai-code-explainer', 'ai-code-refactor', 'ai-regex-gen',
    'ai-sql-builder', 'ai-json-tool', 'ai-api-gen', 'ai-commit-gen',
    'ai-error-interpreter', 'ai-test-gen', 'ai-legal-gen', 'ai-nda-analyzer',
    'ai-trademark-scout', 'ai-conflict-mediator', 'ai-revenue-diversifier',
    'ai-color-psychologist', 'ai-metaphor-machine', 'ai-art-prompt-engineer',
    'ai-elevator-pitch-shaper', 'ai-interview-question-gen', 'ai-remote-policy-creator',
    'ai-thesis-hardener', 'ai-amazon-review-responder', 'ai-ui-ux-feedback-bot',
    'ai-tagline-engine', 'ai-pricing-strategist', 'ai-cold-call-script-writer',
    'ai-sales-objection-crusher', 'ai-invoice-chaser', 'ai-invoice-generator',
    'ai-legal-draft', 'ai-test-case-gen', 'ai-api-request-gen',
    'product-demo-specialist', 'tiktok-trend-cloner', 'white-paper-researcher',
    'viral-ad-producer', 'social-media-strategist', 'finance-forensic'
  ];

  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [presentations, setPresentations] = useState<PresType[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [sites, setSites] = useState<SitePage[]>([]);
  const [canvasBoards, setCanvasBoards] = useState<CanvasBoard[]>([]);
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [codeProjects, setCodeProjects] = useState<CodeProject[]>([]);
  const [pixelProjects, setPixelProjects] = useState<PixelArtProject[]>([]);
  const [kanbanProjects, setKanbanProjects] = useState<KanbanProject[]>([]);
  const [workLogProjects, setWorkLogProjects] = useState<WorkLogProject[]>([]);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [ledgerProjects, setLedgerProjects] = useState<LedgerProject[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [aiProjects, setAiProjects] = useState<AIBuilderProject[]>([]);
  const [aiCodeProjects, setAiCodeProjects] = useState<CodeProject[]>([]);
  const [podcastRecordings, setPodcastRecordings] = useState<PodcastRecording[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'root-work', name: 'Operational', parentId: null },
    { id: 'root-personal', name: 'Private', parentId: null }
  ]);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('App update available');
      },
      onOfflineReady() {
        console.log('App is ready to work offline');
      },
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const connected = await storage.initializeDeviceStorage();
      setIsWorkspaceConnected(connected);

      const [
        sDocs, sNotes, sSlides, sSheets, sEvents, sSites, sCanvas, sPlans, sCode, sPixels, sKanban, sContent, sLedgers, sClients, sDecisions, sJournal, sHabits, sGoals, sPasswords, sAI, sAICode, sPodcasts, sAgents, sWorkLogs
      ] = await Promise.all([
        storage.list('docs'),
        storage.list('notes'),
        storage.list('slides'),
        storage.list('sheets'),
        storage.list('calendar'),
        storage.list('site-builder'),
        storage.list('canvas'),
        storage.list('plan-builder'),
        storage.list('code-editor'),
        storage.list('pixel-art'),
        storage.list('project-manager'),
        storage.list('content-calendar'),
        storage.list('ledger'),
        storage.list('client-vault'),
        storage.list('decision-log'),
        storage.list('journal'),
        storage.list('habits'),
        storage.list('goals'),
        storage.list('passwords'),
        storage.list('joymiz-ai'),
        storage.list('ai-code-editor'),
        storage.list('podcast-studio'),
        storage.list('agents'),
        storage.list('work-logs')
      ]);

      setDocuments(sDocs?.map(a => a.data) || []);
      setNotes(sNotes?.map(a => a.data) || []);
      setPresentations(sSlides?.map(a => a.data) || []);
      setSpreadsheets(sSheets?.map(a => a.data) || []);
      setCalendarEvents(sEvents?.map(a => a.data) || []);
      setSites(sSites?.map(a => a.data) || []);
      setCanvasBoards(sCanvas?.map(a => a.data) || []);
      setPlans(sPlans?.map(a => a.data) || []);
      setCodeProjects(sCode?.map(a => a.data) || []);
      setPixelProjects(sPixels?.map(a => a.data) || []);
      setKanbanProjects(sKanban?.map(a => a.data) || []);
      setContentPlans(sContent?.map(a => a.data) || []);
      setLedgerProjects(sLedgers?.map(a => a.data) || []);
      setClients(sClients?.map(a => a.data) || []);
      setDecisions(sDecisions?.map(a => a.data) || []);
      setJournalEntries(sJournal?.map(a => a.data) || []);
      setHabits(sHabits?.map(a => a.data) || []);
      setGoals(sGoals?.map(a => a.data) || []);
      setPasswords(sPasswords?.map(a => a.data) || []);
      setAiProjects(sAI?.map(a => a.data) || []);
      setAiCodeProjects(sAICode?.map(a => a.data) || []);
      setPodcastRecordings(sPodcasts?.map(a => a.data) || []);
      if (sAgents?.length) {
        setAgents(sAgents.map(a => a.data));
      } else {
        const defaultAgent: Agent = {
          id: 'system-architect',
          name: 'System Architect',
          title: 'System Architect',
          description: 'The core intelligence of the Cordoval Workspace. Specialized in system management, tool orchestration, and strategic planning.',
          systemInstruction: "You are the Cordoval System Architect. You are the primary interface for the user to manage their digital workspace. You have DIRECT ACCESS to local tools (notes, documents, calendar, etc.) via function calling. When a user asks you to perform a task like creating a document or saving a note, you MUST use the corresponding tool. NEVER tell the user you don't have access to local tools.",
          allowedTools: cordovalTools.map(t => t.name),
          history: [],
          updatedAt: Date.now(),
          tags: ['system', 'core'],
          icon: 'Bot',
          color: 'indigo',
          folderId: null
        };
        setAgents([defaultAgent]);
        await storage.save('agents', {
          id: defaultAgent.id,
          name: defaultAgent.title,
          type: 'agents',
          data: defaultAgent,
          updatedAt: defaultAgent.updatedAt
        });
      }
      setWorkLogProjects(sWorkLogs?.map(a => a.data) || []);
    };

    const savedTheme = localStorage.getItem('cordoval_theme') as AppTheme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }

    loadData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const refreshData = async () => {
    const [
      sDocs, sNotes, sSlides, sSheets, sEvents, sSites, sCanvas, sPlans, sCode, sPixels, sKanban, sContent, sLedgers, sClients, sDecisions, sJournal, sHabits, sGoals, sPasswords, sAI, sAICode, sPodcasts, sAgents, sWorkLogs
    ] = await Promise.all([
      storage.list('docs'),
      storage.list('notes'),
      storage.list('slides'),
      storage.list('sheets'),
      storage.list('calendar'),
      storage.list('site-builder'),
      storage.list('canvas'),
      storage.list('plan-builder'),
      storage.list('code-editor'),
      storage.list('pixel-art'),
      storage.list('project-manager'),
      storage.list('content-calendar'),
      storage.list('ledger'),
      storage.list('client-vault'),
      storage.list('decision-log'),
      storage.list('journal'),
      storage.list('habits'),
      storage.list('goals'),
      storage.list('passwords'),
      storage.list('joymiz-ai'),
      storage.list('ai-code-editor'),
      storage.list('podcast-studio'),
      storage.list('agents'),
      storage.list('work-logs')
    ]);

    setDocuments(sDocs?.map(a => a.data) || []);
    setNotes(sNotes?.map(a => a.data) || []);
    setPresentations(sSlides?.map(a => a.data) || []);
    setSpreadsheets(sSheets?.map(a => a.data) || []);
    setCalendarEvents(sEvents?.map(a => a.data) || []);
    setSites(sSites?.map(a => a.data) || []);
    setCanvasBoards(sCanvas?.map(a => a.data) || []);
    setPlans(sPlans?.map(a => a.data) || []);
    setCodeProjects(sCode?.map(a => a.data) || []);
    setPixelProjects(sPixels?.map(a => a.data) || []);
    setKanbanProjects(sKanban?.map(a => a.data) || []);
    setContentPlans(sContent?.map(a => a.data) || []);
    setLedgerProjects(sLedgers?.map(a => a.data) || []);
    setClients(sClients?.map(a => a.data) || []);
    setDecisions(sDecisions?.map(a => a.data) || []);
    setJournalEntries(sJournal?.map(a => a.data) || []);
    setHabits(sHabits?.map(a => a.data) || []);
    setGoals(sGoals?.map(a => a.data) || []);
    setPasswords(sPasswords?.map(a => a.data) || []);
    setAiProjects(sAI?.map(a => a.data) || []);
    setAiCodeProjects(sAICode?.map(a => a.data) || []);
    setPodcastRecordings(sPodcasts?.map(a => a.data) || []);
    setAgents(sAgents?.map(a => a.data) || []);
    setWorkLogProjects(sWorkLogs?.map(a => a.data) || []);
  };

  const handleConnectWorkspace = async () => {
    const connected = await storage.initializeDeviceStorage(true);
    setIsWorkspaceConnected(connected);
    if (connected) {
       await storage.backupBrowserToDevice();
       setShowStorageModal(false);
       // Reload all data after connection and backup
       const [
         sDocs, sNotes, sSlides, sSheets, sEvents, sSites, sCanvas, sPlans, sCode, sPixels, sKanban, sContent, sLedgers, sClients, sDecisions, sJournal, sHabits, sGoals, sPasswords, sAI, sAICode, sPodcasts
       ] = await Promise.all([
         storage.list('docs'), storage.list('notes'), storage.list('slides'), storage.list('sheets'),
         storage.list('calendar'), storage.list('site-builder'), storage.list('canvas'), storage.list('plan-builder'),
         storage.list('code-editor'), storage.list('pixel-art'), storage.list('project-manager'), storage.list('content-calendar'),
         storage.list('ledger'), storage.list('client-vault'), storage.list('decision-log'), storage.list('journal'),
         storage.list('habits'), storage.list('goals'), storage.list('passwords'), storage.list('joymiz-ai'),
         storage.list('ai-code-editor'),
         storage.list('podcast-studio')
       ]);
       
       if (sDocs?.length) setDocuments(sDocs.map(a => a.data));
       if (sNotes?.length) setNotes(sNotes.map(a => a.data));
       if (sSlides?.length) setPresentations(sSlides.map(a => a.data));
       if (sSheets?.length) setSpreadsheets(sSheets.map(a => a.data));
       if (sEvents?.length) setCalendarEvents(sEvents.map(a => a.data));
       if (sSites?.length) setSites(sSites.map(a => a.data));
       if (sCanvas?.length) setCanvasBoards(sCanvas.map(a => a.data));
       if (sPlans?.length) setPlans(sPlans.map(a => a.data));
       if (sCode?.length) setCodeProjects(sCode.map(a => a.data));
       if (sPixels?.length) setPixelProjects(sPixels.map(a => a.data));
       if (sKanban?.length) setKanbanProjects(sKanban.map(a => a.data));
       if (sContent?.length) setContentPlans(sContent.map(a => a.data));
       if (sLedgers?.length) setLedgerProjects(sLedgers.map(a => a.data));
       if (sClients?.length) setClients(sClients.map(a => a.data));
       if (sDecisions?.length) setDecisions(sDecisions.map(a => a.data));
       if (sJournal?.length) setJournalEntries(sJournal.map(a => a.data));
       if (sHabits?.length) setHabits(sHabits.map(a => a.data));
       if (sGoals?.length) setGoals(sGoals.map(a => a.data));
       if (sPasswords?.length) setPasswords(sPasswords.map(a => a.data));
       if (sAI?.length) setAiProjects(sAI.map(a => a.data));
       if (sAICode?.length) setAiCodeProjects(sAICode.map(a => a.data));
       if (sPodcasts?.length) setPodcastRecordings(sPodcasts.map(a => a.data));
    }
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('cordoval_theme', newTheme);
  };

  useEffect(() => {
    const handlePopState = () => {
      // Just keep dashboard view
      setCurrentView('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (view: AppView, data?: any) => {
    if (activeTab !== 'work' && activeTab !== 'agents') {
      setActiveTab('work');
    }
    const isAIView = AI_VIEWS.includes(view);
    
    if (isAIView) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (!storedKey) {
        setShowAIKeyModal(true);
        setCurrentView('settings');
        return;
      }
    }

    // Auto-onboard logic disabled

    if (view !== 'settings') setSettingsMessage(null);
    setCurrentView(view);
    
    if (view === 'dashboard') {
      if (activeTab === 'create') {
        window.history.pushState({}, '', '/create');
        setActiveTab('create');
      } else if (activeTab === 'dev') {
        window.history.pushState({}, '', '/dev');
        setActiveTab('dev');
      } else if (activeTab === 'work') {
        window.history.pushState({}, '', '/work');
        setActiveTab('work');
      } else {
        window.history.pushState({}, '', '/dashboard');
      }
    } else if (view === 'landing') {
      window.history.pushState({}, '', '/');
    }
    
    setActiveTag(null);
  };

  const syncArtifact = React.useCallback(async (type: string, data: any, name: string) => {
    const artifact: StorageArtifact = {
      id: data.id,
      name,
      data,
      updatedAt: Date.now(),
      type
    };
    await storage.save(type, artifact);
  }, []);

  const handleSaveAIProject = React.useCallback((project: AIBuilderProject) => {
    setAiProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('joymiz-ai', project, project.name);
  }, [syncArtifact]);

  const handleSaveAICodeProject = React.useCallback((project: CodeProject) => {
    setAiCodeProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('ai-code-editor', project, project.name);
  }, [syncArtifact]);

  const handleSavePodcast = React.useCallback((recording: PodcastRecording) => {
    setPodcastRecordings(prev => {
      const exists = prev.find(p => p.id === recording.id);
      if (exists) return prev.map(p => p.id === recording.id ? recording : p);
      return [recording, ...prev];
    });
    syncArtifact('podcast-studio', recording, recording.title);
  }, [syncArtifact]);

  const handleDeletePodcast = React.useCallback(async (id: string) => {
    setPodcastRecordings(prev => prev.filter(p => p.id !== id));
    await storage.delete('podcast-studio', id);
  }, []);

  const handleSavePassword = React.useCallback((pwd: PasswordEntry) => {
    setPasswords(prev => {
      const exists = prev.find(p => p.id === pwd.id);
      if (exists) return prev.map(p => p.id === pwd.id ? pwd : p);
      return [pwd, ...prev];
    });
    syncArtifact('passwords', pwd, pwd.service);
  }, [syncArtifact]);

  const handleDeletePassword = React.useCallback(async (id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
    await storage.delete('passwords', id);
  }, []);

  const handleSaveGoal = React.useCallback((goal: Goal) => {
    setGoals(prev => {
      const exists = prev.find(g => g.id === goal.id);
      if (exists) return prev.map(g => g.id === goal.id ? goal : g);
      return [goal, ...prev];
    });
    syncArtifact('goals', goal, goal.title);
  }, [syncArtifact]);

  const handleDeleteGoal = React.useCallback(async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await storage.delete('goals', id);
  }, []);

  const handleSaveHabit = React.useCallback((habit: Habit) => {
    setHabits(prev => {
      const exists = prev.find(h => h.id === habit.id);
      if (exists) return prev.map(h => h.id === habit.id ? habit : h);
      return [habit, ...prev];
    });
    syncArtifact('habits', habit, habit.title);
  }, [syncArtifact]);

  const handleDeleteHabit = React.useCallback(async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    await storage.delete('habits', id);
  }, []);

  const handleSaveJournal = React.useCallback((entry: JournalEntry) => {
    setJournalEntries(prev => {
      const exists = prev.find(j => j.id === entry.id);
      if (exists) return prev.map(j => j.id === entry.id ? entry : j);
      return [entry, ...prev];
    });
    syncArtifact('journal', entry, entry.title || 'Untitled Entry');
  }, [syncArtifact]);

  const handleDeleteJournal = React.useCallback(async (id: string) => {
    setJournalEntries(prev => prev.filter(j => j.id !== id));
    await storage.delete('journal', id);
  }, []);

  const handleSaveDoc = React.useCallback((doc: Document) => {
    setDocuments(prev => {
      const exists = prev.find(d => d.id === doc.id);
      if (exists) return prev.map(d => d.id === doc.id ? doc : d);
      return [doc, ...prev];
    });
    syncArtifact('docs', doc, doc.name);
  }, [syncArtifact]);

  const handleSaveNote = React.useCallback((note: Note) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id);
      if (exists) return prev.map(n => n.id === note.id ? note : n);
      return [note, ...prev];
    });
    syncArtifact('notes', note, note.title);
  }, [syncArtifact]);

  const handleSaveLedger = React.useCallback((project: LedgerProject) => {
    setLedgerProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('ledger', project, project.name);
  }, [syncArtifact]);

  const handleSaveClient = React.useCallback((client: ClientProfile) => {
    setClients(prev => {
      const exists = prev.find(p => p.id === client.id);
      if (exists) return prev.map(p => p.id === client.id ? client : p);
      return [client, ...prev];
    });
    syncArtifact('client-vault', client, client.name);
  }, [syncArtifact]);

  const handleDeleteClient = React.useCallback(async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    await storage.delete('client-vault', id);
  }, []);

  const handleSaveDecision = React.useCallback((decision: Decision) => {
    setDecisions(prev => {
      const exists = prev.find(p => p.id === decision.id);
      if (exists) return prev.map(p => p.id === decision.id ? decision : p);
      return [decision, ...prev];
    });
    syncArtifact('decision-log', decision, decision.name);
  }, [syncArtifact]);

  const handleSavePixelArt = React.useCallback((project: PixelArtProject) => {
    setPixelProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('pixel-art', project, project.name);
  }, [syncArtifact]);

  const handleSaveKanban = React.useCallback((project: KanbanProject) => {
    setKanbanProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('project-manager', project, project.name);
  }, [syncArtifact]);

  const handleSaveWorkLog = React.useCallback((project: WorkLogProject) => {
    setWorkLogProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('work-logs', project, project.name);
  }, [syncArtifact]);

  const handleExportWorkLogToSheets = React.useCallback(async (project: WorkLogProject) => {
    const data: { [key: string]: string } = {
      'A1': 'Date', 'B1': 'Project', 'C1': 'Client', 'D1': 'Description', 'E1': 'Duration (s)', 'F1': 'Billable', 'G1': 'Rate', 'H1': 'Amount'
    };

    project.entries.forEach((e, idx) => {
      const row = idx + 2;
      data[`A${row}`] = new Date(e.startTime).toLocaleDateString();
      data[`B${row}`] = e.projectName;
      data[`C${row}`] = e.clientName || '';
      data[`D${row}`] = e.description;
      data[`E${row}`] = e.duration.toString();
      data[`F${row}`] = e.isBillable ? 'Yes' : 'No';
      data[`G${row}`] = (e.hourlyRate || 50).toString();
      data[`H${row}`] = ((e.duration / 3600) * (e.hourlyRate || 50)).toFixed(2);
    });

    const newSheet: Spreadsheet = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${project.name} Export`,
      updatedAt: Date.now(),
      tags: ['export', 'timesheet'],
      folderId: null,
      history: [],
      data: data
    };

    setSpreadsheets(prev => [newSheet, ...prev]);
    syncArtifact('sheets', newSheet, newSheet.name);
    navigate('sheets', newSheet.id);
  }, [syncArtifact, navigate]);

  const handleSaveContentPlan = React.useCallback((plan: ContentPlan) => {
    setContentPlans(prev => {
      const exists = prev.find(p => p.id === plan.id);
      if (exists) return prev.map(p => p.id === plan.id ? plan : p);
      return [plan, ...prev];
    });
    syncArtifact('content-calendar', plan, plan.name);
  }, [syncArtifact]);

  const handleSaveSite = React.useCallback((site: SitePage) => {
    setSites(prev => {
      const exists = prev.find(s => s.id === site.id);
      if (exists) return prev.map(s => s.id === site.id ? site : s);
      return [site, ...prev];
    });
    syncArtifact('site-builder', site, site.name);
  }, [syncArtifact]);

  const handleSaveCanvas = React.useCallback((board: CanvasBoard) => {
    setCanvasBoards(prev => {
      const exists = prev.find(b => b.id === board.id);
      if (exists) return prev.map(b => b.id === board.id ? board : b);
      return [board, ...prev];
    });
    syncArtifact('canvas', board, board.name);
  }, [syncArtifact]);

  const handleSavePlan = React.useCallback((plan: BusinessPlan) => {
    setPlans(prev => {
      const exists = prev.find(p => p.id === plan.id);
      if (exists) return prev.map(p => p.id === plan.id ? plan : p);
      return [plan, ...prev];
    });
    syncArtifact('plan-builder', plan, plan.name);
  }, [syncArtifact]);

  const handleSaveCode = React.useCallback((project: CodeProject) => {
    setCodeProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
    syncArtifact('code-editor', project, project.name);
  }, [syncArtifact]);

  const handleSaveSheet = React.useCallback((sheet: Spreadsheet) => {
    setSpreadsheets(prev => {
      const exists = prev.find(s => s.id === sheet.id);
      if (exists) return prev.map(s => s.id === sheet.id ? sheet : s);
      return [sheet, ...prev];
    });
    syncArtifact('sheets', sheet, sheet.name);
  }, [syncArtifact]);

  const handleSavePresentation = React.useCallback((pres: PresType) => {
    setPresentations(prev => {
      const exists = prev.find(p => p.id === pres.id);
      if (exists) return prev.map(p => p.id === pres.id ? pres : p);
      return [pres, ...prev];
    });
    syncArtifact('slides', pres, pres.name);
  }, [syncArtifact]);

  const handleSaveEvent = React.useCallback((e: CalendarEvent) => {
    setCalendarEvents(prev => {
      const exists = prev.find(ev => ev.id === e.id);
      if (exists) return prev.map(ev => ev.id === e.id ? e : ev);
      return [...prev, e];
    });
    syncArtifact('calendar', e, e.title);
  }, [syncArtifact]);

  const handleSaveAgent = async (agent: Agent) => {
    setAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      if (exists) return prev.map(a => a.id === agent.id ? agent : a);
      return [agent, ...prev];
    });
    await storage.save('agents', { id: agent.id, name: agent.title, data: agent, updatedAt: agent.updatedAt, type: 'agents' });
  };

  const handleDeleteAgent = async (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    await storage.delete('agents', id);
  };

  const getFilteredArtifacts = () => {
    const all = [
      ...(documents || []).map(d => ({ ...d, type: 'docs', name: d.name || 'Untitled Doc' })),
      ...(spreadsheets || []).map(s => ({ ...s, type: 'sheets', name: s.name || 'Untitled Sheet' })),
      ...(presentations || []).map(p => ({ ...p, type: 'slides', name: p.name || 'Untitled Pres' })),
      ...(notes || []).map(n => ({ ...n, name: n.title || 'Untitled Note', type: 'notes' })),
      ...(sites || []).map(s => ({ ...s, type: 'site-builder', name: s.name || 'Untitled Site' })),
      ...(canvasBoards || []).map(c => ({ ...c, type: 'canvas', name: c.name || 'Untitled Canvas' })),
      ...(plans || []).map(p => ({ ...p, type: 'plan-builder', name: p.name || 'Untitled Plan' })),
      ...(codeProjects || []).map(c => ({ ...c, type: 'code-editor', name: c.name || 'Untitled Code' })),
      ...(pixelProjects || []).map(p => ({ ...p, type: 'pixel-art', name: p.name || 'Untitled Art' })),
      ...(kanbanProjects || []).map(k => ({ ...k, type: 'project-manager', name: k.name || 'Untitled Project' })),
      ...(contentPlans || []).map(c => ({ ...c, type: 'content-calendar', name: c.name || 'Untitled Content' })),
      ...(ledgerProjects || []).map(l => ({ ...l, type: 'ledger', name: l.name || 'Untitled Ledger' })),
      ...(clients || []).map(c => ({ ...c, type: 'client-vault', name: c.name || 'Untitled Client' })),
      ...(decisions || []).map(d => ({ ...d, type: 'decision-log', name: d.name || 'Untitled Decision' })),
      ...(journalEntries || []).map(j => ({ ...j, type: 'journal', name: j.title || 'Untitled Journal' })),
      ...(goals || []).map(g => ({ ...g, type: 'goals', name: g.title || 'Untitled Goal' })),
      ...(aiProjects || []).map(p => ({ ...p, type: 'joymiz-ai', name: p.name || 'Untitled AI Project' })),
      ...(podcastRecordings || []).map(p => ({ ...p, type: 'podcast-studio', name: p.title || 'Untitled Podcast' })),
    ];
    if (activeTag) {
      return all.filter(f => f.tags?.includes(activeTag));
    }
    return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  };

  const showNavRail = currentView !== 'landing' && (activeTab === 'work' || activeTab === 'agents');

  const showMobileBottomBar = isMobile && showNavRail && !['dashboard', 'dashboard-academy'].includes(currentView);



  return (
    <div className="flex flex-col h-screen w-screen bg-[#ffffff] text-slate-900 overflow-hidden font-sans">
      
      {/* PERSISTENT HEADER */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 z-[101] shadow-sm flex-shrink-0 select-none">
        {/* Left Logo */}
        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => setActiveTab('work')}>
          <img src="https://raw.githubusercontent.com/KierenDayStudios/Cordoval-image/main/project_20260728_2225349-01%20(1).png" className="w-8 h-8 rounded-xl object-cover shrink-0 shadow-sm" alt="Cordoval Logo" />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-black tracking-tight text-slate-900 leading-none">CORDOVAL 8.0</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Local First</span>
          </div>
        </div>

        {/* Middle Apps Menu */}
        <div className="flex justify-center items-center flex-1">
          <div className="relative">
            <button
              onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                isAppsMenuOpen ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Menu"
            >
              <Grid3X3 size={20} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Menu</span>
            </button>

            {isAppsMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[100]" 
                  onClick={() => setIsAppsMenuOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-14 left-1/2 -translate-x-1/2 w-80 max-w-[94vw] max-h-[82vh] overflow-y-auto bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200 p-4 z-[102] origin-top flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between px-2 pt-1 border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ecosystem Navigation</span>
                    <button 
                      onClick={() => setIsAppsMenuOpen(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'home', label: 'Home', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { id: 'fast-track', label: 'Fast Track', icon: Rocket, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { id: 'work', label: 'Work', icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { id: 'create', label: 'Create', icon: Palette, color: 'text-rose-600', bg: 'bg-rose-50' },
                      { id: 'dev', label: 'Dev', icon: Terminal, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { id: 'play', label: 'Play', icon: Gamepad2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { id: 'cast', label: 'Cast', icon: Radio, color: 'text-rose-600', bg: 'bg-rose-50' },
                      { id: 'learn', label: 'Learn', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { id: 'news', label: 'News', icon: Newspaper, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { id: 'consulting', label: 'Consulting', icon: Briefcase, color: 'text-sky-600', bg: 'bg-sky-50', comingSoon: true },
                      { id: 'agents', label: 'Agents', icon: Bot, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (!tab.comingSoon) {
                              handleTabClick(tab.id as any);
                              setIsAppsMenuOpen(false);
                            }
                          }}
                          className={`relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl transition-all cursor-pointer ${
                            isActive ? 'bg-slate-100 ring-1 ring-slate-200 shadow-sm' : 'hover:bg-slate-50'
                          } ${tab.comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tab.bg} ${tab.color}`}>
                            <Icon size={24} strokeWidth={2.5} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 tracking-tight">{tab.label}</span>
                          {tab.comingSoon && (
                            <div className="absolute top-2 right-2 bg-slate-800 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Soon
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Right workspace status */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 text-xs font-medium text-slate-500 flex-1">
          {isBackgroundPlaying && currentEpisode && (
            <button 
              onClick={() => {
                setIsBackgroundPlaying(false);
                handleTabClick('cast');
              }}
              className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase text-indigo-600 tracking-wider animate-pulse hover:bg-indigo-100 transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span className="hidden sm:inline">Cast Active</span>
            </button>
          )}

          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-slate-600 tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <HelpCircle size={12} className="text-slate-500" />
            <span className="hidden min-[420px]:inline">Support</span>
          </button>
        </div>
      </header>

      {/* BODY WRAPPER */}
      <div className="flex flex-1 w-full h-full overflow-hidden relative bg-white">

      
      {showNavRail && !isMobile && (
        <motion.aside 
          drag
          dragMomentum={false}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 w-16 flex flex-col py-4 gap-6 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl items-center z-[1000] shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-default select-none"
        >
          <div className="w-8 h-1.5 bg-slate-100 rounded-full mb-1 cursor-grab active:cursor-grabbing flex items-center justify-center group">
             <div className="w-4 h-0.5 bg-slate-200 group-hover:bg-slate-300 transition-colors rounded-full" />
          </div>

          <div className="relative">
            <div 
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 group relative z-10 ${currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} 
              onClick={() => navigate('dashboard')}
            >
               <Grid3X3 size={20} strokeWidth={2.5} />
               <div className="absolute right-full mr-4 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-[10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                  Mission Control
               </div>
            </div>
            {currentView === 'dashboard' && <div className="absolute -inset-1 bg-slate-900/5 blur-xl rounded-full" />}
          </div>
          
          <div className="flex flex-col gap-4 items-center w-full px-2">
             <button 
                onClick={() => navigate('file-manager')}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${currentView === 'file-manager' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
             >
                <FolderOpen size={18} strokeWidth={2.5} />
                <div className="absolute right-full mr-4 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-[5px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                  Data Vault
                </div>
             </button>

             <button 
                onClick={() => setShowStorageModal(true)}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:bg-slate-50 hover:text-slate-600`}
             >
                <Link size={18} strokeWidth={2.5} />
                <div className="absolute right-full mr-4 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-[5px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                  Cloud Link
                </div>
             </button>

             <button 
                onClick={() => navigate('settings')}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${currentView === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
             >
                <SettingsIcon size={18} strokeWidth={2.5} />
                <div className="absolute right-full mr-4 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-[5px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                  Configure
                </div>
             </button>
          </div>
        </motion.aside>
      )}

      {showMobileBottomBar && (
        <aside className="fixed bottom-0 left-0 right-0 h-[72px] px-8 bg-white border-t border-slate-100 flex items-center justify-between z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <button 
            className={`p-3 rounded-2xl transition-all ${currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`} 
            onClick={() => navigate('dashboard')}
          >
             <Grid3X3 size={24} strokeWidth={2} />
          </button>
          
          <button 
            className={`p-3 rounded-2xl transition-all ${currentView === 'file-manager' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`} 
            onClick={() => navigate('file-manager')}
          >
             <FolderOpen size={24} strokeWidth={2} />
          </button>

          <button 
            className="p-3 rounded-2xl text-slate-400" 
            onClick={() => setShowStorageModal(true)}
          >
             <Link size={24} strokeWidth={2} />
          </button>

          <button 
            className={`p-3 rounded-2xl transition-all ${currentView === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`} 
            onClick={() => navigate('settings')}
          >
             <SettingsIcon size={24} strokeWidth={2} />
          </button>
        </aside>
      )}


      <main className={`flex-1 flex flex-col overflow-hidden relative ${showMobileBottomBar ? 'pb-[72px]' : ''}`}>
        
        {showAIKeyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[900] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-8 ring-8 ring-amber-50/50">
                <ShieldAlert size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">Neural Connection Needed</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">
                In order to keep privacy high and for you to access to AI tools, you will need to connect a Google Gemini API key with billing enabled. 
                This key stays on your device's local browser storage and is never sent to our servers.
              </p>
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setShowAIKeyModal(false)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Understood, proceed
                </button>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">
                  We don't have servers. Your data is yours.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {showStorageModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-2xl px-6 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl bg-white rounded-[3.5rem] p-12 shadow-2xl border border-white flex flex-col relative overflow-hidden">
               <button 
                 onClick={() => setShowStorageModal(false)}
                 className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors z-[600]"
               >
                 <X size={24} />
               </button>
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <ShieldCheck size={300} />
               </div>

               <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                    <Command size={32} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Initialize Vault</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                       <ShieldCheck size={14} className="text-emerald-500" /> Professional Sovereignty Protocol
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group flex flex-col p-10 bg-[#F9FAFB] rounded-[2.5rem] border border-slate-100 hover:border-slate-900 hover:bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer" onClick={handleConnectWorkspace}>
                     <div className="w-16 h-16 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all mb-8">
                        <HardDrive size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Local Device Folder</h3>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                        Map Cordoval directly to a folder on your computer. Files are stored as standard JSON/TXT artifacts on your hard drive.
                     </p>
                     
                     <div className="mt-auto space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-50 group-hover:border-slate-100 transition-colors">
                           <Lock size={14} className="text-emerald-500 mt-0.5" />
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-normal">
                             <span className="text-slate-900">Total Sovereignty:</span> Cordoval acts as a lens over your existing files. No syncing, no clouds, no tracking.
                           </p>
                        </div>
                        <button className="w-full h-14 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95">
                           Connect Vault <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="group flex flex-col p-10 bg-[#F9FAFB] rounded-[2.5rem] border border-slate-100 hover:border-slate-900 hover:bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer" onClick={() => setShowStorageModal(false)}>
                     <div className="w-16 h-16 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all mb-8">
                        <Shield size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Browser Sandbox</h3>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                        Continue using your browser's internal database (IndexedDB). No computer file permissions required. Simple and fast.
                     </p>
                     
                     <div className="mt-auto space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 transition-colors">
                           <div className="text-amber-500 mt-0.5"><Info size={14} /></div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-normal">
                             <span className="text-slate-900">Sandbox Privacy:</span> Private to this browser, but artifacts may be lost if browser cache is cleared.
                           </p>
                        </div>
                        <button className="w-full h-14 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95">
                           Use Sandbox <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center md:text-left">
                     Privacy is not an option — it is our baseline. <br />
                     <span className="text-slate-300">Choose the layer that fits your workflow.</span>
                  </p>
                  <button onClick={() => navigate('settings')} className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors">Read Legal & Terms</button>
               </div>
            </div>
          </div>
        )}

        {isCommandPaletteOpen && (
          <CommandPalette 
            onNavigate={navigate} 
            setActiveDocId={setActiveDocId}
            setCurrentView={setCurrentView}
            onThemeChange={handleThemeChange} 
            onClose={() => setIsCommandPaletteOpen(false)} 
          />
        )}

        <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
            
            {activeTab === 'home' && currentView === 'dashboard' && (
              <HomeTab 
                events={calendarEvents}
                onSaveEvent={handleSaveEvent}
                notes={notes}
                onSaveNote={handleSaveNote}
                onDeleteNote={(id) => setNotes(prev => prev.filter(n => n.id !== id))}
                onNavigate={navigate}
                onSelectTab={handleTabClick}
              />
            )}

            {activeTab === 'fast-track' && currentView === 'dashboard' && (
              <FastTrackTab 
                onNavigate={navigate}
                onSelectTab={handleTabClick}
              />
            )}

            {currentView === 'fast-track' && (
              <FastTrackTab 
                onNavigate={navigate}
                onSelectTab={handleTabClick}
              />
            )}

            {activeTab === 'dev' && currentView === 'dashboard' && (
              <DevTab 
                onNavigate={navigate}
              />
            )}

            {activeTab === 'create' && currentView === 'dashboard' && (
              <CreateTab 
                onNavigate={navigate}
              />
            )}

            {activeTab === 'play' && (
              <PlayTab onNavigate={navigate} />
            )}

            {activeTab === 'learn' && (
              <LearnTab />
            )}

            {activeTab === 'news' && (
              <NewsTab />
            )}

            {activeTab === 'finance' && (
              <FinanceTab />
            )}

            {activeTab === 'cast' && (
              <CastTab
                currentEpisode={currentEpisode}
                isPlaying={isPlaying}
                currentTime={currentTimeState}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                playbackRate={playbackRate}
                allEpisodes={allEpisodes}
                loadingEpisodes={loadingEpisodes}
                onSelectEpisode={(ep) => {
                  setCurrentEpisode(ep);
                  setIsPlaying(false);
                  setCurrentTimeState(0);
                  setTimeout(() => {
                    if (audioRef.current) {
                      audioRef.current.load();
                      audioRef.current.play().then(() => {
                        setIsPlaying(true);
                      }).catch(err => console.warn('Play interrupted/blocked', err));
                    }
                  }, 50);
                }}
                onTogglePlay={() => {
                  if (!audioRef.current) return;
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current.play().then(() => {
                      setIsPlaying(true);
                    }).catch(err => console.warn('Play interrupted/blocked', err));
                  }
                }}
                onSetVolume={setVolume}
                onSetMuted={setIsMuted}
                onSetPlaybackRate={setPlaybackRate}
                onSeek={(newTime) => {
                  setCurrentTimeState(newTime);
                  if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                  }
                }}
                onClosePlayer={() => {
                  if (isMobile) {
                    setShowPodcastBackgroundPlayModal(true);
                  } else {
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                    setCurrentEpisode(null);
                  }
                }}
                onNavigate={navigate}
              />
            )}

            {(activeTab === 'work' || activeTab === 'agents') && (
              <>
                {currentView === 'landing' && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                    <p className="font-bold text-sm">Redirecting to Dashboard...</p>
                  </div>
                )}




            {currentView === 'dashboard' && activeTab === 'work' && (
              <Dashboard 
                onNavigate={navigate} 
                recentFiles={getFilteredArtifacts().slice(0, 10)}
                pinnedFiles={getFilteredArtifacts().filter(f => f.isPinned)}
                onSaveNote={handleSaveNote}
                isWorkspaceConnected={isWorkspaceConnected}
                onConnectWorkspace={() => setShowStorageModal(true)}
                stats={{
                  docs: documents.length,
                  notes: notes.length,
                  sheets: spreadsheets.length,
                  slides: presentations.length,
                  sites: sites.length,
                  canvas: canvasBoards.length,
                  plans: plans.length,
                  code: codeProjects.length,
                  pixel: pixelProjects.length,
                  projects: kanbanProjects.length,
                  ledger: ledgerProjects.length,
                  clients: clients.length,
                  decisions: decisions.length,
                  journal: journalEntries.length,
                  habits: habits.length,
                  goals: goals.length,
                  passwords: passwords.length,
                  aiProjects: aiProjects.length,
                  workLogs: workLogProjects.length
                }}
                activeTag={activeTag}
                onClearTag={() => setActiveTag(null)}
              />
            )}
            {currentView === 'dashboard' && activeTab === 'agents' && (
              <AgentsDashboard 
                onNavigate={navigate} 
                recentFiles={getFilteredArtifacts().slice(0, 10)}
                pinnedFiles={getFilteredArtifacts().filter(f => f.isPinned)}
                onSaveNote={handleSaveNote}
                isWorkspaceConnected={isWorkspaceConnected}
                onConnectWorkspace={() => setShowStorageModal(true)}
                stats={{
                  docs: documents.length,
                  notes: notes.length,
                  sheets: spreadsheets.length,
                  slides: presentations.length,
                  sites: sites.length,
                  canvas: canvasBoards.length,
                  plans: plans.length,
                  code: codeProjects.length,
                  pixel: pixelProjects.length,
                  projects: kanbanProjects.length,
                  ledger: ledgerProjects.length,
                  clients: clients.length,
                  decisions: decisions.length,
                  journal: journalEntries.length,
                  habits: habits.length,
                  goals: goals.length,
                  passwords: passwords.length,
                  aiProjects: aiProjects.length,
                  workLogs: workLogProjects.length
                }}
                activeTag={activeTag}
                onClearTag={() => setActiveTag(null)}
              />
            )}


            {currentView === 'joymiz-ai' && (
              <JoymizAI 
                activeProject={aiProjects.find(p => p.id === activeDocId)}
                onSave={handleSaveAIProject}
                onBack={() => navigate('dashboard')}
              />
            )}

            {currentView === 'ai-code-editor' && (
              <AICodeEditor 
                activeProject={aiCodeProjects.find(p => p.id === activeDocId)}
                onSave={handleSaveAICodeProject}
                onBack={() => navigate('dashboard')}
              />
            )}

            {currentView === 'ai-text-rewriter' && (
              <SmartTextRewriter onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-summariser' && (
              <AutoSummariser onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-grammar-fixer' && (
              <GrammarFixer onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-headline-gen' && (
              <HeadlineGenerator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-bg-remover' && (
              <BackgroundRemover onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-caption-gen' && (
              <CaptionGenerator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-code-explainer' && (
              <CodeExplainer onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-code-refactor' && (
              <CodeRefactorer onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-regex-gen' && (
              <RegexGenerator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-sql-builder' && (
              <SQLBuilder onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-json-tool' && (
              <JSONTool onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-api-gen' && (
              <APIRequestGen onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-commit-gen' && (
              <CommitMsgGen onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-error-interpreter' && (
              <ErrorInterpreter onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-test-gen' && (
              <TestCaseGen onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-legal-gen' && (
              <LegalDraftGen onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-nda-analyzer' && (
              <AINDAAnalyzer onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-trademark-scout' && (
              <AITrademarkScout onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-conflict-mediator' && (
              <AIConflictMediator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'ai-revenue-diversifier' && (
              <AIRevenueDiversifier onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-color-psychologist' && (
              <AIColorPsychologist onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-metaphor-machine' && (
              <AIMetaphorMachine onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-art-prompt-engineer' && (
              <AIArtPromptEngineer onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-elevator-pitch-shaper' && (
              <AIElevatorPitchShaper onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-interview-question-gen' && (
              <AIInterviewQuestionGen onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-remote-policy-creator' && (
              <AIRemotePolicyCreator onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-thesis-hardener' && (
              <AIThesisHardener onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-amazon-review-responder' && (
              <AIAmazonReviewResponder onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-ui-ux-feedback-bot' && (
              <AIUXFeedbackBot onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-tagline-engine' && (
              <AITaglineEngine onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-pricing-strategist' && (
              <AIPricingStrategist onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-cold-call-script-writer' && (
              <AIColdCallScriptWriter onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-sales-objection-crusher' && (
              <AISalesObjectionCrusher onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-invoice-chaser' && (
              <AIInvoiceChaser onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-collaborative-whiteboard' && (
              <CollaborativeWhiteboard onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'ai-business-card-designer' && (
              <BusinessCardDesigner onBack={() => navigate('dashboard')} onNavigate={navigate} />
            )}

            {currentView === 'audio-snippet-tool' && (
              <AudioSnippetTool onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'screen-recorder' && (
              <ScreenRecorder onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'multi-track-mixer' && (
              <MultiTrackMixer onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'code-snippet-library' && (
              <CodeSnippetLibrary onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'internal-wiki' && (
              <InternalWiki onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'chart-maker' && (
              <ChartMaker onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'deadline-countdown' && (
              <DeadlineCountdown onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'mockup-studio' && (
              <MockupStudio onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'meeting-recorder' && (
              <MeetingRecorder onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'quote-generator' && (
              <QuoteGenerator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'image-upscaler' && (
              <ImageUpscaler onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'pdf-editor' && (
              <PDFEditor onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'roadmap-planner' && (
              <RoadmapPlanner onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'follow-up-scheduler' && (
              <FollowUpScheduler onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'time-zone-converter' && (
              <TimeZoneConverter onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'domain-portfolio' && (
              <DomainPortfolio onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'sales-script-library' && (
              <SalesScriptLibrary onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'sop-creator' && (
              <SOPCreator onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'press-release' && (
              <PressReleaseProfessional onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'quiz-creator' && (
              <QuizCreator onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}
            
            {currentView === 'ad-copy' && (
              <AdCopyGenerator onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'customer-persona' && (
              <CustomerPersonaProfiler onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'customer-reply-bot' && (
              <CustomerReplyBot onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'video-script-specialist' && (
              <VideoScriptSpecialist onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'sales-outreach' && (
              <ColdOutreachPersonalizer onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'finance-forensic' && (
              <FinanceForensic onSaveDoc={handleSaveDoc} onSaveSheet={handleSaveSheet} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'social-media-strategist' && (
              <SocialMediaStrategist onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'viral-ad-producer' && (
              <ViralAdProducerAgent onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'tiktok-trend-cloner' && (
              <TikTokTrendClonerAgent onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'product-demo-specialist' && (
              <ProductDemoSpecialistAgent onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'white-paper-researcher' && (
              <WhitePaperResearcherAgent onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'newsletter-agent' && (
              <NewsletterAgentUI onGenerated={(id) => navigate('docs', id)} />
            )}

            {currentView === 'book-cover-agent' && (
              <BookCoverVisionaryAgent onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'product-description-agent' && (
              <ProductDescriptionAgent onSaveDoc={handleSaveDoc} onNavigate={navigate} onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'password-safe' && (
              <PasswordSafe 
                entries={passwords}
                onSave={handleSavePassword}
                onDelete={handleDeletePassword}
                onBack={() => navigate('dashboard')}
              />
            )}

            {currentView === 'journal' && (
              <JournalApp 
                entries={journalEntries}
                onSaveEntry={handleSaveJournal}
                onDeleteEntry={handleDeleteJournal}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'habits' && (
              <HabitsApp 
                habits={habits}
                onSaveHabit={handleSaveHabit}
                onDeleteHabit={handleDeleteHabit}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {(currentView as string) === 'bottom-tab-goals' && (
              <GoalsApp 
                goals={goals}
                onSaveGoal={handleSaveGoal}
                onDeleteGoal={handleDeleteGoal}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'goals' && (
              <GoalsApp 
                goals={goals}
                onSaveGoal={handleSaveGoal}
                onDeleteGoal={handleDeleteGoal}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {(currentView === 'timer' || currentView === 'stopwatch') && (
              <ClockApp 
                initialTab={currentView === 'stopwatch' ? 'stopwatch' : 'timer'}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'docs' && (
              <DocsEditor 
                docId={activeDocId} 
                existingDoc={documents.find(d => d.id === activeDocId)}
                onSave={handleSaveDoc}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'ledger' && (
              <LedgerApp 
                activeProject={ledgerProjects.find(l => l.id === activeDocId)}
                onSave={handleSaveLedger}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'client-vault' && (
              <ClientVault 
                activeProfile={clients.find(l => l.id === activeDocId)}
                initialClients={clients}
                onSave={handleSaveClient}
                onDeleteClient={handleDeleteClient}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'decision-log' && (
              <DecisionLog 
                activeDecision={decisions.find(l => l.id === activeDocId)}
                onSave={handleSaveDecision}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'notes' && (
              <NotesApp 
                notes={notes}
                onSaveNote={handleSaveNote}
                onDeleteNote={async (id) => {
                  setNotes(prev => prev.filter(n => n.id !== id));
                  await storage.delete('notes', id);
                }}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'slides' && (
              <SlidesApp 
                activePres={presentations.find(p => p.id === activeDocId)}
                onSave={handleSavePresentation}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'sheets' && (
              <SheetsApp 
                activeSheet={spreadsheets.find(s => s.id === activeDocId)}
                onSave={handleSaveSheet}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'calculator' && (
              <AdvancedCalculator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'content-calendar' && (
              <ContentCalendar 
                plans={contentPlans}
                onSavePlan={handleSaveContentPlan}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'calendar' && (
              <CalendarApp 
                events={calendarEvents} 
                onSaveEvent={handleSaveEvent}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'site-builder' && (
              isMobile ? (
                <MobileBlocker onBack={() => navigate('dashboard')} />
              ) : (
                <SiteBuilder 
                  activeSite={sites.find(s => s.id === activeDocId)}
                  onSave={handleSaveSite}
                  onBack={() => navigate('dashboard')}
                />
              )
            )}

            {currentView === 'canvas' && (
              <CanvasApp 
                activeBoard={canvasBoards.find(b => b.id === activeDocId)}
                onSave={handleSaveCanvas}
                onBack={() => navigate('dashboard')}
              />
            )}

            {currentView === 'plan-builder' && (
              <BusinessPlanBuilder 
                activePlan={plans.find(p => p.id === activeDocId)}
                onSave={handleSavePlan}
                onBack={() => navigate('dashboard')}
              />
            )}

            {currentView === 'code-editor' && (
              isMobile ? (
                <MobileBlocker onBack={() => navigate('dashboard')} />
              ) : (
                <CodeEditor 
                  activeProject={codeProjects.find(p => p.id === activeDocId)}
                  onSave={handleSaveCode}
                  onBack={() => navigate('dashboard')}
                />
              )
            )}

            {currentView === 'stock-media' && (
              <StockMedia 
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'podcast-studio' && (
              <PodcastStudio 
                recordings={podcastRecordings}
                onSave={handleSavePodcast}
                onDelete={handleDeletePodcast}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'agent-runtime' && (
              <AgentRuntime 
                agent={[...DEFAULT_AGENTS, ...agents].find(a => a.id === activeDocId) || DEFAULT_AGENTS[0]}
                onBack={() => navigate('dashboard')} 
                onAgentForged={() => {
                  storage.list('agents').then(res => setAgents(res.map(r => r.data)));
                }}
                onStartPodcast={() => setCurrentView('podcast-studio')}
                onStartBusinessPlan={(plan) => {
                  if (plan) {
                    setActiveDocId(plan.id);
                  }
                  setCurrentView('plan-builder');
                }}
                onArtifactCreated={refreshData}
                onOpenDoc={(docId) => {
                  setActiveDocId(docId);
                  setCurrentView('docs');
                  refreshData();
                }}
                onOpenSheet={(sheetId) => {
                  setActiveDocId(sheetId);
                  setCurrentView('sheets');
                  refreshData();
                }}
              />
            )}

            {currentView === 'pixel-art' && (
              <PixelArtApp 
                activeProject={pixelProjects.find(p => p.id === activeDocId)}
                onSave={handleSavePixelArt}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'post-designer' && (
              <PostDesigner 
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'e-signature' && (
              <ESignatureTool onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'invoice-generator' && (
              <InvoiceGenerator onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'video-trimmer' && (
              <VideoTrimmer onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'teleprompter' && (
              <Teleprompter onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'watermark' && (
              <WatermarkTool onBack={() => navigate('dashboard')} />
            )}

            {currentView === 'project-manager' && (
              <ProjectManager 
                activeProject={kanbanProjects.find(p => p.id === activeDocId)}
                onSave={handleSaveKanban}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'work-log' && (
              <WorkLog 
                activeProject={workLogProjects.find(p => p.id === activeDocId)}
                onSave={handleSaveWorkLog}
                onExportToSheets={handleExportWorkLogToSheets}
                onBack={() => navigate('dashboard')} 
              />
            )}

            {currentView === 'settings' && (
              <Settings 
                onBack={() => navigate('dashboard')} 
                message={settingsMessage}
                onClearMessage={() => setSettingsMessage(null)}
                paywall={paywall}
              />
            )}

            {currentView === 'file-manager' && (
              <FileManager 
                documents={documents}
                notes={notes}
                presentations={presentations}
                spreadsheets={spreadsheets}
                sites={sites}
                canvasBoards={canvasBoards}
                plans={plans}
                codeProjects={codeProjects}
                pixelProjects={pixelProjects}
                kanbanProjects={kanbanProjects}
                workLogProjects={workLogProjects}
                ledgerProjects={ledgerProjects}
                clients={clients}
                decisions={decisions}
                journalEntries={journalEntries}
                habits={habits}
                goals={goals}
                passwords={passwords}
                aiProjects={aiProjects}
                aiCodeProjects={aiCodeProjects}
                podcastRecordings={podcastRecordings}
                folders={folders}
                onDelete={async (type, id) => {
                  if (type === 'docs') setDocuments(prev => prev.filter(d => d.id !== id));
                  if (type === 'notes') setNotes(prev => prev.filter(n => n.id !== id));
                  if (type === 'slides') setPresentations(prev => prev.filter(p => p.id !== id));
                  if (type === 'sheets') setSpreadsheets(prev => prev.filter(s => s.id !== id));
                  if (type === 'site-builder') setSites(prev => prev.filter(s => s.id !== id));
                  if (type === 'canvas') setCanvasBoards(prev => prev.filter(b => b.id !== id));
                  if (type === 'plan-builder') setPlans(prev => prev.filter(p => p.id !== id));
                  if (type === 'code-editor') setCodeProjects(prev => prev.filter(p => p.id !== id));
                  if (type === 'pixel-art') setPixelProjects(prev => prev.filter(p => p.id !== id));
                  if (type === 'project-manager') setKanbanProjects(prev => prev.filter(p => p.id !== id));
                  if (type === 'ledger') setLedgerProjects(prev => prev.filter(l => l.id !== id));
                  if (type === 'client-vault') setClients(prev => prev.filter(l => l.id !== id));
                  if (type === 'decision-log') setDecisions(prev => prev.filter(l => l.id !== id));
                  if (type === 'journal') setJournalEntries(prev => prev.filter(j => j.id !== id));
                  if (type === 'goals') setGoals(prev => prev.filter(g => g.id !== id));
                  if (type === 'passwords') setPasswords(prev => prev.filter(p => p.id !== id));
                  if (type === 'joymiz-ai') setAiProjects(prev => prev.filter(p => p.id !== id));
                  if (type === 'podcast-studio') setPodcastRecordings(prev => prev.filter(p => p.id !== id));
                  if (type === 'work-logs') setWorkLogProjects(prev => prev.filter(p => p.id !== id));
                  await storage.delete(type, id);
                }}
                onOpen={(type, id) => navigate(type as AppView, id)}
              />
            )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* HIDDEN AUDIO ELEMENT */}
      {currentEpisode && (
        <audio
          ref={audioRef}
          src={
            currentEpisode.audioUrl 
              ? (currentEpisode.audioUrl.startsWith('/') || currentEpisode.audioUrl.startsWith('blob:') || audioProxyFailed
                ? currentEpisode.audioUrl 
                : (isApiAvailable 
                    ? `/api/podcast/proxy-audio?url=${encodeURIComponent(currentEpisode.audioUrl)}`
                    : currentEpisode.audioUrl)) 
              : ''
          }
          onError={() => {
            if (!audioProxyFailed) {
              console.warn("Audio proxy stream failed, switching to direct URL fallback:", currentEpisode.audioUrl);
              setAudioProxyFailed(true);
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.load();
                  audioRef.current.play().then(() => setIsPlaying(true)).catch(err => console.warn("Fallback audio play failed", err));
                }
              }, 50);
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTimeState(audioRef.current.currentTime);
            }
          }}
          onDurationChange={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={handlePlayNextEpisode}
        />
      )}

      {/* FLOATING AUDIO PLAYER */}
      {currentEpisode && activeTab !== 'cast' && !isBackgroundPlaying && (
        <motion.div 
          drag={!isMobile}
          dragMomentum={false}
          className={`fixed z-[999] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col p-4 gap-3 text-white cursor-default select-none ${
            showMobileBottomBar 
              ? 'bottom-[84px] left-4 right-4 md:right-24 md:left-auto md:w-80' 
              : 'bottom-4 left-4 right-4 md:bottom-6 md:right-24 md:left-auto md:w-80'
          }`}
        >
          {/* Draggable indicator handle (only on desktop/tablet) */}
          {!isMobile && (
            <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-1 cursor-grab active:cursor-grabbing flex items-center justify-center group hover:bg-slate-700 transition-colors">
              <div className="w-6 h-0.5 bg-slate-700 group-hover:bg-slate-500 rounded-full transition-colors" />
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {currentEpisode.imageUrl && (
                <img 
                  src={currentEpisode.imageUrl} 
                  alt="Player cover" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block leading-none">PODCAST PLAYING</span>
                <h4 className="font-bold text-slate-100 text-xs truncate mt-1">
                  {currentEpisode.title}
                </h4>
                <p className="text-[9px] text-slate-400 truncate font-semibold">{currentEpisode.podcastName}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (isMobile) {
                  setShowPodcastBackgroundPlayModal(true);
                } else {
                  setIsPlaying(false);
                  if (audioRef.current) audioRef.current.pause();
                  setCurrentEpisode(null);
                }
              }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
              title="Close player"
            >
              <X size={14} />
            </button>
          </div>

          {/* Simple progress line */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 w-8 text-right">
              {Math.floor(currentTimeState / 60)}:{String(Math.floor(currentTimeState % 60)).padStart(2, '0')}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTimeState}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                setCurrentTimeState(newTime);
                if (audioRef.current) audioRef.current.currentTime = newTime;
              }}
              className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[9px] font-bold text-slate-400 w-8">
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <span className="text-[10px] font-bold text-slate-400">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!audioRef.current) return;
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current.play().then(() => {
                      setIsPlaying(true);
                    }).catch(err => console.warn('Blocked play', err));
                  }
                }}
                className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-950 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
              </button>
              <button
                onClick={handlePlayNextEpisode}
                className="w-8 h-8 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                title="Next Episode"
              >
                <SkipForward size={14} />
              </button>
              <button
                onClick={() => handleTabClick('cast')}
                className="px-2 py-1 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all"
              >
                Expand
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* MOBILE PODCAST BACKGROUND PLAY CONFIRMATION MODAL */}
      {showPodcastBackgroundPlayModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[1000] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100/50 text-center space-y-6"
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Radio className="animate-pulse" size={24} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Broadcast</h3>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Would you like to play "{currentEpisode?.title}" in the background, or stop playback entirely?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsBackgroundPlaying(true);
                  setShowPodcastBackgroundPlayModal(false);
                }}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Play in Background
              </button>
              <button 
                onClick={() => {
                  setIsPlaying(false);
                  if (audioRef.current) audioRef.current.pause();
                  setCurrentEpisode(null);
                  setIsBackgroundPlaying(false);
                  setShowPodcastBackgroundPlayModal(false);
                }}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                Stop & Close
              </button>
              <button 
                onClick={() => setShowPodcastBackgroundPlayModal(false)}
                className="w-full h-12 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CAST THIRD-PARTY DISCLOSURE MODAL */}
      {showCastDisclosure && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 text-center space-y-6"
          >
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={24} />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Non-Private Area Notice</h3>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed text-center">
                You are entering a non-private area. Cordoval does not track your usage, but podcasts are served by separate, third-party hosts not associated with Cordoval.
              </p>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed text-center">
                Because of this, these third-party hosts will track their own views and download statistics independently.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowCastDisclosure(false);
                }}
                className="flex-1 h-12 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-200 cursor-pointer font-bold"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  setActiveTab('cast');
                  setShowCastDisclosure(false);
                }}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/10 cursor-pointer font-bold"
              >
                Okay
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100/50 text-center space-y-6 relative"
          >
            <button 
              onClick={() => setShowSupportModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <HelpCircle size={24} />
            </div>
            
            <div className="space-y-3 text-center">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Support & Inquiry</h3>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed px-2">
                If you requre support, or have found a bug or have a business enquiry please send a google chat message to:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 inline-block select-all font-mono text-xs font-bold text-indigo-600 tracking-tight">
                cordoval.work@gmail.com
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setShowSupportModal(false)}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer font-bold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <SocialPaywallModal
        isOpen={paywall.isLocked}
        isMandatoryLock={paywall.isMandatoryLock}
        activeSeconds={paywall.activeSeconds}
        subActiveUntil={paywall.subActiveUntil}
        lastSharedAt={paywall.lastSharedAt}
        onShareSuccess={paywall.recordShareSuccess}
        onClose={paywall.closePaywallModal}
      />

      </div>
    </div>
  );
};

export default App;
