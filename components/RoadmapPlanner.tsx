import React, { useState, useEffect } from 'react';
import { ArrowLeft, Map, Plus, GripVertical, CheckCircle2, Circle, Clock, MessageSquare, Tag, AlignLeft, Calendar as CalendarIcon, Filter, LayoutGrid, List } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

interface RoadmapItem {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'completed';
  category: string;
  date: string;
  description: string;
}

const DEFAULT_ITEMS: RoadmapItem[] = [
  { id: '1', title: 'Launch MVP', status: 'completed', category: 'Product', date: 'Q1 2026', description: 'Initial release with core features.' },
  { id: '2', title: 'Mobile App Beta', status: 'in-progress', category: 'Engineering', date: 'Q2 2026', description: 'Test mobile application with early adopters.' },
  { id: '3', title: 'Global Expansion', status: 'planned', category: 'Marketing', date: 'Q3 2026', description: 'Targeting European and Asian markets.' },
  { id: '4', title: 'AI Integration V2', status: 'planned', category: 'Product', date: 'Q4 2026', description: 'Advanced agentic workflows and multi-modal models.' },
];

export const RoadmapPlanner: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<RoadmapItem[]>(() => {
    try {
      const saved = localStorage.getItem('cordoval_roadmap_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ITEMS;
  });

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_roadmap_items', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "roadmap_planner_backup.json");
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
        if (Array.isArray(parsed)) setItems(parsed);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');

  const addItem = (status: 'planned' | 'in-progress' | 'completed') => {
    setItems([...items, {
      id: Date.now().toString(),
      title: 'New Roadmap Item',
      status,
      category: 'General',
      date: 'Q3 2026',
      description: 'Add a brief description here.'
    }]);
  };

  const statusConfig = {
    'planned': { label: 'Planned', color: 'bg-slate-100 text-slate-700', icon: Circle, dot: 'bg-slate-400' },
    'in-progress': { label: 'In Progress', color: 'bg-orange-50 text-orange-700', icon: Clock, dot: 'bg-orange-500' },
    'completed': { label: 'Completed', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2, dot: 'bg-emerald-500' }
  };

  const renderCard = (item: RoadmapItem) => (
    <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col gap-3 cursor-grab active:cursor-grabbing">
      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{item.category}</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1"><CalendarIcon size={10} />{item.date}</span>
        </div>
        <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} />
        </button>
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
      </div>
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
          <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
           <button className="hover:text-slate-600 flex items-center gap-1"><MessageSquare size={14} /><span className="text-[10px] font-medium">3</span></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
               <Map size={16} />
             </div>
             <h1 className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-4">Roadmap Planner</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Roadmap" />
          <div className="bg-slate-100 rounded-lg p-1 hidden sm:flex">
             <button 
               onClick={() => setActiveTab('board')}
               className={`p-1.5 rounded-md ${activeTab === 'board' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
             >
                <LayoutGrid size={16} />
             </button>
             <button 
               onClick={() => setActiveTab('list')}
               className={`p-1.5 rounded-md ${activeTab === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
             >
                <List size={16} />
             </button>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs md:text-sm shadow-sm md:w-auto w-10 justify-center">
            <Plus size={16} /> <span className="hidden md:inline">New Initiative</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden w-full relative">
        <div className="absolute inset-0 p-4 md:p-8 flex flex-col min-w-max md:min-w-0">
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 w-full min-w-max">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl font-light text-slate-900 tracking-tight">Product Roadmap</h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">Public</span>
             </div>
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent">
                  <Filter size={14} /> FIlter
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm">
                   Share View
                </button>
             </div>
          </div>

          {activeTab === 'board' ? (
            <div className="flex-1 overflow-y-auto flex gap-6 pb-8 items-start w-full min-w-max">
              {(['planned', 'in-progress', 'completed'] as const).map(status => {
                const columnItems = items.filter(i => i.status === status);
                const config = statusConfig[status];
                return (
                  <div key={status} className="w-80 flex flex-col shrink-0">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                          {config.label}
                        </h3>
                        <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{columnItems.length}</span>
                      </div>
                      <button onClick={() => addItem(status)} className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {columnItems.map(renderCard)}
                      
                      <button 
                        onClick={() => addItem(status)}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Add Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-default">
                  <div className="col-span-1 border-r border-slate-200">ID</div>
                  <div className="col-span-5 border-r border-slate-200">Title</div>
                  <div className="col-span-2 border-r border-slate-200">Status</div>
                  <div className="col-span-2 border-r border-slate-200">Category</div>
                  <div className="col-span-2">Date</div>
               </div>
               <div className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                     const config = statusConfig[item.status];
                     return (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors text-sm">
                        <div className="col-span-1 text-slate-400">{index + 1}</div>
                        <div className="col-span-5 font-semibold text-slate-900">{item.title}</div>
                        <div className="col-span-2">
                           <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                             <config.icon size={12} />
                             {config.label}
                           </span>
                        </div>
                        <div className="col-span-2 text-slate-600">{item.category}</div>
                        <div className="col-span-2 text-slate-600">{item.date}</div>
                      </div>
                     );
                  })}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
