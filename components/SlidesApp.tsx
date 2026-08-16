
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Maximize2, 
  Save, 
  Monitor, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  ChevronRight,
  GripHorizontal,
  StickyNote,
  Trash2,
  Columns,
  Square,
  Heading,
  AlignLeft,
  ChevronLeft,
  X
} from 'lucide-react';
import { Presentation, Slide, SlideLayout } from '../types';

interface SlidesAppProps {
  activePres?: Presentation;
  onSave: (pres: Presentation) => void;
  onBack: () => void;
}

const LAYOUTS: { id: SlideLayout; label: string; icon: any }[] = [
  { id: 'title', label: 'Title Slide', icon: <Heading size={16} /> },
  { id: 'title-content', label: 'Title & Content', icon: <AlignLeft size={16} /> },
  { id: 'two-columns', label: 'Two Columns', icon: <Columns size={16} /> },
  { id: 'comparison', label: 'Comparison', icon: <Columns size={16} /> },
  { id: 'title-only', label: 'Title Only', icon: <Type size={16} /> },
  { id: 'title-image', label: 'Title & Image', icon: <ImageIcon size={16} /> },
  { id: 'image-full', label: 'Full Image', icon: <Maximize2 size={16} /> },
  { id: 'blank', label: 'Blank', icon: <Square size={16} /> },
];

const THEMES = [
  { id: 'bg-rose-600', label: 'Rose', color: '#e11d48' },
  { id: 'bg-blue-700', label: 'Blue', color: '#1d4ed8' },
  { id: 'bg-slate-900', label: 'Midnight', color: '#0f172a' },
  { id: 'bg-emerald-600', label: 'Emerald', color: '#059669' },
  { id: 'bg-amber-500', label: 'Amber', color: '#f59e0b' },
  { id: 'bg-purple-600', label: 'Purple', color: '#9333ea' },
];

