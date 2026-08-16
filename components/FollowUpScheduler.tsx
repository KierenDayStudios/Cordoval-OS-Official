import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarClock, Plus, Calendar as CalendarIcon, CheckCircle2, Clock, Mail, Phone, Users, Search, Filter, MoreHorizontal, User } from 'lucide-react';
import { SaveLoadControls } from './SaveLoadControls';

interface FollowUp {
  id: string;
  clientName: string;
  company: string;
  type: 'email' | 'call' | 'meeting';
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
  notes: string;
}

const DEFAULT_FOLLOWUPS: FollowUp[] = [];

export const FollowUpScheduler: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    try {
      const saved = localStorage.getItem('cordoval_followups');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_FOLLOWUPS;
  });

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_followups', JSON.stringify(followUps));
    } catch (e) {}
  }, [followUps]);

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(followUps, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "followup_scheduler_backup.json");
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
        if (Array.isArray(parsed)) setFollowUps(parsed);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'overdue'>('all');

  const filteredFollowUps = followUps.filter(f => {
    if (activeTab === 'all') return true;
    return f.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'overdue': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} />;
      case 'call': return <Phone size={16} />;
      case 'meeting': return <Users size={16} />;
      default: return <Mail size={16} />;
    }
  };

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
             <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
               <CalendarClock size={16} />
             </div>
             <h1 className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-4 hidden sm:block">Follow-up Scheduler</h1>
             <h1 className="text-lg font-bold text-slate-900 block sm:hidden">Follow-ups</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Follow-ups" />
          <button className="bg-slate-900 text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm shadow-sm">
            <Plus size={16} /> <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0">
             
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search clients, companies, or notes..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>

            {/* Dashboard summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                 <div className="text-slate-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Clock size={14} className="text-amber-500" /> Pending</div>
                 <div className="text-2xl font-black text-slate-900">12</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                 <div className="text-slate-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><AlertCircle size={14} className="text-rose-500" /> Overdue</div>
                 <div className="text-2xl font-black text-rose-600">3</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-slate-300">
                 <div className="text-slate-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><CheckCircle2 size={14} className="text-emerald-500" /> Done (7d)</div>
                 <div className="text-2xl font-black text-slate-900">24</div>
               </div>
               <div className="bg-slate-900 p-4 rounded-xl shadow-lg shadow-slate-900/10 flex flex-col justify-center items-center text-white cursor-pointer hover:bg-slate-800 transition-colors">
                 <div className="text-slate-400 text-xs font-bold mb-1">Success Rate</div>
                 <div className="text-2xl font-black">82%</div>
               </div>
            </div>

            {/* Task list container */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
               {/* Tabs */}
               <div className="flex items-center border-b border-slate-200 px-2 pt-2 bg-slate-50/50">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'all' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    All Tasks
                  </button>
                  <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => setActiveTab('overdue')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'overdue' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Overdue
                  </button>
               </div>

               {/* List content */}
               <div className="flex-1 overflow-y-auto">
                 {filteredFollowUps.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                     <CalendarClock size={48} className="mb-4 opacity-20" />
                     <p className="font-medium text-slate-600">No tasks found</p>
                     <p className="text-sm mt-1">You're all caught up!</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-100">
                     {filteredFollowUps.map(task => (
                       <div key={task.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center">
                         
                         {/* Checkbox & Status */}
                         <div className="flex items-center gap-4 shrink-0">
                           <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                             task.status === 'completed' 
                               ? 'bg-emerald-500 border-emerald-500 text-white' 
                               : 'border-slate-300 text-transparent hover:border-emerald-500'
                           }`}>
                             <CheckCircle2 size={14} />
                           </button>
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.type === 'email' ? 'bg-blue-100 text-blue-600' : task.type === 'call' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                             {getTypeIcon(task.type)}
                           </div>
                         </div>
                         
                         {/* Client Info */}
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="font-bold text-slate-900 truncate">{task.clientName}</span>
                             <span className="text-slate-400 text-sm">•</span>
                             <span className="text-slate-500 text-sm truncate">{task.company}</span>
                           </div>
                           <p className="text-sm text-slate-600 line-clamp-1">{task.notes}</p>
                         </div>

                         {/* Meta Info */}
                         <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <CalendarIcon size={12} /> {task.dueDate}
                            </span>
                         </div>
                         
                         {/* Actions dropdown Placeholder */}
                         <div className="hidden sm:flex ml-2">
                           <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                             <MoreHorizontal size={18} />
                           </button>
                         </div>

                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="w-full md:w-80 flex flex-col gap-6 shrink-0 h-full">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <CalendarIcon size={80} />
               </div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Upcoming Today</h3>
               
               <div className="space-y-4 relative z-10">
                 <div className="relative pl-6 pb-4 border-l-2 border-rose-500">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-rose-500" />
                   <p className="text-xs font-bold text-slate-500 mb-1">2:00 PM</p>
                   <p className="font-semibold text-slate-900 text-sm">Send proposal email</p>
                   <p className="text-xs text-slate-500">Sarah Jenkins • Acme Corp</p>
                 </div>
                 
                 <div className="relative pl-6 pb-4 border-l-2 border-slate-200">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                   <p className="text-xs font-bold text-slate-400 mb-1">4:30 PM</p>
                   <p className="font-semibold text-slate-700 text-sm">Demo Call</p>
                   <p className="text-xs text-slate-400">Mark Otto • Startup Inc</p>
                 </div>
               </div>
               
               <button className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                 Open Full Calendar
               </button>
            </div>

            {/* Quick Add Form Mockup */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-slate-900/10">
               <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                 <Plus size={16} className="text-rose-500" /> Quick Add Schedule
               </h3>
               <div className="space-y-3">
                 <input type="text" placeholder="Client Name" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500" />
                 <input type="text" placeholder="Company" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500" />
                 <div className="flex gap-2">
                   <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2 flex items-center justify-center text-slate-300"><Mail size={16} /></button>
                   <button className="flex-1 bg-rose-500 border border-rose-500 rounded-lg py-2 flex items-center justify-center text-white shadow-lg shadow-rose-500/20"><Phone size={16} /></button>
                   <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2 flex items-center justify-center text-slate-300"><Users size={16} /></button>
                 </div>
                 <button className="w-full mt-2 bg-white text-slate-900 font-bold py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-sm">
                   Save Follow-up
                 </button>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Add AlertCircle icon internally for this component
const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
