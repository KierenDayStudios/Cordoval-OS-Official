import { IStorageAdapter, StorageArtifact } from './types';

const ELECTRON_VAULT_KEY = 'cordoval_electron_vault_path';

export class ElectronStorageAdapter implements IStorageAdapter {
  private vaultPath: string | null = null;
  private readonly folderMap: Record<string, string> = {
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
    'ai-code-editor': 'AI_Code',
    'agents': 'Agents',
    'work-logs': 'WorkLogs'
  };

  async initialize(forcePrompt = false): Promise<boolean> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      return false;
    }

    try {
      if (!forcePrompt) {
        const stored = localStorage.getItem(ELECTRON_VAULT_KEY);
        if (stored) {
          this.vaultPath = stored;
          const exists = await window.electronAPI.fs.stat(this.vaultPath);
          if (exists?.isDirectory) {
            return true;
          }
        }
        return false;
      }

      const selectedPath = await window.electronAPI.dialog.openDirectory();
      if (selectedPath) {
        this.vaultPath = selectedPath;
        localStorage.setItem(ELECTRON_VAULT_KEY, selectedPath);
        await this.ensureVaultStructure();
        return true;
      }
      return false;
    } catch (e) {
      console.error('ElectronStorageAdapter initialization failed:', e);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.vaultPath !== null;
  }

  private async ensureVaultStructure(): Promise<void> {
    if (!this.vaultPath) return;
    for (const folder of Object.values(this.folderMap)) {
      const folderPath = `${this.vaultPath}/${folder}`;
      await window.electronAPI.fs.mkdir(folderPath);
    }
  }

  private getFolderPath(type: string): string {
    if (!this.vaultPath) throw new Error('Vault not initialized');
    const folderName = this.folderMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    return `${this.vaultPath}/${folderName}`;
  }

  private getSafeFileName(name: string, id: string): string {
    const safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || id;
    return `${safeName}.json`;
  }

  async save(type: string, artifact: StorageArtifact): Promise<void> {
    const folderPath = this.getFolderPath(type);
    await window.electronAPI.fs.mkdir(folderPath);

    const entries = await window.electronAPI.fs.readDir(folderPath);
    for (const entry of entries) {
      if (entry.isFile && entry.name.endsWith('.json')) {
        const filePath = `${folderPath}/${entry.name}`;
        const content = await window.electronAPI.fs.readFile(filePath);
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (parsed.id === artifact.id && entry.name !== this.getSafeFileName(artifact.name, artifact.id)) {
              await window.electronAPI.fs.deleteFile(filePath);
            }
          } catch {
            // ignore
          }
        }
      }
    }

    const fileName = this.getSafeFileName(artifact.name, artifact.id);
    const filePath = `${folderPath}/${fileName}`;
    const content = JSON.stringify(artifact, null, 2);
    await window.electronAPI.fs.writeFile(filePath, content);
  }

  async load(type: string, id: string): Promise<StorageArtifact | null> {
    try {
      const folderPath = this.getFolderPath(type);
      const entries = await window.electronAPI.fs.readDir(folderPath);
      
      for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          const filePath = `${folderPath}/${entry.name}`;
          const content = await window.electronAPI.fs.readFile(filePath);
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.id === id) return parsed;
            } catch {
              // ignore
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async list(type: string): Promise<StorageArtifact[]> {
    try {
      const folderPath = this.getFolderPath(type);
      const entries = await window.electronAPI.fs.readDir(folderPath);
      const artifacts: StorageArtifact[] = [];

      for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          const filePath = `${folderPath}/${entry.name}`;
          const content = await window.electronAPI.fs.readFile(filePath);
          if (content) {
            try {
              artifacts.push(JSON.parse(content));
            } catch {
              // ignore
            }
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
      const folderPath = this.getFolderPath(type);
      const entries = await window.electronAPI.fs.readDir(folderPath);
      
      for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          const filePath = `${folderPath}/${entry.name}`;
          const content = await window.electronAPI.fs.readFile(filePath);
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.id === id) {
                await window.electronAPI.fs.deleteFile(filePath);
                return;
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  getVaultPath(): string | null {
    return this.vaultPath;
  }

  async backupBrowserToDevice(browserAdapter: any): Promise<void> {
    const types = Object.keys(this.folderMap);
    for (const type of types) {
      const browserData = await browserAdapter.list(type);
      for (const artifact of browserData) {
        await this.save(type, artifact);
      }
    }
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}