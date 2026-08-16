import React, { useState, useEffect } from 'react';
import { HardDrive, FolderDown, X, CheckCircle2, ShieldCheck, ArrowRight, FolderPlus } from 'lucide-react';
import {
  hasDedicatedFolder,
  getDedicatedFolderName,
  connectDedicatedFolder,
  saveToDedicatedVault,
  saveToUserPickedLocation,
  SaveResult
} from '../src/lib/saveManager';

export interface SaveDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  content: string | Blob | ArrayBuffer;
  mimeType?: string;
  onSaveComplete?: (result: SaveResult) => void;
}

export const SaveDestinationModal: React.FC<SaveDestinationModalProps> = ({
  isOpen,
  onClose,
  filename,
  content,
  mimeType = 'application/json',
  onSaveComplete
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('Cordoval_Vault');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rememberPreference, setRememberPreference] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      checkFolderStatus();
    }
  }, [isOpen]);

  const checkFolderStatus = async () => {
    const connected = await hasDedicatedFolder();
    setIsConnected(connected);
    const name = await getDedicatedFolderName();
    setFolderName(name);
  };

  if (!isOpen) return null;

  const handleSaveToDedicated = async () => {
    setIsSaving(true);
    try {
      if (!isConnected) {
        const handle = await connectDedicatedFolder();
        if (!handle) {
          setIsSaving(false);
          return;
        }
        setIsConnected(true);
        setFolderName(handle.name);
      }

      const res = await saveToDedicatedVault(filename, content);
      if (rememberPreference) {
//         localStorage.setItem('cordoval_default_save_dest', 'dedicated');
      }
      setIsSaving(false);
      onClose();
      if (onSaveComplete) onSaveComplete(res);
    } catch (err: any) {
      console.error('Failed to save to dedicated folder:', err);
      setIsSaving(false);
    }
  };

  const handleSaveToCustom = async () => {
    setIsSaving(true);
    try {
      const res = await saveToUserPickedLocation(filename, content, mimeType);
      if (rememberPreference) {
//         localStorage.setItem('cordoval_default_save_dest', 'custom');
      }
      setIsSaving(false);
      onClose();
      if (onSaveComplete) onSaveComplete(res);
    } catch (err: any) {
      console.error('Failed to save to custom location:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Select Save Destination</h3>
              <p className="text-xs text-slate-400 mt-0.5">Choose where to save your file on this device</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">File to save:</span>
            <span className="font-mono font-bold text-indigo-300 truncate max-w-[220px]">{filename}</span>
          </div>
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-4">
          
          {/* Option 1: Dedicated Cordoval Vault Folder */}
          <button
            onClick={handleSaveToDedicated}
            disabled={isSaving}
            className="w-full text-left p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group flex items-start gap-4 cursor-pointer relative overflow-hidden active:scale-[0.99]"
          >
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
              <HardDrive size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-1.5">
                  Dedicated Cordoval Vault
                </h4>
                {isConnected ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FolderPlus size={10} /> Connect / Create
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isConnected
                  ? `Saves directly into your connected "${folderName}" folder on disk.`
                  : `Connect or create a dedicated "Cordoval_Vault" folder on your computer.`}
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all self-center" />
          </button>

          {/* Option 2: Custom User Picked Location */}
          <button
            onClick={handleSaveToCustom}
            disabled={isSaving}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-400 hover:bg-slate-50 transition-all group flex items-start gap-4 cursor-pointer relative overflow-hidden active:scale-[0.99]"
          >
            <div className="p-3 bg-slate-800 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
              <FolderDown size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-slate-950 transition-colors">
                Choose Custom Location
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pick a specific folder, drive, or file path on your device for this save.
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all self-center" />
          </button>

          {/* Remember Preference Checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="remember_save_dest"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="remember_save_dest" className="text-xs text-slate-600 font-medium cursor-pointer">
              Remember my choice for future saves
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
