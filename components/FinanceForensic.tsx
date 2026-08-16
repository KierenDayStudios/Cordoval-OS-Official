
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  PieChart, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Zap,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Search,
  X,
  ChevronRight,
  Table
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { AppView, Document, Spreadsheet, LedgerProject } from '../types';
import { storage } from '../storage';

interface FinanceForensicProps {
  onSaveDoc: (doc: Document) => void;
  onSaveSheet: (sheet: Spreadsheet) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Depth = 'summary' | 'audit' | 'tax';
type Goal = 'waste' | 'profit' | 'forecast';

export const FinanceForensic: React.FC<FinanceForensicProps> = ({ 
  onSaveDoc, 
  onSaveSheet,
  onNavigate, 
  onBack 
}) => {
  const [period, setPeriod] = useState('');
  const [guidance, setGuidance] = useState('');
  const [depth, setDepth] = useState<Depth>('audit');
  const [goal, setGoal] = useState<Goal>('profit');
  const [currency, setCurrency] = useState('USD');
  const [ledgerSync, setLedgerSync] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceFile(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const startAudit = async () => {
    if (!period || !sourceFile) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // We'll use JSON output to get structured data for the spreadsheet and ledger
      const prompt = `
        You are "The Finance Forensic", a high-level financial auditor and strategist.
        
        TASK: Analyze the provided financial data and generate a structured audit.
        
        INPUTS:
        - PERIOD: ${period}
        - GUIDANCE: ${guidance || 'None'}
        - DEPTH: ${depth}
        - GOAL: ${goal}
        - CURRENCY: ${currency}
        - SOURCE DATA: ${sourceFile}
        
        REQUIREMENTS:
        1. Categorize every transaction found in the source data.
        2. Calculate total income, total expenses, and net profit/loss.
        3. Identify anomalies or duplicate charges if requested (Alerts: ${showAlerts}).
        4. Provide a forecast for the next month based on trends.
        
        OUTPUT FORMAT: You must return a JSON object with the following structure:
        {
          "spreadsheetData": {
            "title": "Audit - ${period}",
            "cells": {
              "A1": "Date", "B1": "Description", "C1": "Category", "D1": "Amount",
              "A2": "2026-03-01", "B2": "Example Transaction", "C2": "Software", "D2": "-29.99",
              ... more cells ...
              "F1": "SUMMARY",
              "F2": "Total Income", "G2": "5000.00",
              "F3": "Total Expenses", "G3": "2500.00",
              "F4": "Net Profit", "G4": "2500.00"
            }
          },
          "ledgerTotals": {
            "income": 5000.00,
            "expenses": 2500.00
          },
          "analysisReport": "Markdown formatted summary of findings, anomalies, and strategic advice."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a precise financial auditor. Extract data accurately from messy CSV or text inputs. Always return valid JSON."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      // 1. Save Spreadsheet
      const newSheet: Spreadsheet = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.spreadsheetData?.title || `Audit - ${period}`,
        data: result.spreadsheetData?.cells || {},
        updatedAt: Date.now(),
        tags: ['audit', 'finance', period],
        folderId: null,
        history: []
      };
      onSaveSheet(newSheet);

      // 2. Update Ledger if sync is on
      if (ledgerSync) {
        const ledgers = await storage.list('ledger');
        let project: LedgerProject;
        if (ledgers.length === 0) {
          project = {
            id: 'default-ledger',
            name: 'Main Ledger',
            updatedAt: Date.now(),
            tags: ['finance'],
            folderId: null,
            history: [],
            currency: currency,
            entries: []
          };
        } else {
          project = ledgers[0].data;
        }

        // Add summary entries
        if (result.ledgerTotals?.income > 0) {
          project.entries.unshift({
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            description: `Audit Income - ${period}`,
            amount: result.ledgerTotals.income,
            category: 'Audit Adjustment',
            type: 'income'
          });
        }
        if (result.ledgerTotals?.expenses > 0) {
          project.entries.unshift({
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            description: `Audit Expenses - ${period}`,
            amount: result.ledgerTotals.expenses,
            category: 'Audit Adjustment',
            type: 'expense'
          });
        }
        project.updatedAt = Date.now();
        await storage.save('ledger', { id: project.id, name: project.name, data: project, updatedAt: project.updatedAt, type: 'ledger' });
      }

      // 3. Save Analysis Report as Doc
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Analysis Report - ${period}`,
        content: result.analysisReport || "No report generated.",
        updatedAt: Date.now(),
        tags: ['audit-report', 'finance'],
        folderId: null,
        history: []
      };
      onSaveDoc(newDoc);

      // 4. Navigate to Sheets
      onNavigate('sheets', newSheet.id);

    } catch (error) {
      console.error("Audit failed:", error);
      alert("Failed to process financial data. Ensure the file is readable.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/20 border border-amber-500/30 rounded-lg md:rounded-xl flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10 shrink-0">
              <PieChart size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tight italic truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The Finance Forensic</h1>
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Neural Audit Engine</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Audit Ready</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Reporting Period</label>
                <input 
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g., March 2026 or Q1"
                  className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-amber-500/50 outline-none transition-all text-sm md:text-lg font-bold text-white placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-amber-500/50 outline-none transition-all text-sm md:text-lg font-bold text-white appearance-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Look for why my subscription costs are so high..."
                className="w-full px-4 md:px-8 py-4 md:py-6 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:border-amber-500/50 outline-none transition-all text-xs md:text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[80px] md:min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Depth Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Analysis Depth</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={depth === 'summary'} 
                    onClick={() => setDepth('summary')} 
                    label="Summary" 
                    desc="Quick Look"
                  />
                  <OptionCard 
                    active={depth === 'audit'} 
                    onClick={() => setDepth('audit')} 
                    label="Audit" 
                    desc="Detailed"
                  />
                  <OptionCard 
                    active={depth === 'tax'} 
                    onClick={() => setDepth('tax')} 
                    label="Tax-Ready" 
                    desc="Categorized"
                  />
                </div>
              </div>

              {/* Goal Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4">Primary Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={goal === 'waste'} 
                    onClick={() => setGoal('waste')} 
                    label="Waste" 
                    desc="Cut Costs"
                  />
                  <OptionCard 
                    active={goal === 'profit'} 
                    onClick={() => setGoal('profit')} 
                    label="Profit" 
                    desc="P&L Focus"
                  />
                  <OptionCard 
                    active={goal === 'forecast'} 
                    onClick={() => setGoal('forecast')} 
                    label="Forecast" 
                    desc="Next Month"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button 
                onClick={() => setLedgerSync(!ledgerSync)}
                className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between ${ledgerSync ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <TrendingUp size={16} className={`md:w-5 md:h-5 ${ledgerSync ? 'text-amber-500' : 'text-slate-600'}`} />
                  <div className="text-left">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Ledger Sync</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Auto-update Finance Tool</p>
                  </div>
                </div>
                {ledgerSync && <CheckCircle2 size={14} className="md:w-4 md:h-4 text-amber-500" />}
              </button>

              <button 
                onClick={() => setShowAlerts(!showAlerts)}
                className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between ${showAlerts ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <AlertTriangle size={16} className={`md:w-5 md:h-5 ${showAlerts ? 'text-amber-500' : 'text-slate-600'}`} />
                  <div className="text-left">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Anomaly Alerts</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Highlight Duplicates</p>
                  </div>
                </div>
                {showAlerts && <CheckCircle2 size={14} className="md:w-4 md:h-4 text-amber-500" />}
              </button>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-slate-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/10 text-amber-500 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tight">Financial Source Material</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Bank Statements (CSV/PDF) or Receipts</p>
                </div>
              </div>
              {fileName && (
                <button onClick={() => { setSourceFile(null); setFileName(null); }} className="text-rose-500 hover:text-rose-600 p-1">
                  <X size={14} className="md:w-4 md:h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full py-10 md:py-16 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={32} className="md:w-10 md:h-10 text-amber-500" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-white truncate max-w-[200px] md:max-w-none">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Data Ingested Successfully</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="md:w-10 md:h-10 text-slate-800" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-400">Drop financial data here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">CSV, PDF, or TXT supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Start Button */}
          <button 
            onClick={startAudit}
            disabled={!period || !sourceFile || isGenerating}
            className={`w-full h-16 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center gap-3 md:gap-4 transition-all ${!period || !sourceFile || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-400 shadow-2xl shadow-amber-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Crunching Numbers...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Initialize Financial Audit</span>
                <ChevronRight size={16} className="md:w-5 md:h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-amber-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <DollarSign size={32} className="absolute inset-0 m-auto text-amber-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Categorizing Transactions...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is auditing your cashflow</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/5' : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/10'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
