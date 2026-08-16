
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Globe, Plus, Trash2, Download, Eye, Settings, 
  MoveUp, MoveDown, Layout, Type, Palette, Zap, Monitor, 
  Smartphone, Tablet, Layers, Image as ImageIcon, Check, 
  ChevronRight, ExternalLink, Copy, MousePointer2, Archive, 
  Search, FileCode, Play, Sparkles, Hash, Rocket, Info,
  Box, MousePointer, MoreVertical, Maximize2, Edit3, X, ImagePlus, RefreshCw
} from 'lucide-react';
import JSZip from 'jszip';
import { SitePage, SiteSection, SitePageContent, SiteSEO } from '../types';

interface SiteBuilderProps {
  activeSite?: SitePage;
  onSave: (site: SitePage) => void;
  onBack: () => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type InspectorTab = 'content' | 'style' | 'motion' | 'seo';

export const SiteBuilder: React.FC<SiteBuilderProps> = ({ activeSite, onSave, onBack }) => {
  const [site, setSite] = useState<SitePage>(activeSite || {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Modern Enterprise Project',
    updatedAt: Date.now(),
    tags: ['web'],
    folderId: null,
    history: [],
    primaryColor: '#3b82f6',
    activePageId: 'page-index',
    seo: {
      title: 'KDS Modern Site',
      description: 'Built with Site Sculptor Pro',
      ogImage: '',
      favicon: ''
    },
    pages: [
      {
        id: 'page-index',
        name: 'Home',
        path: 'index.html',
        sections: [
          { 
            id: 'nav-1', 
            type: 'nav', 
            title: 'KDS Studio', 
            subtitle: '', 
            content: 'Home,Services,About,Contact', 
            layout: 'left',
            bgType: 'white'
          },
          { 
            id: 'hero-1', 
            type: 'hero', 
            title: 'Modern High Fidelity', 
            subtitle: 'Sculpted in KDS Office Suite', 
            content: 'Transform your vision into high-fidelity code instantly.', 
            ctaText: 'Launch Project',
            layout: 'center',
            padding: 'large',
            customPadding: 80,
            bgType: 'light',
            animation: 'slide-up'
          }
        ]
      },
      {
        id: 'page-about',
        name: 'About',
        path: 'about.html',
        sections: [
          { id: 'nav-1', type: 'nav', title: 'KDS Studio', subtitle: '', content: 'Home,Services,About,Contact', layout: 'left', bgType: 'white' }
        ]
      }
    ]
  });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null); // sectionId

  const activePage = site.pages.find(p => p.id === site.activePageId) || site.pages[0];

  const switchPage = (id: string) => {
    setSite(prev => ({ ...prev, activePageId: id }));
    setActiveSectionId(null);
  };

  const addPage = () => {
    const name = prompt('Enter page name:', 'Services');
    if (!name) return;
    const newPage: SitePageContent = {
      id: 'page-' + Math.random().toString(36).substr(2, 5),
      name,
      path: name.toLowerCase() + '.html',
      sections: activePage.sections.filter(s => s.type === 'nav' || s.type === 'footer')
    };
    setSite(prev => ({ ...prev, pages: [...prev.pages, newPage], activePageId: newPage.id }));
  };

  const addSection = (type: SiteSection['type']) => {
    const newSection: SiteSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type === 'hero' ? 'New Visual Anchor' : 'Section Heading',
      subtitle: 'Supporting narrative for your digital artifact.',
      content: type === 'features' ? 'Intelligence, Speed, Sovereignty' : 'Crafted for the future of professional work.',
      ctaText: type === 'hero' || type === 'cta' ? 'Get Started' : undefined,
      layout: 'center',
      padding: 'medium',
      customPadding: 60,
      bgType: 'white',
      animation: 'fade-in'
    };

