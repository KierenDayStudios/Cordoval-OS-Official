
export type AppView = 'landing' | 'onboarding' | 'dashboard' | 'fast-track' | 'docs' | 'notes' | 'slides' | 'sheets' | 'file-manager' | 'calendar' | 'site-builder' | 'canvas' | 'plan-builder' | 'code-editor' | 'stock-media' | 'pixel-art' | 'privacy-policy' | 'terms-of-use' | 'post-designer' | 'project-manager' | 'settings' | 'calculator' | 'content-calendar' | 'ledger' | 'client-vault' | 'decision-log' | 'journal' | 'habits' | 'goals' | 'timer' | 'stopwatch' | 'password-safe' | 'podcast-studio' | 'bottom-tab-goals' | 'work-log' | 'agent-builder' | 'agent-runtime' | 'joymiz-ai' | 'ai-code-editor' | 'ai-text-rewriter' | 'ai-summariser' | 'ai-grammar-fixer' | 'ai-headline-gen' | 'ai-bg-remover' | 'ai-caption-gen' | 'ai-code-explainer' | 'ai-code-refactor' | 'ai-regex-gen' | 'ai-sql-builder' | 'ai-json-tool' | 'ai-api-gen' | 'ai-commit-gen' | 'ai-error-interpreter' | 'ai-test-gen' | 'ai-legal-gen' | 'e-signature' | 'invoice-generator' | 'video-trimmer' | 'teleprompter' | 'watermark' | 'ai-nda-analyzer' | 'ai-trademark-scout' | 'ai-conflict-mediator' | 'ai-revenue-diversifier' | 'ai-color-psychologist' | 'ai-metaphor-machine' | 'ai-art-prompt-engineer' | 'ai-elevator-pitch-shaper' | 'ai-interview-question-gen' | 'ai-remote-policy-creator' | 'ai-thesis-hardener' | 'ai-amazon-review-responder' | 'ai-ui-ux-feedback-bot' | 'ai-tagline-engine' | 'ai-pricing-strategist' | 'ai-cold-call-script-writer' | 'ai-sales-objection-crusher' | 'ai-invoice-chaser' | 'ai-invoice-generator' | 'ai-legal-draft' | 'ai-test-case-gen' | 'ai-api-request-gen' | 'ai-conflict-mediator' | 'ai-nda-analyzer' | 'ai-ui-ux-feedback-bot' | 'ai-amazon-review-responder' | 'ai-art-prompt-engineer' | 'ai-interview-question-gen' | 'ai-thesis-hardener' | 'ai-tagline-engine' | 'ai-remote-policy-creator' | 'ai-pricing-strategist' | 'ai-cold-call-script-writer' | 'ai-sales-objection-crusher' | 'ai-invoice-chaser' | 'ai-summariser' | 'ai-code-explainer' | 'ai-code-refactor' | 'ai-regex-gen' | 'ai-sql-builder' | 'ai-json-tool' | 'ai-collaborative-whiteboard' | 'ai-business-card-designer' | 'audio-snippet-tool' | 'screen-recorder' | 'multi-track-mixer' | 'code-snippet-library' | 'sales-script-library' | 'internal-wiki' | 'chart-maker' | 'deadline-countdown' | 'mockup-studio' | 'time-zone-converter' | 'domain-portfolio' | 'meeting-recorder' | 'quote-generator' | 'image-upscaler' | 'pdf-editor' | 'roadmap-planner' | 'follow-up-scheduler' | 'sop-creator' | 'press-release' | 'quiz-creator' | 'customer-persona' | 'ad-copy' | 'sales-outreach' | 'customer-reply-bot' | 'video-script-specialist' | 'white-paper-researcher' | 'viral-ad-producer' | 'social-media-strategist' | 'finance-forensic' | 'email' | 'world-clock' | 'tiktok-trend-cloner' | 'product-demo-specialist' | 'newsletter-agent' | 'book-cover-agent' | 'product-description-agent';
export type AppTheme = 'default' | 'oled' | 'sepia' | 'solarized' | 'glass';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Version {
  timestamp: number;
  content: string;
  name?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface BaseFile {
  id: string;
  name: string;
  updatedAt: number;
  isPinned?: boolean;
  tags?: string[];
  folderId?: string | null;
  history?: Version[];
}

export interface Agent extends BaseFile {
  title: string;
  description: string;
  systemInstruction: string;
  allowedTools: string[];
  icon: string;
  color: string;
}

export interface AIBuilderProject extends BaseFile {
  prompt: string;
  status?: 'idle' | 'generating' | 'completed';
  generatedCode?: string;
  chatHistory?: any[];
}

export interface CodeProject extends BaseFile {
  files: CodeFile[];
  activeFileId?: string;
  chatHistory?: any[];
}

export interface AIProjectFile {
  id?: string;
  name?: string;
  content: string;
  language?: string;
  path?: string;
}

export interface CodeFile {
  id?: string;
  name?: string;
  content: string;
  language?: string;
  path?: string;
}
export interface PasswordEntry extends BaseFile {
  service: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

// Journal, Habit & Goal Types
export type MoodType = 'serene' | 'energetic' | 'thoughtful' | 'anxious' | 'grateful' | 'melancholy';

export interface JournalEntry extends BaseFile {
  title: string;
  content: string;
  mood: MoodType;
  promptId?: string;
}

export interface Habit extends BaseFile {
  title: string;
  icon: string;
  color: string;
  completedDays: string[]; // Array of YYYY-MM-DD strings
}

export type GoalStatus = 'active' | 'completed' | 'at-risk' | 'on-hold';

export interface Goal extends BaseFile {
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: GoalStatus;
  milestones: ChecklistItem[];
}

// Client Vault Types
export interface ClientLink {
  id: string;
  label: string;
  url: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'other';

export interface ClientInteraction {
  id: string;
  date: string;
  note: string;
  type: InteractionType;
}

export interface ClientTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export type LeadStage = 'prospect' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'active' | 'past';

export interface ClientProfile extends BaseFile {
  company: string;
  email: string;
  phone: string;
  title?: string;
  dealValue?: number;
  stage?: LeadStage;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'active' | 'lead' | 'past';
  notes: string;
  links: ClientLink[];
  interactions: ClientInteraction[];
  tasks?: ClientTask[];
}

// Decision Log Types
export type DecisionStatus = 'pending' | 'evaluated' | 'reversed';

export interface Decision extends BaseFile {
  context: string;
  assumptions: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: DecisionStatus;
}

// Ledger Types
export type LedgerEntryType = 'income' | 'expense';

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: LedgerEntryType;
}

export interface LedgerProject extends BaseFile {
  currency: string;
  entries: LedgerEntry[];
}

// Content Calendar Types
export type ContentPlatform = 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'other';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'on-hold';

export interface ContentItem {
  id: string;
  title: string;
  platform: ContentPlatform;
  status: ContentStatus;
  notes: string;
  time?: string;
}

export interface ContentPlan extends BaseFile {
  monthKey: string; // Format: "YYYY-MM"
  days: { [day: number]: ContentItem[] };
}

// Storage Interfaces
export interface StorageArtifact {
  id: string;
  name: string;
  data: any;
  updatedAt: number;
  type: string;
}

export interface IStorageAdapter {
  save(type: string, artifact: StorageArtifact): Promise<void>;
  load(type: string, id: string): Promise<StorageArtifact | null>;
  list(type: string): Promise<StorageArtifact[]>;
  delete(type: string, id: string): Promise<void>;
}

// Project Manager Types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  labels: string[];
  checklist: ChecklistItem[];
  createdAt: number;
}

export interface ProjectColumn {
  id: string;
  name: string;
  tasks: Task[];
}

export interface KanbanProject extends BaseFile {
  columns: ProjectColumn[];
}

export interface Note extends Omit<BaseFile, 'name'> {
  title: string;
  content: string;
  color: string;
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system' | 'tool';
  content: string;
  toolCalls?: any[];
  isToolCall?: boolean;
  toolName?: string;
  timerData?: { duration: number; label?: string };
  image?: string;
}

export interface ChatSession extends BaseFile {
  messages: ChatMessage[];
  agentId?: string;
}

export interface Document extends BaseFile {
  content: string;
  category?: 'resume' | 'meeting' | 'report' | 'blank';
}

export interface Presentation extends BaseFile {
  slides: Slide[];
  themeColor?: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  secondaryContent?: string;
  titleSubtitle?: string;
  extraContent?: string;
  layout: SlideLayout;
  speakerNotes?: string;
  imageUrl?: string;
}

export type SlideLayout = 'title' | 'title-content' | 'two-columns' | 'comparison' | 'blank' | 'title-only' | 'image-full' | 'title-image';

export interface Spreadsheet extends BaseFile {
  data: SpreadsheetData;
}

export interface SpreadsheetData {
  [cellId: string]: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'work' | 'personal' | 'urgent';
  description?: string;
}

// Site Sculptor Types
export interface SiteSection {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'footer' | 'nav' | 'testimonial';
  title: string;
  subtitle: string;
  content: string;
  ctaText?: string;
  layout?: 'left' | 'center' | 'right';
  padding?: 'small' | 'medium' | 'large' | 'none';
  customPadding?: number; // Visual handle resizing
  bgType?: 'white' | 'light' | 'dark' | 'accent';
  imageUrl?: string;
  animation?: 'none' | 'fade-in' | 'slide-up' | 'scale-up';
  isMaster?: boolean; // Sync across pages
}

export interface SiteSEO {
  title: string;
  description: string;
  ogImage: string;
  favicon: string;
}

export interface SitePageContent {
  id: string;
  name: string;
  path: string;
  sections: SiteSection[];
}

export interface SitePage extends BaseFile {
  pages: SitePageContent[];
  activePageId: string;
  primaryColor: string;
  fontFamily?: string;
  seo: SiteSEO;
}

// Canvas Types
export interface CanvasElement {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color: string;
  zIndex: number;
}

export interface CanvasConnection {
  fromId: string;
  toId: string;
}

export interface CanvasBoard extends BaseFile {
  elements: CanvasElement[];
  connections: CanvasConnection[];
}

// Business Plan Types
export interface PlanSection {
  id: string;
  title: string;
  content: string;
}

export interface BusinessPlan extends BaseFile {
  sections: PlanSection[];
  companyName: string;
  industry: string;
}

// Pixel Art Types
export interface PixelArtProject extends BaseFile {
  width: number;
  height: number;
  frames: string[][][]; // [frame][y][x] hex strings
  palette: string[];
}

export interface PodcastRecording extends BaseFile {
  title: string;
  duration: number; // in seconds
  blobUrl?: string; // transient
  fileSize?: number;
}

/**
 * Added missing Email and EmailAccount types for EmailApp
 */
export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: number;
  read: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
}

