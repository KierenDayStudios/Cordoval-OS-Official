
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, History, Trash2, Hash, 
  RotateCcw, Zap, Clock, Calculator as CalcIcon,
  ChevronRight, Divide, X, Minus, Plus, Equal
} from 'lucide-react';

interface Calculation {
  expression: string;
  result: string;
  timestamp: number;
}

export const AdvancedCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [isScientific, setIsScientific] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isRadians, setIsRadians] = useState(true);

  const handleNumber = (num: string) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error' || prev === 'Infinity') return num;
      return prev + num;
    });
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      // Basic math evaluation for standard ops
      const sanitized = fullExpression.replace(/[^-()\d/*+.]/g, '');
      const result = Function('"use strict";return (' + sanitized + ')')();
      
      const newCalc: Calculation = {
        expression: fullExpression,
        result: result.toString(),
        timestamp: Date.now()
      };
      
      setHistory(prev => [newCalc, ...prev].slice(0, 20));
      setDisplay(result.toString());
      setExpression('');
    } catch (err) {
      setDisplay('Error');
    }
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const handleScientific = (func: string) => {
    let val = parseFloat(display);
    let result = 0;

    // Convert to Radians if input is in Degrees for trig functions
    const angle = isRadians ? val : (val * Math.PI) / 180;

    switch(func) {
      case 'sin': result = Math.sin(angle); break;
      case 'cos': result = Math.cos(angle); break;
      case 'tan': result = Math.tan(angle); break;
      case 'asin': result = Math.asin(val); break;
      case 'acos': result = Math.acos(val); break;
      case 'atan': result = Math.atan(val); break;
      case 'sqrt': result = Math.sqrt(val); break;
      case 'log': result = Math.log10(val); break;
      case 'ln': result = Math.log(val); break;
      case 'fact': result = factorial(val); break;
      case 'sq': result = Math.pow(val, 2); break;
      case 'cu': result = Math.pow(val, 3); break;
      case 'inv': result = 1 / val; break;
      case 'pow': setExpression(display + ' ** '); setDisplay('0'); return;
      case 'pi': setDisplay(Math.PI.toString()); return;
      case 'e': setDisplay(Math.E.toString()); return;
    }

    // Convert back to degrees for inverse trig if needed
    if (!isRadians && ['asin', 'acos', 'atan'].includes(func)) {
      result = (result * 180) / Math.PI;
    }

    setDisplay(Number.isFinite(result) ? result.toString() : 'Error');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F0F2F5] overflow-hidden font-sans">
      <header className="px-4 md:px-8 py-4 md:h-20 flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-slate-200 shrink-0 z-50 shadow-sm gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
               <CalcIcon size={16} className="md:w-5 md:h-5" />
             </div>
             <div>
               <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tighter uppercase truncate">Advanced Calculator</h1>
               <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">High-Precision Computation</p>
             </div>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsRadians(!isRadians)}
            className={`h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isRadians ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
          >
            {isRadians ? 'Radians' : 'Degrees'}
          </button>
          <button 
            onClick={() => setIsScientific(!isScientific)}
            className={`h-8 md:h-10 px-4 md:px-6 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isScientific ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {isScientific ? 'Full Suite' : 'Basic'}
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${showHistory ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-white border border-transparent hover:border-slate-200'}`}
          >
            <History size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-100/30 overflow-y-auto">
          <div className={`w-full transition-all duration-500 ${isScientific ? 'max-w-3xl' : 'max-w-md'} bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl border border-white flex flex-col gap-6 md:gap-8 animate-in zoom-in-95`}>
             {/* Display Panel */}
             <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-right shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform"><Zap size={40} className="text-white" /></div>
                <div className="flex justify-between items-center mb-2 h-4">
                  <div className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">{isRadians ? 'RAD' : 'DEG'}</div>
                  <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[200px]">{expression}</div>
                </div>
                <div className="text-4xl md:text-6xl font-black text-white tracking-tighter truncate leading-tight">
                  {display}
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-6 md:gap-8">
               {/* Scientific Pad (Left Side when Expanded) */}
               {isScientific && (
                 <div className="flex-1 grid grid-cols-3 gap-2 md:gap-3 animate-in slide-in-from-left-4">
                    <CalcBtn label="sin" onClick={() => handleScientific('sin')} scientific />
                    <CalcBtn label="cos" onClick={() => handleScientific('cos')} scientific />
                    <CalcBtn label="tan" onClick={() => handleScientific('tan')} scientific />
                    <CalcBtn label="sin⁻¹" onClick={() => handleScientific('asin')} scientific />
                    <CalcBtn label="cos⁻¹" onClick={() => handleScientific('acos')} scientific />
                    <CalcBtn label="tan⁻¹" onClick={() => handleScientific('atan')} scientific />
                    <CalcBtn label="ln" onClick={() => handleScientific('ln')} scientific />
                    <CalcBtn label="log" onClick={() => handleScientific('log')} scientific />
                    <CalcBtn label="n!" onClick={() => handleScientific('fact')} scientific />
                    <CalcBtn label="x²" onClick={() => handleScientific('sq')} scientific />
                    <CalcBtn label="x³" onClick={() => handleScientific('cu')} scientific />
                    <CalcBtn label="x^y" onClick={() => handleScientific('pow')} scientific />
                    <CalcBtn label="1/x" onClick={() => handleScientific('inv')} scientific />
                    <CalcBtn label="π" onClick={() => handleScientific('pi')} scientific />
                    <CalcBtn label="e" onClick={() => handleScientific('e')} scientific />
                 </div>
               )}

               {/* Standard Pad */}
               <div className={`grid gap-2 md:gap-3 ${isScientific ? 'w-full md:w-80 grid-cols-4' : 'w-full grid-cols-4'}`}>
                  <CalcBtn label="C" onClick={clear} variant="danger" />
                  <CalcBtn label="(" onClick={() => setDisplay(prev => prev === '0' ? '(' : prev + '(')} variant="alt" />
                  <CalcBtn label=")" onClick={() => setDisplay(prev => prev === '0' ? ')' : prev + ')')} variant="alt" />
                  <button onClick={() => handleOperator('/')} className="h-12 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl font-black hover:bg-indigo-100 transition-all flex items-center justify-center"><Divide size={18} /></button>

                  <CalcBtn label="7" onClick={() => handleNumber('7')} />
                  <CalcBtn label="8" onClick={() => handleNumber('8')} />
                  <CalcBtn label="9" onClick={() => handleNumber('9')} />
                  <button onClick={() => handleOperator('*')} className="h-12 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl font-black hover:bg-indigo-100 transition-all flex items-center justify-center"><X size={18} /></button>

                  <CalcBtn label="4" onClick={() => handleNumber('4')} />
                  <CalcBtn label="5" onClick={() => handleNumber('5')} />
                  <CalcBtn label="6" onClick={() => handleNumber('6')} />
                  <button onClick={() => handleOperator('-')} className="h-12 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl font-black hover:bg-indigo-100 transition-all flex items-center justify-center"><Minus size={18} /></button>

                  <CalcBtn label="1" onClick={() => handleNumber('1')} />
                  <CalcBtn label="2" onClick={() => handleNumber('2')} />
                  <CalcBtn label="3" onClick={() => handleNumber('3')} />
                  <button onClick={() => handleOperator('+')} className="h-12 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl font-black hover:bg-indigo-100 transition-all flex items-center justify-center"><Plus size={18} /></button>

                  <CalcBtn label="0" onClick={() => handleNumber('0')} className="col-span-1" />
                  <CalcBtn label="." onClick={() => setDisplay(prev => prev.includes('.') ? prev : prev + '.')} />
                  <CalcBtn label="√" onClick={() => handleScientific('sqrt')} variant="alt" />
                  <button onClick={calculate} className="h-12 md:h-14 bg-rose-500 text-white rounded-xl md:rounded-2xl font-black hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all flex items-center justify-center"><Equal size={18} /></button>
               </div>
             </div>
          </div>
        </main>

        {showHistory && (
          <aside className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-6 md:p-8 flex flex-col gap-4 md:gap-6 shrink-0 animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-300 h-64 md:h-auto">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-slate-900" /> Session History
                </h3>
                <button onClick={() => setHistory([])} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                     <Hash size={40} className="text-slate-300 mb-4" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No calculations yet</p>
                  </div>
                ) : (
                  history.map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => setDisplay(h.result)}
                      className="group p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-900/10 hover:shadow-lg transition-all cursor-pointer"
                    >
                       <div className="text-[10px] font-bold text-slate-400 truncate mb-1">{h.expression}</div>
                       <div className="text-lg font-black text-slate-900 tracking-tight">= {h.result}</div>
                    </div>
                  ))
                )}
             </div>
          </aside>
        )}
      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-900" /> <span className="hidden sm:inline">SYSTEM: READY</span></span>
           <span className="text-slate-300 hidden sm:inline">|</span>
           <span className="truncate">PRECISION: IEEE-754</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="hidden sm:inline">FLOATING POINT CALIBRATED</span>
        </div>
      </footer>
    </div>
  );
};

const CalcBtn = ({ label, onClick, variant = 'default', scientific = false, className = '' }: any) => {
  const styles: Record<string, string> = {
    default: 'bg-slate-50 text-slate-900 hover:bg-slate-100',
    op: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    accent: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200',
    danger: 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100',
    alt: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
    scientific: 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
  };

  return (
    <button 
      onClick={onClick}
      className={`h-12 md:h-14 rounded-xl md:rounded-2xl font-black transition-all active:scale-95 ${styles[scientific ? 'scientific' : variant]} ${className} ${scientific ? 'text-[9px] md:text-[10px] uppercase tracking-tighter' : 'text-xs md:text-sm'}`}
    >
      {label}
    </button>
  );
};
