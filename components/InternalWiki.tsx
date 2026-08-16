import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Library, Plus, Search, Hexagon, ChevronRight, Hash, Network, Save } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

interface WikiPage {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

const DEFAULT_PAGES: WikiPage[] = [
  { id: '1', title: 'Company Vision', content: '# Our Core Vision\nWe aim to build the fastest creative tools.\n\n## Value Pillars\n- Speed\n- Aesthetic\n- Power', tags: ['Culture'] },
  { id: '2', title: 'Engineering Guidelines', content: '# Engineering\nAll new code must pass strict type checking and feature responsive designs. See [[Design System]] for more info.', tags: ['Engineering', 'Guidelines'] },
];

export const InternalWiki: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pages, setPages] = useState<WikiPage[]>(() => {
    try {
      const saved = localStorage.getItem('cordoval_internal_wiki_pages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PAGES;
  });

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_internal_wiki_pages', JSON.stringify(pages));
    } catch (e) {}
  }, [pages]);

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "internal_wiki_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setPages(parsed);
          if (parsed.length > 0) setActivePageId(parsed[0].id);
        }
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const [activePageId, setActivePageId] = useState<string>('1');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const activePage = pages.find(p => p.id === activePageId);

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreateNew = () => {
    const newPage: WikiPage = {
      id: Date.now().toString(),
      title: 'Untitled Page',
      content: '# New Page\nStart typing here...',
      tags: []
    };
    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
    startEditing(newPage);
  };

  const startEditing = (page: WikiPage) => {
    setEditingId(page.id);
    setEditTitle(page.title);
    setEditContent(page.content);
  };

  const saveEdit = () => {
    setPages(pages.map(p => p.id === editingId ? { ...p, title: editTitle, content: editContent } : p));
    setEditingId(null);
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar Navigation */}
      <div className="w-64 sm:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <ArrowLeft size={18} />
              </button>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Library size={16} />
              </div>
              <h1 className="font-bold text-slate-900">Knowledge Base</h1>
            </div>
            <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Wiki" compact />
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search wiki..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          <button 
            onClick={handleCreateNew}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> New Page
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">All Pages</h3>
           <div className="space-y-1">
             {filteredPages.map(page => (
               <button 
                 key={page.id}
                 onClick={() => { setActivePageId(page.id); setEditingId(null); }}
                 className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activePageId === page.id && !editingId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
               >
                  <div className="flex items-center gap-2 truncate">
                    <Book size={14} className={activePageId === page.id ? 'text-indigo-500' : 'text-slate-400'} /> 
                    <span className="truncate">{page.title}</span>
                  </div>
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {editingId && activePage ? (
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
             <input 
               value={editTitle}
               onChange={e => setEditTitle(e.target.value)}
               className="w-full text-4xl font-black text-slate-900 border-none outline-none bg-transparent mb-6 placeholder:text-slate-300"
               placeholder="Page Title"
             />
             <textarea 
               value={editContent}
               onChange={e => setEditContent(e.target.value)}
               className="w-full min-h-[500px] text-slate-700 border-none outline-none bg-transparent resize-none leading-relaxed font-medium"
             />
             
             <div className="fixed bottom-6 right-6">
                <button 
                  onClick={saveEdit}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold flex items-center gap-2 hover:-translate-y-1 transition-transform"
                >
                  <Save size={18} /> Save Changes
                </button>
             </div>
          </div>
        ) : activePage ? (
          <div className="max-w-4xl mx-auto p-8 lg:p-12 relative group">
             <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEditing(activePage)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Edit Page
                </button>
             </div>
             <h1 className="text-4xl font-black text-slate-900 mb-6">{activePage.title}</h1>
             <div className="prose prose-slate prose-indigo max-w-none">
                 {/* Basic Markdown Rendering Simulation */}
                 {activePage.content.split('\n').map((line, i) => {
                   if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-slate-800">{line.replace('# ', '')}</h1>;
                   if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800">{line.replace('## ', '')}</h2>;
                   if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-slate-600">{line.replace('- ', '')}</li>;
                   if (line.match(/\[\[(.*?)\]\]/g)) {
                      // Simulate wiki links
                      const parts = line.split(/(\[\[.*?\]\])/g);
                      return <p key={i} className="text-slate-600 mb-4 font-medium leading-relaxed">
                        {parts.map((part, j) => {
                          if (part.startsWith('[[') && part.endsWith(']]')) {
                            const linkText = part.slice(2, -2);
                            return <span key={j} className="text-indigo-600 font-bold cursor-pointer hover:underline bg-indigo-50 px-1 rounded mx-0.5">{linkText}</span>
                          }
                          return part;
                        })}
                      </p>
                   }
                   if (!line.trim()) return <br key={i} />;
                   return <p key={i} className="text-slate-600 mb-4 font-medium leading-relaxed">{line}</p>;
                 })}
             </div>
             
             {activePage.tags.length > 0 && (
               <div className="mt-12 pt-6 border-t border-slate-200 flex items-center gap-2">
                 <Hash size={14} className="text-slate-400" />
                 {activePage.tags.map(t => (
                   <span key={t} className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-bold">{t}</span>
                 ))}
               </div>
             )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <Network size={48} className="mb-4 text-slate-300" />
             <p className="font-medium">Select a page or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
