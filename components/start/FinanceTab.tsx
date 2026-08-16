import React, { useState, useEffect } from 'react';
import { 
  DollarSign, PieChart, Receipt, TrendingUp, Calculator, ShieldCheck, 
  BookOpen, FileText, Calendar, ArrowUpRight, ArrowDownRight, Plus, Trash2, 
  CheckCircle2, AlertCircle, Percent, BarChart3, RefreshCw, Wallet, Building, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FinanceSubView = 
  | 'overview' 
  | 'budgeting' 
  | 'invoicing' 
  | 'expenses' 
  | 'revenue' 
  | 'profit' 
  | 'projections' 
  | 'education' 
  | 'calculators' 
  | 'tax' 
  | 'cashflow';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
}

interface RevenueItem {
  id: string;
  source: string;
  amount: number;
  type: 'MRR' | 'One-off' | 'Services';
  date: string;
}

export const FinanceTab: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<FinanceSubView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent state with 100% clean defaults (zero hardcoded placeholders)
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('cordoval_finance_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('cordoval_finance_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('cordoval_finance_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [revenues, setRevenues] = useState<RevenueItem[]>(() => {
    const saved = localStorage.getItem('cordoval_finance_revenues');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cordoval_finance_budgets', JSON.stringify(budgets));
  }, [budgets]);
  useEffect(() => {
    localStorage.setItem('cordoval_finance_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('cordoval_finance_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('cordoval_finance_revenues', JSON.stringify(revenues));
  }, [revenues]);

  // Calculations
  const totalRevenue = revenues.reduce((acc, r) => acc + r.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Form states for adding items
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAllocated, setNewBudgetAllocated] = useState('');
  const [newBudgetSpent, setNewBudgetSpent] = useState('');

  const [newInvoiceClient, setNewInvoiceClient] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceDue, setNewInvoiceDue] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');

  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Software');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('');

  const [newRevenueSource, setNewRevenueSource] = useState('');
  const [newRevenueAmount, setNewRevenueAmount] = useState('');
  const [newRevenueType, setNewRevenueType] = useState<'MRR' | 'One-off' | 'Services'>('MRR');
  const [newRevenueDate, setNewRevenueDate] = useState('');

  // Handlers for adding
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName || !newBudgetAllocated) return;
    const item: BudgetCategory = {
      id: Date.now().toString(),
      name: newBudgetName,
      allocated: parseFloat(newBudgetAllocated),
      spent: newBudgetSpent ? parseFloat(newBudgetSpent) : 0
    };
    setBudgets([...budgets, item]);
    setNewBudgetName('');
    setNewBudgetAllocated('');
    setNewBudgetSpent('');
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceClient || !newInvoiceAmount) return;
    const inv: Invoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      client: newInvoiceClient,
      amount: parseFloat(newInvoiceAmount),
      dueDate: newInvoiceDue || new Date().toISOString().split('T')[0],
      status: newInvoiceStatus
    };
    setInvoices([inv, ...invoices]);
    setNewInvoiceClient('');
    setNewInvoiceAmount('');
    setNewInvoiceDue('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) return;
    const exp: Expense = {
      id: Date.now().toString(),
      title: newExpenseTitle,
      category: newExpenseCategory,
      amount: parseFloat(newExpenseAmount),
      date: newExpenseDate || new Date().toISOString().split('T')[0]
    };
    setExpenses([exp, ...expenses]);
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setNewExpenseDate('');
  };

  const handleAddRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevenueSource || !newRevenueAmount) return;
    const rev: RevenueItem = {
      id: Date.now().toString(),
      source: newRevenueSource,
      amount: parseFloat(newRevenueAmount),
      type: newRevenueType,
      date: newRevenueDate || new Date().toISOString().split('T')[0]
    };
    setRevenues([rev, ...revenues]);
    setNewRevenueSource('');
    setNewRevenueAmount('');
    setNewRevenueDate('');
  };

  // Handlers for deleting items
  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleDeleteRevenue = (id: string) => {
    setRevenues(revenues.filter(r => r.id !== id));
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all finance records?')) {
      setBudgets([]);
      setInvoices([]);
      setExpenses([]);
      setRevenues([]);
      localStorage.removeItem('cordoval_finance_budgets');
      localStorage.removeItem('cordoval_finance_invoices');
      localStorage.removeItem('cordoval_finance_expenses');
      localStorage.removeItem('cordoval_finance_revenues');
    }
  };

  // Calculator states
  const [calcPrincipal, setCalcPrincipal] = useState<number>(10000);
  const [calcRate, setCalcRate] = useState<number>(8);
  const [calcYears, setCalcYears] = useState<number>(5);
  const compoundFutureValue = calcPrincipal * Math.pow(1 + calcRate / 100, calcYears);

  // Tax Estimator states
  const [taxableIncome, setTaxableIncome] = useState<number>(120000);
  const estimatedTax = taxableIncome * 0.21;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Finance Top Navigation Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black shadow-inner">
            <DollarSign size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Finance Workspace</h1>
            <p className="text-xs text-slate-500 font-medium">Sovereign treasury, custom budgeting, forecasting, and automated accounting.</p>
          </div>
        </div>

        {/* Quick Metrics Bar & Reset Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Revenue</span>
              <span className="font-black text-emerald-600">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Net Profit</span>
              <span className="font-black text-slate-900">${netProfit.toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Margin</span>
              <span className="font-black text-indigo-600">{profitMargin}%</span>
            </div>
          </div>
          
          <button 
            onClick={handleClearAllData}
            title="Clear all finance records"
            className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={16} />
            <span className="hidden md:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Container Layout with Sub-sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Menu Button on Mobile */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider border border-slate-700 cursor-pointer active:scale-95 transition-transform"
          >
            <BarChart3 size={16} /> Tools Menu
          </button>
        </div>

        {/* Floating Sidebar Drawer & Backdrop on Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl p-6 flex flex-col gap-2 overflow-y-auto lg:hidden border-r border-slate-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Financial Tools</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
                  >
                    ✕
                  </button>
                </div>

                {[
                  { id: 'overview', label: 'Financial Overview', icon: BarChart3 },
                  { id: 'budgeting', label: '1. Budgeting', icon: PieChart },
                  { id: 'invoicing', label: '2. Invoicing', icon: FileText },
                  { id: 'expenses', label: '3. Expenses', icon: Receipt },
                  { id: 'revenue', label: '4. Revenue Tracking', icon: TrendingUp },
                  { id: 'profit', label: '5. Profit Calculator', icon: Calculator },
                  { id: 'projections', label: '6. Business Projections', icon: Building },
                  { id: 'education', label: '7. Investment Education', icon: BookOpen },
                  { id: 'calculators', label: '8. Financial Calculators', icon: Percent },
                  { id: 'tax', label: '9. Tax Planning Tools', icon: ShieldCheck },
                  { id: 'cashflow', label: '10. Cash-Flow Forecast', icon: RefreshCw },
                ].map(tool => {
                  const Icon = tool.icon;
                  const isActive = activeSubView === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveSubView(tool.id as FinanceSubView);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="truncate">{tool.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* Sidebar Navigation for Tools */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-1 overflow-y-auto flex-shrink-0 hidden lg:flex">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Financial Tools</span>
          
          {[
            { id: 'overview', label: 'Financial Overview', icon: BarChart3 },
            { id: 'budgeting', label: '1. Budgeting', icon: PieChart },
            { id: 'invoicing', label: '2. Invoicing', icon: FileText },
            { id: 'expenses', label: '3. Expenses', icon: Receipt },
            { id: 'revenue', label: '4. Revenue Tracking', icon: TrendingUp },
            { id: 'profit', label: '5. Profit Calculator', icon: Calculator },
            { id: 'projections', label: '6. Business Projections', icon: Building },
            { id: 'education', label: '7. Investment Education', icon: BookOpen },
            { id: 'calculators', label: '8. Financial Calculators', icon: Percent },
            { id: 'tax', label: '9. Tax Planning Tools', icon: ShieldCheck },
            { id: 'cashflow', label: '10. Cash-Flow Forecast', icon: RefreshCw },
          ].map(tool => {
            const Icon = tool.icon;
            const isActive = activeSubView === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveSubView(tool.id as FinanceSubView)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                <span className="truncate">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {/* Mobile subview selector */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'budgeting', label: 'Budget' },
              { id: 'invoicing', label: 'Invoices' },
              { id: 'expenses', label: 'Expenses' },
              { id: 'revenue', label: 'Revenue' },
              { id: 'profit', label: 'Profit' },
              { id: 'projections', label: 'Projections' },
              { id: 'education', label: 'Education' },
              { id: 'calculators', label: 'Calculators' },
              { id: 'tax', label: 'Tax' },
              { id: 'cashflow', label: 'Cash-Flow' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveSubView(t.id as FinanceSubView)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  activeSubView === t.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* OVERVIEW */}
            {activeSubView === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                      <ArrowUpRight className="text-emerald-500" size={20} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">${totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-emerald-600 font-semibold">Live aggregate from revenue logs</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
                      <ArrowDownRight className="text-rose-500" size={20} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">${totalExpenses.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 font-semibold">Live aggregate from expense logs</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Net Profitability</span>
                      <DollarSign className="text-indigo-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-slate-900">${netProfit.toLocaleString()}</div>
                    <p className="text-xs text-indigo-600 font-semibold">{profitMargin}% Net Profit Margin</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quick Financial Health Check</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-bold text-emerald-900">Sovereign Data Storage</h4>
                        <p className="text-emerald-700 mt-1">All entries are persisted locally in your browser with instant deletion and customization controls.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3">
                      <CheckCircle2 className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-bold text-indigo-900">Zero Placeholder Bloat</h4>
                        <p className="text-indigo-700 mt-1">Every table and ledger starts completely clean so you can input your exact business figures.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* BUDGETING (Fully customizable with add & delete) */}
            {activeSubView === 'budgeting' && (
              <motion.div key="budgeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Departmental Budgeting</h2>
                  <p className="text-xs text-slate-500">Create, customize, monitor, and delete departmental expenditure budgets.</p>
                </div>

                {/* Add Budget Form */}
                <form onSubmit={handleAddBudget} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Add Custom Budget Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Category Name (e.g. R&D / Engineering)" 
                      value={newBudgetName} 
                      onChange={e => setNewBudgetName(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input 
                      type="number" 
                      placeholder="Allocated Limit ($)" 
                      value={newBudgetAllocated} 
                      onChange={e => setNewBudgetAllocated(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input 
                      type="number" 
                      placeholder="Current Spent ($)" 
                      value={newBudgetSpent} 
                      onChange={e => setNewBudgetSpent(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
                    Add Budget Category
                  </button>
                </form>

                {/* Budget List */}
                <div className="space-y-4">
                  {budgets.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                      <PieChart className="mx-auto text-slate-300" size={40} />
                      <p className="text-xs font-bold text-slate-500">No budget categories created yet. Add your first budget above.</p>
                    </div>
                  ) : (
                    budgets.map(b => {
                      const pct = b.allocated > 0 ? Math.min(100, Math.round((b.spent / b.allocated) * 100)) : 0;
                      return (
                        <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex justify-between items-center text-xs font-black">
                            <span className="text-slate-900 uppercase tracking-wide">{b.name}</span>
                            <div className="flex items-center gap-4">
                              <span className={pct > 90 ? 'text-rose-600' : 'text-slate-600'}>
                                ${b.spent.toLocaleString()} / ${b.allocated.toLocaleString()} ({pct}%)
                              </span>
                              <button 
                                onClick={() => handleDeleteBudget(b.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Delete Budget"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* INVOICING */}
            {activeSubView === 'invoicing' && (
              <motion.div key="invoicing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Client Invoicing</h2>
                  <p className="text-xs text-slate-500">Create, track, manage, and delete client bills and receivables.</p>
                </div>

                {/* New Invoice Form */}
                <form onSubmit={handleAddInvoice} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Create New Invoice</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Client Name / Company" 
                      value={newInvoiceClient} 
                      onChange={e => setNewInvoiceClient(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input 
                      type="number" 
                      placeholder="Amount ($)" 
                      value={newInvoiceAmount} 
                      onChange={e => setNewInvoiceAmount(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input 
                      type="date" 
                      value={newInvoiceDue} 
                      onChange={e => setNewInvoiceDue(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <select 
                      value={newInvoiceStatus}
                      onChange={e => setNewInvoiceStatus(e.target.value as 'Paid' | 'Pending' | 'Overdue')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
                    Issue Invoice
                  </button>
                </form>

                {/* Invoices Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {invoices.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <FileText className="mx-auto text-slate-300" size={40} />
                      <p className="text-xs font-bold text-slate-500">No invoices logged yet. Issue an invoice above to begin tracking receivables.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                          <th className="p-4">Invoice ID</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-900">{inv.id}</td>
                            <td className="p-4 text-slate-700">{inv.client}</td>
                            <td className="p-4 font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
                            <td className="p-4 text-slate-500">{inv.dueDate}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                                inv.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Delete Invoice"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* EXPENSES */}
            {activeSubView === 'expenses' && (
              <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Expense Tracking</h2>
                  <p className="text-xs text-slate-500">Log, categorize, and delete business expenditures.</p>
                </div>

                <form onSubmit={handleAddExpense} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Log New Expense</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Expense Title" 
                      value={newExpenseTitle} 
                      onChange={e => setNewExpenseTitle(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <select 
                      value={newExpenseCategory} 
                      onChange={e => setNewExpenseCategory(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Software">Software</option>
                      <option value="Legal">Legal</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Travel">Travel</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Amount ($)" 
                      value={newExpenseAmount} 
                      onChange={e => setNewExpenseAmount(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input 
                      type="date" 
                      value={newExpenseDate} 
                      onChange={e => setNewExpenseDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
                    Add Expense
                  </button>
                </form>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {expenses.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <Receipt className="mx-auto text-slate-300" size={40} />
                      <p className="text-xs font-bold text-slate-500">No expenses logged yet. Add your expenditures above.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                          <th className="p-4">Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {expenses.map(exp => (
                          <tr key={exp.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-900">{exp.title}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{exp.date}</td>
                            <td className="p-4 font-bold text-rose-600">-${exp.amount.toLocaleString()}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Delete Expense"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* REVENUE TRACKING */}
            {activeSubView === 'revenue' && (
              <motion.div key="revenue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Revenue Tracking & Streams</h2>
                  <p className="text-xs text-slate-500">Add, manage, and delete incoming revenue streams, MRR, and client inflows.</p>
                </div>

                <form onSubmit={handleAddRevenue} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Log New Revenue Stream</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Source / Client Name" 
                      value={newRevenueSource} 
                      onChange={e => setNewRevenueSource(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <select 
                      value={newRevenueType} 
                      onChange={e => setNewRevenueType(e.target.value as 'MRR' | 'One-off' | 'Services')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="MRR">MRR</option>
                      <option value="Services">Services</option>
                      <option value="One-off">One-off</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Amount ($)" 
                      value={newRevenueAmount} 
                      onChange={e => setNewRevenueAmount(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input 
                      type="date" 
                      value={newRevenueDate} 
                      onChange={e => setNewRevenueDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
                    Add Revenue
                  </button>
                </form>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {revenues.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <TrendingUp className="mx-auto text-slate-300" size={40} />
                      <p className="text-xs font-bold text-slate-500">No revenue streams logged yet. Add your revenue streams above.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                          <th className="p-4">Revenue Stream</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {revenues.map(rev => (
                          <tr key={rev.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-900">{rev.source}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                {rev.type}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{rev.date}</td>
                            <td className="p-4 font-bold text-emerald-600">+${rev.amount.toLocaleString()}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleDeleteRevenue(rev.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Delete Revenue"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* PROFIT CALCULATOR */}
            {activeSubView === 'profit' && (
              <motion.div key="profit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Profit Calculator & Margin Analyzer</h2>
                  <p className="text-xs text-slate-500">Calculate gross profit, net margins, and break-even points based on your real logs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Margin Metrics</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Total Revenue:</span>
                        <span className="font-bold text-slate-900">${totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Total Expenses:</span>
                        <span className="font-bold text-rose-600">-${totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Net Profit:</span>
                        <span className="font-black text-emerald-600">${netProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500 font-medium">Net Profit Margin:</span>
                        <span className="font-black text-indigo-600">{profitMargin}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Profit Health Guidance</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {totalRevenue === 0 && totalExpenses === 0 ? (
                        'Add your revenue streams and expenses in their respective tabs to calculate your live net profit margin.'
                      ) : (
                        `Your current net profit margin is ${profitMargin}%. Add or remove revenue and expense records at any time to update this analysis.`
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* BUSINESS PROJECTIONS */}
            {activeSubView === 'projections' && (
              <motion.div key="projections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Business Financial Projections</h2>
                  <p className="text-xs text-slate-500">Dynamic 3-year growth model calculated from your current revenue logs.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        <th className="p-4">Scenario</th>
                        <th className="p-4">Year 1 Projection</th>
                        <th className="p-4">Year 2 Projection</th>
                        <th className="p-4">Year 3 Projection</th>
                        <th className="p-4">Estimated Valuation (5x Y3)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">Conservative (15% MoM Growth)</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.15).toLocaleString()}</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.15 * 1.15).toLocaleString()}</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.15 * 1.15 * 1.15).toLocaleString()}</td>
                        <td className="p-4 font-bold text-indigo-600">${Math.round(totalRevenue * 12 * Math.pow(1.15, 3) * 5).toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">Expected (25% MoM Growth)</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.25).toLocaleString()}</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.25 * 1.25).toLocaleString()}</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.25 * 1.25 * 1.25).toLocaleString()}</td>
                        <td className="p-4 font-bold text-indigo-600">${Math.round(totalRevenue * 12 * Math.pow(1.25, 3) * 5).toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">Aggressive (40% MoM Growth)</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.40).toLocaleString()}</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.40 * 1.40).toLocaleString()}</td>
                        <td className="p-4">${Math.round(totalRevenue * 12 * 1.40 * 1.40 * 1.40).toLocaleString()}</td>
                        <td className="p-4 font-bold text-indigo-600">${Math.round(totalRevenue * 12 * Math.pow(1.40, 3) * 5).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* INVESTMENT EDUCATION */}
            {activeSubView === 'education' && (
              <motion.div key="education" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Investment & Treasury Education</h2>
                  <p className="text-xs text-slate-500">Master corporate treasury management, sovereign bonds, and cash reserves.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-sm font-black text-slate-900">1. Sovereign Fixed-Yield Notes</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sovereign treasury notes offer zero-risk fixed yield returns locked for predetermined durations. Businesses use these to park idle cash reserves safely without exposure to market volatility.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-sm font-black text-slate-900">2. Working Capital Buffer</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Maintaining a 6-to-12 month working capital buffer ensures uninterrupted payroll and supplier payments during macroeconomic downturns or seasonal revenue dips.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FINANCIAL CALCULATORS */}
            {activeSubView === 'calculators' && (
              <motion.div key="calculators" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Compound Interest & Growth Calculator</h2>
                  <p className="text-xs text-slate-500">Simulate treasury compounding and investment returns over time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Parameters</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-500 font-medium block mb-1">Initial Principal ($)</label>
                        <input 
                          type="number" 
                          value={calcPrincipal} 
                          onChange={e => setCalcPrincipal(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-medium block mb-1">Annual Yield Rate (%)</label>
                        <input 
                          type="number" 
                          value={calcRate} 
                          onChange={e => setCalcRate(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-medium block mb-1">Duration (Years)</label>
                        <input 
                          type="number" 
                          value={calcYears} 
                          onChange={e => setCalcYears(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Projected Future Value</span>
                    <div className="text-4xl font-black text-emerald-600">${Math.round(compoundFutureValue).toLocaleString()}</div>
                    <p className="text-xs text-slate-500">Total compound earnings: <span className="font-bold text-slate-900">${Math.round(compoundFutureValue - calcPrincipal).toLocaleString()}</span></p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAX PLANNING */}
            {activeSubView === 'tax' && (
              <motion.div key="tax" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Tax Planning & Corporate Estimation</h2>
                  <p className="text-xs text-slate-500">Estimate corporate tax liabilities and deductions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Tax Liability Estimator</h3>
                    <div>
                      <label className="text-slate-500 font-medium text-xs block mb-1">Net Taxable Income ($)</label>
                      <input 
                        type="number" 
                        value={taxableIncome} 
                        onChange={e => setTaxableIncome(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Flat Corporate Rate:</span>
                        <span className="font-bold text-slate-900">21%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimated Tax Due:</span>
                        <span className="font-black text-rose-600">${estimatedTax.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Deductions Checklist</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        'Software & Cloud Infrastructure (AWS, GitHub, Vercel)',
                        'Legal & Professional Incorporation Fees',
                        'R&D Tax Credits for Software Engineering',
                        'Home Office & Equipment Depreciation'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CASH-FLOW FORECAST */}
            {activeSubView === 'cashflow' && (
              <motion.div key="cashflow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">30 / 60 / 90-Day Cash-Flow Forecasting</h2>
                  <p className="text-xs text-slate-500">Project liquidity runway and cash inflows vs outflows based on logged revenues and expenses.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">30-Day Outlook</span>
                    <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">Net cash flow projection</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">60-Day Outlook</span>
                    <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${netProfit >= 0 ? '+' : ''}{(netProfit * 2).toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">Cumulative forecast</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">90-Day Outlook</span>
                    <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${netProfit >= 0 ? '+' : ''}{(netProfit * 3).toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">Quarterly liquidity trajectory</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
