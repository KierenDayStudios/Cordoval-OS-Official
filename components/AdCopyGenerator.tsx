
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Megaphone, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Target,
  Zap,
  Globe,
  Layers,
  History,
  Layout,
  ChevronRight,
  MousePointer2,
  Rocket,
  Clock,
  AlertCircle,
  X,
  Instagram,
  Facebook,
  Search,
  Type
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface AdCopyGeneratorProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type AdPlatform = 'meta' | 'google' | 'pinterest';
type AdGoal = 'awareness' | 'retargeting' | 'hardsell';
type Tone = 'urgent' | 'educational' | 'witty';

export const AdCopyGenerator: React.FC<AdCopyGeneratorProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [productUrl, setProductUrl] = useState(() => localStorage.getItem('cordoval_ad_product_url') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_ad_guidance') || '');
  const [platform, setPlatform] = useState<AdPlatform>('meta');
  const [goal, setGoal] = useState<AdGoal>('hardsell');
  const [tone, setTone] = useState<Tone>('urgent');
  const [variations, setVariations] = useState(3);
  const [strictLimits, setStrictLimits] = useState(true);

  useEffect(() => {
//     localStorage.setItem('cordoval_ad_product_url', productUrl);
//     localStorage.setItem('cordoval_ad_guidance', guidance);
  }, [productUrl, guidance]);

  const handleSave = () => {
    const backup = { productUrl, guidance, platform, goal, tone, variations, strictLimits };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ad_copy_backup.json");
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
        if (parsed.productUrl !== undefined) setProductUrl(parsed.productUrl);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.platform !== undefined) setPlatform(parsed.platform);
        if (parsed.goal !== undefined) setGoal(parsed.goal);
        if (parsed.tone !== undefined) setTone(parsed.tone);
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

  const generateAds = async () => {
    if (!productUrl) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3.1-pro-preview";
      
      const prompt = `
        You are "The Ad Copy Generator", a high-performance direct response copywriter.
        
        TASK: Generate ${variations} creative ad variations/angles.
        
        - PRODUCT/SERVICE: ${productUrl}
        - AD PLATFORM: ${platform} (e.g., Meta = FB/IG, Google = Search Ads)
        - AD GOAL: ${goal}
        - TONE: ${tone}
        - STRICT CHARACTER LIMITS: ${strictLimits ? 'Yes (Follow Meta/Google standards)' : 'No'}
        - ADDITIONAL GUIDANCE (Sale/Problem): ${guidance || 'None'}
        ${sourceFile ? `- SOURCE MATERIAL (Style Guide/Previous Ads): ${sourceFile}` : ''}
        
        OUTPUT FORMAT (Markdown):
        Organize the ads by "Angle" (e.g., "The Price Angle," "The Quality Angle," "The FOMO Angle").
        For each variation, include:
        1. Angle Name
        2. Headline(s)
        3. Primary Text / Body Copy
        4. Call to Action (CTA) Button Text
        5. Description (if applicable for the platform)
        
        Ensure the copy is highly engaging, uses psychological triggers relevant to the ${tone} tone, and adheres to the ${goal} objective.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const content = response.text || "Failed to generate ad copy.";
      
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Ad Campaign: ${productUrl.slice(0, 20)}...`,
        content: content,
        updatedAt: Date.now(),
        tags: ['advertising', 'marketing', platform],
        folderId: 'root',
        history: []
      };

      onSaveDoc(newDoc);
      onNavigate('docs', newDoc.id);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate ad copy. Please try again.");
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
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20 shrink-0">
              <Megaphone size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">The Ad Copy Generator</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">High-Conversion Creative Engine</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Ad Copy" compact />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
            <Rocket size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Campaign Mode: Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product / Service URL or Name</label>
              <input 
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="e.g., https://myproduct.com or 'Premium Coffee'"
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Context (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="Black Friday sale, solving back pain, limited time offer..."
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Platform Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={platform === 'meta'} 
                    onClick={() => setPlatform('meta')} 
                    label="Meta" 
                    desc="FB / IG"
                    icon={Facebook}
                  />
                  <OptionCard 
                    active={platform === 'google'} 
                    onClick={() => setPlatform('google')} 
                    label="Google" 
                    desc="Search"
                    icon={Search}
                  />
                  <OptionCard 
                    active={platform === 'pinterest'} 
                    onClick={() => setPlatform('pinterest')} 
                    label="Pinterest" 
                    desc="Visual"
                    icon={Layout}
                  />
                </div>
              </div>

              {/* Ad Goal */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={goal === 'awareness'} 
                    onClick={() => setGoal('awareness')} 
                    label="Awareness" 
                    desc="Reach"
                    icon={Globe}
                  />
                  <OptionCard 
                    active={goal === 'retargeting'} 
                    onClick={() => setGoal('retargeting')} 
                    label="Retarget" 
                    desc="Warm"
                    icon={History}
                  />
                  <OptionCard 
                    active={goal === 'hardsell'} 
                    onClick={() => setGoal('hardsell')} 
                    label="Hard Sell" 
                    desc="Convert"
                    icon={Target}
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={tone === 'urgent'} 
                    onClick={() => setTone('urgent')} 
                    label="Urgent" 
                    desc="FOMO"
                    icon={Clock}
                  />
                  <OptionCard 
                    active={tone === 'educational'} 
                    onClick={() => setTone('educational')} 
                    label="Education" 
                    desc="Value"
                    icon={FileText}
                  />
                  <OptionCard 
                    active={tone === 'witty'} 
                    onClick={() => setTone('witty')} 
                    label="Witty" 
                    desc="Humor"
                    icon={Sparkles}
                  />
                </div>
              </div>

              {/* Variations & Limits */}
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Variations</span>
                    <span className="text-rose-600">{variations} Angles</span>
                  </label>
                  <input 
                    type="range" 
                    min="3" 
                    max="10" 
                    step="1"
                    value={variations}
                    onChange={(e) => setVariations(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>

                <button 
                  onClick={() => setStrictLimits(!strictLimits)}
                  className={`w-full p-4 md:p-6 rounded-xl md:rounded-2xl border-2 flex items-center justify-between transition-all ${strictLimits ? 'bg-rose-50 border-rose-600 text-rose-700' : 'bg-white border-slate-50 text-slate-400'}`}
                >
                  <div className="text-left flex items-center gap-2 md:gap-3">
                    <div className={`p-1.5 md:p-2 rounded-lg ${strictLimits ? 'bg-rose-100' : 'bg-slate-100'}`}>
                      <Type size={14} className="md:w-4 md:h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-tight">Strict Limits</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Adhere to character counts</p>
                    </div>
                  </div>
                  <div className={`w-8 md:w-10 h-4 md:h-5 rounded-full relative transition-all ${strictLimits ? 'bg-rose-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 md:top-1 w-3 h-3 rounded-full bg-white transition-all ${strictLimits ? 'left-4 md:left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 text-rose-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight">Brand Assets</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Style Guide, Past Ads, or Landing Pages</p>
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
              <div className={`w-full py-8 md:py-12 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={24} className="md:w-8 md:h-8 text-rose-500" />
                    <div className="text-center">
                      <p className="text-xs md:text-sm font-black text-slate-900 truncate max-w-[200px] md:max-w-none px-4">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assets Loaded</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="md:w-8 md:h-8 text-slate-300" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-900">Drop style guide or PDF here</p>
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
              onClick={generateAds}
              disabled={!productUrl || isGenerating}
              className={`group relative w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-3 md:gap-4 transition-all overflow-hidden ${!productUrl || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl shadow-slate-900/20'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Generating Angles...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Generate Ad Copy</span>
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
            <div className="w-24 h-24 border-4 border-rose-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <MousePointer2 size={32} className="absolute inset-0 m-auto text-rose-600 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Creative Brainstorming...</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Developing multi-angle ad strategies</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-rose-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-lg shadow-rose-600/5' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
  >
    {Icon && <Icon size={14} className="mb-1" />}
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
