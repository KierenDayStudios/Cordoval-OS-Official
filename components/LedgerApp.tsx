
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Wallet, Plus, Download, Trash2, 
  TrendingUp, TrendingDown, DollarSign, Filter,
  Calendar, CreditCard, ChevronRight, X, PieChart,
  CheckCircle2, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { LedgerProject, LedgerEntry, LedgerEntryType } from '../types';

interface LedgerAppProps {
  activeProject?: LedgerProject;
  onSave: (project: LedgerProject) => void;
  onBack: () => void;
}

export const LedgerApp: React.FC<LedgerAppProps> = ({ activeProject, onSave, onBack }) => {
  const [project, setProject] = useState<LedgerProject>(activeProject || {
    id: 'ledger_' + Math.random().toString(36).substr(2, 9),
    name: 'Personal Ledger 2025',
    updatedAt: Date.now(),
    tags: ['finance'],
    folderId: null,
    history: [],
    currency: 'USD',
    entries: []
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'General',
    description: ''
  });

  const totals = useMemo(() => {
    const income = project.entries
      .filter(e => e.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = project.entries
      .filter(e => e.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [project.entries]);

  const handleAddEntry = () => {
    if (!newEntry.amount || !newEntry.description) return;

    const entry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: newEntry.date || new Date().toISOString().split('T')[0],
      description: newEntry.description,
      amount: Number(newEntry.amount),
      category: newEntry.category || 'General',
      type: newEntry.type as LedgerEntryType
    };

    const updatedProject = {
      ...project,
      entries: [entry, ...project.entries],
      updatedAt: Date.now()
    };
    
    setProject(updatedProject);
    onSave(updatedProject);
    setShowAddModal(false);
    setNewEntry({ type: 'expense', date: new Date().toISOString().split('T')[0], amount: 0, category: 'General', description: '' });
  };

  const removeEntry = (id: string) => {
    const updatedProject = {
      ...project,
      entries: project.entries.filter(e => e.id !== id),
      updatedAt: Date.now()
    };
    setProject(updatedProject);
    onSave(updatedProject);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount'];
    const rows = project.entries.map(e => [e.date, `"${e.description}"`, e.type, `"${e.category}"`, e.amount]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kds_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FC] overflow-hidden font-sans">
      <header className="px-4 md:px-8 py-4 md:h-20 flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all shrink-0"><ArrowLeft size={20} className="md:w-5 md:h-5" /></button>
          <div className="flex items-center gap-3 min-w-0">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
               <Wallet size={16} className="md:w-5 md:h-5" />
             </div>
             <div className="min-w-0">
               <input 
                value={project.name}
                onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
                className="bg-transparent font-black text-slate-900 text-base md:text-lg outline-none border-b-2 border-transparent focus:border-emerald-100 w-full md:w-64 truncate"
                placeholder="Ledger Identity"
               />
               <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">Sovereign Asset Tracker</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none h-10 md:h-11 px-4 md:px-6 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={14} className="md:w-4 md:h-4" /> New Entry
          </button>
          <button 
            onClick={exportToCSV}
            className="flex-1 md:flex-none h-10 md:h-11 px-4 md:px-6 bg-white text-slate-600 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={14} className="md:w-4 md:h-4" /> CSV Export
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <StatCard 
              label="Total Revenue" 
              value={totals.income} 
              icon={<TrendingUp className="text-emerald-500" />} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
              symbol={project.currency}
            />
            <StatCard 
              label="Total Expenditure" 
              value={totals.expenses} 
              icon={<TrendingDown className="text-rose-500" />} 
              color="text-rose-600" 
              bg="bg-rose-50" 
              symbol={project.currency}
            />
            <StatCard 
              label="Net Liquidity" 
              value={totals.balance} 
              icon={<PieChart className="text-blue-500" />} 
              color="text-blue-600" 
              bg="bg-blue-50" 
              symbol={project.currency}
              highlight
            />
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Transaction Log</h3>
               <div className="flex gap-1 md:gap-2">
                  <button className="p-1.5 md:p-2 text-slate-400 hover:text-slate-900 transition-colors"><Filter size={14} className="md:w-4 md:h-4" /></button>
                  <button className="p-1.5 md:p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreHorizontal size={14} className="md:w-4 md:h-4" /></button>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-4 md:px-8 py-3 md:py-5">Origin/Date</th>
                    <th className="px-4 md:px-8 py-3 md:py-5">Description</th>
                    <th className="px-4 md:px-8 py-3 md:py-5">Classification</th>
                    <th className="px-4 md:px-8 py-3 md:py-5 text-right">Value</th>
                    <th className="px-4 md:px-8 py-3 md:py-5 w-16 md:w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {project.entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 md:px-8 py-10 md:py-20 text-center text-slate-300 italic text-xs md:text-sm">No financial artifacts found in local layer.</td>
                    </tr>
                  ) : (
                    project.entries.map((entry) => (
                      <tr key={entry.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-4 md:px-8 py-3 md:py-5">
                          <div className="text-[10px] md:text-xs font-black text-slate-800">{entry.date}</div>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-5">
                          <div className="text-xs md:text-sm font-bold text-slate-700">{entry.description}</div>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-5">
                          <span className="text-[8px] md:text-[9px] font-black uppercase px-2 md:px-2.5 py-0.5 md:py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-right">
                          <div className={`text-xs md:text-sm font-black flex items-center justify-end gap-1 ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {entry.type === 'income' ? <ArrowUpRight size={12} className="md:w-3.5 md:h-3.5" /> : <ArrowDownRight size={12} className="md:w-3.5 md:h-3.5" />}
                             {entry.type === 'expense' ? '-' : '+'}{entry.amount.toLocaleString()} <span className="text-[8px] md:text-[10px] opacity-40">{project.currency}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-right">
                           <button onClick={() => removeEntry(entry.id)} className="p-1.5 md:p-2 text-slate-300 md:text-slate-200 hover:text-rose-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                              <Trash2 size={14} className="md:w-4 md:h-4" />
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 md:p-6">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] w-full max-w-lg p-6 md:p-10 shadow-2xl border border-white animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Log Artifact</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X size={16} className="md:w-5 md:h-5" /></button>
             </div>
             
             <div className="space-y-6">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                   <button 
                    onClick={() => setNewEntry({...newEntry, type: 'expense'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newEntry.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                   >
                     Expense
                   </button>
                   <button 
                    onClick={() => setNewEntry({...newEntry, type: 'income'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newEntry.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                   >
                     Income
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Date</label>
                      <input 
                        type="date" 
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        value={newEntry.date}
                        onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Magnitude ({project.currency})</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        value={newEntry.amount}
                        onChange={e => setNewEntry({...newEntry, amount: Number(e.target.value)})}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Narrative</label>
                   <input 
                    placeholder="Q1 Hosting Fees, Client Payout..." 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    value={newEntry.description}
                    onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Classification</label>
                   <select 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer"
                    value={newEntry.category}
                    onChange={e => setNewEntry({...newEntry, category: e.target.value})}
                   >
                      <option value="General">General</option>
                      <option value="Business">Business</option>
                      <option value="Personal">Personal</option>
                      <option value="Savings">Savings</option>
                      <option value="Investment">Investment</option>
                   </select>
                </div>
             </div>

             <div className="mt-12 flex gap-4">
                <button 
                  onClick={handleAddEntry}
                  className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:bg-slate-800 active:scale-95"
                >
                  Verify & Log Entry
                </button>
             </div>
          </div>
        </div>
      )}

      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {project.entries.length} TRANSACTIONS</span>
           <span className="text-slate-300">|</span>
           <span>LOCAL LEDGER VAULT: ACTIVE</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <CheckCircle2 size={12} /> SYNCED_TO_PRIVATE_LAYER
        </div>
      </footer>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg, symbol, highlight = false }: any) => (
  <div className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group ${highlight ? 'bg-slate-900 text-white' : 'bg-white'}`}>
    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">{icon}</div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
    <div className="flex items-baseline gap-2">
       <h4 className={`text-3xl font-black tracking-tighter ${highlight ? 'text-white' : color}`}>
         {value < 0 ? '-' : ''}{Math.abs(value).toLocaleString()}
       </h4>
       <span className={`text-xs font-black uppercase opacity-40 ${highlight ? 'text-white' : 'text-slate-900'}`}>{symbol}</span>
    </div>
  </div>
);
