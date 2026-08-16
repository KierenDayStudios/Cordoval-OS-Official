/**
 * Cordoval Universal Save Manager
 * Handles saving files to either a dedicated Cordoval Vault directory or a user-picked location.
 */

const DB_NAME = 'cordoval_storage_db';
const STORE_NAME = 'handles';
const DEDICATED_HANDLE_KEY = 'cordoval_vault_dir_handle';

// Open IndexedDB to store FileSystemDirectoryHandle across sessions
function openDB(): Promise<IDBDatabase> {
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

async function getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DEDICATED_HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setStoredHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, DEDICATED_HANDLE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to store directory handle in IndexedDB', err);
  }
}

export interface SaveResult {
  success: boolean;
  destination: 'dedicated' | 'custom' | 'fallback';
  filename: string;
  error?: string;
}

export async function hasDedicatedFolder(): Promise<boolean> {
  const handle = await getStoredHandle();
  return !!handle;
}

export async function getDedicatedFolderName(): Promise<string> {
  const handle = await getStoredHandle();
  return handle ? handle.name : 'Cordoval_Vault';
}

/**
 * Prompts user to pick or create their dedicated Cordoval Vault directory
 */
export async function connectDedicatedFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    throw new Error('File System Access API is not supported in this browser. Native downloads will be used as fallback.');
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });

    // Request permissions if needed
    if (dirHandle.queryPermission) {
      const status = await dirHandle.queryPermission({ mode: 'readwrite' });
      if (status !== 'granted') {
        const req = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (req !== 'granted') {
          throw new Error('Permission to write to directory was denied.');
        }
      }
    }

    await setStoredHandle(dirHandle);
    return dirHandle;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null;
    }
    throw err;
  }
}

/**
 * Saves a file directly inside the dedicated Cordoval Vault folder
 */
export async function saveToDedicatedVault(
  filename: string,
  content: string | Blob | ArrayBuffer
): Promise<SaveResult> {
  let dirHandle = await getStoredHandle();

  if (!dirHandle) {
    // Attempt to connect/create dedicated folder
    dirHandle = await connectDedicatedFolder();
    if (!dirHandle) {
      return {
        success: false,
        destination: 'dedicated',
        filename,
        error: 'Dedicated folder not connected'
      };
    }
  }

  try {
    // Verify permission
    const dh = dirHandle as any;
    if (dh.queryPermission) {
      const perm = await dh.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        const req = await dh.requestPermission({ mode: 'readwrite' });
        if (req !== 'granted') {
          throw new Error('Permission denied');
        }
      }
    }

    // Get file handle in dedicated directory
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    return {
      success: true,
      destination: 'dedicated',
      filename
    };
  } catch (err: any) {
    console.warn('Failed to write directly to dedicated folder, trying fallback download', err);
    // If handle is stale, try re-connecting or fallback to custom location
    return saveToUserPickedLocation(filename, content);
  }
}

/**
 * Saves a file to a location chosen by the user via Save File Picker or classic Download
 */
export async function saveToUserPickedLocation(
  filename: string,
  content: string | Blob | ArrayBuffer,
  mimeType: string = 'application/octet-stream'
): Promise<SaveResult> {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const ext = filename.split('.').pop() || 'txt';
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'File',
          accept: { [mimeType]: [`.${ext}`] }
        }]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      return {
        success: true,
        destination: 'custom',
        filename: fileHandle.name || filename
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, destination: 'custom', filename, error: 'User cancelled' };
      }
    }
  }

  // Classic browser fallback download anchor
  try {
    let blob: Blob;
    if (content instanceof Blob) {
      blob = content;
    } else if (typeof content === 'string') {
      blob = new Blob([content], { type: mimeType });
    } else {
      blob = new Blob([content], { type: mimeType });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    return {
      success: true,
      destination: 'fallback',
      filename
    };
  } catch (err: any) {
    return {
      success: false,
      destination: 'fallback',
      filename,
      error: err.message || 'Download failed'
    };
  }
}