    setSite(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, sections: [...p.sections, newSection] } : p)
    }));
    setActiveSectionId(newSection.id);
  };

  const updateSection = (id: string, updates: Partial<SiteSection>) => {
    // If it's a master component (nav, footer, or marked master), update across all pages
    const sectionToUpdate = activePage.sections.find(s => s.id === id);
    const isGlobal = sectionToUpdate?.type === 'nav' || sectionToUpdate?.type === 'footer' || sectionToUpdate?.isMaster;

    setSite(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (!isGlobal && p.id !== prev.activePageId) return p;
        return {
          ...p,
          sections: p.sections.map(s => s.id === id ? { ...s, ...updates } : s)
        };
      })
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...activePage.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSite(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, sections: newSections } : p)
    }));
  };

  // Add missing removeSection function
  const removeSection = (id: string) => {
    const sectionToRemove = activePage.sections.find(s => s.id === id);
    if (!sectionToRemove) return;
    
    const isGlobal = sectionToRemove.type === 'nav' || sectionToRemove.type === 'footer' || sectionToRemove.isMaster;

    setSite(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (!isGlobal && p.id !== prev.activePageId) return p;
        return {
          ...p,
          sections: p.sections.filter(s => s.id !== id)
        };
      })
    }));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const handleDragResize = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const startY = e.clientY;
    const currentSection = activePage.sections.find(s => s.id === sectionId);
    const startPadding = currentSection?.customPadding || 60;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientY - startY;
      const newPadding = Math.max(0, startPadding + diff);
      updateSection(sectionId, { customPadding: newPadding, padding: 'none' });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const generatePageHTML = (page: SitePageContent) => {
    const sectionsHTML = page.sections.map(s => {
      const alignment = s.layout === 'center' ? 'text-center' : s.layout === 'right' ? 'text-right' : 'text-left';
      const bgStyle = s.bgType === 'dark' ? 'background-color: #0f172a; color: white;' : s.bgType === 'accent' ? `background-color: ${site.primaryColor}; color: white;` : s.bgType === 'light' ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
      const paddingVal = s.padding === 'none' ? s.customPadding : (s.padding === 'large' ? 120 : (s.padding === 'small' ? 40 : 80));
      const animationClass = s.animation && s.animation !== 'none' ? `animate-${s.animation}` : '';

      switch (s.type) {
        case 'nav':
          return `<nav style="padding: 24px 8%; display: flex; justify-content: space-between; align-items: center; ${bgStyle} position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid rgba(0,0,0,0.05);">
            <div style="font-weight: 900; font-size: 1.5rem; letter-spacing: -0.05em;">${s.title}</div>
            <div style="display: flex; gap: 32px;">
              ${site.pages.map(p => `<a href="${p.path}" style="text-decoration: none; color: inherit; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">${p.name}</a>`).join('')}
            </div>
          </nav>`;
        case 'hero':
          return `<section class="${animationClass}" style="padding: ${paddingVal}px 8%; ${bgStyle} ${s.layout === 'center' ? 'text-align: center;' : ''}">
            <h1 style="font-size: 4rem; font-weight: 900; line-height: 0.95; margin-bottom: 24px; letter-spacing: -0.05em;">${s.title}</h1>
            <p style="font-size: 1.25rem; opacity: 0.7; max-width: 600px; ${s.layout === 'center' ? 'margin: 0 auto;' : ''} margin-bottom: 48px; font-weight: 500;">${s.subtitle}</p>
            ${s.ctaText ? `<button style="background: ${s.bgType === 'accent' ? 'white' : site.primaryColor}; color: ${s.bgType === 'accent' ? site.primaryColor : 'white'}; padding: 20px 56px; border-radius: 99px; border: none; font-weight: 900; cursor: pointer; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);">${s.ctaText}</button>` : ''}
          </section>`;
        case 'features':
          return `<section class="${animationClass}" style="padding: ${paddingVal}px 8%; ${bgStyle}">
            <h2 style="font-size: 2.5rem; font-weight: 900; text-align: center; margin-bottom: 80px; letter-spacing: -0.03em;">${s.title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; max-width: 1400px; margin: 0 auto;">
              ${s.content.split(',').map(f => `<div style="padding: 48px; border-radius: 32px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                <div style="width: 48px; height: 48px; background: ${site.primaryColor}; border-radius: 12px; margin-bottom: 24px;"></div>
                <h3 style="font-weight: 800; font-size: 1.25rem; margin-bottom: 16px; letter-spacing: -0.02em;">${f.trim()}</h3>
                <p style="opacity: 0.6; font-size: 0.95rem; line-height: 1.6;">Integrated high-performance systems for modern enterprise digital presence.</p>
              </div>`).join('')}
            </div>
          </section>`;
        default: return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site.seo.title || page.name} | ${site.name}</title>
    <meta name="description" content="${site.seo.description}">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
      body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; color: #0f172a; line-height: 1.5; overflow-x: hidden; }
      * { box-sizing: border-box; }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes scale-up { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      .animate-fade-in { animation: fade-in 1s ease forwards; }
      .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-scale-up { animation: scale-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    </style>
</head>
<body>
    ${sectionsHTML}
</body>
</html>`;
  };

  const exportZip = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    
    // Pages
    site.pages.forEach(p => {
      zip.file(p.path, generatePageHTML(p));
    });

    // Assets Mock
    zip.folder("assets");
    zip.folder("css").file("global.css", "/* KDS Global Styles */");
    zip.file("README.md", `# ${site.name}\n\nBuilt with Site Sculptor Pro.\n\n## Project Map\n${site.pages.map(p => `- ${p.path}`).join('\n')}`);
    
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.name.toLowerCase().replace(/\s+/g, '-')}-structured.zip`;
    a.click();
    setIsExporting(false);
  };

  const getViewportWidth = () => {
    if (viewport === 'mobile') return 'max-w-[375px]';
    if (viewport === 'tablet') return 'max-w-[768px]';
    return 'max-w-full';
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-500 ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-black' : 'bg-[#F0F2F5]'}`}>
      {/* Top Bar */}
      <header className={`h-16 px-6 flex items-center justify-between border-b z-50 shadow-sm shrink-0 ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-black border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-zinc-900 border-white/5 text-zinc-400' : 'hover:bg-slate-50 border-slate-100 text-slate-500'}`}><ArrowLeft size={18} /></button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input 
                value={site.name} 
                onChange={e => setSite(prev => ({ ...prev, name: e.target.value }))} 
                className={`bg-transparent font-black text-sm outline-none w-48 border-b border-transparent focus:border-blue-500 transition-all ${document.body.getAttribute('data-theme') === 'oled' ? 'text-white' : 'text-slate-800'}`} 
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Site Sculptor Pro 4.5</span>
          </div>
        </div>

        <div className={`flex items-center p-1 rounded-xl border ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-zinc-900 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          <button onClick={() => setViewport('desktop')} className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Monitor size={16} /></button>
          <button onClick={() => setViewport('tablet')} className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Tablet size={16} /></button>
          <button onClick={() => setViewport('mobile')} className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Smartphone size={16} /></button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(!showPreview)} className={`h-10 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${showPreview ? 'bg-blue-600 text-white' : (document.body.getAttribute('data-theme') === 'oled' ? 'bg-zinc-900 text-zinc-400' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white')}`}>
            <Eye size={14} /> {showPreview ? 'Exit Preview' : 'Live Preview'}
          </button>
          <button 
            onClick={exportZip} 
            disabled={isExporting}
            className="h-10 px-6 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            {isExporting ? 'Archiving...' : 'Publish Project'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Multi-Page Logic & Blocks */}
        {!showPreview && (
          <aside className={`w-72 border-r p-6 flex flex-col gap-10 overflow-y-auto shrink-0 ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-black border-white/10' : 'bg-white border-slate-200'}`}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sitemap</h3>
                <button onClick={addPage} className="p-1 hover:text-blue-500 transition-colors"><Plus size={14} /></button>
              </div>
              <div className="space-y-1.5">
                {site.pages.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => switchPage(p.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all ${site.activePageId === p.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center gap-2"><FileCode size={14} /> {p.name}</span>
                    {p.id !== 'page-index' && <Trash2 size={12} className="opacity-0 group-hover:opacity-100 hover:text-rose-500" />}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Block Architecture</h3>
              <div className="grid grid-cols-1 gap-3">
                <BlockBtn icon={<Layout size={18} />} label="Header" onClick={() => addSection('nav')} />
                <BlockBtn icon={<Zap size={18} />} label="Hero Anchor" onClick={() => addSection('hero')} />
                <BlockBtn icon={<Layers size={18} />} label="Grid System" onClick={() => addSection('features')} />
                <BlockBtn icon={<Rocket size={18} />} label="Call to Action" onClick={() => addSection('cta')} />
                <BlockBtn icon={<Palette size={18} />} label="Testimonial" onClick={() => addSection('testimonial')} />
              </div>
            </section>
          </aside>
        )}

        {/* Center: Canvas */}
        <div className={`flex-1 overflow-y-auto p-12 scrollbar-hide flex flex-col items-center transition-colors duration-500 ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-zinc-950' : 'bg-slate-100'}`}>
          <div className={`${getViewportWidth()} w-full bg-white shadow-2xl transition-all duration-500 min-h-[1200px] relative`}>
            {activePage.sections.map((s, idx) => (
              <div 
                key={s.id} 
                className={`relative group border-2 border-transparent transition-all ${activeSectionId === s.id ? 'border-blue-500' : 'hover:border-blue-200'}`}
                onClick={() => setActiveSectionId(s.id)}
                style={{ 
                  paddingTop: `${s.customPadding || (s.padding === 'large' ? 120 : (s.padding === 'small' ? 40 : 80))}px`,
                  paddingBottom: `${s.customPadding || (s.padding === 'large' ? 120 : (s.padding === 'small' ? 40 : 80))}px`,
                }}
              >
                {/* Drag Handle for Resizing Padding */}
                {!showPreview && activeSectionId === s.id && (
                   <div 
                    onMouseDown={(e) => handleDragResize(e, s.id)}
                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-center justify-center"
                   >
                     <div className="px-3 py-1 bg-blue-500 text-white text-[8px] font-black uppercase rounded-full shadow-lg">Drag to Resize</div>
                   </div>
                )}

                <div className={`px-[8%] transition-all ${s.bgType === 'dark' ? 'bg-slate-900 text-white' : s.bgType === 'accent' ? `text-white` : s.bgType === 'light' ? 'bg-slate-50' : 'bg-white'}`}
                  style={s.bgType === 'accent' ? { backgroundColor: site.primaryColor } : {}}
                >
                  <div className={`${s.layout === 'center' ? 'text-center' : s.layout === 'right' ? 'text-right' : 'text-left'} max-w-7xl mx-auto`}>
                    {s.type === 'nav' ? (
                      <div className="flex justify-between items-center py-4">
                        <h4 
                          contentEditable={!showPreview}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSection(s.id, { title: e.target.innerText })}
                          className="text-2xl font-black outline-none"
                        >{s.title}</h4>
                        <div className="flex gap-8">
                          {site.pages.map(p => <span key={p.id} className="text-xs font-black uppercase tracking-widest opacity-60">{p.name}</span>)}
                        </div>
                      </div>
                    ) : (
                      <div className={s.animation && s.animation !== 'none' ? `animate-${s.animation}` : ''}>
                        <h2 
                          contentEditable={!showPreview}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSection(s.id, { title: e.target.innerText })}
                          className="text-5xl md:text-6xl font-black tracking-tighter mb-6 outline-none leading-[0.95]"
                        >{s.title}</h2>
                        <p 
                          contentEditable={!showPreview}
                          suppressContentEditableWarning
                          onBlur={(e) => updateSection(s.id, { subtitle: e.target.innerText })}
                          className="text-xl opacity-70 mb-10 max-w-2xl mx-auto outline-none font-medium"
                        >{s.subtitle}</p>
                        {s.ctaText && (
                          <button className="px-10 py-5 bg-blue-600 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all" style={s.bgType === 'accent' ? { backgroundColor: 'white', color: site.primaryColor } : { backgroundColor: site.primaryColor }}>
                            {s.ctaText}
                          </button>
                        )}
                        {s.type === 'features' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 text-left">
                             {s.content.split(',').map((f, i) => (
                               <div key={i} className="p-10 rounded-[2.5rem] bg-black/5 border border-black/5 backdrop-blur-md">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 text-blue-500 shadow-sm"><Zap size={24} /></div>
                                  <h4 className="text-lg font-black mb-3 tracking-tight">{f.trim()}</h4>
                                  <p className="text-sm opacity-60 leading-relaxed font-medium">Built with clean structured architecture for high-performance output.</p>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!showPreview && activeSectionId === s.id && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-900 text-white rounded-xl p-1 shadow-2xl z-50">
                    <button onClick={() => moveSection(idx, 'up')} className="p-2 hover:bg-white/10 rounded-lg"><MoveUp size={14} /></button>
                    <button onClick={() => moveSection(idx, 'down')} className="p-2 hover:bg-white/10 rounded-lg"><MoveDown size={14} /></button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button onClick={() => updateSection(s.id, { isMaster: !s.isMaster })} className={`p-2 rounded-lg ${s.isMaster ? 'text-amber-400' : 'text-slate-500'}`} title="Master Component"><Box size={14} /></button>
                    <button onClick={() => removeSection(s.id)} className="p-2 hover:bg-rose-500 rounded-lg text-rose-400 hover:text-white"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Inspector */}
        {!showPreview && activeSectionId && (
          <aside className={`w-80 border-l p-6 flex flex-col gap-10 overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-300 ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-black border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               {(['content', 'style', 'motion', 'seo'] as InspectorTab[]).map(tab => (
                 <button 
                  key={tab} 
                  onClick={() => setInspectorTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${inspectorTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
               {inspectorTab === 'content' && (
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Headline Narrative</label>
                       <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none h-20 resize-none"
                        value={activePage.sections.find(s => s.id === activeSectionId)?.title}
                        onChange={e => updateSection(activeSectionId, { title: e.target.value })}
                       />
                       <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium text-slate-500 outline-none h-32 resize-none"
                        value={activePage.sections.find(s => s.id === activeSectionId)?.subtitle}
                        onChange={e => updateSection(activeSectionId, { subtitle: e.target.value })}
                       />
                    </div>
                    
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asset Bridge</label>
                       <button 
                        onClick={() => alert('Bridge to Stock Media Hub initialized. Pick an asset to sync.')}
                        className="w-full h-12 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
                       >
                         <ImagePlus size={16} /> Hub Asset Bridge
                       </button>
                    </div>
                 </div>
               )}

               {inspectorTab === 'style' && (
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Chroma Protocol</label>
                       <div className="grid grid-cols-2 gap-2">
                          {['white', 'light', 'dark', 'accent'].map(t => (
                            <button 
                             key={t}
                             onClick={() => updateSection(activeSectionId, { bgType: t as any })}
                             className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${activePage.sections.find(s => s.id === activeSectionId)?.bgType === t ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                            >
                              {t}
                            </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Spatial Config</label>
                       <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-black"
                            value={activePage.sections.find(s => s.id === activeSectionId)?.customPadding}
                            onChange={e => updateSection(activeSectionId, { customPadding: parseInt(e.target.value), padding: 'none' })}
                          />
                          <span className="flex items-center text-[10px] font-black text-slate-400 uppercase">Pixels (PXY)</span>
                       </div>
                    </div>
                 </div>
               )}

               {inspectorTab === 'motion' && (
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reveal Physics</label>
                       <div className="grid grid-cols-1 gap-2">
                          {['none', 'fade-in', 'slide-up', 'scale-up'].map(a => (
                            <button 
                             key={a}
                             onClick={() => updateSection(activeSectionId, { animation: a as any })}
                             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activePage.sections.find(s => s.id === activeSectionId)?.animation === a ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                            >
                              {a} {activePage.sections.find(s => s.id === activeSectionId)?.animation === a && <Check size={14} />}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {inspectorTab === 'seo' && (
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Meta Identity</label>
                       <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none"
                        placeholder="Page Title"
                        value={site.seo.title}
                        onChange={e => setSite(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                       />
                       <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium text-slate-500 outline-none h-32 resize-none"
                        placeholder="Meta Description"
                        value={site.seo.description}
                        onChange={e => setSite(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                       />
                    </div>
                 </div>
               )}
            </div>
          </aside>
        )}
      </div>

      <footer className={`h-8 border-t px-6 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-black border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {activePage.sections.length} ACTIVE ARTIFACTS</span>
           <span className="flex items-center gap-2"><Globe size={12} /> {activePage.path}</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           PROJECT_SYNCED: LOCAL_VAULT_S1
        </div>
      </footer>
    </div>
  );
};

const BlockBtn = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group border ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-zinc-900 border-white/5 text-zinc-400' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
  >
    <div className={`p-2 rounded-xl transition-colors ${document.body.getAttribute('data-theme') === 'oled' ? 'bg-black' : 'bg-white shadow-sm group-hover:bg-blue-100'}`}>{icon}</div>
    <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
    <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);
