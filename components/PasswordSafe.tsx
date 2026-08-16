
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Lock, Plus, Search, Eye, EyeOff, 
  Copy, Trash2, Shield, Key, ExternalLink, 
  ChevronRight, X, Save, Edit3, Globe, User, 
  CheckCircle2, Info, RefreshCcw, Zap, AlertCircle
} from 'lucide-react';
import { PasswordEntry } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface PasswordSafeProps {
  entries: PasswordEntry[];
  onSave: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const PasswordSafe: React.FC<PasswordSafeProps> = ({ 
  entries, onSave, onDelete, onBack 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or entry ID
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleSaveFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `password_vault_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item.service && item.username) onSave(item);
          });
        }
      } catch (err) {
        alert("Invalid Password Vault JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Form State
  const [form, setForm] = useState<Partial<PasswordEntry>>({
    service: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    tags: []
  });

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.service.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, searchQuery]);

  const toggleVisibility = (id: string) => {
    const next = new Set(visiblePasswords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisiblePasswords(next);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const startEdit = (entry: PasswordEntry) => {
    setForm(entry);
    setIsEditing(entry.id);
  };

  const startNew = () => {
    setForm({ service: '', username: '', password: '', url: '', notes: '', tags: [] });
    setIsEditing('new');
  };

  const commitSave = () => {
    if (!form.service || !form.username || !form.password) return;
    const entry: PasswordEntry = {
      id: isEditing === 'new' ? Math.random().toString(36).substr(2, 9) : isEditing!,
      service: form.service,
      name: form.service,
      username: form.username,
      password: form.password,
      url: form.url || '',
      notes: form.notes || '',
      tags: form.tags || [],
      updatedAt: Date.now(),
      folderId: null,
      history: []
    };
    onSave(entry);
    setIsEditing(null);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pwd = '';
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password: pwd });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-hidden font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
               <Lock size={20} />
             </div>
             <div>
               <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">Secure Vault</h1>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Personal Identity Sovereign Safe</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <SaveLoadControls onSave={handleSaveFile} onLoad={handleLoadFile} label="Passwords" compact />
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                placeholder="Search accounts..."
                className="w-80 h-10 pl-11 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <button 
             onClick={startNew}
             className="h-10 px-6 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95"
           >
             <Plus size={14} /> Add Credential
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-10">
        <div className="max-w-6xl mx-auto">
           {filteredEntries.length === 0 ? (
             <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400">
                   <Shield size={40} />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em]">Vault Currently Empty</p>
                <button onClick={startNew} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all">Add First Account</button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntries.map(e => (
                  <div key={e.id} className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Lock size={120} /></div>
                     
                     <div className="relative z-10 mb-8">
                        <div className="flex items-center justify-between mb-6">
                           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                              <Globe size={24} />
                           </div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(e)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={16} /></button>
                              <button onClick={() => { if(confirm('Delete account?')) onDelete(e.id); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase truncate">{e.service}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Modified {new Date(e.updatedAt).toLocaleDateString()}</p>
                     </div>

                     <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/field transition-all hover:bg-white border border-transparent hover:border-slate-100">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase">Username</span>
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{e.username}</span>
                           </div>
                           <button onClick={() => handleCopy(e.username, 'user')} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                              <Copy size={14} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/field transition-all hover:bg-white border border-transparent hover:border-slate-100">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase">Password</span>
                              <span className="text-xs font-bold text-slate-700 tracking-wider">
                                 {visiblePasswords.has(e.id) ? e.password : '••••••••••••'}
                              </span>
                           </div>
                           <div className="flex gap-1">
                              <button onClick={() => toggleVisibility(e.id)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                                 {visiblePasswords.has(e.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button onClick={() => handleCopy(e.password, 'pwd')} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                                 <Copy size={14} />
                              </button>
                           </div>
                        </div>
                     </div>

                     {e.url && (
                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                           <a 
                             href={e.url.startsWith('http') ? e.url : `https://${e.url}`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-emerald-800 transition-colors"
                           >
                              Visit Service <ExternalLink size={12} />
                           </a>
                        </div>
                     )}
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Entry Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
           <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl border border-white animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                       <Key size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
                         {isEditing === 'new' ? 'New Credential' : 'Edit Artifact'}
                       </h2>
                    </div>
                 </div>
                 <button onClick={() => setIsEditing(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Service Identity</label>
                       <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            className="w-full h-12 pl-12 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                            placeholder="e.g. GitHub, Google, Stripe..."
                            value={form.service}
                            onChange={e => setForm({...form, service: e.target.value})}
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">User Identifier</label>
                          <div className="relative">
                             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                             <input 
                               className="w-full h-12 pl-12 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                               placeholder="Email or Alias"
                               value={form.username}
                               onChange={e => setForm({...form, username: e.target.value})}
                             />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password Secret</label>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                             <input 
                               type="text"
                               className="w-full h-12 pl-12 pr-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                               placeholder="Secret..."
                               value={form.password}
                               onChange={e => setForm({...form, password: e.target.value})}
                             />
                             <button 
                               onClick={generatePassword}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                               title="Generate Strong Password"
                             >
                                <RefreshCcw size={16} />
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">URL Reference</label>
                       <input 
                         className="w-full h-12 px-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                         placeholder="https://service.com/login"
                         value={form.url}
                         onChange={e => setForm({...form, url: e.target.value})}
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Secure Notes</label>
                       <textarea 
                         className="w-full h-24 p-6 bg-slate-50 border-none rounded-[2rem] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none"
                         placeholder="Additional context only visible in this vault..."
                         value={form.notes}
                         onChange={e => setForm({...form, notes: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button 
                      onClick={commitSave}
                      className="flex-1 h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-emerald-600"
                    >
                      <Save size={18} /> Commit to Vault
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-slate-900 text-white rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
           <CheckCircle2 size={16} className="text-emerald-400" />
           <span className="text-[10px] font-black uppercase tracking-widest">{copyFeedback === 'user' ? 'Username' : 'Password'} Copied</span>
        </div>
      )}

      <footer className="h-10 bg-white border-t border-slate-100 px-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> IDENTITY_ENCRYPTION: ACTIVE</span>
           <span className="text-slate-300">|</span>
           <span>RECORD COUNT: {entries.length}</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           SYNC_STATUS: LOCAL_VAULT_OK
        </div>
      </footer>
    </div>
  );
};
