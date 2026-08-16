import React, { useState, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SaveLoadControls } from './SaveLoadControls';

export const InvoiceGenerator: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [invoiceMetadata, setInvoiceMetadata] = useState(() => {
    try {
      const saved = localStorage.getItem('cordoval_invoice_metadata');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      invoiceNumber: 'INV-001',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: '$'
    };
  });

  const [fromInfo, setFromInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('cordoval_invoice_from');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      name: 'Your Company Name',
      email: 'info@yourcompany.com',
      address: '123 Business Rd.\nCity, State 12345'
    };
  });

  const [toInfo, setToInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('cordoval_invoice_to');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      name: 'Client Name',
      email: 'client@email.com',
      address: '456 Client St.\nClient City, 67890'
    };
  });

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cordoval_invoice_items');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: '1', description: 'Web Design Services', quantity: 1, rate: 1500, amount: 1500 }
    ];
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('cordoval_invoice_notes') || 'Thank you for your business!');
  const [taxRate, setTaxRate] = useState(() => Number(localStorage.getItem('cordoval_invoice_tax') || 0));

  useEffect(() => {
    try {
//       localStorage.setItem('cordoval_invoice_metadata', JSON.stringify(invoiceMetadata));
//       localStorage.setItem('cordoval_invoice_from', JSON.stringify(fromInfo));
//       localStorage.setItem('cordoval_invoice_to', JSON.stringify(toInfo));
//       localStorage.setItem('cordoval_invoice_items', JSON.stringify(items));
//       localStorage.setItem('cordoval_invoice_notes', notes);
//       localStorage.setItem('cordoval_invoice_tax', taxRate.toString());
    } catch (e) {}
  }, [invoiceMetadata, fromInfo, toInfo, items, notes, taxRate]);

  const handleSaveFile = () => {
    const backup = { invoiceMetadata, fromInfo, toInfo, items, notes, taxRate };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `invoice_${invoiceMetadata.invoiceNumber || 'backup'}.json`);
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
        if (parsed.invoiceMetadata) setInvoiceMetadata(parsed.invoiceMetadata);
        if (parsed.fromInfo) setFromInfo(parsed.fromInfo);
        if (parsed.toInfo) setToInfo(parsed.toInfo);
        if (parsed.items) setItems(parsed.items);
        if (parsed.notes !== undefined) setNotes(parsed.notes);
        if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
      } catch (err) {
        alert("Invalid invoice backup file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const previewRef = useRef<HTMLDivElement>(null);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleDownloadPDF = async () => {
    const input = previewRef.current;
    if (!input) return;

    try {
      // Create a temporary clone for A4 rendering to preserve original styling
      const clone = input.cloneNode(true) as HTMLElement;
      clone.style.width = '800px';
      // Basic padding to adjust it if it's too snug to the top corner
      clone.style.padding = '40px'; 
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceMetadata.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#F8F9FB]">
      
      {/* Configuration Sidebar */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shrink-0 custom-scrollbar z-10 shadow-sm relative">
        <header className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Gen</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Billing tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaveLoadControls onSave={handleSaveFile} onLoad={handleLoadFile} label="Invoice" compact />
            <button 
              onClick={handleDownloadPDF} 
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Invoice #</label>
                <input type="text" value={invoiceMetadata.invoiceNumber} onChange={(e) => setInvoiceMetadata({...invoiceMetadata, invoiceNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Currency</label>
                <input type="text" value={invoiceMetadata.currency} onChange={(e) => setInvoiceMetadata({...invoiceMetadata, currency: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Issue Date</label>
                <input type="date" value={invoiceMetadata.date} onChange={(e) => setInvoiceMetadata({...invoiceMetadata, date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Due Date</label>
                <input type="date" value={invoiceMetadata.dueDate} onChange={(e) => setInvoiceMetadata({...invoiceMetadata, dueDate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">From (Your Details)</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Company Name" value={fromInfo.name} onChange={(e) => setFromInfo({...fromInfo, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <input type="email" placeholder="Email Address" value={fromInfo.email} onChange={(e) => setFromInfo({...fromInfo, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <textarea placeholder="Address" value={fromInfo.address} onChange={(e) => setFromInfo({...fromInfo, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">To (Client Details)</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Client Name" value={toInfo.name} onChange={(e) => setToInfo({...toInfo, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <input type="email" placeholder="Client Email" value={toInfo.email} onChange={(e) => setToInfo({...toInfo, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <textarea placeholder="Client Address" value={toInfo.address} onChange={(e) => setToInfo({...toInfo, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Line Items</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                  <div className="absolute right-3 top-3">
                     <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                     </button>
                  </div>
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm pr-8 focus:outline-none focus:ring-2 focus:border-blue-500" />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 uppercase ml-1">Qty</label>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 uppercase ml-1">Rate</label>
                      <input type="number" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-bold">
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Additional</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tax %</label>
              <input type="number" min="0" value={taxRate || ''} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Notes / Terms</label>
              <textarea placeholder="Thank you for your business!" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 min-h-[80px]" />
            </div>
          </div>

        </div>
      </aside>

      {/* Live Preview Pane */}
      <main className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8 flex items-start justify-center custom-scrollbar">
        <div className="overflow-x-auto w-full flex justify-center lg:block">
          <div 
            ref={previewRef}
            className="bg-white shadow-xl shadow-slate-200/50 w-[800px] shrink-0 p-10 md:p-16 flex flex-col font-sans origin-top lg:mx-auto"
            style={{
               minHeight: '1131px', // A4 proportion
            }}
          >
            {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">INVOICE</h1>
              <p className="text-slate-500 text-lg"># {invoiceMetadata.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 ml-auto text-pink shadow-lg shadow-blue-500/20">
                 <FileText size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{fromInfo.name || 'Your Company'}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bill To</h3>
              <p className="font-bold text-slate-900 text-lg mb-1">{toInfo.name || 'Client Name'}</p>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{toInfo.address}</p>
              <p className="text-slate-600 mt-1">{toInfo.email}</p>
            </div>
            
            <div className="text-right">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">From</h3>
              <p className="font-bold text-slate-900 text-lg mb-1">{fromInfo.name}</p>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{fromInfo.address}</p>
              <p className="text-slate-600 mt-1">{fromInfo.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 border-y border-slate-100 py-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Invoice Date</h3>
              <p className="font-medium text-slate-900">{invoiceMetadata.date}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Due Date</h3>
              <p className="font-medium text-slate-900">{invoiceMetadata.dueDate}</p>
            </div>
          </div>

          <div className="flex-1">
            <table className="w-full text-left mb-8">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-900">Description</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-900 text-center w-24">Qty</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-900 text-right w-32">Rate</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-900 text-right w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-4 text-slate-900 font-medium">{item.description || 'Item description'}</td>
                    <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                    <td className="py-4 text-slate-600 text-right">{invoiceMetadata.currency}{item.rate.toFixed(2)}</td>
                    <td className="py-4 text-slate-900 font-bold text-right">{invoiceMetadata.currency}{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
             <div className="w-64 flex justify-between py-2 text-slate-600">
                <span>Subtotal</span>
                <span>{invoiceMetadata.currency}{subtotal.toFixed(2)}</span>
             </div>
             {taxRate > 0 && (
               <div className="w-64 flex justify-between py-2 text-slate-600">
                  <span>Tax ({taxRate}%)</span>
                  <span>{invoiceMetadata.currency}{taxAmount.toFixed(2)}</span>
               </div>
             )}
             <div className="w-64 flex justify-between py-4 border-t-2 border-slate-900 text-xl font-black text-slate-900 mt-2">
                <span>Total</span>
                <span>{invoiceMetadata.currency}{total.toFixed(2)}</span>
             </div>
          </div>

          {notes && (
            <div className="mt-16 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</h3>
              <p className="text-slate-600 line-clamp-4 whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          </div>
        </div>
      </main>

    </div>
  );
};
