/**
 * Cordoval Local-First Service Worker & Online/Offline Codebase Auto-Updater
 */

export interface SWStatus {
  isOnline: boolean;
  hasUpdate: boolean;
  isRegistered: boolean;
  lastChecked: Date | null;
}

type SWStatusListener = (status: SWStatus) => void;

let currentStatus: SWStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  hasUpdate: false,
  isRegistered: false,
  lastChecked: null
};

const listeners: Set<SWStatusListener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn({ ...currentStatus }));
}

export function subscribeSWStatus(listener: SWStatusListener): () => void {
  listeners.add(listener);
  listener({ ...currentStatus });
  return () => listeners.delete(listener);
}

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    currentStatus.isOnline = isOnline;
    notifyListeners();

    if (isOnline && navigator.serviceWorker.controller) {
      // When user goes online, check server for latest codebase version and update local cache
      navigator.serviceWorker.ready.then(registration => {
        registration.update().catch(err => console.warn('SW update check failed:', err));
        currentStatus.lastChecked = new Date();
        notifyListeners();
      });
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      currentStatus.isRegistered = true;
      currentStatus.lastChecked = new Date();
      notifyListeners();

      // Check if a new service worker / codebase update is waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[Cordoval Sync] New codebase version detected and cached locally!');
            currentStatus.hasUpdate = true;
            notifyListeners();
          }
        });
      });

      // Periodically check for updates if online (every 15 mins)
      setInterval(() => {
        if (navigator.onLine) {
          registration.update().catch(() => {});
          currentStatus.lastChecked = new Date();
          notifyListeners();
        }
      }, 15 * 60 * 1000);

    } catch (error) {
      console.warn('[Cordoval Sync] Service worker registration error:', error);
    }
  });
}

export function applyCodebaseUpdate() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
}
