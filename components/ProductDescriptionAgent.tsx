
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Tag,
  Search,
  X,
  Target,
  Zap,
  Globe,
  Layers,
  Star,
  History,
  Layout,
  ChevronRight,
  Package,
  Boxes,
  Feather
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';

interface ProductDescriptionAgentProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

type Platform = 'shopify' | 'amazon' | 'etsy' | 'ebay';
type Tone = 'luxury' | 'playful' | 'rugged';
type Structure = 'bullets' | 'story' | 'technical';

export const ProductDescriptionAgent: React.FC<ProductDescriptionAgentProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [productName, setProductName] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [guidance, setGuidance] = useState('');
  const [platform, setPlatform] = useState<Platform>('shopify');
  const [tone, setTone] = useState<Tone>('luxury');
  const [structure, setStructure] = useState<Structure>('story');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [brandMentions, setBrandMentions] = useState(false);
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
      reader.readAsDataURL(file);
    }
  };

  const generateDescription = async () => {
    if (!productName || !keyFeatures) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3.1-pro-preview";
      
      const prompt = `
        You are "The Product Description Agent", a world-class e-commerce copywriter.
        
        TASK: Generate a high-converting product listing.
        
        - PRODUCT NAME: ${productName}
        - KEY FEATURES: ${keyFeatures}
        - PLATFORM: ${platform}
        - TONE: ${tone}
        - STRUCTURE: ${structure}
        - SEO KEYWORDS: ${seoKeywords}
        - BRAND MENTIONS ALLOWED: ${brandMentions ? 'Yes (can compare)' : 'No (focus only on this brand)'}
        - ADDITIONAL GUIDANCE (Audience/Vibe): ${guidance || 'None'}
        ${sourceFile ? `- SOURCE MATERIAL (Image/Spec Sheet/Testimonials): [Attached Material]` : ''}
        
        OUTPUT FORMAT (Markdown):
        1. Catchy Title (Optimized for ${platform})
        2. Benefit-Driven Description (Using ${tone} tone and ${structure} structure)
        3. Bulletized Feature List
        4. Meta-Description for SEO (max 160 chars)
        
        Ensure the copy is persuasive, highlights the unique value proposition, and uses the SEO keywords naturally.
      `;

      const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
      if (sourceFile) {
        contents[0].parts.unshift({
          inlineData: {
            data: sourceFile.split(',')[1],
            mimeType: "image/jpeg"
          }
        });
      }

      const response = await ai.models.generateContent({
        model,
        contents,
      });

      const content = response.text || "Failed to generate description.";
      
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Product Page: ${productName}`,
        content: content,
        updatedAt: Date.now(),
        tags: ['e-commerce', 'product-listing', platform],
        folderId: 'root',
        history: []
      };

      onSaveDoc(newDoc);
      onNavigate('docs', newDoc.id);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate description. Please try again.");
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
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 shrink-0">
              <ShoppingBag size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">Product Description Agent</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">E-commerce Conversion Specialist</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Target size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Conversion Mode Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Main Input Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                <input 
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Ultra-Light Carbon Fiber Bike"
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SEO Keywords</label>
                <input 
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="carbon bike, lightweight, racing..."
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Features</label>
              <textarea 
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="List the main selling points, specs, or benefits..."
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[100px] md:min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audience / Brand Vibe (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="Who is this for? What's the brand personality?"
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300 min-h-[60px] md:min-h-[80px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Platform Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <OptionCard 
                    active={platform === 'shopify'} 
                    onClick={() => setPlatform('shopify')} 
                    label="Shopify" 
                    desc="Direct Store"
                    icon={ShoppingBag}
                  />
                  <OptionCard 
                    active={platform === 'amazon'} 
                    onClick={() => setPlatform('amazon')} 
                    label="Amazon" 
                    desc="Marketplace"
                    icon={Boxes}
                  />
                  <OptionCard 
                    active={platform === 'etsy'} 
                    onClick={() => setPlatform('etsy')} 
                    label="Etsy" 
                    desc="Handmade"
                    icon={Star}
                  />
                  <OptionCard 
                    active={platform === 'ebay'} 
                    onClick={() => setPlatform('ebay')} 
                    label="eBay" 
                    desc="Auction/Fixed"
                    icon={Tag}
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={tone === 'luxury'} 
                    onClick={() => setTone('luxury')} 
                    label="Luxury" 
                    desc="High-End"
                    icon={Feather}
                  />
                  <OptionCard 
                    active={tone === 'playful'} 
                    onClick={() => setTone('playful')} 
                    label="Playful" 
                    desc="Trendy"
                    icon={Zap}
                  />
                  <OptionCard 
                    active={tone === 'rugged'} 
                    onClick={() => setTone('rugged')} 
                    label="Rugged" 
                    desc="Functional"
                    icon={Layers}
                  />
                </div>
              </div>

              {/* Structure Selection */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structure</label>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard 
                    active={structure === 'bullets'} 
                    onClick={() => setStructure('bullets')} 
                    label="Bullets" 
                    desc="Quick Scan"
                    icon={Layout}
                  />
                  <OptionCard 
                    active={structure === 'story'} 
                    onClick={() => setStructure('story')} 
                    label="Story" 
                    desc="Narrative"
                    icon={History}
                  />
                  <OptionCard 
                    active={structure === 'technical'} 
                    onClick={() => setStructure('technical')} 
                    label="Technical" 
                    desc="Specs Focus"
                    icon={Zap}
                  />
                </div>
              </div>

              {/* Brand Mentions */}
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Mentions</label>
                <button 
                  onClick={() => setBrandMentions(!brandMentions)}
                  className={`w-full p-4 md:p-6 rounded-xl md:rounded-2xl border-2 flex items-center justify-between transition-all ${brandMentions ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-50 text-slate-400'}`}
                >
                  <div className="text-left">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-tight">Allow Comparisons</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Compare to other brands</p>
                  </div>
                  <div className={`w-8 md:w-10 h-4 md:h-5 rounded-full relative transition-all ${brandMentions ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 md:top-1 w-3 h-3 rounded-full bg-white transition-all ${brandMentions ? 'left-4 md:left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Source Material Section */}
          <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight">Visual & Spec Context</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Photos, Spec Sheets, or Testimonials</p>
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
              <div className={`w-full py-8 md:py-12 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileName ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={24} className="md:w-8 md:h-8 text-indigo-500" />
                    <div className="text-center">
                      <p className="text-xs md:text-sm font-black text-slate-900 truncate max-w-[200px] md:max-w-none px-4">{fileName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context Loaded</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="md:w-8 md:h-8 text-slate-300" />
                    <div className="text-center px-4">
                      <p className="text-xs md:text-sm font-black text-slate-900">Drop product photo or specs here</p>
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
              onClick={generateDescription}
              disabled={!productName || !keyFeatures || isGenerating}
              className={`group relative w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-3 md:gap-4 transition-all overflow-hidden ${!productName || !keyFeatures || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl shadow-slate-900/20'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="md:w-6 md:h-6 animate-spin" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Crafting Listing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Generate Description</span>
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
            <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <Package size={32} className="absolute inset-0 m-auto text-indigo-600 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Analyzing Product DNA...</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synthesizing benefits and SEO data</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ active, onClick, label, desc, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-lg shadow-indigo-600/5' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
  >
    {Icon && <Icon size={14} className="mb-1" />}
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{desc}</span>
  </button>
);
