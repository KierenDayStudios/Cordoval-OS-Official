import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Plus, Search, Tag, Check, Trash2 } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

interface Snippet {
  id: number;
  title: string;
  lang: string;
  code: string;
  tag: string;
}

const DEFAULT_SNIPPETS: Snippet[] = [];

export const CodeSnippetLibrary: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try {
      const saved = localStorage.getItem('cordoval_code_snippets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SNIPPETS;
  });

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_code_snippets', JSON.stringify(snippets));
    } catch (e) {}
  }, [snippets]);

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "code_snippets_backup.json");
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
        if (Array.isArray(parsed)) setSnippets(parsed);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = snippets.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Code Library</h1>
        <div className="flex items-center gap-2">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Snippets" compact />
          <button onClick={() => setSnippets([{ id: Date.now(), title: 'Untitled Snippet', lang: 'javascript', code: '// Add your code...', tag: 'Draft' }, ...snippets])} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors"><Plus size={18} /></button>
        </div>
      </header>

      <div className="p-4 border-b border-white/5">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search snippets or tags..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {filtered.map(snippet => (
            <div key={snippet.id} className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl group">
              <div className="p-4 md:p-6 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                <div className="flex-1 pr-4">
                  <input 
                    type="text" 
                    value={snippet.title}
                    onChange={e => setSnippets(snippets.map(s => s.id === snippet.id ? {...s, title: e.target.value} : s))}
                    className="bg-transparent text-white font-bold text-lg outline-none focus:border-b focus:border-white/20 w-full mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{snippet.lang}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md"><Tag size={10}/> {snippet.tag}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setSnippets(snippets.filter(s => s.id !== snippet.id))} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => copyToClipboard(snippet.id, snippet.code)} className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                    {copiedId === snippet.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6 flex-1 bg-[#0d1117]">
                <textarea 
                  value={snippet.code}
                  onChange={e => setSnippets(snippets.map(s => s.id === snippet.id ? {...s, code: e.target.value} : s))}
                  className="w-full h-full min-h-[140px] bg-transparent resize-none outline-none text-sm font-mono text-slate-300 leading-relaxed"
                  spellCheck="false"
                  placeholder="Paste your code here..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
