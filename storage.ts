import { IStorageAdapter, StorageArtifact } from './types';
import { ElectronStorageAdapter, isElectron } from './electronStorage';

export class DeviceStorageAdapter implements IStorageAdapter {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private readonly DB_NAME = 'kds_handles_db';
  private readonly STORE_NAME = 'handles';

  public readonly folderMap: Record<string, string> = {
    'docs': 'Documents',
    'sheets': 'Spreadsheets',
    'slides': 'Presentations',
    'project-manager': 'Projects',
    'canvas': 'Designs',
    'site-builder': 'Websites',
    'plan-builder': 'Plans',
    'code-editor': 'Source',
    'pixel-art': 'Art',
    'passwords': 'Security',
    'podcast-studio': 'Podcasts',
    'notes': 'Notes',
    'calendar': 'Calendar',
    'journal': 'Journal',
    'habits': 'Wellness',
    'goals': 'Objectives',
    'ledger': 'Finance',
    'client-vault': 'Clients',
    'decision-log': 'Thinking',
    'content-calendar': 'Strategy',
    'joymiz-ai': 'AI_Artifacts',
    'ai-code-editor': 'AI_Code'
  };

  async initialize(forcePrompt = false): Promise<boolean> {
    try {
      if (!forcePrompt) {
        this.rootHandle = await this.getStoredHandle();
        if (this.rootHandle) {
          const permission = await (this.rootHandle as any).queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') return true;
        }
        return false;
      }

      if (!(window as any).showDirectoryPicker) {
        console.warn("File System Access API not supported in this browser.");
        return false;
      }

      try {
        const handle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });

        this.rootHandle = await handle.getDirectoryHandle('KDS Workspace', { create: true });
        await this.storeHandle(this.rootHandle!);
        return true;
      } catch (pickerError: any) {
        if (pickerError.name === 'SecurityError' || pickerError.message.includes('Cross origin')) {
          console.warn("Directory picker blocked in cross-origin frame. Falling back.");
        } else {
          throw pickerError;
        }
        return false;
      }
    } catch (e) {
      console.error("Storage Initialization Failed", e);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.rootHandle !== null;
  }

  private async getSubFolder(type: string): Promise<FileSystemDirectoryHandle> {
    if (!this.rootHandle) throw new Error("Root handle not initialized");
    const folderName = this.folderMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    return await this.rootHandle.getDirectoryHandle(folderName, { create: true });
  }

  async save(type: string, artifact: StorageArtifact): Promise<void> {
    const folder = await this.getSubFolder(type);
    
    for await (const entry of (folder as any).values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')) {
        try {
          const file = await entry.getFile();
          const content = await file.text();
          const parsed = JSON.parse(content);
          if (parsed.id === artifact.id && entry.name !== `${artifact.name}.json`) {
            await folder.removeEntry(entry.name);
          }
        } catch {
        }
      }
    }

    let safeName = artifact.name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || artifact.id;
    const fileName = `${safeName}.json`;
    const fileHandle = await folder.getFileHandle(fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(JSON.stringify(artifact, null, 2));
    await writable.close();
  }

  async load(type: string, id: string): Promise<StorageArtifact | null> {
    try {
      const folder = await this.getSubFolder(type);
      for await (const entry of (folder as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          const file = await entry.getFile();
          const content = await file.text();
          const parsed = JSON.parse(content);
          if (parsed.id === id) return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async list(type: string): Promise<StorageArtifact[]> {
    try {
      const folder = await this.getSubFolder(type);
      const artifacts: StorageArtifact[] = [];
      for await (const entry of (folder as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          try {
            const file = await entry.getFile();
            const content = await file.text();
            artifacts.push(JSON.parse(content));
          } catch {
          }
        }
      }
      return artifacts;
    } catch {
      return [];
    }
  }

  async delete(type: string, id: string): Promise<void> {
    try {
      const folder = await this.getSubFolder(type);
      for await (const entry of (folder as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          const file = await entry.getFile();
          const content = await file.text();
          const parsed = JSON.parse(content);
          if (parsed.id === id) {
            await folder.removeEntry(entry.name);
            return;
          }
        }
      }
    } catch {
    }
  }

  private async storeHandle(handle: FileSystemDirectoryHandle) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    tx.objectStore(this.STORE_NAME).put(handle, 'root');
  }

  private async getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
    const db = await this.openDB();
    return new Promise((resolve) => {
      const request = db.transaction(this.STORE_NAME).objectStore(this.STORE_NAME).get('root');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(this.STORE_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export class BrowserStorageAdapter implements IStorageAdapter {
  private readonly DB_NAME = 'kds_browser_storage';
  private readonly STORE_NAME = 'artifacts';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.STORE_NAME)) {
          const store = request.result.createObjectStore(this.STORE_NAME, { keyPath: ['type', 'id'] });
          store.createIndex('type', 'type', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save(type: string, artifact: StorageArtifact): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.put({ ...artifact, type });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async load(type: string, id: string): Promise<StorageArtifact | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.get([type, id]);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async list(type: string): Promise<StorageArtifact[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(IDBKeyRange.only(type));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(type: string, id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.delete([type, id]);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export class StorageManager {
  private electronAdapter = new ElectronStorageAdapter();
  private deviceAdapter = new DeviceStorageAdapter();
  private browserAdapter = new BrowserStorageAdapter();
  private initialized = false;

  private getAdapter(type: string): IStorageAdapter {
    if (isElectron() && this.electronAdapter.isInitialized()) return this.electronAdapter;
    if (this.deviceAdapter.isInitialized()) return this.deviceAdapter;
    return this.browserAdapter;
  }

  async initializeDeviceStorage(force = false) {
    if (isElectron()) {
      try {
        const result = await this.electronAdapter.initialize(force);
        if (result) {
          this.initialized = true;
          return true;
        }
      } catch (e) {
        console.warn("Electron storage initialization failed, falling back", e);
      }
    }
    try {
      return await this.deviceAdapter.initialize(force);
    } catch (e) {
      console.warn("Device storage initialization failed, falling back to browser storage", e);
      return false;
    }
  }

  async save(type: string, artifact: StorageArtifact) {
    return this.getAdapter(type).save(type, artifact);
  }

  async load(type: string, id: string) {
    return this.getAdapter(type).load(type, id);
  }

  async list(type: string) {
    return this.getAdapter(type).list(type);
  }

  async delete(type: string, id: string) {
    return this.getAdapter(type).delete(type, id);
  }

  async backupBrowserToDevice() {
    if (isElectron() && this.electronAdapter.isInitialized()) {
      await this.electronAdapter.backupBrowserToDevice(this.browserAdapter);
    } else {
      const types = Object.keys(this.deviceAdapter['folderMap']);
      for (const type of types) {
        const browserData = await this.browserAdapter.list(type);
        for (const artifact of browserData) {
          await this.deviceAdapter.save(type, artifact);
        }
      }
    }
  }

  getElectronAdapter(): ElectronStorageAdapter {
    return this.electronAdapter;
  }

  isUsingElectronStorage(): boolean {
    return isElectron() && this.electronAdapter.isInitialized();
  }
}

export const storage = new StorageManager();