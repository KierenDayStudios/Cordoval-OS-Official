
import React, { useState } from 'react';
import { 
  ArrowLeft, BrainCircuit, Plus, Trash2, CheckCircle2, 
  X, Clock, AlertTriangle, ChevronRight, Hash,
  Save, RotateCcw, Info, Activity, Target, Zap
} from 'lucide-react';
import { Decision, DecisionStatus } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface DecisionLogProps {
  activeDecision?: Decision;
  onSave: (decision: Decision) => void;
  onBack: () => void;
}

export const DecisionLog: React.FC<DecisionLogProps> = ({ activeDecision, onSave, onBack }) => {
  const [decision, setDecision] = useState<Decision>(activeDecision || {
    id: 'dec_' + Math.random().toString(36).substr(2, 9),
    name: 'Untitled Decision Point',
    context: '',
    assumptions: '',
    expectedOutcome: '',
    actualOutcome: '',
    status: 'pending',
    updatedAt: Date.now(),
    tags: ['strategic'],
    folderId: null,
    history: []
  });

  const handleUpdate = (updates: Partial<Decision>) => {
    const updated = { ...decision, ...updates, updatedAt: Date.now() };
    setDecision(updated);
    onSave(updated);
  };

  const handleSaveFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decision, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `decision_${decision.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name) {
          setDecision(parsed);
          onSave(parsed);
        }
      } catch (err) {
        alert("Invalid decision log file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F7] overflow-hidden font-sans">
      <header className="px-4 md:px-8 py-4 md:h-20 flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0 shadow-sm gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all shrink-0"><ArrowLeft size={20} className="md:w-5 md:h-5" /></button>
          <div className="flex items-center gap-3 min-w-0">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-50 text-violet-600 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/10 shrink-0">
               <BrainCircuit size={16} className="md:w-5 md:h-5" />
             </div>
             <div className="min-w-0">
               <input 
                value={decision.name}
                onChange={e => handleUpdate({ name: e.target.value })}
                className="bg-transparent font-black text-slate-900 text-base md:text-lg outline-none border-b-2 border-transparent focus:border-violet-100 w-full md:w-80 truncate"
                placeholder="Decision Identifier"
               />
               <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">Rational Accountability Journal</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
           <SaveLoadControls onSave={handleSaveFile} onLoad={handleLoadFile} label="Decision" compact />
           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto scrollbar-hide">
              {(['pending', 'evaluated', 'reversed'] as DecisionStatus[]).map(s => (
                <button 
                  key={s}
                  onClick={() => handleUpdate({ status: s })}
                  className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${decision.status === s ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
           </div>
           <div className="hidden sm:block h-10 w-px bg-slate-200 mx-2" />
           <button onClick={() => { onSave(decision); alert('Reasoning synchronized.'); }} className="w-full sm:w-auto h-10 md:h-11 px-4 md:px-8 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl hover:bg-slate-800 transition-all shrink-0">Sync Reasoning</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 pb-10 md:pb-20">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm space-y-4 md:space-y-8 flex flex-col group transition-all hover:shadow-xl">
                 <div className="flex items-center gap-3 md:gap-4 text-violet-600">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><Info size={20} className="md:w-6 md:h-6" /></div>
                    <h3 className="text-base md:text-lg font-black italic tracking-tight">Context & Background</h3>
                 </div>
                 <textarea 
                  className="flex-1 w-full bg-slate-50 rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-sm md:text-base font-medium text-slate-700 outline-none resize-none border border-transparent focus:ring-4 focus:ring-violet-500/5 transition-all min-h-[150px]"
                  placeholder="Why is this decision being made? What is the current situation?"
                  value={decision.context}
                  onChange={e => handleUpdate({ context: e.target.value })}
                 />
              </section>

              <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm space-y-4 md:space-y-8 flex flex-col group transition-all hover:shadow-xl">
                 <div className="flex items-center gap-3 md:gap-4 text-amber-600">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><AlertTriangle size={20} className="md:w-6 md:h-6" /></div>
                    <h3 className="text-base md:text-lg font-black italic tracking-tight">Underlying Assumptions</h3>
                 </div>
                 <textarea 
                  className="flex-1 w-full bg-slate-50 rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-sm md:text-base font-medium text-slate-700 outline-none resize-none border border-transparent focus:ring-4 focus:ring-amber-500/5 transition-all min-h-[150px]"
                  placeholder="What are we assuming to be true? What risks are we ignoring?"
                  value={decision.assumptions}
                  onChange={e => handleUpdate({ assumptions: e.target.value })}
                 />
              </section>
           </div>

           <section className="bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 text-white relative overflow-hidden group shadow-2xl">
              <Zap size={100} className="absolute -bottom-10 -right-10 md:-bottom-20 md:-right-20 opacity-5 group-hover:scale-110 transition-transform duration-1000 md:w-[200px] md:h-[200px]" />
              <div className="relative z-10 space-y-4 md:space-y-8">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center"><Target size={20} className="md:w-8 md:h-8" /></div>
                    <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Targeted Outcome</h3>
                 </div>
                 <textarea 
                  className="w-full h-32 md:h-40 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-base md:text-xl font-medium text-indigo-100 outline-none resize-none focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="If this decision is correct, what exactly will happen?"
                  value={decision.expectedOutcome}
                  onChange={e => handleUpdate({ expectedOutcome: e.target.value })}
                 />
              </div>
           </section>

           <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm space-y-4 md:space-y-8 flex flex-col transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 md:gap-4 text-emerald-600">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><Activity size={20} className="md:w-6 md:h-6" /></div>
                    <h3 className="text-base md:text-lg font-black italic tracking-tight">Reality Check (Post-Evaluation)</h3>
                 </div>
                 {decision.actualOutcome && <CheckCircle2 className="text-emerald-500 md:w-6 md:h-6" size={20} />}
              </div>
              <textarea 
                className="w-full h-40 md:h-64 bg-emerald-50/30 rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-sm md:text-base font-medium text-slate-700 outline-none resize-none border border-transparent focus:ring-4 focus:ring-emerald-500/5 transition-all"
                placeholder="What actually happened? Compare reality to assumptions..."
                value={decision.actualOutcome}
                onChange={e => handleUpdate({ actualOutcome: e.target.value })}
              />
           </section>

           <div className="p-4 md:p-8 bg-blue-50 border border-blue-100 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row items-start gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0"><BrainCircuit size={20} className="md:w-6 md:h-6" /></div>
              <div>
                 <h4 className="text-[10px] md:text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Rational Optimization</h4>
                 <p className="text-[9px] md:text-[11px] text-blue-700/70 font-medium leading-relaxed uppercase">High-performance leadership is built on high-fidelity feedback loops. Documenting assumptions prevents hindsight bias.</p>
              </div>
           </div>
        </div>
      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-1 md:gap-2 font-mono truncate max-w-[100px] sm:max-w-none"><div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" /> <span className="hidden sm:inline">LOG_ID:</span> {decision.id}</span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="hidden sm:inline">STATUS: {decision.status.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-violet-500">
           <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
           <span className="hidden sm:inline">RATIONAL_VAULT_SYNCED</span><span className="sm:hidden">SYNCED</span>
        </div>
      </footer>
    </div>
  );
};
