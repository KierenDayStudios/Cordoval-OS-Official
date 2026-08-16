import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Upload, Save, FileEdit, Scissors, Layers, Type, MousePointer2, ZoomIn, ZoomOut, Download, Trash2, Edit3 } from 'lucide-react';

export const PDFEditor: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'draw' | 'erase'>('select');
  const [zoom, setZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0 z-10 w-full">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
               <FileEdit size={16} />
             </div>
             <h1 className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-4 hidden sm:block">PDF Editor Pro</h1>
             <h1 className="text-lg font-bold text-slate-900 block sm:hidden">Editor</h1>
          </div>
        </div>
        
        {file && (
          <div className="flex items-center gap-2">
            <button className="bg-white border border-slate-200 text-slate-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs md:text-sm shadow-sm md:w-auto w-10 justify-center">
              <Download size={16} /> <span className="hidden md:inline">Export</span>
            </button>
            <button className="bg-red-600 text-white px-3 md:px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 text-xs md:text-sm shadow-sm md:w-auto w-10 justify-center">
              <Save size={16} /> <span className="hidden md:inline">Save PDF</span>
            </button>
          </div>
        )}
      </header>

      {file ? (
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Main Workspace */}
          <div className="flex-1 flex flex-col bg-slate-200/50 relative overflow-hidden order-2 md:order-1">
            {/* Top Toolbar */}
            <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 overflow-x-auto gap-4">
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => setActiveTool('select')}
                  className={`p-2 rounded-md ${activeTool === 'select' ? 'bg-slate-100 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`} title="Select"
                >
                  <MousePointer2 size={16} />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button 
                  onClick={() => setActiveTool('text')}
                  className={`p-2 rounded-md ${activeTool === 'text' ? 'bg-slate-100 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`} title="Add Text"
                >
                  <Type size={16} />
                </button>
                <button 
                  onClick={() => setActiveTool('draw')}
                  className={`p-2 rounded-md ${activeTool === 'draw' ? 'bg-slate-100 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`} title="Draw"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => setActiveTool('erase')}
                  className={`p-2 rounded-md ${activeTool === 'erase' ? 'bg-slate-100 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`} title="Erase"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1 text-slate-500 hover:text-slate-700 hover:bg-white rounded">
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-semibold w-12 text-center text-slate-700">{zoom}%</span>
                <button onClick={() => setZoom(Math.min(300, zoom + 25))} className="p-1 text-slate-500 hover:text-slate-700 hover:bg-white rounded">
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Document Container */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center">
              <div 
                className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 w-full max-w-3xl aspect-[1/1.4] relative flex flex-col items-center justify-center text-slate-400"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                <FileText size={64} className="opacity-20 mb-4" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs opacity-60 mt-1">Ready for editing</p>
                <div className="absolute inset-x-0 bottom-8 text-center text-[10px] uppercase tracking-widest opacity-40 font-bold">
                  Page 1 / 1
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Page Thumbnails & Tools) */}
          <div className="w-full md:w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 order-1 md:order-2 h-48 md:h-auto border-b md:border-b-0">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Actions</h3>
            </div>
            <div className="p-2 flex gap-2 md:flex-col overflow-x-auto md:overflow-visible">
              <button className="flex items-center gap-3 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap md:whitespace-normal shrink-0">
                <Layers size={16} className="text-blue-500" />
                Merge Files
              </button>
              <button className="flex items-center gap-3 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap md:whitespace-normal shrink-0">
                <Scissors size={16} className="text-orange-500" />
                Split PDF
              </button>
              <button className="flex items-center gap-3 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap md:whitespace-normal shrink-0">
                <FileText size={16} className="text-emerald-500" />
                Extract Text (OCR)
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 hidden md:block border-t border-slate-200 bg-slate-50/50">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pages</h3>
              <div className="space-y-4">
                {/* Mock Thumbnail */}
                <div className="aspect-[1/1.4] bg-white border-2 border-red-500 shadow-sm rounded flex items-center justify-center relative cursor-pointer">
                  <span className="text-[10px] font-bold text-slate-400 absolute bottom-2">1</span>
                  <FileText size={24} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-white border border-slate-200 m-4 md:m-8 rounded-2xl shadow-sm border-dashed">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">PDF Editor</h2>
          <p className="text-slate-500 max-w-sm mb-8 text-sm md:text-base">Upload a PDF document to start editing, annotating, signing, or extracting pages.</p>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-3 w-full max-w-sm"
          >
            <Upload size={18} /> Select PDF File
          </button>
          
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-8 w-full max-w-sm hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm font-semibold text-slate-600">Or drag & drop here</p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF up to 25MB</p>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="application/pdf"
          />
        </div>
      )}
    </div>
  );
};
