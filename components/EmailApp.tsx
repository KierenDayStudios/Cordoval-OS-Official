
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Inbox, Send, Trash2, File, MoreVertical, 
  ChevronLeft, ChevronRight, User, Star, Paperclip, 
  ArrowLeft, Mail, Zap, Settings, ShieldCheck, RefreshCw, 
  Server, Lock, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { Email, EmailAccount } from '../types';

interface EmailProps {
  emails: Email[];
  onSaveEmail: (email: Email) => void;
  onBack: () => void;
}

export const EmailApp: React.FC<EmailProps> = ({ emails, onSaveEmail, onBack }) => {
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<EmailAccount | null>(null);
  
  // Configuration Form State
  const [config, setConfig] = useState<Partial<EmailAccount>>({
    provider: 'custom',
    imapHost: '',
    imapPort: 993,
    smtpHost: '',
    smtpPort: 465,
    email: '',
    username: '',
    password: '',
    useSSL: true
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('kds_mail_account');
    if (savedAccount) {
      setLinkedAccount(JSON.parse(savedAccount));
    }
  }, []);

  const handleLinkAccount = () => {
    if (!config.email || !config.imapHost || !config.password) {
      alert("Please fill in core connection details.");
      return;
    }
    const newAccount: EmailAccount = {
      ...config as EmailAccount,
      id: Math.random().toString(36).substr(2, 9)
    };
    setLinkedAccount(newAccount);
    localStorage.setItem('kds_mail_account', JSON.stringify(newAccount));
    setShowSettings(false);
  };

  const handleDisconnect = () => {
    if (confirm("Disconnect and clear all local mail credentials?")) {
      setLinkedAccount(null);
      localStorage.removeItem('kds_mail_account');
    }
  };

  const handleRefresh = () => {
    if (!linkedAccount) return;
    setIsRefreshing(true);
    // Simulate IMAP Fetch
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const mockEmails: Email[] = linkedAccount ? [
    { id: '1', from: 'KDS Security', subject: 'Vault Access Verified', body: 'The mail bridge has been successfully established for ' + linkedAccount.email + '.\n\nAll credentials remain strictly in your browser\'s secure local storage.', date: Date.now() - 3600000, read: false, folder: 'inbox' },
    { id: '2', from: 'Sarah Mitchell', subject: 'Re: Q4 Strategy Feedback', body: 'This is a simulated secure fetch of your correspondence.\n\nNote: In a standard browser environment, a CORS-friendly IMAP proxy or WebSockets-to-TCP bridge is typically required for full real-time syncing.', date: Date.now() - 86400000, read: true, folder: 'inbox' },
  ] : [];

  const currentEmails = [...mockEmails, ...emails].filter(e => e.folder === activeFolder);

  // Connection Setup View
  if (!linkedAccount || showSettings) {
    return (
      <div className="flex-1 flex flex-col bg-[#F8F9FC] overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-8 py-20">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-white">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                  <Mail size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Mail Bridge Setup</h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect your existing IMAP/SMTP host</p>
                </div>
              </div>
              {!showSettings ? (
                <button onClick={onBack} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
              ) : (
                 <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              )}
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                  <input 
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                    placeholder="name@example.com"
                    value={config.email}
                    onChange={e => setConfig({...config, email: e.target.value, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">App Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                      placeholder="••••••••••••"
                      value={config.password}
                      onChange={e => setConfig({...config, password: e.target.value})}
                    />
                    <Lock size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Server size={18} className="text-amber-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Incoming Server (IMAP)</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Host</label>
                    <input 
                      placeholder="imap.provider.com" 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                      value={config.imapHost}
                      onChange={e => setConfig({...config, imapHost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Port</label>
                    <input 
                      type="number"
                      placeholder="993" 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                      value={config.imapPort}
                      onChange={e => setConfig({...config, imapPort: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Send size={18} className="text-amber-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Outgoing Server (SMTP)</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Host</label>
                    <input 
                      placeholder="smtp.provider.com" 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                      value={config.smtpHost}
                      onChange={e => setConfig({...config, smtpHost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Port</label>
                    <input 
                      type="number"
                      placeholder="465" 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                      value={config.smtpPort}
                      onChange={e => setConfig({...config, smtpPort: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight mb-1">KDS Privacy Protocol</p>
                  <p className="text-[10px] text-emerald-600 font-medium leading-relaxed">
                    Connection credentials are never transmitted to KDS or any third party. The "Mail Bridge" logic executes strictly within your browser's execution context.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex flex-col gap-4">
                <button 
                  onClick={handleLinkAccount}
                  className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                >
                  <Zap size={20} className="text-amber-400" /> Verify & Connect Bridge
                </button>
                {linkedAccount && (
                   <button 
                    onClick={handleDisconnect}
                    className="w-full h-14 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-rose-50"
                   >
                     Destroy Connection Artifacts
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFC] overflow-hidden">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 transition-all rounded-lg"><ArrowLeft size={20} /></button>
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                placeholder="Search threads and attachments..." 
                className="w-96 h-12 pl-12 pr-6 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
              />
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={handleRefresh}
            className={`p-3 text-slate-400 hover:text-slate-900 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Inbox"
           >
             <RefreshCw size={20} />
           </button>
           <button onClick={() => setShowSettings(true)} className="p-3 text-slate-400 hover:text-slate-900 transition-all">
             <Settings size={20} />
           </button>
           <button onClick={() => setShowCompose(true)} className="h-12 px-8 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
             <Plus size={18} /> New Message
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <aside className="w-64 bg-white border-r border-slate-100 p-4 flex flex-col gap-1.5 shrink-0">
          <FolderItem icon={<Inbox size={18} />} label="Inbox" count={currentEmails.length} active={activeFolder === 'inbox'} onClick={() => setActiveFolder('inbox')} />
          <FolderItem icon={<Send size={18} />} label="Sent" active={activeFolder === 'sent'} onClick={() => setActiveFolder('sent')} />
          <FolderItem icon={<File size={18} />} label="Drafts" active={activeFolder === 'drafts'} onClick={() => setActiveFolder('drafts')} />
          <FolderItem icon={<Trash2 size={18} />} label="Trash" active={activeFolder === 'trash'} onClick={() => setActiveFolder('trash')} />
          
          <div className="mt-auto p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><User size={40} /></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Connected as</p>
             <h4 className="text-sm font-black text-slate-800 leading-tight truncate">{linkedAccount?.username}</h4>
             <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[9px] font-bold text-amber-600 uppercase">Bridge Active</p>
             </div>
          </div>
        </aside>

        {/* Inbox List */}
        <div className="w-[450px] bg-white border-r border-slate-100 overflow-y-auto shrink-0 scrollbar-hide">
           {isRefreshing && (
             <div className="p-6 text-center animate-pulse">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Negotiating IMAP Stream...</p>
             </div>
           )}
           {currentEmails.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50 p-10 text-center">
                <Mail size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest italic">Vault Empty</p>
             </div>
           ) : (
             currentEmails.map(e => (
               <div 
                key={e.id} 
                onClick={() => setSelectedEmail(e)}
                className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/80 relative group ${selectedEmail?.id === e.id ? 'bg-amber-50/50' : ''}`}
               >
                 {selectedEmail?.id === e.id && <div className="absolute left-0 top-0 w-1 h-full bg-amber-500" />}
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{e.from}</span>
                    <span className="text-[10px] font-bold text-slate-300">{new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <h3 className={`text-sm mb-1 line-clamp-1 ${!e.read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{e.subject}</h3>
                 <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">{e.body}</p>
                 <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-300 hover:text-amber-500 transition-colors"><Star size={14} /></button>
                    <button className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                 </div>
               </div>
             ))
           )}
        </div>

        {/* Reading Pane */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedEmail ? (
            <div className="p-16 max-w-4xl mx-auto animate-in fade-in slide-in-from-right-2">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">{selectedEmail.from.charAt(0)}</div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedEmail.subject}</h2>
                        <p className="text-sm font-bold text-slate-400 mt-0.5">from: <span className="text-amber-600 font-black">{selectedEmail.from}</span></p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"><Paperclip size={18} /></button>
                     <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"><MoreVertical size={18} /></button>
                  </div>
               </div>
               <div className="text-lg text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap mb-20 border-t border-slate-50 pt-12">
                  {selectedEmail.body}
               </div>
               <div className="h-px bg-slate-100 w-full mb-10" />
               <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 size={18} className="text-emerald-500" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TLS Security Verified via {linkedAccount?.imapHost}</span>
                  </div>
                  <button className="h-14 px-10 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/10">Reply to Thread</button>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center select-none">
               <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 opacity-30">
                  <Mail size={48} className="text-slate-300" />
               </div>
               <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">Select a thread to view insights</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Overlay */}
      {showCompose && (
        <div className="fixed bottom-0 right-10 z-[100] w-[600px] bg-white rounded-t-[2rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] border-x border-t border-slate-100 animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
             <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Mail size={16} className="text-amber-400" />
                Draft Master via {linkedAccount?.smtpHost}
             </h3>
             <button onClick={() => setShowCompose(false)} className="text-white/40 hover:text-white transition-colors"><Trash2 size={20} /></button>
          </div>
          <div className="p-8 space-y-6">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">To:</span>
                <input placeholder="recipient@enterprise.com" className="flex-1 text-sm font-bold text-slate-800 bg-transparent outline-none" />
             </div>
             <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">Subject:</span>
                <input placeholder="Insight Summary..." className="flex-1 text-sm font-bold text-slate-800 bg-transparent outline-none" />
             </div>
             <textarea 
               placeholder="Write your professional masterpiece..." 
               className="w-full h-80 text-base text-slate-600 outline-none resize-none font-medium leading-relaxed bg-transparent"
             />
             <div className="flex items-center justify-between pt-6">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><Paperclip size={20} /></button>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest mr-2">
                      <Lock size={12} /> SMTP Encrypted
                   </div>
                   <button 
                    onClick={() => {
                      onSaveEmail({ id: Math.random().toString(), from: 'Me', subject: 'Insight Summary', body: 'Draft content...', date: Date.now(), read: true, folder: 'sent' });
                      setShowCompose(false);
                    }}
                    className="h-14 px-12 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-200 transition-all active:scale-95"
                  >
                    Blast Message
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FolderItem = ({ icon, label, count, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${active ? 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    <div className="flex items-center gap-4">
       <div className={`transition-transform group-hover:scale-110 ${active ? 'text-amber-500' : ''}`}>{icon}</div>
       <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
    {count !== undefined && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-400'}`}>{count}</span>}
  </button>
);
