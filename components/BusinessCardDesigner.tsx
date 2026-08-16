import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, CreditCard, User, Mail, Phone, Globe } from 'lucide-react';
import { AppView } from '../types';
import html2canvas from 'html2canvas';

interface BusinessCardDesignerProps {
  onBack: () => void;
  onNavigate: (view: AppView, id: string | null) => void;
}

export const BusinessCardDesigner: React.FC<BusinessCardDesignerProps> = ({ onBack }) => {
  const [name, setName] = useState('John Doe');
  const [title, setTitle] = useState('Software Engineer');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = 'business-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Card Designer</h1>
        <button onClick={downloadCard} className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl"><Download size={18} /></button>
      </header>
      
      <div className="flex-1 flex flex-col items-center p-6 gap-8 overflow-y-auto">
        <div ref={cardRef} className="w-full max-w-[350px] aspect-[1.75/1] bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">{name}</h2>
            <p className="text-slate-400 text-xs mt-1">{title}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-300 text-[10px] flex items-center gap-2"><Mail size={12}/>{email}</p>
            <p className="text-slate-300 text-[10px] flex items-center gap-2"><Phone size={12}/>{phone}</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4 bg-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3"><User size={16}/><input value={name} onChange={e => setName(e.target.value)} className="bg-transparent flex-1 outline-none text-white"/></div>
          <div className="flex items-center gap-3"><CreditCard size={16}/><input value={title} onChange={e => setTitle(e.target.value)} className="bg-transparent flex-1 outline-none text-white"/></div>
          <div className="flex items-center gap-3"><Mail size={16}/><input value={email} onChange={e => setEmail(e.target.value)} className="bg-transparent flex-1 outline-none text-white"/></div>
          <div className="flex items-center gap-3"><Phone size={16}/><input value={phone} onChange={e => setPhone(e.target.value)} className="bg-transparent flex-1 outline-none text-white"/></div>
        </div>
      </div>
    </div>
  );
};