export interface EmailAccount {
  id: string;
  provider: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  email: string;
  username: string;
  password: string;
  useSSL: boolean;
}

// Work Log Types
export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName?: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  isBillable: boolean;
  hourlyRate?: number;
}

export interface WorkLogProject extends BaseFile {
  entries: TimeEntry[];
  totalSeconds: number;
  defaultRate?: number;
  clientName?: string;
}


export interface AdminNotification {
  id: string;
  text: string;
  link?: string;
  linkText?: string;
  createdAt: any;
  active: boolean;
}

export interface SystemSettings {
  id: string;
  guidelines: string;
}

export interface AnalyticsEntry {
  id: string; // date string YYYY-MM-DD
  views: number;
  date: string;
}

export const STORAGE_LIMITS = {
  docs: 20,
  slides: 10,
  sheets: 10,
  notes: 50,
  calendar: 200,
  sites: 5,
  canvas: 5,
  plans: 5,
  code: 5,
  pixelArt: 5,
  projects: 10,
  ledger: 5,
  clients: 50,
  decisions: 100,
  journal: 1000,
  habits: 100,
  goals: 50,
  passwords: 200
};

export const NOTE_CHAR_LIMIT = 2000;

// Fast Track Types
export interface FastTrackPhaseField {
  id: string;
  label: string;
  placeholder: string;
  description: string;
  value: string;
  type?: 'text' | 'textarea' | 'bullets';
}

export interface FastTrackPhase {
  id: number;
  title: string;
  subtitle: string;
  fields: FastTrackPhaseField[];
}

export interface FastTrackPlan extends BaseFile {
  title: string;
  tagline: string;
  phases: FastTrackPhase[];
  generatedPrototypeCode?: string;
  prototypeChatHistory?: { role: 'user' | 'assistant'; text: string; timestamp: number }[];
}

