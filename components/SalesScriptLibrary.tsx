import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Plus, Search, Check, Trash2 } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

interface Script {
  id: number;
  title: string;
  category: string;
  content: string;
}

const DEFAULT_SCRIPTS: Script[] = [];

export const SalesScriptLibrary: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [scripts, setScripts] = useState<Script[]>(() => {
    try {
      const saved = localStorage.getItem('cordoval_sales_scripts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SCRIPTS;
  });

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_sales_scripts', JSON.stringify(scripts));
    } catch (e) {}
  }, [scripts]);

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scripts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "sales_scripts_backup.json");
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
        if (Array.isArray(parsed)) setScripts(parsed);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = scripts.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Sales Scripts</h1>
        <div className="flex items-center gap-2">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Scripts" compact />
          <button onClick={() => setScripts([{ id: Date.now(), title: 'New Template', category: 'Draft', content: '' }, ...scripts])} className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"><Plus size={18} /></button>
        </div>
      </header>

      <div className="p-4 border-b border-white/5 mx-auto w-full max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search libraries or categories..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filtered.map(script => (
            <div key={script.id} className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl group">
              <div className="p-5 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                <div className="flex-1 pr-4">
                  <input 
                    type="text" 
                    value={script.title}
                    onChange={e => setScripts(scripts.map(s => s.id === script.id ? {...s, title: e.target.value} : s))}
                    className="bg-transparent text-white font-bold text-lg outline-none focus:border-b focus:border-white/20 w-full mb-2 leading-tight"
                    placeholder="Script Title"
                  />
                  <input
                    type="text"
                    value={script.category}
                    onChange={e => setScripts(scripts.map(s => s.id === script.id ? {...s, category: e.target.value} : s))}
                    className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md outline-none focus:bg-blue-500/20 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                   <button onClick={() => setScripts(scripts.filter(s => s.id !== script.id))} className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => copyToClipboard(script.id, script.content)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all">
                    {copiedId === script.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 relative bg-slate-950/50">
                <textarea 
                  value={script.content}
                  onChange={e => setScripts(scripts.map(s => s.id === script.id ? {...s, content: e.target.value} : s))}
                  className="w-full h-full min-h-[160px] bg-transparent resize-none outline-none text-sm text-slate-400 leading-relaxed custom-scrollbar"
                  placeholder="Enter script text here..."
                  spellCheck="false"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