export const SlidesApp: React.FC<SlidesAppProps> = ({ activePres, onSave, onBack }) => {
  const [slides, setSlides] = useState<Slide[]>(activePres?.slides || [
    { id: Math.random().toString(36).substr(2, 9), title: 'New Presentation', content: 'Subtitle or content goes here', layout: 'title', speakerNotes: '' }
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [theme, setTheme] = useState(activePres?.themeColor || 'bg-rose-600');
  const [showNotes, setShowNotes] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showList, setShowList] = useState(false);
  const [presName, setPresName] = useState(activePres?.name || 'Untitled Presentation');
  const titleRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const activeSlide = slides[activeIdx];

  const updateSlide = (key: keyof Slide, val: string) => {
    const newSlides = [...slides];
    newSlides[activeIdx] = { ...newSlides[activeIdx], [key]: val };
    setSlides(newSlides);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      content: '',
      layout: 'title-content',
      speakerNotes: ''
    };
    setSlides([...slides, newSlide]);
    setActiveIdx(slides.length);
    setShowList(false);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== idx);
    setSlides(newSlides);
    if (activeIdx >= newSlides.length) {
      setActiveIdx(newSlides.length - 1);
    }
  };

  const changeLayout = (layout: SlideLayout) => {
    updateSlide('layout', layout);
    setShowLayoutPicker(false);
  };

  const handleSave = () => {
    onSave({
      id: activePres?.id || Math.random().toString(36).substr(2, 9),
      name: presName,
      slides,
      themeColor: theme,
      updatedAt: Date.now(),
      tags: activePres?.tags || [],
      folderId: activePres?.folderId || 'root',
      history: activePres?.history || []
    });
  };

  const handleMediaClick = () => {
    if (activeSlide.layout !== 'title-image' && activeSlide.layout !== 'image-full') {
      changeLayout('title-image');
    }
    setShowMediaPicker(!showMediaPicker);
  };

  const handleTextClick = () => {
    if (titleRef.current) {
      titleRef.current.focus();
    } else if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      
      {/* Ribbon Header */}
      <div className={`${theme} text-white flex items-center justify-between px-4 md:px-6 py-3 shadow-lg z-50 transition-all duration-500 shrink-0`}>
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <button onClick={() => setShowList(!showList)} className="md:hidden p-2 hover:bg-black/10 rounded-xl transition-all"><Layout size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3">
             <Monitor size={20} className="hidden sm:block" />
             <input 
               value={presName}
               onChange={(e) => setPresName(e.target.value)}
               className="bg-transparent border-none outline-none font-black text-sm w-32 sm:w-64 placeholder-white/50 focus:bg-white/10 px-2 py-1 rounded-lg" 
               placeholder="Presentation Name"
             />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="hidden sm:flex px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 items-center gap-2 transition-all">
            <Play size={14} fill="white" /> Present
          </button>
          <button onClick={handleSave} className="px-4 md:px-6 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95">
            Sync
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Slide Selector */}
        <aside className={`w-full md:w-72 bg-white border-r border-slate-200 flex flex-col p-4 gap-4 overflow-y-auto scrollbar-hide shrink-0 absolute md:relative inset-0 z-40 transition-transform duration-300 ${showList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slides</h3>
            <span className="text-[10px] font-bold text-slate-300">{slides.length} Total</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {slides.map((s, i) => (
              <div key={s.id} className="group relative shrink-0">
                <div 
                  onClick={() => { setActiveIdx(i); setShowList(false); }}
                  className={`w-full aspect-video rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center text-center p-4 ${activeIdx === i ? 'border-rose-500 ring-4 ring-rose-500/10 shadow-xl' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <span className={`text-[10px] font-black absolute top-3 left-3 ${activeIdx === i ? 'text-rose-500' : 'text-slate-300'}`}>{i+1}</span>
                  <div className="scale-[0.4] pointer-events-none w-[250%] origin-center">
                     <h4 className="text-xl font-black text-slate-800 line-clamp-1">{s.title || 'Untitled Slide'}</h4>
                     <p className="text-sm text-slate-400 mt-2 line-clamp-2">{s.content}</p>
                  </div>
                </div>
                {slides.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={addSlide}
            className="w-full shrink-0 py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 transition-all mt-2"
          >
            <Plus size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">New Slide</span>
          </button>
        </aside>

        {/* Main Workspace */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-slate-50/50 absolute md:relative inset-0 z-30 md:z-0 transition-transform duration-300 ${showList ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          
          {/* Toolbar */}
          <div className="bg-white border-b border-slate-200 p-2 md:p-3 px-4 md:px-6 flex items-center gap-4 md:gap-8 select-none shrink-0 z-30 overflow-x-auto scrollbar-hide">
             <div className="flex items-center gap-1 md:gap-2 border-r border-slate-100 pr-4 md:pr-8 shrink-0">
                <div className="relative">
                  <ToolBtn 
                    icon={<Layout size={18} />} 
                    label="Layout" 
                    onClick={() => setShowLayoutPicker(!showLayoutPicker)}
                    active={showLayoutPicker}
                  />
                  {showLayoutPicker && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pick Layout</span>
                        <button onClick={() => setShowLayoutPicker(false)}><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {LAYOUTS.map(l => (
                          <button 
                            key={l.id}
                            onClick={() => changeLayout(l.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${activeSlide.layout === l.id ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-50 hover:border-slate-200 text-slate-500'}`}
                          >
                            {l.icon}
                            <span className="text-[9px] font-bold">{l.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <ToolBtn icon={<Type size={18} />} label="Text" onClick={handleTextClick} />
                <div className="relative">
                  <ToolBtn 
                    icon={<ImageIcon size={18} />} 
                    label="Media" 
                    onClick={handleMediaClick}
                    active={showMediaPicker}
                  />
                  {showMediaPicker && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Media</span>
                        <button onClick={() => setShowMediaPicker(false)}><X size={14} /></button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Image URL</label>
                          <input 
                            type="text"
                            value={activeSlide.imageUrl || ''}
                            onChange={(e) => updateSlide('imageUrl', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          Enter a direct link to an image. It will be displayed based on your slide layout.
                        </p>
                        <button 
                          onClick={() => setShowMediaPicker(false)}
                          className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
             </div>

             <div className="flex items-center gap-4 md:gap-6 border-r border-slate-100 pr-4 md:pr-8 shrink-0">
                <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">Themes</div>
                <div className="flex gap-2 md:gap-2.5">
                   {THEMES.map(t => (
                     <div 
                       key={t.id}
                       onClick={() => setTheme(t.id)} 
                       title={t.label}
                       className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all hover:scale-125 ${t.id} ${theme === t.id ? 'border-slate-900 scale-110 ring-2 ring-slate-200' : 'border-white shadow-sm'}`} 
                     />
                   ))}
                </div>
             </div>

             <div className="flex items-center gap-2 shrink-0">
                <ToolBtn icon={<StickyNote size={18} />} label="Notes" onClick={() => setShowNotes(!showNotes)} active={showNotes} />
             </div>
          </div>

          <div className="flex-1 p-4 md:p-12 overflow-y-auto flex flex-col items-center scrollbar-hide">
            {/* Slide Canvas */}
            <div className="w-full max-w-5xl aspect-video bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-xl md:rounded-3xl p-6 md:p-16 flex flex-col relative group overflow-hidden border border-slate-200">
              
              {/* Layout Rendering */}
              {activeSlide.layout === 'title' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <input 
                    ref={titleRef}
                    value={activeSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-6xl font-black text-slate-900 bg-transparent border-none outline-none text-center placeholder:text-slate-100 tracking-tighter"
                    placeholder="Presentation Title"
                  />
                  <div className="w-24 h-1.5 bg-rose-500 my-8 rounded-full" />
                  <textarea 
                    ref={contentRef}
                    value={activeSlide.content}
                    onChange={(e) => updateSlide('content', e.target.value)}
                    className="w-full text-2xl text-slate-400 bg-transparent border-none outline-none text-center resize-none h-24 placeholder:text-slate-100 font-medium"
                    placeholder="Subtitle or author name..."
                  />
                </div>
              )}

              {activeSlide.layout === 'title-content' && (
                <div className="flex-1 flex flex-col">
                  <input 
                    ref={titleRef}
                    value={activeSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-4xl font-black text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-100 tracking-tight mb-8"
                    placeholder="Slide Title"
                  />
                  <textarea 
                    ref={contentRef}
                    value={activeSlide.content}
                    onChange={(e) => updateSlide('content', e.target.value)}
                    className="flex-1 w-full text-xl text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed"
                    placeholder="Start typing your content here..."
                  />
                </div>
              )}

              {activeSlide.layout === 'two-columns' && (
                <div className="flex-1 flex flex-col">
                  <input 
                    ref={titleRef}
                    value={activeSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-4xl font-black text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-100 tracking-tight mb-12"
                    placeholder="Slide Title"
                  />
                  <div className="flex-1 flex gap-12">
                    <textarea 
                      ref={contentRef}
                      value={activeSlide.content}
                      onChange={(e) => updateSlide('content', e.target.value)}
                      className="flex-1 text-lg text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed"
                      placeholder="Left column content..."
                    />
                    <div className="w-px bg-slate-100" />
                    <textarea 
                      value={activeSlide.secondaryContent || ''}
                      onChange={(e) => updateSlide('secondaryContent', e.target.value)}
                      className="flex-1 text-lg text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed"
                      placeholder="Right column content..."
                    />
                  </div>
                </div>
              )}

              {activeSlide.layout === 'title-only' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <input 
                    ref={titleRef}
                    value={activeSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-5xl font-black text-slate-900 bg-transparent border-none outline-none text-center placeholder:text-slate-100 tracking-tight"
                    placeholder="Slide Title"
                  />
                </div>
              )}

              {activeSlide.layout === 'blank' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <textarea 
                    ref={contentRef}
                    value={activeSlide.content}
                    onChange={(e) => updateSlide('content', e.target.value)}
                    className="w-full h-full text-xl text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed text-center"
                    placeholder="Blank canvas. Type anything..."
                  />
                </div>
              )}

              {activeSlide.layout === 'comparison' && (
                <div className="flex-1 flex flex-col">
                  <input 
                    ref={titleRef}
                    value={activeSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-4xl font-black text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-100 tracking-tight mb-8 text-center"
                    placeholder="Comparison Title"
                  />
                  <div className="flex-1 flex gap-8">
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Option A</div>
                      <textarea 
                        ref={contentRef}
                        value={activeSlide.content}
                        onChange={(e) => updateSlide('content', e.target.value)}
                        className="flex-1 text-lg text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed"
                        placeholder="Details for A..."
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Option B</div>
                      <textarea 
                        value={activeSlide.secondaryContent || ''}
                        onChange={(e) => updateSlide('secondaryContent', e.target.value)}
                        className="flex-1 text-lg text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed"
                        placeholder="Details for B..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSlide.layout === 'title-image' && (
                <div className="flex-1 flex flex-col">
                  <input 
                    ref={titleRef}
                    value={activeSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-4xl font-black text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-100 tracking-tight mb-8"
                    placeholder="Slide Title"
                  />
                  <div className="flex-1 flex gap-12 overflow-hidden">
                    <textarea 
                      ref={contentRef}
                      value={activeSlide.content}
                      onChange={(e) => updateSlide('content', e.target.value)}
                      className="flex-1 text-xl text-slate-500 bg-transparent border-none outline-none resize-none placeholder:text-slate-100 font-medium leading-relaxed"
                      placeholder="Start typing your content here..."
                    />
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center relative group/img">
                      {activeSlide.imageUrl ? (
                        <img 
                          src={activeSlide.imageUrl} 
                          alt="Slide Media" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <ImageIcon size={48} />
                          <span className="text-[10px] font-black uppercase tracking-widest">No Image Set</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setShowMediaPicker(true)}
                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                      >
                        <ImageIcon size={16} /> Change Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSlide.layout === 'image-full' && (
                <div className="flex-1 -m-16 relative group/img">
                  {activeSlide.imageUrl ? (
                    <img 
                      src={activeSlide.imageUrl} 
                      alt="Full Slide Media" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-300">
                      <ImageIcon size={64} />
                      <span className="text-xs font-black uppercase tracking-widest">No Image Set</span>
                    </div>
                  )}
                  <div className="absolute top-12 left-12 right-12 pointer-events-none">
                    <input 
                      ref={titleRef}
                      value={activeSlide.title}
                      onChange={(e) => updateSlide('title', e.target.value)}
                      className="w-full text-4xl font-black text-white bg-black/20 backdrop-blur-md border-none outline-none p-6 rounded-2xl placeholder:text-white/50 pointer-events-auto shadow-2xl"
                      placeholder="Overlay Title"
                    />
                  </div>
                  <button 
                    onClick={() => setShowMediaPicker(true)}
                    className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover/img:opacity-100 transition-all"
                  >
                    Change Image
                  </button>
                </div>
              )}
            </div>

            {/* Speaker Notes Drawer */}
            {showNotes && (
              <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 mt-12">
                <div className="bg-slate-50 px-8 py-3 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <StickyNote size={14} className="text-rose-500" />
                     Presenter Notes
                   </div>
                   <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
                </div>
                <textarea 
                  value={activeSlide.speakerNotes || ''}
                  onChange={(e) => updateSlide('speakerNotes', e.target.value)}
                  className="w-full h-40 p-8 text-base text-slate-600 bg-transparent outline-none resize-none font-medium leading-relaxed"
                  placeholder="Add notes for your presentation here. These won't be visible on the slide..."
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const ToolBtn = ({ icon, label, onClick, active }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all group w-20 h-20 ${active ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-100' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-800'}`}
  >
    <div className="group-hover:scale-110 transition-transform mb-1.5">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);
