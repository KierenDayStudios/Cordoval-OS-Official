import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Heart, 
  Copy, 
  ExternalLink, 
  Zap, 
  Check, 
  Gift, 
  ArrowRight,
  Globe,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TRIAL_LIMIT_SECONDS = 1800; // 30 minutes active time
const RENEWAL_PERIOD_MS = 28 * 24 * 60 * 60 * 1000; // 28 days

export interface PaywallState {
  activeSeconds: number;
  subActiveUntil: number | null;
  lastSharedAt: number | null;
  totalShares: number;
  isLocked: boolean;
}

export function useSocialPaywallLogic() {
  const [activeSeconds, setActiveSeconds] = useState<number>(() => {
    const val = localStorage.getItem('cordoval_active_usage_seconds');
    return val ? parseInt(val, 10) : 0;
  });

  const [subActiveUntil, setSubActiveUntil] = useState<number | null>(() => {
    const val = localStorage.getItem('cordoval_sub_active_until');
    return val ? parseInt(val, 10) : null;
  });

  const [lastSharedAt, setLastSharedAt] = useState<number | null>(() => {
    const val = localStorage.getItem('cordoval_last_shared_at');
    return val ? parseInt(val, 10) : null;
  });

  const [totalShares, setTotalShares] = useState<number>(() => {
    const val = localStorage.getItem('cordoval_total_shares');
    return val ? parseInt(val, 10) : 0;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [manualOpen, setManualOpen] = useState<boolean>(false);

  // Initialize first seen timestamp if not set
  useEffect(() => {
    if (!localStorage.getItem('cordoval_paywall_first_seen')) {
//       localStorage.setItem('cordoval_paywall_first_seen', Date.now().toString());
    }
  }, []);

  // Check lock status
  useEffect(() => {
    const now = Date.now();
    
    // Condition 1: Sub active until timestamp set
    if (subActiveUntil && subActiveUntil > 0) {
      if (now > subActiveUntil) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
      return;
    }

    // Condition 2: No active sub, check 30 min trial active time
    if (activeSeconds >= TRIAL_LIMIT_SECONDS) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [activeSeconds, subActiveUntil]);

  // Active usage timer (only ticks when active & tab is visible & not yet locked)
  useEffect(() => {
    // If sub is currently active and not expired, no need to tick trial timer
    if (subActiveUntil && Date.now() < subActiveUntil) {
      return;
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isLocked) {
        setActiveSeconds((prev) => {
          const next = prev + 1;
//           localStorage.setItem('cordoval_active_usage_seconds', next.toString());
          if (next >= TRIAL_LIMIT_SECONDS) {
            setIsLocked(true);
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, subActiveUntil]);

  const recordShareSuccess = () => {
    const now = Date.now();
    const newUntil = now + RENEWAL_PERIOD_MS;
    const newTotal = totalShares + 1;

    setSubActiveUntil(newUntil);
    setLastSharedAt(now);
    setTotalShares(newTotal);
    setIsLocked(false);
    setManualOpen(false);

//     localStorage.setItem('cordoval_sub_active_until', newUntil.toString());
//     localStorage.setItem('cordoval_last_shared_at', now.toString());
//     localStorage.setItem('cordoval_total_shares', newTotal.toString());
  };

  return {
    activeSeconds,
    subActiveUntil,
    lastSharedAt,
    totalShares,
    isLocked: isLocked || manualOpen,
    isMandatoryLock: isLocked,
    recordShareSuccess,
    openPaywallModal: () => setManualOpen(true),
    closePaywallModal: () => setManualOpen(false),
  };
}

interface SocialPaywallModalProps {
  isOpen: boolean;
  isMandatoryLock: boolean;
  activeSeconds: number;
  subActiveUntil: number | null;
  lastSharedAt: number | null;
  onShareSuccess: () => void;
  onClose?: () => void;
}

export const SocialPaywallModal: React.FC<SocialPaywallModalProps> = ({
  isOpen,
  isMandatoryLock,
  activeSeconds,
  subActiveUntil,
  lastSharedAt,
  onShareSuccess,
  onClose
}) => {
  const [shareStep, setShareStep] = useState<'prompt' | 'success'>('prompt');

  const remainingTrialSeconds = Math.max(0, TRIAL_LIMIT_SECONDS - activeSeconds);
  const trialMinutes = Math.floor(remainingTrialSeconds / 60);
  const trialSecs = remainingTrialSeconds % 60;

  const daysRemainingSub = subActiveUntil 
    ? Math.max(0, Math.ceil((subActiveUntil - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const shareTitle = "Cordoval - The Everything App for Creators & Businesses";
  const shareText = "I support and use Cordoval, it's the ultimate business workspace and it's completely free!";
  const shareUrl = "https://cordoval.work";

  const handleSocialClick = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    handleSuccess();
  };

  const handleSuccess = () => {
    setShareStep('success');
    setTimeout(() => {
      onShareSuccess();
      setShareStep('prompt');
    }, 2200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-xl font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
        >
          {/* Top Decorative Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Optional Close button if manual open & not mandatory lock */}
            {!isMandatoryLock && onClose && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} /> 
                Zero-Cost £0 Subscription
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
              {isMandatoryLock ? "Time for your Monthly Subscription!" : "Cordoval 28-Day Access Pass"}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
              We operate differently at Cordoval. Your monthly membership costs <strong className="text-emerald-400 font-bold">£0/month</strong>. All you need to do is share to social media once every 28 days to keep full unlimited access.
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6">

            {shareStep === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Subscription Activated!</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto">
                  Thank you for spreading the word! You now have <strong>28 Days of Full Access</strong> to all 80+ Cordoval apps.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200/60">
                  <ShieldCheck size={16} /> 28 Days Active • Next Renewal in 28 Days
                </div>
              </motion.div>
            ) : (
              <>
                {/* Highlights Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-2.5">
                    <span className="flex items-center gap-1.5 text-slate-900">
                      <Gift size={16} className="text-indigo-600" />
                      What's Included in Your £0 Membership
                    </span>
                    <span className="text-emerald-600 font-black">100% Free Forever</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      80+ AI Apps & Business Suite
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      Local-First Disk Storage & Privacy
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      No Credit Card Ever Required
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      28-Day Access per Social Share
                    </li>
                  </ul>
                </div>

                {/* Social Media Share Buttons */}
                <div>
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Select a Social Platform to Share & Activate Access
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Twitter / X */}
                    <button
                      onClick={() => handleSocialClick(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)}
                      className="flex items-center justify-center gap-2.5 p-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Share on X</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      onClick={() => handleSocialClick(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
                      className="flex items-center justify-center gap-2.5 p-3.5 bg-[#0A66C2] hover:bg-[#084e96] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                      <span>Share on LinkedIn</span>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => handleSocialClick(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent("I support and use Cordoval, it's the ultimate business workspace and it's completely free!")}`)}
                      className="flex items-center justify-center gap-2.5 p-3.5 bg-[#1877F2] hover:bg-[#125ecc] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.5 5.63 13.78 5.63c1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z"/>
                      </svg>
                      <span>Share on Facebook</span>
                    </button>

                    {/* Reddit */}
                    <button
                      onClick={() => handleSocialClick(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("I support and use Cordoval, it's the ultimate business workspace and it's completely free!")}`)}
                      className="flex items-center justify-center gap-2.5 p-3.5 bg-[#FF4500] hover:bg-[#d93a00] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                      <Globe size={16} />
                      <span>Share on Reddit</span>
                    </button>
                  </div>
                </div>

                {/* System Policy Footer Notice */}
                <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Your share unlocks <strong>28 full days</strong> of Cordoval access. Thank you for supporting local-first apps!</span>
                </div>
              </>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
