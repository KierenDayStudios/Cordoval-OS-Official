
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Zap,
  MessageSquare,
  X,
  Languages,
  ShieldCheck,
  Globe,
  Lock,
  User,
  HeartHandshake,
  Briefcase,
  PartyPopper,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface CustomerReplyBotProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Tone = 'empathetic' | 'professional' | 'enthusiastic';
type Style = 'short' | 'detailed';
type Resolution = 'support' | 'refund' | 'thanks';
type Privacy = 'public' | 'private';

export const CustomerReplyBot: React.FC<CustomerReplyBotProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [customerMessage, setCustomerMessage] = useState(() => localStorage.getItem('cordoval_reply_msg') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_reply_guidance') || '');
  const [tone, setTone] = useState<Tone>('empathetic');
  const [style, setStyle] = useState<Style>('detailed');
  const [resolution, setResolution] = useState<Resolution>('support');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
//     localStorage.setItem('cordoval_reply_msg', customerMessage);
//     localStorage.setItem('cordoval_reply_guidance', guidance);
  }, [customerMessage, guidance]);

  const handleSave = () => {
    const backup = { customerMessage, guidance, tone, style, resolution, privacy, language };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "customer_reply_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.customerMessage !== undefined) setCustomerMessage(parsed.customerMessage);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.tone !== undefined) setTone(parsed.tone);
        if (parsed.style !== undefined) setStyle(parsed.style);
        if (parsed.language !== undefined) setLanguage(parsed.language);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const generateReply = async () => {
    if (!customerMessage) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3.1-pro-preview";
      
      const prompt = `
        You are "The Customer Reply Bot", an expert in customer success and reputation management.
        
        TASK: Generate a professional and effective response to a customer's review or message.
        
        - CUSTOMER MESSAGE: ${customerMessage}
        - TONE: ${tone}
        - RESPONSE STYLE: ${style}
        - RESOLUTION TYPE: ${resolution}
        - PLATFORM TYPE: ${privacy} (Public platforms like Google/Yelp vs Private Email/DM)
        - TARGET LANGUAGE: ${language}
        - ADDITIONAL GUIDANCE/FACTS: ${guidance || 'None'}
        ${sourceFile ? `- SOURCE MATERIAL (Policies/Order Info): ${sourceFile}` : ''}
        
        STRUCTURE REQUIREMENTS:
        1. Clearly label the draft (e.g., "Draft for Google Review" or "Private Email Response").
        2. Analyze the customer's sentiment first (internally) to ensure the tone is perfectly matched.
        3. If it's a public review, ensure the response is helpful for other potential customers reading it.
        4. If it's a private message, focus on direct resolution and relationship building.
        5. Use placeholders like [Name] or [Order #] if specific info is missing.
        6. Output the response in ${language}.
        
        Output the entire content in clean Markdown format.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const content = response.text || "Failed to generate reply.";
      
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Customer Reply: ${customerMessage.slice(0, 20)}...`,
        content: content,
        updatedAt: Date.now(),
        tags: ['customer-success', 'support', privacy],
        folderId: 'root',
        history: []
      };

      onSaveDoc(newDoc);
      onNavigate('docs', newDoc.id);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate reply. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-slate-100 rounded-xl transition-all">
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 shrink-0">
              <MessageCircle size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The Customer Reply Bot</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Reputation & Success Architect</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Reply Bot" compact />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Policy Guard Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={12} /> Customer Message / Review
              </label>
              <textarea 
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Paste the customer's review or message here..."
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[120px] md:min-h-[150px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes / Guidance</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="Specific facts, discount codes, or internal context about the situation..."
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Tone Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={tone === 'empathetic'} 
                    onClick={() => setTone('empathetic')} 
                    label="Empathetic" 
                    desc="Apologetic"
                    icon={HeartHandshake}
                  />
                  <OptionCard 
                    active={tone === 'professional'} 
                    onClick={() => setTone('professional')} 
                    label="Professional" 
                    desc="Firm/Clear"
                    icon={Briefcase}
                  />
                  <OptionCard 
                    active={tone === 'enthusiastic'} 
                    onClick={() => setTone('enthusiastic')} 
                    label="Enthusiastic" 
                    desc="Appreciative"
                    icon={PartyPopper}
                  />
                </div>
              </div>

              {/* Response Style */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Response Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <OptionCard 
                    active={style === 'short'} 
                    onClick={() => setStyle('short')} 
                    label="Short" 
                    desc="Direct"
                  />
                  <OptionCard 
                    active={style === 'detailed'} 
                    onClick={() => setStyle('detailed')} 
                    label="Detailed" 
                    desc="Resolution"
                  />
                </div>
              </div>

              {/* Resolution Type */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resolution Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={resolution === 'support'} 
                    onClick={() => setResolution('support')} 
                    label="Support" 
                    desc="Contact Us"
                  />
                  <OptionCard 
                    active={resolution === 'refund'} 
                    onClick={() => setResolution('refund')} 
                    label="Refund" 
                    desc="Credit/Comp"
                  />
                  <OptionCard 
                    active={resolution === 'thanks'} 
                    onClick={() => setResolution('thanks')} 
                    label="Thanks" 
                    desc="Just Gratitude"
                  />
                </div>
              </div>

              {/* Privacy Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <OptionCard 
                    active={privacy === 'public'} 
                    onClick={() => setPrivacy('public')} 
                    label="Public" 
                    desc="Google/Yelp"
                    icon={Globe}
                  />
                  <OptionCard 
                    active={privacy === 'private'} 
                    onClick={() => setPrivacy('private')} 
                    label="Private" 
                    desc="Email/DM"
                    icon={Lock}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Languages size={12} /> Response Language
              </label>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Auto-Detect'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${language === lang ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight">Company Context</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Refund Policy, FAQ, or Order History</p>
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
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full py-8 md:py-12 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={24} className="md:w-8 md:h-8 text-emerald-500" />
                    <div className="text-center">
                      <p className="text-xs md:text-sm font-black text-slate-900 truncate max-w-[200px] md:max-w-none px-4">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context Loaded</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="md:w-8 md:h-8 text-slate-300" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-900">Drop policy or order data here</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="flex justify-center pt-2 md:pt-4">
            <button 
              onClick={generateReply}
              disabled={!customerMessage || isGenerating}
              className={`group relative w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-3 md:gap-4 transition-all overflow-hidden ${!customerMessage || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl shadow-slate-900/20'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Analyzing Sentiment...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Generate Reply</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <MessageSquare size={32} className="absolute inset-0 m-auto text-emerald-600 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Crafting Response...</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Matching policies to customer needs</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-lg shadow-emerald-600/5' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
  >
    {Icon && <Icon size={14} className="mb-1" />}
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
