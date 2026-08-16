import React, { useState, useRef } from 'react';
import { Download, Upload, Check } from 'lucide-react';
import { StorageBrowser } from './StorageBrowser';
import { storage } from '../storage';

interface SaveLoadControlsProps {
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadFromLocal?: () => void;
  label: string;
  compact?: boolean;
}

export const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({
  onSave,
  onLoad,
  onLoadFromLocal,
  label,
  compact = false
}) => {
  const [toast, setToast] = useState('');
  const [browserMode, setBrowserMode] = useState<'save' | 'load' | null>(null);
  
  // Create a safe type name for storage folders
  const safeType = label.toLowerCase().replace(/\s+/g, '-');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveInit = () => {
    setBrowserMode('save');
  };

  const handleLoadInit = () => {
    if (onLoadFromLocal) {
      onLoadFromLocal();
      showToast(`Loaded ${label} from local storage!`);
    } else {
      setBrowserMode('load');
    }
  };

  const executeSave = async (fileName: string) => {
    // Intercept anchor creation to capture the generated JSON data
    const originalCreateElement = document.createElement.bind(document);
    let caughtData: string | null = null;
    
    document.createElement = function(tagName: string, options?: any) {
      const el = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'a') {
        const origSetAttr = el.setAttribute.bind(el);
        el.setAttribute = function(name: string, value: string) {
          if (name === 'href' && typeof value === 'string' && value.startsWith('data:')) {
            caughtData = value;
          }
          origSetAttr(name, value);
        };
        el.click = function() {
          // Intercepted!
        };
      }
      return el;
    };

    try {
      onSave(); // Component thinks it's downloading
    } finally {
      document.createElement = originalCreateElement;
    }

    let finalContent = "";

    if (caughtData) {
      try {
        finalContent = decodeURIComponent(caughtData.split(',')[1]);
      } catch (e) {
        console.error("Failed to decode caught data", e);
      }
    }

    if (!finalContent) {
      // Fallback for apps that don't use 'a' tag download (they just rely on localstorage)
      const backupData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cordoval_') || key.startsWith('kds_'))) {
          try {
            backupData[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            backupData[key] = localStorage.getItem(key);
          }
        }
      }
      finalContent = JSON.stringify(backupData, null, 2);
    }

    // Now save to StorageManager
    try {
      // We look up if this file name already exists in this folder to preserve ID
      const items = await storage.list(safeType);
      const existing = items.find(i => i.name === fileName);
      
      const artifact = {
        id: existing ? existing.id : Date.now().toString(),
        name: fileName,
        type: safeType,
        data: JSON.parse(finalContent),
        updatedAt: Date.now()
      };
      
      await storage.save(safeType, artifact);
      showToast(`Saved ${fileName}`);
      setBrowserMode(null);
    } catch (e) {
      console.error("Error saving artifact", e);
      alert("Failed to save. Did you authorize folder access?");
    }
  };

  const executeLoad = (artifact: any) => {
    try {
      const jsonString = JSON.stringify(artifact.data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], `${artifact.name}.json`, { type: 'application/json' });
      const dt = new DataTransfer();
      dt.items.add(file);
      
      onLoad({ target: { files: dt.files } } as any);
      showToast(`Loaded ${artifact.name}`);
      setBrowserMode(null);
    } catch (e) {
      console.error("Error loading artifact", e);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        onClick={handleSaveInit}
        title={`Save ${label}`}
        className={`flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200/80 cursor-pointer shadow-sm ${
          compact ? 'px-2.5 py-1.5 text-[9px]' : 'px-3 py-2 text-[10px]'
        }`}
      >
        <Download size={compact ? 12 : 14} className="text-indigo-600" />
        <span>Save {compact ? '' : 'File'}</span>
      </button>

      <button
        onClick={handleLoadInit}
        title={`Load ${label}`}
        className={`flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200/80 cursor-pointer shadow-sm ${
          compact ? 'px-2.5 py-1.5 text-[9px]' : 'px-3 py-2 text-[10px]'
        }`}
      >
        <Upload size={compact ? 12 : 14} className="text-emerald-600" />
        <span>Load {compact ? '' : 'File'}</span>
      </button>

      <StorageBrowser 
        isOpen={browserMode !== null}
        onClose={() => setBrowserMode(null)}
        mode={browserMode || 'save'}
        type={safeType}
        defaultName={`New ${label}`}
        onConfirmSave={executeSave}
        onSelectLoad={executeLoad}
      />

      {toast && (
        <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1">
          <Check size={12} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
