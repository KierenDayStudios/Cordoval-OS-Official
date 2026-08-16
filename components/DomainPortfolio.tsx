import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Plus, Trash2, Calendar, DollarSign, Link as LinkIcon, AlertCircle, Search } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

interface Domain {
  id: string;
  url: string;
  registrar: string;
  expirationDate: string; // YYYY-MM-DD
  cost: number;
}

const DEFAULT_DOMAINS: Domain[] = [];

export const DomainPortfolio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [domains, setDomains] = useState<Domain[]>(() => {
    try {
      const saved = localStorage.getItem('cordoval_domain_portfolio');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading saved domains", e);
    }
    return DEFAULT_DOMAINS;
  });

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_domain_portfolio', JSON.stringify(domains));
    } catch (e) {
      console.error("Error saving domains", e);
    }
  }, [domains]);

  const handleSaveToFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(domains, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "domain_portfolio_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setDomains(parsed);
        }
      } catch (err) {
        alert("Invalid domain backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [search, setSearch] = useState('');
  
  const [newUrl, setNewUrl] = useState('');
  const [newRegistrar, setNewRegistrar] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCost, setNewCost] = useState('');

  const addDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newRegistrar || !newDate) return;
    
    setDomains([...domains, {
      id: Date.now().toString(),
      url: newUrl,
      registrar: newRegistrar,
      expirationDate: newDate,
      cost: parseFloat(newCost) || 0
    }]);

    setNewUrl('');
    setNewRegistrar('');
    setNewDate('');
    setNewCost('');
  };

  const removeDomain = (id: string) => {
    setDomains(domains.filter(d => d.id !== id));
  };

  const filteredDomains = domains.filter(d => d.url.toLowerCase().includes(search.toLowerCase()));

  const getDaysUntilExpiration = (dateString: string) => {
    const exp = new Date(dateString);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-lg">Domain Portfolio</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">URL Expiration Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSaveToFile} onLoad={handleLoadFromFile} label="Domains" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search domains..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col xl:flex-row gap-8">
         
         {/* Main List */}
         <div className="flex-1 max-w-5xl space-y-4">
            {filteredDomains.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
                <Globe size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">No domains found.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                 {filteredDomains.map(domain => {
                   const daysLeft = getDaysUntilExpiration(domain.expirationDate);
                   const isExpired = daysLeft < 0;
                   const isUrgent = daysLeft >= 0 && daysLeft <= 30;
                   
                   return (
                     <div key={domain.id} className={`bg-white p-5 md:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-shadow hover:shadow-md ${isExpired ? 'border-red-200 bg-red-50/30' : isUrgent ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isExpired ? 'bg-red-100 text-red-500' : isUrgent ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                             {isExpired || isUrgent ? <AlertCircle size={20} /> : <LinkIcon size={20} />}
                           </div>
                           <div>
                             <h3 className="text-lg font-bold text-slate-900">{domain.url}</h3>
                             <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5"><Globe size={12} /> {domain.registrar}</p>
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Expires</span>
                             <div className="flex items-center gap-2">
                               <Calendar size={14} className={isExpired ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-slate-400'} />
                               <span className={`text-sm font-bold ${isExpired ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-slate-700'}`}>
                                 {domain.expirationDate}
                               </span>
                             </div>
                             {isExpired ? (
                               <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">Expired {Math.abs(daysLeft)} days ago</span>
                             ) : isUrgent ? (
                               <span className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wider">Expires in {daysLeft} days</span>
                             ) : null}
                           </div>

                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Cost</span>
                             <div className="flex items-center text-sm font-bold text-slate-700">
                               <DollarSign size={14} className="text-slate-400" />
                               {domain.cost.toFixed(2)}/yr
                             </div>
                           </div>
                           
                           <button 
                             onClick={() => removeDomain(domain.id)}
                             className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-auto"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                   );
                 })}
              </div>
            )}
         </div>

         {/* Add Form Sidebar */}
         <div className="w-full xl:w-80 shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 sticky top-0">
               <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                 <Plus size={16} className="text-indigo-500" /> Add Domain
               </h2>
               <form onSubmit={addDomain} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-600 mb-1.5 block">Domain URL</label>
                   <input required type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="example.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-600 mb-1.5 block">Registrar</label>
                   <input required type="text" value={newRegistrar} onChange={e => setNewRegistrar(e.target.value)} placeholder="Namecheap, GoDaddy..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-600 mb-1.5 block">Expiration Date</label>
                   <input required type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-600 mb-1.5 block">Annual Cost ($)</label>
                   <input type="number" step="0.01" value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="12.99" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                 </div>
                 
                 <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-transform active:scale-95 mt-4">
                   Save Domain
                 </button>
               </form>
            </div>
         </div>

      </div>
    </div>
  );
};
