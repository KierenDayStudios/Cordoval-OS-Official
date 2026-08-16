
import React, { useState, useEffect } from 'react';
import { 
  Search, Image as ImageIcon, ArrowLeft, Download, 
  Copy, ExternalLink, RefreshCw, Layers, Zap, Heart,
  Maximize2, Share2, Filter, ChevronRight
} from 'lucide-react';

interface StockMediaProps {
  onBack: () => void;
}

const PEXELS_KEY = 'krrp2QrWCseehAF7ZWmkNjkAVd3EcSBfHP1clPBQIDzaNYNum10y7rGO';

export const StockMedia: React.FC<StockMediaProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Trending' | 'Nature' | 'Architecture' | 'Technology'>('Trending');

  const searchPexels = async (searchTerm: string = query) => {
    const q = searchTerm || 'Modern Workspace';
    setIsLoading(true);
    try {
      const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=24`;
      
      const res = await fetch(endpoint, {
        headers: { Authorization: PEXELS_KEY }
      });
      const data = await res.json();
      setResults(data.photos || []);
    } catch (err) {
      console.error("Pexels search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchPexels(activeTab === 'Trending' ? 'office' : activeTab);
  }, [activeTab]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Media link copied to clipboard.');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FC] overflow-hidden">
      {/* High-Performance Header */}
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
               <ImageIcon size={18} />
             </div>
             <div className="truncate">
               <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tighter truncate">STOCK MEDIA HUB</h1>
               <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">Powered by Pexels Engine</p>
             </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl px-12">
          <div className="relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              placeholder="Search 4K images..."
              className="w-full h-12 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchPexels()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-blue-600 uppercase tracking-widest items-center gap-2">
            <ImageIcon size={14} /> Photos Only
          </div>
          <button className="md:hidden p-2 bg-slate-50 text-slate-400 rounded-xl"><Search size={20} /></button>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-3 bg-white border-b border-slate-50">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            placeholder="Search 4K images..."
            className="w-full h-10 pl-11 pr-4 bg-slate-50 border-none rounded-xl font-bold text-slate-800 outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchPexels()}
          />
        </div>
      </div>

      {/* Categories Bar */}
      <div className="h-12 md:h-14 bg-white border-b border-slate-50 px-4 md:px-8 flex items-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide shrink-0">
        {['Trending', 'Nature', 'Architecture', 'Technology', 'People', 'Business', 'Abstract'].map(cat => (
          <button 
            key={cat}
            onClick={() => { setActiveTab(cat as any); setQuery(''); }}
            className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border ${activeTab === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'text-slate-400 border-transparent hover:bg-slate-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide bg-slate-50/50">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
             <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Negotiating with Pexels API...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 animate-in fade-in duration-700">
            {results.map((item) => (
              <div 
                key={item.id}
                className="group relative bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="aspect-[4/5] relative bg-slate-100 overflow-hidden">
                  <img 
                    src={item.src.large} 
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Floating Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 md:p-6">
                     <div className="flex items-center justify-between gap-2">
                        <button 
                          onClick={() => window.open(item.src.original, '_blank')}
                          className="flex-1 h-10 md:h-12 bg-white text-slate-900 rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button 
                          onClick={() => handleCopy(item.src.original)}
                          className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-white/40 transition-all"
                        >
                          <Copy size={16} />
                        </button>
                     </div>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[7px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest">Resolution: HQ</span>
                     <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                     </div>
                  </div>
                  <h4 className="text-xs md:text-sm font-black text-slate-800 tracking-tight truncate mb-1">{item.photographer}</h4>
                  <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Artist Portfolio</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 md:py-20">
             <Layers size={48} className="text-slate-200 mb-6" />
             <h3 className="text-lg md:text-2xl font-black text-slate-300 italic">No Media Artifacts Found</h3>
             <p className="text-slate-400 text-xs md:text-sm font-medium mt-2">Try adjusting your search query or switching categories.</p>
          </div>
        )}
      </main>

      <footer className="h-8 md:h-10 bg-white border-t border-slate-100 px-4 md:px-8 flex items-center justify-between text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-1.5"><Zap size={10} className="text-amber-500" /> <span className="hidden sm:inline">Pexels Content API v1</span><span className="sm:hidden">Pexels API</span></span>
           <span className="hidden sm:inline text-slate-300">|</span>
           <span className="hidden sm:inline">Results: {results.length} Managed Artifacts</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           <span className="hidden sm:inline">SYSTEM: STREAMING OPTIMIZED</span><span className="sm:hidden">STREAMING</span>
        </div>
      </footer>
    </div>
  );
};
