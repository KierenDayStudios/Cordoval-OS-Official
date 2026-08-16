
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, FileText, StickyNote, Table, Presentation, Palette, Shield, Zap, X, Image as ImageIcon, Video, Mail, MessageCircle, ShoppingBag, Megaphone, PieChart, Share2, Globe, BookOpen, ClipboardList, GraduationCap, Users, Package, Smartphone, Camera, Library, BarChart, Timer, MonitorSmartphone } from 'lucide-react';
import { AppView, AppTheme } from '../types';

interface CommandPaletteProps {
  onNavigate: (view: AppView) => void;
  setActiveDocId: (id: string | null) => void;
  setCurrentView: (view: AppView) => void;
  onThemeChange: (theme: AppTheme) => void;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate, setActiveDocId, setCurrentView, onThemeChange, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const items = [
    { id: 'nav-docs', label: 'Go to Documents', icon: FileText, action: () => onNavigate('docs'), category: 'Navigation' },
    { id: 'nav-notes', label: 'Go to Quick Notes', icon: StickyNote, action: () => onNavigate('notes'), category: 'Navigation' },
    { id: 'nav-sheets', label: 'Go to Spreadsheets', icon: Table, action: () => onNavigate('sheets'), category: 'Navigation' },
    { id: 'nav-slides', label: 'Go to Presentations', icon: Presentation, action: () => onNavigate('slides'), category: 'Navigation' },
    { id: 'nav-scripts', label: 'Video Script Specialist', icon: Video, action: () => { setActiveDocId('video-script-specialist'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-outreach', label: 'Cold Outreach Personalizer', icon: Mail, action: () => { setActiveDocId('cold-outreach-personalizer'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-reply', label: 'Customer Reply Bot', icon: MessageCircle, action: () => { setActiveDocId('customer-reply-bot'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-product', label: 'Product Description Agent', icon: ShoppingBag, action: () => { setActiveDocId('product-description-agent'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-ads', label: 'Ad Copy Generator', icon: Megaphone, action: () => { setActiveDocId('ad-copy-generator'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-finance', label: 'The Finance Forensic', icon: PieChart, action: () => { setActiveDocId('finance-forensic'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-social', label: 'The Social Media Strategist', icon: Share2, action: () => { setActiveDocId('social-media-strategist'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-pr', label: 'The Press Release Professional', icon: Globe, action: () => { setActiveDocId('press-release-professional'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-whitepaper', label: 'The White Paper Engineer', icon: BookOpen, action: () => { setActiveDocId('white-paper-engineer'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-sop', label: 'The SOP Creator', icon: ClipboardList, action: () => { setActiveDocId('sop-creator'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-quiz', label: 'The Quiz & Assessment Creator', icon: GraduationCap, action: () => { setActiveDocId('quiz-creator'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-persona', label: 'The Customer Persona Profiler', icon: Users, action: () => { setActiveDocId('customer-persona-profiler'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-doc-film', label: 'The Documentary Filmmaker', icon: Video, action: () => { setActiveDocId('documentary-filmmaker'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-viral-ad', label: 'The Viral Ad Producer', icon: Megaphone, action: () => { setActiveDocId('viral-ad-producer'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-product-demo', label: 'The Product Demo Specialist', icon: Package, action: () => { setActiveDocId('product-demo-specialist'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-tiktok-trend', label: 'The TikTok Trend Cloner', icon: Smartphone, action: () => { setActiveDocId('tiktok-trend-cloner'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-ecom-photo', label: 'The E-Com Lifestyle Photographer', icon: Camera, action: () => { setActiveDocId('ecom-lifestyle-photographer'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-book-cover', label: 'The Book Cover Visionary', icon: BookOpen, action: () => { setActiveDocId('book-cover-visionary'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-event-poster', label: 'The Event Poster Artist', icon: Palette, action: () => { setActiveDocId('event-poster-artist'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-white-paper', label: 'The White Paper Researcher', icon: Library, action: () => { setActiveDocId('white-paper-researcher'); setCurrentView('agent-runtime'); }, category: 'Navigation' },
    { id: 'nav-internal-wiki', label: 'Internal Wiki', icon: Library, action: () => setCurrentView('internal-wiki'), category: 'Navigation' },
    { id: 'nav-chart-maker', label: 'Chart Maker', icon: BarChart, action: () => setCurrentView('chart-maker'), category: 'Navigation' },
    { id: 'nav-deadline-countdown', label: 'Deadline Countdown', icon: Timer, action: () => setCurrentView('deadline-countdown'), category: 'Navigation' },
    { id: 'nav-mockup-studio', label: 'Mockup Studio', icon: MonitorSmartphone, action: () => setCurrentView('mockup-studio'), category: 'Navigation' },
    { id: 'nav-time-zone-converter', label: 'Time Zone Converter', icon: Globe, action: () => setCurrentView('time-zone-converter'), category: 'Navigation' },
    { id: 'nav-domain-portfolio', label: 'Domain Portfolio', icon: Globe, action: () => setCurrentView('domain-portfolio'), category: 'Navigation' },
    { id: 'theme-default', label: 'Set Theme: Light/Default', icon: Palette, action: () => onThemeChange('default'), category: 'Appearance' },
    { id: 'theme-oled', label: 'Set Theme: OLED Black', icon: Palette, action: () => onThemeChange('oled'), category: 'Appearance' },
    { id: 'theme-sepia', label: 'Set Theme: Sepia Paper', icon: Palette, action: () => onThemeChange('sepia'), category: 'Appearance' },
    { id: 'theme-solarized', label: 'Set Theme: Solarized Dark', icon: Palette, action: () => onThemeChange('solarized'), category: 'Appearance' },
    { id: 'cmd-vault', label: 'Open Secure Vault', icon: Shield, action: () => onNavigate('file-manager'), category: 'System' },
    { id: 'cmd-clear', label: 'Clear Local Cache', icon: Zap, action: () => { localStorage.clear(); window.location.reload(); }, category: 'System' },
  ];

  const filteredItems = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-md" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Command size={20} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, files, or themes..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 font-medium py-2"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase">ESC</kbd>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-sm">No commands found for "{query}"</div>
          ) : (
            <div className="space-y-4 py-2">
              {['Navigation', 'Appearance', 'System'].map(category => {
                const catItems = filteredItems.filter(i => i.category === category);
                if (catItems.length === 0) return null;
                return (
                  <div key={category}>
                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{category}</h4>
                    {catItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { item.action(); onClose(); }}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-left group"
                      >
                        <div className="p-2 bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 rounded-lg transition-colors">
                          <item.icon size={18} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
