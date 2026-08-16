
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Table as TableIcon, 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Save,
  BarChart3,
  Filter,
  Baseline,
  Search,
  Zap,
  ChevronDown
} from 'lucide-react';
import { SpreadsheetData, Spreadsheet } from '../types';

interface ExcelAppProps {
  activeSheet?: Spreadsheet;
  onSave: (sheet: Spreadsheet) => void;
  onBack: () => void;
}

export const ExcelApp: React.FC<ExcelAppProps> = ({ activeSheet, onSave, onBack }) => {
  const [sheetName, setSheetName] = useState(activeSheet?.name || 'Financial Forecast 2024');
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [cellData, setCellData] = useState<SpreadsheetData>(activeSheet?.data || {
    'A1': 'Q1 Revenue', 'B1': '45000',
    'A2': 'Q2 Revenue', 'B2': '52000',
    'A3': 'Q3 Revenue', 'B3': '49000',
    'A4': 'Q4 Revenue', 'B4': '61000',
    'A5': 'Annual Total', 'B5': '207000'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const columns = useMemo(() => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), []);
  const rows = useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);

  const handleCellClick = (cellId: string) => setSelectedCell(cellId);
  
  const handleDataChange = (cellId: string, value: string) => {
    setCellData(prev => ({ ...prev, [cellId]: value }));
  };

  // Quick Visualization Data
  const chartData = useMemo(() => {
    return [
      { label: 'Q1', value: parseInt(cellData['B1']) || 0 },
      { label: 'Q2', value: parseInt(cellData['B2']) || 0 },
      { label: 'Q3', value: parseInt(cellData['B3']) || 0 },
      { label: 'Q4', value: parseInt(cellData['B4']) || 0 },
    ];
  }, [cellData]);

  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FC] overflow-hidden">
      
      {/* Excel Ribbon */}
      <div className="bg-rose-700 text-white flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-2 shrink-0 shadow-lg z-20 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-rose-600 rounded-lg transition-all"><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><TableIcon size={18} /></div>
            <input 
              value={sheetName} 
              onChange={(e) => setSheetName(e.target.value)}
              className="bg-transparent border-none outline-none focus:bg-rose-800 px-2 md:px-3 py-1 rounded font-bold text-sm transition-all w-full sm:w-64 text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 self-end sm:self-auto">
          <button 
            onClick={() => setShowChart(!showChart)}
            className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showChart ? 'bg-white text-rose-700' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
          >
            <BarChart3 size={14} /> <span className="hidden sm:inline">Quick Chart</span>
          </button>
          <button onClick={() => setIsSaving(true)} className="px-4 md:px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest border border-rose-500 shadow-sm transition-all">
            {isSaving ? 'Syncing...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Advanced Toolbar */}
      <div className="bg-white border-b border-slate-200 p-2 flex items-center gap-2 overflow-x-auto select-none scrollbar-hide">
        <div className="flex items-center border-r border-slate-100 pr-3 gap-1 shrink-0">
          <button className="p-2 hover:bg-slate-50 rounded text-slate-500"><Undo size={16} /></button>
          <button className="p-2 hover:bg-slate-50 rounded text-slate-500"><Redo size={16} /></button>
        </div>
        <div className="flex items-center border-r border-slate-100 px-3 gap-1 shrink-0">
          <button className="p-2 hover:bg-slate-50 rounded text-slate-700 font-bold"><Bold size={16} /></button>
          <button className="p-2 hover:bg-slate-50 rounded text-slate-700"><Italic size={16} /></button>
          <button className="p-2 hover:bg-slate-50 rounded text-slate-700"><Baseline size={16} /></button>
        </div>
        <div className="flex items-center border-r border-slate-100 px-3 gap-2 shrink-0">
           <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">Formatting:</div>
           <button className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase border border-rose-100 flex items-center gap-1.5">
             <Zap size={12} /> <span className="hidden sm:inline">Auto-Color Logic</span>
           </button>
           <button className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase border border-slate-100 flex items-center gap-1.5">
             <Filter size={12} /> <span className="hidden sm:inline">Filter Range</span>
           </button>
        </div>
        <div className="ml-auto px-2 md:px-4 flex items-center gap-2 shrink-0">
          <div className="w-10 md:w-12 h-7 flex items-center justify-center bg-slate-900 text-white text-[10px] font-black rounded lowercase">{selectedCell}</div>
          <div className="italic text-slate-300 font-serif font-black px-1">fx</div>
          <input 
            className="w-32 sm:w-48 md:w-64 h-8 px-2 md:px-3 text-sm bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/10 text-slate-600"
            value={cellData[selectedCell] || ''}
            onChange={(e) => handleDataChange(selectedCell, e.target.value)}
            placeholder="Value..."
          />
        </div>
      </div>

      {/* Sheet & Chart Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SVG Chart Overlay */}
        {showChart && (
          <div className="absolute top-4 md:top-10 right-4 md:right-10 z-40 w-[calc(100%-2rem)] md:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Revenue Projection</h3>
              <button onClick={() => setShowChart(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><ChevronDown size={20} /></button>
            </div>
            <div className="h-48 flex items-end justify-around gap-4 px-4 border-b border-slate-100 pb-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                   <div 
                    className="w-full bg-rose-500 rounded-t-lg transition-all duration-1000 shadow-lg shadow-rose-500/20"
                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                   />
                   <span className="text-[10px] font-black text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid Area */}
        <div className="flex-1 overflow-auto bg-slate-200/30">
          <table className="border-collapse table-fixed bg-white min-w-full">
            <thead>
              <tr className="sticky top-0 z-30">
                <th className="w-12 bg-slate-50 border border-slate-300"></th>
                {columns.map(col => (
                  <th key={col} className={`w-36 bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-400 uppercase py-2 ${selectedCell.startsWith(col) ? 'bg-rose-50 text-rose-600' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row}>
                  <td className={`bg-slate-50 border border-slate-200 text-center text-[10px] font-black text-slate-400 sticky left-0 z-20 w-12 ${selectedCell.endsWith(row.toString()) ? 'bg-rose-50 text-rose-600' : ''}`}>
                    {row}
                  </td>
                  {columns.map(col => {
                    const cellId = `${col}${row}`;
                    const isActive = selectedCell === cellId;
                    const value = cellData[cellId] || '';
                    
                    // Conditional Formatting Logic
                    const isNumeric = !isNaN(parseFloat(value));
                    const numValue = parseFloat(value);
                    const formatClass = isNumeric && numValue > 50000 ? 'text-rose-600 font-bold' : isNumeric && numValue < 0 ? 'text-rose-500' : 'text-slate-700';

                    return (
                      <td 
                        key={cellId}
                        onClick={() => handleCellClick(cellId)}
                        className={`border border-slate-100 h-9 px-3 text-sm relative cursor-cell transition-colors overflow-hidden ${isActive ? 'ring-2 ring-rose-500 ring-inset z-10 bg-rose-50/20' : 'hover:bg-slate-50/50'}`}
                      >
                        <span className={`truncate w-full block ${formatClass}`}>
                          {value}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="h-8 bg-white border-t border-slate-200 px-4 md:px-6 flex items-center justify-between">
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 md:gap-4">
            <span>READY</span>
            <div className="hidden sm:block w-px h-3 bg-slate-100" />
            <span className="text-rose-600 hidden sm:inline">AVERAGE: {Math.round(chartData.reduce((a,b)=>a+b.value,0)/4)}</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase hidden sm:inline">Synced to Vault</span>
         </div>
      </footer>
    </div>
  );
};
