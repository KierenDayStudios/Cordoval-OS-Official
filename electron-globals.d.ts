export {};

declare global {
  interface Window {
    electronAPI?: {
      dialog: {
        openDirectory: () => Promise<string | null>;
      };
      fs: {
        readDir: (dirPath: string) => Promise<{ name: string; isDirectory: boolean; isFile: boolean }[]>;
        readFile: (filePath: string) => Promise<string | null>;
        writeFile: (filePath: string, content: string) => Promise<boolean>;
        deleteFile: (filePath: string) => Promise<boolean>;
        mkdir: (dirPath: string) => Promise<boolean>;
        stat: (filePath: string) => Promise<{ isFile: boolean; isDirectory: boolean; size: number; mtime: number } | null>;
      };
      app: {
        getVersion: () => Promise<string>;
        getPath: (name: string) => Promise<string>;
      };
      update: {
        check: () => Promise<{ status: string; message?: string }>;
        download: () => Promise<{ status: string; message?: string }>;
        install: () => Promise<{ status: string; message?: string }>;
        getVersion: () => Promise<string>;
        onStatus: (callback: (payload: UpdateStatusPayload) => void) => () => void;
      };
      isElectron: boolean;
    };
  }
}

export interface UpdateStatusPayload {
  status: string;
  version?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  message?: string;
}
