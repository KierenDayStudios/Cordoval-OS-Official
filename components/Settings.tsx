import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Shield, Save, ExternalLink, Key,
  Settings as SettingsIcon, AlertCircle, CheckCircle2, Zap,
  RefreshCw, Check, ShieldCheck, Gift, Globe, Copy, Share2, Sparkles, Clock
} from 'lucide-react';
import { LegalSection } from './LegalSection';

interface SettingsProps {
  onBack: () => void;
  message?: string | null;
  onClearMessage?: () => void;
  paywall?: {
    subActiveUntil: number | null;
    lastSharedAt: number | null;
    totalShares: number;
    recordShareSuccess: () => void;
    openPaywallModal: () => void;
  };
}

export const Settings: React.FC<SettingsProps> = ({ onBack, message, onClearMessage, paywall }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('idle');
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updatePercent, setUpdatePercent] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState('');

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    if (isElectron) {
      window.electronAPI.update.getVersion().then((v) => setCurrentVersion(v));
      const unsubscribe = window.electronAPI.update.onStatus((payload) => {
        if (payload.status === 'available') {
          setUpdateStatus('available');
          setUpdateVersion(payload.version);
        } else if (payload.status === 'not-available') {
          setUpdateStatus('not-available');
        } else if (payload.status === 'checking') {
          setUpdateStatus('checking');
        } else if (payload.status === 'downloading') {
          setUpdateStatus('downloading');
          setUpdatePercent(payload.percent || 0);
        } else if (payload.status === 'downloaded') {
          setUpdateStatus('downloaded');
          setUpdateVersion(payload.version);
        } else if (payload.status === 'error') {
          setUpdateStatus('error');
          setUpdateError(payload.message);
        } else if (payload.status === 'dev-mode') {
          setUpdateStatus('dev-mode');
        }
      });
      return unsubscribe;
    }
  }, [isElectron]);

  const handleCheckUpdates = async () => {
    setUpdateStatus('checking');
    setUpdateError(null);
    try {
      await window.electronAPI.update.check();
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateError(err?.message || 'Failed to check for updates');
    }
  };

  const handleDownloadUpdate = async () => {
    setUpdateStatus('downloading');
    try {
      await window.electronAPI.update.download();
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateError(err?.message || 'Failed to download update');
    }
  };

  const handleInstallUpdate = async () => {
    try {
      await window.electronAPI.update.install();
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateError(err?.message || 'Failed to install update');
    }
  };

  const subActiveUntil = paywall?.subActiveUntil ?? (() => {
    const val = localStorage.getItem('cordoval_sub_active_until');
    return val ? parseInt(val, 10) : null;
  })();

  const lastSharedAt = paywall?.lastSharedAt ?? (() => {
    const val = localStorage.getItem('cordoval_last_shared_at');
    return val ? parseInt(val, 10) : null;
  })();

  const totalShares = paywall?.totalShares ?? (() => {
    const val = localStorage.getItem('cordoval_total_shares');
    return val ? parseInt(val, 10) : 0;
  })();

  const isSubActive = subActiveUntil ? subActiveUntil > Date.now() : false;
  const daysLeft = subActiveUntil 
    ? Math.max(0, Math.ceil((subActiveUntil - Date.now()) / (1000 * 60 * 60 * 24))) 
    : 0;

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveKey = () => {
    if (apiKey) {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      if (onClearMessage) onClearMessage();
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText('https://cordoval.work');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareSocial = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    if (paywall?.recordShareSuccess) {
      paywall.recordShareSuccess();
    } else {
      const now = Date.now();
      const newUntil = now + 28 * 24 * 60 * 60 * 1000;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FC] overflow-y-auto">
      <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
               <SettingsIcon size={20} />
             </div>
             <div>
               <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">System Settings</h1>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Application Core Preferences</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-8 py-16 space-y-12">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-bold text-amber-900 leading-tight">
              {message}
            </p>
          </motion.div>
        )}

        {/* Membership & Access Tracker Section */}
        <section className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Gift size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">£0 Membership Tracker</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cordoval 28-Day Access Pass & Social Sharing</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                isSubActive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/80'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSubActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isSubActive ? `Pass Active (${daysLeft} Days Left)` : 'Renewal Recommended'}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monthly Cost</span>
                <span className="text-xl font-black text-emerald-600">£0.00 / mo</span>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">100% Free Forever</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pass Expiration</span>
                <span className="text-sm font-black text-slate-900 truncate block">
                  {subActiveUntil ? new Date(subActiveUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not Active'}
                </span>
                <p className="text-[10px] font-semibold text-emerald-600 mt-1">{isSubActive ? `${daysLeft} Days Remaining` : 'Click Share Below'}</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Domain</span>
                <span className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                  <Globe size={14} /> cordoval.work
                </span>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">Official Share URL</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Shares</span>
                <span className="text-xl font-black text-slate-900">{totalShares}</span>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  Last: {lastSharedAt ? new Date(lastSharedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            {/* Interactive Share & Copy Card */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-400" />
                    Share cordoval.work to Activate / Extend Your 28-Day Pass
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    Sharing cordoval.work on social media instantly grants 28 full days of unrestricted access.
                  </p>
                </div>

                <button
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10 shrink-0 cursor-pointer active:scale-95"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied cordoval.work!' : 'Copy cordoval.work'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <button
                  onClick={() => handleShareSocial(`https://twitter.com/intent/tweet?text=${encodeURIComponent("I support and use Cordoval, it's the ultimate business workspace and it's completely free!")}&url=${encodeURIComponent("https://cordoval.work")}`)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/5 active:scale-95"
                >
                  <span>Share on X</span>
                </button>
                <button
                  onClick={() => handleShareSocial(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://cordoval.work")}`)}
                  className="p-3 bg-[#0A66C2]/80 hover:bg-[#0A66C2] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <span>LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShareSocial(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://cordoval.work")}&quote=${encodeURIComponent("I support and use Cordoval, it's the ultimate business workspace and it's completely free!")}`)}
                  className="p-3 bg-[#1877F2]/80 hover:bg-[#1877F2] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => {
                    if (paywall?.openPaywallModal) {
                      paywall.openPaywallModal();
                    }
                  }}
                  className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
                >
                  <Share2 size={14} />
                  <span>Open Paywall</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm">
              <RefreshCw size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Updates</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cordoval OS Release Channel</p>
            </div>
          </div>

          {!isElectron ? (
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-slate-400" />
                <p className="text-sm font-bold text-slate-500">
                  You are running Cordoval OS in the browser. Auto-updates are available in the desktop app.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Installed Version</span>
                  <span className="text-xl font-black text-slate-900">{currentVersion || '...'}</span>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Cordoval OS Desktop</p>
                </div>
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Update Channel</span>
                  <span className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                    <Globe size={14} /> GitHub Releases
                  </span>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">KierenDayStudios/Cordoval-OS-Official</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                {updateStatus === 'idle' && (
                  <p className="text-sm font-medium text-slate-500">
                    Check GitHub for the latest Cordoval OS release.
                  </p>
                )}
                {updateStatus === 'checking' && (
                  <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-sky-500" /> Checking for updates...
                  </p>
                )}
                {updateStatus === 'not-available' && (
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 size={16} /> You are running the latest version.
                  </p>
                )}
                {updateStatus === 'available' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                      <Zap size={16} /> Version {updateVersion} is available to download.
                    </p>
                  </div>
                )}
                {updateStatus === 'downloading' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-sky-500" /> Downloading update... {Math.round(updatePercent)}%
                    </p>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${updatePercent}%` }} />
                    </div>
                  </div>
                )}
                {updateStatus === 'downloaded' && (
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Update {updateVersion} downloaded. Restart to install.
                  </p>
                )}
                {updateStatus === 'dev-mode' && (
                  <p className="text-sm font-bold text-slate-500">
                    Auto-updates are disabled in development mode. Package the app to enable GitHub update checks.
                  </p>
                )}
                {updateStatus === 'error' && (
                  <p className="text-sm font-bold text-red-500">
                    Update check failed: {updateError || 'Unknown error'}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                {(updateStatus === 'idle' || updateStatus === 'not-available' || updateStatus === 'error') && (
                  <button
                    onClick={handleCheckUpdates}
                    className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 hover:bg-sky-600 cursor-pointer"
                  >
                    <RefreshCw size={16} /> Check for Updates
                  </button>
                )}
                {updateStatus === 'available' && (
                  <button
                    onClick={handleDownloadUpdate}
                    className="h-12 px-6 bg-sky-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 hover:bg-sky-500 cursor-pointer"
                  >
                    <Zap size={16} /> Download Update
                  </button>
                )}
                {updateStatus === 'downloaded' && (
                  <button
                    onClick={handleInstallUpdate}
                    className="h-12 px-6 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 hover:bg-emerald-500 cursor-pointer"
                  >
                    <RefreshCw size={16} /> Restart & Install
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Key size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Neural Link (AI)</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bring Your Own Key Protocol</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gemini API Configuration</h4>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  Get Key <ExternalLink size={10} />
                </a>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="password"
                    placeholder="Enter your Gemini API Key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 text-sm font-mono outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <button 
                  onClick={handleSaveKey}
                  className="h-14 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 hover:bg-indigo-600"
                >
                  {isSaved ? <Check size={16} /> : <Save size={16} />}
                  {isSaved ? 'Linked' : 'Save Key'}
                </button>
              </div>

              <div className="mt-6 flex items-start gap-4 p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 shadow-inner">
                <ShieldCheck size={20} className="text-amber-500 mt-1 shrink-0" />
                <div>
                  <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Strict Privacy Protocol</h4>
                  <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed">
                    In order to keep privacy high and for you to access to AI tools, you will need to connect a Gemini API key with billing enabled. 
                    This key will be stored exclusively on your device's local browser storage.
                  </p>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-tight mt-3">
                    Note: Your API key does not come to our servers because we don't have any. It stays on your device.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Security & Governance</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Core Protocol</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
              Cordoval OS is architected for absolute privacy. All capabilities are processed locally within your browser's secure context.
            </p>

            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4 mt-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-1">Privacy Standard 4.1</h4>
                <p className="text-xs text-emerald-700/80 font-medium leading-relaxed">
                  No telemetry or analytics ever observe your work. All artifacts remain strictly in your browser or local file system.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Status</h5>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-black text-slate-800">Operational</span>
                    </div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data Sovereignty</h5>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs font-black text-slate-800">Local-Only Persistence</span>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <LegalSection />

      </main>

      <footer className="mt-auto py-10 flex flex-col items-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Cordoval OS Core</p>
        <button 
          onClick={onBack}
          className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          Return to Hub
        </button>
      </footer>
    </div>
  );
};