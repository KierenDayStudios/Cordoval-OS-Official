import React, { useState, useRef } from 'react';
import { ArrowLeft, BarChart, Download, Upload, PieChart as PieChartIcon, LineChart as LineChartIcon, Settings } from 'lucide-react';
import { BarChart as RBarChart, Bar, LineChart as RLineChart, Line, AreaChart as RAreaChart, Area, PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as htmlToImage from 'html-to-image';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ChartMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKey, setYAxisKey] = useState<string>('');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [chartTitle, setChartTitle] = useState('Data Export');
  
  const chartRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setData(results.data);
            const cols = Object.keys(results.data[0] as object);
            setColumns(cols);
            if (cols.length >= 2) {
              setXAxisKey(cols[0]);
              setYAxisKey(cols[1]);
            }
          }
        }
      });
    }
  };

  const downloadPNG = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `${chartTitle.replace(/\\s+/g, '-').toLowerCase()}-chart.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export chart', err);
        alert('Failed to export chart.');
      }
    }
  };

  return (
    <div className="flex h-full bg-[#FAFAFA] text-slate-800">
      {/* Sidebar Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart size={16} />
            </div>
            <h1 className="font-bold text-slate-900">Chart Maker</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">1. Data Source</label>
             <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer text-slate-500 hover:text-emerald-600">
               <Upload size={24} className="mb-2" />
               <span className="text-sm font-bold">Upload CSV file</span>
               <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
             </label>
             {data.length > 0 && <p className="text-xs font-bold text-emerald-600 mt-2">✓ Loaded {data.length} rows</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Chart Type</label>
            <div className="grid grid-cols-2 gap-2">
               {[
                 { id: 'bar', icon: BarChart, label: 'Bar' },
                 { id: 'line', icon: LineChartIcon, label: 'Line' },
                 { id: 'area', icon: BarChart, label: 'Area' },
                 { id: 'pie', icon: PieChartIcon, label: 'Pie' }
               ].map(type => (
                 <button 
                   key={type.id}
                   onClick={() => setChartType(type.id as any)}
                   className={`p-3 flex flex-col items-center gap-2 rounded-xl border text-xs font-bold transition-all ${chartType === type.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                 >
                   <type.icon size={18} />
                   {type.label}
                 </button>
               ))}
            </div>
          </div>

          {columns.length > 0 && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">3. Data Mapping</label>
              
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">X-Axis (Labels)</label>
                <select 
                  value={xAxisKey}
                  onChange={e => setXAxisKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Y-Axis (Values)</label>
                <select 
                  value={yAxisKey}
                  onChange={e => setYAxisKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-slate-100">
             <button 
               onClick={downloadPNG}
               disabled={data.length === 0}
               className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-900/10"
             >
               <Download size={16} /> Export High-Res PNG
             </button>
          </div>

        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex flex-col items-center bg-slate-50/50">
        
        <input 
          type="text" 
          value={chartTitle}
          onChange={e => setChartTitle(e.target.value)}
          className="text-3xl font-black text-slate-900 bg-transparent border-none outline-none text-center mb-8 max-w-2xl w-full"
          placeholder="Chart Title"
        />

        <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200" ref={chartRef}>
           <div className="mb-6">
             <h2 className="text-xl font-bold text-slate-900">{chartTitle}</h2>
             <p className="text-sm text-slate-500 font-medium mt-1">Generated by Operational Layer</p>
           </div>
           
           <div className="h-[500px] w-full">
             {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <RBarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey={xAxisKey} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={{stroke: '#cbd5e1'}} />
                      <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Legend />
                      <Bar dataKey={yAxisKey} fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </RBarChart>
                  ) : chartType === 'line' ? (
                    <RLineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey={xAxisKey} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={{stroke: '#cbd5e1'}} />
                      <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Legend />
                      <Line type="monotone" dataKey={yAxisKey} stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </RLineChart>
                  ) : chartType === 'area' ? (
                    <RAreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey={xAxisKey} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={{stroke: '#cbd5e1'}} />
                      <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Legend />
                      <Area type="monotone" dataKey={yAxisKey} fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth={3} />
                    </RAreaChart>
                  ) : (
                    <RPieChart>
                       <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                       <Legend />
                       <Pie data={data} dataKey={yAxisKey} nameKey={xAxisKey} cx="50%" cy="50%" outerRadius={200} label>
                         {data.map((_, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                    </RPieChart>
                  )}
                </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <BarChart size={48} className="mb-4 text-slate-200" />
                  <p className="font-bold">Upload a CSV file to render chart</p>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
