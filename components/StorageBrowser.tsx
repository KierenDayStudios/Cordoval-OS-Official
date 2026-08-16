import React, { useState, useEffect } from 'react';
import { storage } from '../storage';
import { FolderOpen, Save, File, Trash2, X, HardDrive, Check, Search } from 'lucide-react';
import { StorageArtifact } from '../types';

interface StorageBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'load' | 'save';
  type: string;
  defaultName?: string;
  onSelectLoad?: (artifact: StorageArtifact) => void;
  onConfirmSave?: (name: string) => void;
}

export const StorageBrowser: React.FC<StorageBrowserProps> = ({
  isOpen, onClose, mode, type, defaultName = 'Untitled', onSelectLoad, onConfirmSave
}) => {
  const [artifacts, setArtifacts] = useState<StorageArtifact[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState(defaultName);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setLoading(true);
    // Initialize without force to check if already connected
    const connected = await storage.initializeDeviceStorage(false);
    setIsConnected(connected);
    if (connected) {
      loadFiles();
    }
    setLoading(false);
  };

  const connect = async () => {
    setLoading(true);
    const connected = await storage.initializeDeviceStorage(true);
    setIsConnected(connected);
    if (connected) {
      loadFiles();
    }
    setLoading(false);
  };

  const loadFiles = async () => {
    try {
      const items = await storage.list(type);
      // Sort by updatedAt descending
      setArtifacts(items.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this file permanently?')) {
      await storage.delete(type, id);
      await loadFiles();
    }
  };

  if (!isOpen) return null;

  const filteredArtifacts = artifacts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              {mode === 'save' ? <Save size={20} /> : <FolderOpen size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {mode === 'save' ? `Save ${type}` : `Open ${type}`}
              </h2>
              <p className="text-xs text-slate-500">Local Device Storage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <HardDrive size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Connect Local Storage</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Cordoval securely saves files directly to a folder on your computer. Connect your workspace folder to continue.
              </p>
              <button 
                onClick={connect}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-70"
              >
                {loading ? 'Connecting...' : 'Select Workspace Folder'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === 'save' && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6">
                  <label className="block text-xs font-bold text-indigo-900 mb-1.5 uppercase tracking-wide">File Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="e.g. Q3 Marketing Plan"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => onConfirmSave?.(saveName)}
                      disabled={!saveName.trim()}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-200"
                    >
                      <Check size={18} />
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl mb-4 focus-within:ring-2 focus-within:ring-indigo-500">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm w-full"
                />
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading files...</div>
              ) : filteredArtifacts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <File size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No files found.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredArtifacts.map(artifact => (
                    <div 
                      key={artifact.id}
                      onClick={() => {
                        if (mode === 'load') {
                          onSelectLoad?.(artifact);
                        } else {
                          setSaveName(artifact.name);
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        saveName === artifact.name && mode === 'save'
                          ? 'border-indigo-400 bg-indigo-50' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                          <File size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{artifact.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            {new Date(artifact.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDelete(artifact.id, e)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
