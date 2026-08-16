/**
 * Cordoval PlayTab IndexedDB Storage & Offline State Manager
 */

export interface PlayState {
  corBux: number;
  properties: any[];
  stocks: any[];
  myStocks: any[];
  myBonds: any[];
  lastSaved: number;
}

const DB_NAME = 'cordoval_play_db';
const STORE_NAME = 'play_state';
const STATE_KEY = 'user_game_state';

function openPlayDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePlayStateToIDB(state: Partial<PlayState>): Promise<void> {
  try {
    const db = await openPlayDB();
    const existing = await loadPlayStateFromIDB();
    const merged: PlayState = {
      corBux: state.corBux ?? existing?.corBux ?? 10000,
      properties: state.properties ?? existing?.properties ?? [],
      stocks: state.stocks ?? existing?.stocks ?? [],
      myStocks: state.myStocks ?? existing?.myStocks ?? [],
      myBonds: state.myBonds ?? existing?.myBonds ?? [],
      lastSaved: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(merged, STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save play state to IndexedDB:', err);
  }
}

export async function loadPlayStateFromIDB(): Promise<PlayState | null> {
  try {
    const db = await openPlayDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STATE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
