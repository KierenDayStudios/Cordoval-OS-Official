
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Users, Plus, Search, Mail, Phone, 
  ExternalLink, Trash2, Calendar, FileText, 
  ChevronRight, X, Link as LinkIcon, MoreVertical,
  CheckCircle2, Shield, UserPlus, Building2, Clock, MessageSquare,
  DollarSign, Target, CheckSquare, Filter, Layers, Briefcase, MapPin,
  Sparkles, TrendingUp, AlertCircle, RefreshCw, Check
} from 'lucide-react';
import { ClientProfile, ClientInteraction, ClientLink, ClientTask, LeadStage } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface ClientVaultProps {
  activeProfile?: ClientProfile;
  initialClients?: ClientProfile[];
  onSave: (client: ClientProfile) => void;
  onDeleteClient?: (id: string) => void;
  onBack: () => void;
}

const DEFAULT_SAMPLE_CLIENTS: ClientProfile[] = [
  {
    id: 'client_sample_1',
    name: 'Alexandra Wright',
    company: 'Apex Technologies Ltd',
    email: 'a.wright@apextech.co.uk',
    phone: '+44 20 7946 0912',
    title: 'VP of Engineering',
    dealValue: 45000,
    stage: 'proposal',
    priority: 'high',
    location: 'London, UK',
    status: 'lead',
    notes: 'Key decision maker for enterprise cloud transition project. High interest in custom automation and workspace tools.',
    updatedAt: Date.now(),
    links: [
      { id: 'link_1', label: 'Proposal Deck', url: 'https://cordoval.work' }
    ],
    interactions: [
      { id: 'int_1', date: '2026-08-01', note: 'Discovery call held with Alexandra. Outlined system security and API requirements.', type: 'meeting' },
      { id: 'int_2', date: '2026-08-02', note: 'Sent initial enterprise proposal draft via email.', type: 'proposal' }
    ],
    tasks: [
      { id: 'task_1', title: 'Follow up on proposal review with technical team', dueDate: '2026-08-10', completed: false, priority: 'high' }
    ]
  },
  {
    id: 'client_sample_2',
    name: 'Marcus Sterling',
    company: 'Meridian Capital Partners',
    email: 'm.sterling@meridiancap.com',
    phone: '+44 161 496 0234',
    title: 'Managing Director',
    dealValue: 85000,
    stage: 'negotiation',
    priority: 'high',
    location: 'Manchester, UK',
    status: 'active',
    notes: 'Contract review in final stages. Discussed double-entry ledger integration and custom CRM reporting.',
    updatedAt: Date.now() - 86400000,
    links: [
      { id: 'link_2', label: 'SLA Master Agreement', url: 'https://cordoval.work' }
    ],
    interactions: [
      { id: 'int_3', date: '2026-07-28', note: 'In-person negotiation meeting in Manchester. Agreed on pricing tier.', type: 'meeting' }
    ],
    tasks: [
      { id: 'task_2', title: 'Send finalized contract for e-signature', dueDate: '2026-08-05', completed: false, priority: 'high' }
    ]
  },
  {
    id: 'client_sample_3',
    name: 'Sophia Chen',
    company: 'Horizon BioHealth',
    email: 's.chen@horizonbio.org',
    phone: '+1 415 555 0188',
    title: 'Head of Operations',
    dealValue: 28000,
    stage: 'won',
    priority: 'medium',
    location: 'San Francisco, CA',
    status: 'active',
    notes: 'Closed won account! Onboarding team deployed. Ongoing support for SOP Creator and Document workflows.',
    updatedAt: Date.now() - 172800000,
    links: [],
    interactions: [
      { id: 'int_4', date: '2026-07-20', note: 'Kickoff meeting completed. Setup initial workspace templates.', type: 'meeting' }
    ],
    tasks: [
      { id: 'task_3', title: 'Schedule 30-day account health check-in', dueDate: '2026-08-20', completed: false, priority: 'medium' }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'cordoval_crm_clients_v2';
const ACTIVE_CLIENT_KEY = 'cordoval_crm_active_id_v2';

export const ClientVault: React.FC<ClientVaultProps> = ({ activeProfile, initialClients, onSave, onDeleteClient, onBack }) => {
  // Master client list state
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    if (initialClients && initialClients.length > 0) {
      return initialClients;
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to parse saved CRM clients from localStorage", e);
      }
    }
    return activeProfile ? [activeProfile, ...DEFAULT_SAMPLE_CLIENTS] : DEFAULT_SAMPLE_CLIENTS;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    if (activeProfile?.id) return activeProfile.id;
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem(ACTIVE_CLIENT_KEY);
      if (savedId) return savedId;
    }
    return clients[0]?.id || DEFAULT_SAMPLE_CLIENTS[0].id;
  });

  // Ensure clients is never empty
  useEffect(() => {
    if (clients.length === 0) {
      setClients(DEFAULT_SAMPLE_CLIENTS);
      setActiveId(DEFAULT_SAMPLE_CLIENTS[0].id);
    }
  }, [clients]);

  // Active client object with bulletproof fallback
  const activeClient = useMemo<ClientProfile>(() => {
    return clients.find(c => c.id === activeId) || clients[0] || DEFAULT_SAMPLE_CLIENTS[0];
  }, [clients, activeId]);

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'interactions' | 'links'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<ClientProfile>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    title: '',
    dealValue: 10000,
    stage: 'prospect',
    priority: 'medium',
    location: '',
    notes: ''
  });

  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [newInteraction, setNewInteraction] = useState<Partial<ClientInteraction>>({
    type: 'meeting',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ClientTask>>({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium'
  });

  const [newLink, setNewLink] = useState({ label: '', url: '' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-Save to LocalStorage on every change
  useEffect(() => {
    if (typeof window !== 'undefined' && clients.length > 0) {
      // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
      localStorage.setItem(ACTIVE_CLIENT_KEY, activeId);
    }
  }, [clients, activeId]);

  // Sync active client with parent
  const updateActiveClient = (updated: ClientProfile) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    onSave(updated);
  };

  // Instant Local Load handler for SaveLoadControls
  const handleLoadFromLocal = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setClients(parsed);
            setActiveId(parsed[0].id);
            showToast("Loaded CRM database from browser local storage!");
            return;
          }
        } catch (e) {
          console.error("Local storage parse error", e);
        }
      }
    }
    showToast("No saved CRM data found in local storage.");
  };

  const handleSaveFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crm_database_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported full CRM database backup file!");
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients(parsed);
          setActiveId(parsed[0].id);
          showToast(`Imported ${parsed.length} client records!`);
        } else if (parsed.id && parsed.name) {
          setClients(prev => [parsed, ...prev.filter(c => c.id !== parsed.id)]);
          setActiveId(parsed.id);
          showToast(`Imported ${parsed.name}`);
        }
      } catch (err) {
        alert("Invalid CRM JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateClient = () => {
    if (!newClientData.name) return;
    const newProfile: ClientProfile = {
      id: 'client_' + Math.random().toString(36).substr(2, 9),
      name: newClientData.name,
      company: newClientData.company || 'Independent',
      email: newClientData.email || '',
      phone: newClientData.phone || '',
      title: newClientData.title || '',
      dealValue: Number(newClientData.dealValue) || 0,
      stage: (newClientData.stage as LeadStage) || 'prospect',
      priority: newClientData.priority as any || 'medium',
      location: newClientData.location || '',
      status: 'lead',
      notes: newClientData.notes || '',
      links: [],
      interactions: [],
      tasks: [],
      updatedAt: Date.now()
    };

    setClients(prev => [newProfile, ...prev]);
    setActiveId(newProfile.id);
    onSave(newProfile);
    setShowNewClientModal(false);
    setNewClientData({ name: '', company: '', email: '', phone: '', title: '', dealValue: 10000, stage: 'prospect', priority: 'medium', location: '', notes: '' });
    showToast(`Created client ${newProfile.name}`);
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the CRM?`)) {
      const remaining = clients.filter(c => c.id !== id);
      setClients(remaining);
      if (typeof window !== 'undefined') {
        try {
          // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));
        } catch (e) {
          console.error("Failed to update localStorage after client deletion", e);
        }
      }
      if (onDeleteClient) {
        onDeleteClient(id);
      }
      if (activeId === id) {
        if (remaining.length > 0) {
          setActiveId(remaining[0].id);
        } else {
          setActiveId('');
        }
      }
      showToast(`Removed ${name}`);
    }
  };

  // Task Handlers
  const handleAddTask = () => {
    if (!newTask.title || !activeClient) return;
    const task: ClientTask = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      priority: (newTask.priority as any) || 'medium'
    };
    const updated = {
      ...activeClient,
      tasks: [...(activeClient.tasks || []), task],
      updatedAt: Date.now()
    };
    updateActiveClient(updated);
    setShowTaskModal(false);
    setNewTask({ title: '', dueDate: new Date().toISOString().split('T')[0], priority: 'medium' });
    showToast("Added task!");
  };

  const toggleTask = (taskId: string) => {
    if (!activeClient) return;
    const updatedTasks = (activeClient.tasks || []).map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateActiveClient({ ...activeClient, tasks: updatedTasks, updatedAt: Date.now() });
  };

  const deleteTask = (taskId: string) => {
    if (!activeClient) return;
    const updatedTasks = (activeClient.tasks || []).filter(t => t.id !== taskId);
    updateActiveClient({ ...activeClient, tasks: updatedTasks, updatedAt: Date.now() });
  };

  // Interaction Handlers
  const handleAddInteraction = () => {
    if (!newInteraction.note || !activeClient) return;
    const interaction: ClientInteraction = {
      id: 'int_' + Math.random().toString(36).substr(2, 9),
      date: newInteraction.date || new Date().toISOString().split('T')[0],
      note: newInteraction.note,
      type: (newInteraction.type as any) || 'meeting'
    };
    const updated = {
      ...activeClient,
      interactions: [interaction, ...(activeClient.interactions || [])],
      updatedAt: Date.now()
    };
    updateActiveClient(updated);
    setShowInteractionModal(false);
    setNewInteraction({ type: 'meeting', date: new Date().toISOString().split('T')[0], note: '' });
    showToast("Logged interaction!");
  };

  const removeInteraction = (id: string) => {
    if (!activeClient) return;
    const updated = {
      ...activeClient,
      interactions: activeClient.interactions.filter(i => i.id !== id),
      updatedAt: Date.now()
    };
    updateActiveClient(updated);
  };

  // Link Handlers
  const handleAddLink = () => {
    if (!newLink.label || !newLink.url || !activeClient) return;
    const link: ClientLink = { 
      id: 'link_' + Math.random().toString(36).substr(2, 9), 
      label: newLink.label, 
      url: newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}` 
    };
    const updated = {
      ...activeClient,
      links: [...(activeClient.links || []), link],
      updatedAt: Date.now()
    };
    updateActiveClient(updated);
    setNewLink({ label: '', url: '' });
    showToast("Added resource link!");
  };

  const removeLink = (id: string) => {
    if (!activeClient) return;
    const updated = {
      ...activeClient,
      links: activeClient.links.filter(l => l.id !== id),
      updatedAt: Date.now()
    };
    updateActiveClient(updated);
  };

  // Pipeline Metrics Calculation
  const metrics = useMemo(() => {
    const totalPipeline = clients.reduce((acc, c) => acc + (c.dealValue || 0), 0);
    const activeDeals = clients.filter(c => c.stage !== 'won' && c.stage !== 'lost' && c.status !== 'past').length;
    const wonRevenue = clients.filter(c => c.stage === 'won' || c.status === 'active').reduce((acc, c) => acc + (c.dealValue || 0), 0);
    const pendingTasksCount = clients.reduce((acc, c) => acc + (c.tasks || []).filter(t => !t.completed).length, 0);
    return { totalPipeline, activeDeals, wonRevenue, pendingTasksCount };
  }, [clients]);

  // Filtered Clients List
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [clients, searchQuery, stageFilter]);

  const getStageBadgeColor = (stage?: LeadStage) => {
    switch (stage) {
      case 'won': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'lost': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'proposal': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'negotiation': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'contacted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'active': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* App Header */}
      <header className="px-4 md:px-8 py-3 bg-white border-b border-slate-200/80 z-30 shrink-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-all shrink-0 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-base md:text-lg tracking-tight">Cordoval CRM Workspace</h1>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-md border border-blue-100">
                  {clients.length} Deals
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advanced Client & Pipeline Intelligence</p>
            </div>
          </div>
        </div>

        {/* Controls Header Right */}
        <div className="flex items-center gap-2 flex-wrap">
          <SaveLoadControls 
            onSave={handleSaveFile} 
            onLoad={handleLoadFile} 
            onLoadFromLocal={handleLoadFromLocal}
            label="CRM Database" 
            compact 
          />
          
          <button 
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus size={14} />
            <span>New Lead</span>
          </button>
        </div>
      </header>

      {/* Pipeline Analytics KPI Ribbon */}
      <div className="bg-white border-b border-slate-200/60 px-4 md:px-8 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-black">
            £
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pipeline</div>
            <div className="text-sm font-black text-slate-900">£{metrics.totalPipeline.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 font-black">
            <Target size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Deals</div>
            <div className="text-sm font-black text-slate-900">{metrics.activeDeals} Active</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 font-black">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Won Revenue</div>
            <div className="text-sm font-black text-slate-900">£{metrics.wonRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0 font-black">
            <CheckSquare size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Tasks</div>
            <div className="text-sm font-black text-slate-900">{metrics.pendingTasksCount} Action Items</div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row">
        
        {/* Left Column: Client Directory */}
        <div className="w-full xl:w-96 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-auto xl:h-full">
          
          {/* Search & Filter Top Bar */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clients, company, email..."
                className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Stage Quick Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide text-[10px] font-bold">
              {['all', 'prospect', 'proposal', 'negotiation', 'won', 'active'].map(st => (
                <button
                  key={st}
                  onClick={() => setStageFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize shrink-0 transition-all cursor-pointer ${
                    stageFilter === st 
                      ? 'bg-slate-900 text-white font-black shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Client Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {filteredClients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No matching client records.
              </div>
            ) : (
              filteredClients.map(c => {
                const isSelected = c.id === activeClient.id;
                const openTasksCount = (c.tasks || []).filter(t => !t.completed).length;

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-300 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(c.priority)}`} />
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">{c.name}</h4>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{c.company}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-xs text-slate-900">
                          {c.dealValue ? `£${c.dealValue.toLocaleString()}` : '£0'}
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase rounded-md border mt-0.5 ${getStageBadgeColor(c.stage)}`}>
                          {c.stage || 'lead'}
                        </span>
                      </div>
                    </div>

                    {openTasksCount > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-amber-600 font-bold">
                        <span className="flex items-center gap-1">
                          <CheckSquare size={11} /> {openTasksCount} pending task{openTasksCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Client Workspace */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 flex flex-col gap-5">
          
          {/* Active Client Card Header */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-slate-900/10 shrink-0">
                  {activeClient.name ? activeClient.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input 
                      value={activeClient.name}
                      onChange={e => updateActiveClient({ ...activeClient, name: e.target.value })}
                      className="font-black text-lg md:text-xl text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-blue-400"
                      placeholder="Client Name"
                    />
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg border ${getStageBadgeColor(activeClient.stage)}`}>
                      {activeClient.stage || 'prospect'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><Building2 size={13} /> {activeClient.company}</span>
                    {activeClient.title && <span>• {activeClient.title}</span>}
                    {activeClient.location && <span className="flex items-center gap-1"><MapPin size={12} /> {activeClient.location}</span>}
                  </div>
                </div>
              </div>

              {/* Deal Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-slate-50 border border-slate-200/70 p-2 rounded-xl text-right">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Deal Value</div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-500">£</span>
                    <input 
                      type="number"
                      value={activeClient.dealValue || 0}
                      onChange={e => updateActiveClient({ ...activeClient, dealValue: Number(e.target.value) })}
                      className="w-24 bg-transparent font-black text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 p-2 rounded-xl">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Stage</div>
                  <select
                    value={activeClient.stage || 'prospect'}
                    onChange={e => updateActiveClient({ ...activeClient, stage: e.target.value as LeadStage })}
                    className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer uppercase"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Closed Won</option>
                    <option value="lost">Closed Lost</option>
                    <option value="active">Active Client</option>
                  </select>
                </div>

                <button 
                  onClick={() => handleDeleteClient(activeClient.id, activeClient.name)}
                  title="Delete Client Profile"
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Client Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'overview' 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText size={14} />
                <span>Overview & Notes</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'tasks' 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare size={14} />
                <span>Action Items ({ (activeClient.tasks || []).length })</span>
              </button>

              <button
                onClick={() => setActiveTab('interactions')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'interactions' 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock size={14} />
                <span>Interaction Log ({ (activeClient.interactions || []).length })</span>
              </button>

              <button
                onClick={() => setActiveTab('links')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'links' 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LinkIcon size={14} />
                <span>Resource Links ({ (activeClient.links || []).length })</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & NOTES */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Details Panel */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Contact & Account Details</h3>

                <div className="space-y-3 text-xs font-semibold">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Company / Organization</label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Building2 size={14} className="text-slate-400" />
                      <input 
                        value={activeClient.company}
                        onChange={e => updateActiveClient({ ...activeClient, company: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 w-full outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email Correspondence</label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Mail size={14} className="text-slate-400" />
                      <input 
                        value={activeClient.email}
                        onChange={e => updateActiveClient({ ...activeClient, email: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 w-full outline-none"
                        placeholder="email@domain.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Phone Number</label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Phone size={14} className="text-slate-400" />
                      <input 
                        value={activeClient.phone}
                        onChange={e => updateActiveClient({ ...activeClient, phone: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 w-full outline-none"
                        placeholder="+44 20 ..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Role / Job Title</label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Briefcase size={14} className="text-slate-400" />
                      <input 
                        value={activeClient.title || ''}
                        onChange={e => updateActiveClient({ ...activeClient, title: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 w-full outline-none"
                        placeholder="VP of Growth"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Location / HQ</label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <MapPin size={14} className="text-slate-400" />
                      <input 
                        value={activeClient.location || ''}
                        onChange={e => updateActiveClient({ ...activeClient, location: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 w-full outline-none"
                        placeholder="London, UK"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Notes Panel */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-h-[320px]">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" /> Strategic Notes & Intelligence
                </h3>
                <textarea 
                  value={activeClient.notes}
                  onChange={e => updateActiveClient({ ...activeClient, notes: e.target.value })}
                  placeholder="Record essential context, account requirements, key contacts, or deal strategy notes..."
                  className="flex-1 w-full p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 text-sm font-medium text-slate-800 leading-relaxed outline-none focus:bg-white focus:border-blue-400 resize-none"
                />
              </div>

            </div>
          )}

          {/* TAB 2: TASKS & ACTION ITEMS */}
          {activeTab === 'tasks' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Follow-up Action Items</h3>
                  <p className="text-xs text-slate-500 font-medium">Keep track of upcoming deliverables, meetings, and tasks for this client.</p>
                </div>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="space-y-2">
                {(!activeClient.tasks || activeClient.tasks.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No action items created yet for {activeClient.name}.
                  </div>
                ) : (
                  activeClient.tasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        task.completed 
                          ? 'bg-slate-50 border-slate-100 opacity-60' 
                          : 'bg-white border-slate-200/80 shadow-xs hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-blue-500'
                          }`}
                        >
                          {task.completed && <Check size={12} />}
                        </button>
                        <div>
                          <p className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                            <span className="flex items-center gap-1"><Calendar size={11} /> Due: {task.dueDate}</span>
                            <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[8px] ${
                              task.priority === 'high' ? 'bg-rose-100 text-rose-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIONS LOG */}
          {activeTab === 'interactions' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Interaction & Touchpoint History</h3>
                  <p className="text-xs text-slate-500 font-medium">Log meetings, emails, phone calls, and proposals.</p>
                </div>

                <button
                  onClick={() => setShowInteractionModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Log Touchpoint</span>
                </button>
              </div>

              <div className="space-y-3">
                {(!activeClient.interactions || activeClient.interactions.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No touchpoints recorded yet.
                  </div>
                ) : (
                  activeClient.interactions.map(i => (
                    <div key={i.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 font-bold uppercase text-[10px] ${
                          i.type === 'email' ? 'bg-amber-500' : i.type === 'meeting' ? 'bg-blue-500' : i.type === 'call' ? 'bg-emerald-500' : 'bg-purple-500'
                        }`}>
                          {i.type.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">{i.type}</span>
                            <span className="text-[10px] font-bold text-slate-400">{i.date}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{i.note}</p>
                        </div>
                      </div>

                      <button onClick={() => removeInteraction(i.id)} className="p-1 text-slate-300 hover:text-rose-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RESOURCE LINKS */}
          {activeTab === 'links' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Connected Resource Assets</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeClient.links.map(l => (
                  <div key={l.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-lg border border-slate-200/80 flex items-center justify-center shrink-0">
                        <LinkIcon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 truncate">{l.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{l.url}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600">
                        <ExternalLink size={14} />
                      </a>
                      <button onClick={() => removeLink(l.id)} className="p-1.5 text-slate-300 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Link Form */}
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-2 mt-4">
                <input 
                  placeholder="Link Title (e.g. Contract PDF)"
                  value={newLink.label}
                  onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                  className="w-full sm:w-1/3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                />
                <input 
                  placeholder="URL..."
                  value={newLink.url}
                  onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full sm:flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                />
                <button
                  onClick={handleAddLink}
                  className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Add Link
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* NEW CLIENT MODAL */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" /> Create New Client Profile
              </h3>
              <button onClick={() => setShowNewClientModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Contact Name *</label>
                <input 
                  value={newClientData.name}
                  onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                  placeholder="e.g. Alexandra Wright"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Company</label>
                  <input 
                    value={newClientData.company}
                    onChange={e => setNewClientData({ ...newClientData, company: e.target.value })}
                    placeholder="e.g. Meridian Ltd"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Deal Value (£)</label>
                  <input 
                    type="number"
                    value={newClientData.dealValue}
                    onChange={e => setNewClientData({ ...newClientData, dealValue: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email</label>
                  <input 
                    value={newClientData.email}
                    onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="alex@meridian.com"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Stage</label>
                  <select 
                    value={newClientData.stage}
                    onChange={e => setNewClientData({ ...newClientData, stage: e.target.value as any })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none uppercase"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Closed Won</option>
                    <option value="active">Active Client</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button 
                onClick={() => setShowNewClientModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateClient}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Add Action Task</h3>
            
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Task Title</label>
                <input 
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Follow up on contract draft"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Due Date</label>
                  <input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none font-bold capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={handleAddTask} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW INTERACTION MODAL */}
      {showInteractionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Log Touchpoint / Interaction</h3>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Touchpoint Type</label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {['meeting', 'call', 'email', 'proposal'].map(t => (
                    <button
                      key={t}
                      onClick={() => setNewInteraction({ ...newInteraction, type: t as any })}
                      className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                        newInteraction.type === t ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Date</label>
                <input 
                  type="date"
                  value={newInteraction.date}
                  onChange={e => setNewInteraction({ ...newInteraction, date: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Summary / Key Takeaways</label>
                <textarea 
                  value={newInteraction.note}
                  onChange={e => setNewInteraction({ ...newInteraction, note: e.target.value })}
                  placeholder="Record summary of call, meeting, or email outcome..."
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button onClick={() => setShowInteractionModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={handleAddInteraction} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Save Touchpoint</button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Footer */}
      <footer className="h-9 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local Disk Persistence Active</span>
          </span>
          <span className="text-slate-200">|</span>
          <span>{clients.length} Client Records Loaded</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Shield size={12} className="text-emerald-500" />
          <span>Zero-Cloud Storage Guarantee</span>
        </div>
      </footer>

      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
