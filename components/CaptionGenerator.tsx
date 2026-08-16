
import React, { useState, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Upload, RefreshCw, Copy, Check, Sparkles, MessageSquare, Instagram, Linkedin, ShoppingBag, Accessibility, Zap, Trash2 } from 'lucide-react';
import { createAIInstance } from '../utils/ai';
import { Type as SchemaType } from '@google/genai';

interface CaptionGeneratorProps {
  onBack: () => void;
}

interface CaptionResult {
  instagram: string;
  linkedin: string;
  productDescription: string;
  altText: string;
}

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({ onBack }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCaptions = async () => {
    if (!sourceImage) return;
    setIsGenerating(true);
    
    try {
      const ai = createAIInstance();
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Analyze this image and generate social media captions and descriptions. Return the result in JSON format with the following structure: { "instagram": "string", "linkedin": "string", "productDescription": "string", "altText": "string" }',
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              instagram: { type: SchemaType.STRING },
              linkedin: { type: SchemaType.STRING },
              productDescription: { type: SchemaType.STRING },
              altText: { type: SchemaType.STRING }
            },
            required: ["instagram", "linkedin", "productDescription", "altText"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error('Caption generation failed:', err);
      alert('Neural link error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-300 font-sans">
      <header className="h-16 px-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-indigo-400" />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter">Auto Caption Generator</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Vision Synthesis</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">
          
          {/* Left: Image Input */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Input</h3>
              {sourceImage && (
                <button onClick={() => setSourceImage(null)} className="text-slate-600 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div 
              onClick={() => !sourceImage && fileInputRef.current?.click()}
              className={`aspect-square bg-white/5 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden transition-all ${!sourceImage ? 'border-white/10 hover:border-indigo-500/50 cursor-pointer' : 'border-transparent'}`}
            >
              {!sourceImage ? (
                <div className="flex flex-col items-center gap-4 p-12 text-center">
                  <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-2">
                    <Upload size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Upload image for analysis</p>
                </div>
              ) : (
                <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
              )}
            </div>

            <button
              onClick={handleGenerateCaptions}
              disabled={isGenerating || !sourceImage}
              className="h-16 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-20"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Zap size={18} />}
              {isGenerating ? 'Synthesizing Narrative...' : 'Generate Captions'}
            </button>
          </div>

          {/* Right: Captions Output */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Narratives</h3>
            </div>

            <div className="space-y-6 relative">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-[3rem]">
                  <RefreshCw className="text-indigo-500 animate-spin" size={48} />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Analyzing Visual Semantics</p>
                </div>
              )}

              {!result && !isGenerating && (
                <div className="h-[500px] flex flex-col items-center justify-center text-slate-700 text-center p-12 bg-slate-900/50 border border-white/5 rounded-[3rem]">
                  <Sparkles size={64} className="mb-6 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest italic">Upload image to synthesize social narratives</p>
                </div>
              )}

              {result && (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                  {/* Instagram */}
                  <CaptionCard 
                    icon={<Instagram size={18} />} 
                    label="Instagram" 
                    text={result.instagram} 
                    onCopy={() => copyToClipboard(result.instagram, 'ig')}
                    isCopied={copied === 'ig'}
                  />
                  {/* LinkedIn */}
                  <CaptionCard 
                    icon={<Linkedin size={18} />} 
                    label="LinkedIn" 
                    text={result.linkedin} 
                    onCopy={() => copyToClipboard(result.linkedin, 'li')}
                    isCopied={copied === 'li'}
                  />
                  {/* Product Description */}
                  <CaptionCard 
                    icon={<ShoppingBag size={18} />} 
                    label="Product Description" 
                    text={result.productDescription} 
                    onCopy={() => copyToClipboard(result.productDescription, 'pd')}
                    isCopied={copied === 'pd'}
                  />
                  {/* Alt Text */}
                  <CaptionCard 
                    icon={<Accessibility size={18} />} 
                    label="Accessibility Alt Text" 
                    text={result.altText} 
                    onCopy={() => copyToClipboard(result.altText, 'alt')}
                    isCopied={copied === 'alt'}
                  />
                </div>
              )}
            </div>
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
        </div>
      </main>
    </div>
  );
};

const CaptionCard = ({ icon, label, text, onCopy, isCopied }: any) => (
  <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/20 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/5 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
      </div>
      <button onClick={onCopy} className="text-slate-600 hover:text-white transition-colors">
        {isCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
    <p className="text-sm font-medium text-slate-300 leading-relaxed">{text}</p>
  </div>
);
