
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Briefcase, Plus, Trash2, Download, Eye, Layers, 
  ChevronRight, ChevronLeft, Save, Sparkles, Zap, CheckCircle2,
  FileText, Rocket, Target, BarChart, Users, Settings, Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { BusinessPlan, PlanSection } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface BusinessPlanBuilderProps {
  activePlan?: BusinessPlan;
  onSave: (plan: BusinessPlan) => void;
  onBack: () => void;
}

const DEFAULT_SECTIONS: PlanSection[] = [
  { id: 'exec-summary', title: 'Executive Summary', content: '' },
  { id: 'mission', title: 'Mission & Vision', content: '' },
  { id: 'market', title: 'Market Opportunity', content: '' },
  { id: 'product', title: 'Products & Services', content: '' },
  { id: 'marketing', title: 'Marketing Strategy', content: '' },
  { id: 'financials', title: 'Financial Projections', content: '' }
];

export const BusinessPlanBuilder: React.FC<BusinessPlanBuilderProps> = ({ activePlan, onSave, onBack }) => {
  const [plan, setPlan] = useState<BusinessPlan>(activePlan || {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Untitled Business Plan',
    companyName: '',
    industry: '',
    updatedAt: Date.now(),
    tags: [],
    folderId: null,
    history: [],
    sections: DEFAULT_SECTIONS
  });

  const handleSaveFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `business_plan_${plan.name.replace(/\s+/g, '_').toLowerCase()}.json`);
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
        if (parsed.name && parsed.sections) {
          setPlan(parsed);
          onSave(parsed);
        }
      } catch (err) {
        alert("Invalid Business Plan JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [wizardStep, setWizardStep] = useState<number | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const wizardSteps = [
    { 
      label: 'Core Identity', 
      fields: ['companyName', 'industry'],
      q: 'What is the name of your venture and which industry does it disrupt?'
    },
    { 
      label: 'The Vision', 
      sectionId: 'exec-summary',
      q: 'Summarize the big picture. Why does this company need to exist?'
    },
    { 
      label: 'The Problem', 
      sectionId: 'market',
      q: 'What specific pain point are you solving in the current market?'
    },
    { 
      label: 'The Solution', 
      sectionId: 'product',
      q: 'Describe your product or service in one high-impact paragraph.'
    },
    { 
      label: 'Growth Engine', 
      sectionId: 'marketing',
      q: 'How will you acquire your first 1,000 customers?'
    }
  ];

  const updateSection = (id: string, content: string) => {
    setPlan(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, content } : s)
    }));
  };

  const handleWizardNext = () => {
    if (wizardStep !== null && wizardStep < wizardSteps.length - 1) {
      setWizardStep(wizardStep + 1);
    } else {
      setWizardStep(null);
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    const text = `BUSINESS PLAN: ${plan.name}\nCOMPANY: ${plan.companyName}\nINDUSTRY: ${plan.industry}\n\n` +
      plan.sections.map(s => `--- ${s.title.toUpperCase()} ---\n${s.content}\n\n`).join('');
    
    try {
      const zip = new JSZip();
      zip.file("business_plan.txt", text);
      zip.file("metadata.json", JSON.stringify({
        name: plan.name,
        company: plan.companyName,
        industry: plan.industry,
        exportedAt: new Date().toISOString()
      }, null, 2));
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.name.toLowerCase().replace(/\s+/g, '-')}-archive.zip`;
      a.click();
    } catch (err) {
      console.error("Failed to generate ZIP:", err);
    }
    setIsExporting(false);
  };

  const isWizardActive = wizardStep !== null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9FBFF] overflow-hidden">
      {/* Dynamic Top Bar */}
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 md:gap-6 truncate">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3 truncate">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
               <Briefcase size={18} />
             </div>
             <div className="truncate">
               <input 
                value={plan.name}
                onChange={e => setPlan(prev => ({ ...prev, name: e.target.value }))}
                className="bg-transparent font-black text-slate-900 text-sm md:text-lg outline-none border-b-2 border-transparent focus:border-amber-100 w-32 md:w-64 truncate"
                placeholder="Plan Name"
               />
               <p className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Strategy Architect v1.0</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <SaveLoadControls onSave={handleSaveFile} onLoad={handleLoadFile} label="Plan" compact />
          {!isWizardActive && (
            <button 
              onClick={() => setWizardStep(0)}
              className="h-9 md:h-11 px-3 md:px-6 bg-amber-50 text-amber-600 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] flex items-center gap-2 border border-amber-100 hover:bg-amber-100 transition-all"
            >
              <Sparkles size={14} /> <span className="hidden sm:inline">Launch Wizard</span>
            </button>
          )}
          <button onClick={() => { onSave(plan); alert('Blueprint synced.'); }} className="h-9 md:h-11 px-3 md:px-6 bg-slate-900 text-white rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl active:scale-95 transition-all">Sync</button>
          <button 
            onClick={handleExportZip} 
            disabled={isExporting}
            className="h-9 md:h-11 px-3 md:px-6 bg-white text-slate-600 border border-slate-200 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50"
          >
            {isExporting ? <Archive size={14} className="animate-pulse" /> : <Download size={14} />}
            <span className="hidden sm:inline">{isExporting ? 'Packaging...' : 'Export ZIP'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Navigator (Hidden in Wizard) */}
        {!isWizardActive && (
          <>
            {/* Mobile Section Selector */}
            <div className="md:hidden flex overflow-x-auto p-4 gap-2 bg-white border-b border-slate-100 scrollbar-hide shrink-0">
              {plan.sections.map((s, idx) => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs font-bold ${activeSectionIdx === idx ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-slate-400 bg-slate-50'}`}
                >
                  {idx === 0 && <Rocket size={14} />}
                  {idx === 1 && <Target size={14} />}
                  {idx === 2 && <BarChart size={14} />}
                  {idx === 3 && <Layers size={14} />}
                  {idx === 4 && <Users size={14} />}
                  {idx === 5 && <Settings size={14} />}
                  {s.title}
                </button>
              ))}
            </div>

            <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 p-6 flex-col gap-2 shrink-0 overflow-y-auto">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Plan Structure</h3>
              {plan.sections.map((s, idx) => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-left ${activeSectionIdx === idx ? 'bg-amber-50 text-amber-700 font-black shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {idx === 0 && <Rocket size={16} />}
                  {idx === 1 && <Target size={16} />}
                  {idx === 2 && <BarChart size={16} />}
                  {idx === 3 && <Layers size={16} />}
                  {idx === 4 && <Users size={16} />}
                  {idx === 5 && <Settings size={16} />}
                  <span className="text-xs tracking-tight">{s.title}</span>
                </button>
              ))}
              
              <div className="mt-auto p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Enterprise Detail</h4>
                 <div className="space-y-3">
                   <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Entity</span>
                      <input 
                        value={plan.companyName}
                        onChange={e => setPlan(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full bg-transparent text-xs font-black text-slate-800 outline-none border-b border-slate-200"
                        placeholder="Acme Corp"
                      />
                   </div>
                   <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Focus</span>
                      <input 
                        value={plan.industry}
                        onChange={e => setPlan(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full bg-transparent text-xs font-black text-slate-800 outline-none border-b border-slate-200"
                        placeholder="SaaS / Fintech"
                      />
                   </div>
                 </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content Pane */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center bg-slate-50/30">
          
          {isWizardActive ? (
            <div className="w-full max-w-2xl bg-white rounded-3xl md:rounded-[3rem] shadow-2xl p-6 md:p-16 animate-in zoom-in-95 duration-500 border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-700" style={{ width: `${((wizardStep! + 1) / wizardSteps.length) * 100}%` }} />
               
               <div className="flex items-center gap-3 text-amber-600 font-black text-[8px] md:text-[10px] uppercase tracking-widest mb-6 md:mb-8">
                 <Sparkles size={16} /> Strategy Wizard Step {wizardStep! + 1} of {wizardSteps.length}
               </div>

               <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight italic">
                 {wizardSteps[wizardStep!].q}
               </h2>
               
               <div className="mt-6 md:mt-10">
                 {wizardSteps[wizardStep!].fields ? (
                    <div className="space-y-4 md:space-y-6">
                       {wizardSteps[wizardStep!].fields!.map(f => (
                          <div key={f}>
                            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 md:mb-2">{f.replace(/([A-Z])/g, ' $1')}</label>
                            <input 
                             value={(plan as any)[f]}
                             onChange={e => setPlan(prev => ({ ...prev, [f]: e.target.value }))}
                             className="w-full h-12 md:h-14 px-4 md:px-6 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                             placeholder="Type here..."
                            />
                          </div>
                       ))}
                    </div>
                 ) : (
                    <textarea 
                      value={plan.sections.find(s => s.id === wizardSteps[wizardStep!].sectionId)?.content}
                      onChange={e => updateSection(wizardSteps[wizardStep!].sectionId!, e.target.value)}
                      className="w-full h-48 md:h-64 p-4 md:p-8 bg-slate-50 border-none rounded-2xl md:rounded-3xl font-medium text-slate-700 outline-none resize-none text-base md:text-lg leading-relaxed focus:ring-4 focus:ring-amber-500/5 transition-all"
                      placeholder="Unleash your strategic vision..."
                      autoFocus
                    />
                 )}
               </div>

               <div className="mt-8 md:mt-12 flex justify-between items-center">
                  <button 
                    onClick={() => wizardStep! > 0 ? setWizardStep(wizardStep! - 1) : setWizardStep(null)}
                    className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                  >
                    <ChevronLeft size={16} /> {wizardStep! > 0 ? 'Go Back' : 'Exit Wizard'}
                  </button>
                  <button 
                    onClick={handleWizardNext}
                    className="h-12 md:h-14 px-6 md:px-10 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    {wizardStep! < wizardSteps.length - 1 ? 'Continue' : 'Finalize Plan'} <ChevronRight size={18} />
                  </button>
               </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl space-y-4 md:space-y-8 animate-in fade-in duration-500">
               <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-amber-600 px-6 md:px-10 py-3 md:py-4 flex items-center justify-between">
                     <h2 className="text-white font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-3">
                       <FileText size={16} /> {plan.sections[activeSectionIdx].title}
                     </h2>
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                     </div>
                  </div>
                  <div className="p-6 md:p-10">
                     <textarea 
                        value={plan.sections[activeSectionIdx].content}
                        onChange={e => updateSection(plan.sections[activeSectionIdx].id, e.target.value)}
                        className="w-full min-h-[300px] md:min-h-[400px] bg-transparent border-none outline-none resize-none font-medium text-slate-700 text-base md:text-lg leading-relaxed placeholder:text-slate-100"
                        placeholder="Draft the future of your company here..."
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                       <Users className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                       <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">Executive Summary</h4>
                       <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">Completion: {plan.sections[0].content.length > 50 ? '100%' : 'Drafting'}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                       <BarChart className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                       <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">Financial Pulse</h4>
                       <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">Ready for forecasting</p>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <footer className="h-8 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {plan.sections.length} <span className="hidden sm:inline">STRATEGIC PILLARS</span><span className="sm:hidden">PILLARS</span></span>
          <span className="hidden sm:flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> AUDIT READY</span>
        </div>
        <div className="flex items-center gap-4">
           {isWizardActive && <span className="text-amber-600 animate-pulse italic">Wizard Active</span>}
           <span className="hidden sm:inline text-slate-300">SYSTEM: OPTIMIZED FOR GROWTH</span>
        </div>
      </footer>
    </div>
  );
};
