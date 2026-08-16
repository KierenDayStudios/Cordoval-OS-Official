import React, { useState, useRef } from 'react';
import { Download, ArrowLeft, Plus, Trash2, FileText, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const QuoteGenerator: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [quoteMetadata, setQuoteMetadata] = useState({
    quoteNumber: 'EST-001',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: '$'
  });

  const [fromInfo, setFromInfo] = useState({
    name: 'Your Company Name',
    email: 'sales@yourcompany.com',
    address: '123 Business Rd.\nCity, State 12345'
  });

  const [toInfo, setToInfo] = useState({
    name: 'Client Name',
    email: 'client@email.com',
    address: '456 Client St.\nClient City, 67890'
  });

  const [items, setItems] = useState([
    { id: '1', description: 'Consulting Retainer', quantity: 1, rate: 1500, amount: 1500 }
  ]);

  const [terms, setTerms] = useState('This quote is valid for 30 days. Prices are subject to change after this period.');
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);

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
  const discountAmount = (subtotal * discountRate) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  const handleDownloadPDF = async () => {
    const input = previewRef.current;
    if (!input) return;

    try {
      const clone = input.cloneNode(true) as HTMLElement;
      clone.style.width = '800px';
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
      pdf.save(`quote-${quoteMetadata.quoteNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
               <FileText size={16} />
             </div>
             <h1 className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-4">Quote Generator</h1>
          </div>
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="bg-slate-900 text-white px-4 md:px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm shadow-sm"
        >
          <Download size={16} /> <span className="hidden sm:inline">Export PDF</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto min-h-full">
          {/* Editor Panel */}
          <div className="w-full lg:w-96 flex-shrink-0 border-r border-slate-200 bg-white shadow-xl lg:shadow-none z-10 flex flex-col h-auto lg:h-[calc(100vh-80px)] overflow-y-auto">
            <div className="p-4 md:p-6 space-y-6 md:space-y-8">
              
              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Quote Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Quote #</label>
                    <input 
                      type="text" 
                      value={quoteMetadata.quoteNumber}
                      onChange={e => setQuoteMetadata({...quoteMetadata, quoteNumber: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={quoteMetadata.date}
                      onChange={e => setQuoteMetadata({...quoteMetadata, date: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Valid Until</label>
                    <input 
                      type="date" 
                      value={quoteMetadata.validUntil}
                      onChange={e => setQuoteMetadata({...quoteMetadata, validUntil: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px w-full bg-slate-100" />

              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">From</h3>
                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Company Name"
                    value={fromInfo.name} onChange={e => setFromInfo({...fromInfo, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input 
                    type="email" placeholder="Email Address"
                    value={fromInfo.email} onChange={e => setFromInfo({...fromInfo, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <textarea 
                    placeholder="Address" rows={2}
                    value={fromInfo.address} onChange={e => setFromInfo({...fromInfo, address: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  />
                </div>
              </section>

              <div className="h-px w-full bg-slate-100" />

              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">To (Client)</h3>
                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Client Name"
                    value={toInfo.name} onChange={e => setToInfo({...toInfo, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input 
                    type="email" placeholder="Client Email"
                    value={toInfo.email} onChange={e => setToInfo({...toInfo, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <textarea 
                    placeholder="Client Address" rows={2}
                    value={toInfo.address} onChange={e => setToInfo({...toInfo, address: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  />
                </div>
              </section>

              <div className="h-px w-full bg-slate-100" />

              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Line Items</h3>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Item {index + 1}</span>
                         <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                      <input 
                        type="text" placeholder="Description"
                        value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <div className="flex gap-2">
                        <div className="w-1/3">
                          <input 
                            type="number" placeholder="Qty" min="1"
                            value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                        <div className="w-2/3">
                          <input 
                            type="number" placeholder="Rate" min="0"
                            value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addItem}
                    className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>
              </section>

              <div className="h-px w-full bg-slate-100" />
              
              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Totals & Values</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-1/2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Discount (%)</label>
                        <input 
                          type="number" min="0" max="100"
                          value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                     </div>
                     <div className="w-1/2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Tax (%)</label>
                        <input 
                          type="number" min="0" max="100"
                          value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Currency Symbol</label>
                    <input 
                      type="text" 
                      value={quoteMetadata.currency} onChange={e => setQuoteMetadata({...quoteMetadata, currency: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px w-full bg-slate-100" />

              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Terms & Conditions</h3>
                <textarea 
                  rows={4}
                  value={terms} onChange={e => setTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </section>

            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-slate-100/50 p-4 md:p-8 flex items-start justify-center min-h-[500px]">
             
            <div 
              ref={previewRef}
              className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-200 w-full max-w-[800px] min-h-[800px] p-8 md:p-12 font-sans"
            >
              <div className="flex justify-between items-start mb-16">
                <div>
                  <h1 className="text-3xl font-light text-slate-900 tracking-tight">QUOTE</h1>
                  <p className="text-sm text-slate-500 mt-2">#{quoteMetadata.quoteNumber}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p className="font-medium text-slate-900 text-base">{fromInfo.name}</p>
                  <p className="mt-1">{fromInfo.email}</p>
                  <p className="whitespace-pre-wrap mt-1">{fromInfo.address}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between mb-16 gap-8">
                <div className="text-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quote For</h3>
                  <p className="font-medium text-slate-900 text-base">{toInfo.name}</p>
                  <p className="text-slate-600 mt-1">{toInfo.email}</p>
                  <p className="text-slate-600 whitespace-pre-wrap mt-1">{toInfo.address}</p>
                </div>
                <div className="text-sm sm:text-right">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</h3>
                    <p className="text-slate-900">{quoteMetadata.date}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valid Until</h3>
                    <p className="text-slate-900">{quoteMetadata.validUntil}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex border-b border-slate-200 pb-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="w-1/2">Description</div>
                  <div className="w-1/6 text-right">Qty</div>
                  <div className="w-1/6 text-right">Rate</div>
                  <div className="w-1/6 text-right">Amount</div>
                </div>
                
                {items.map(item => (
                  <div key={item.id} className="flex border-b border-slate-100 py-4 text-sm text-slate-700">
                    <div className="w-1/2 font-medium text-slate-900">{item.description}</div>
                    <div className="w-1/6 text-right">{item.quantity}</div>
                    <div className="w-1/6 text-right">{quoteMetadata.currency}{item.rate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="w-1/6 text-right">{quoteMetadata.currency}{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mb-16">
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-100">
                    <span>Subtotal</span>
                    <span>{quoteMetadata.currency}{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  {discountRate > 0 && (
                    <div className="flex justify-between py-2 text-sm text-amber-600 border-b border-slate-100">
                      <span>Discount ({discountRate}%)</span>
                      <span>-{quoteMetadata.currency}{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-100">
                      <span>Tax ({taxRate}%)</span>
                      <span>{quoteMetadata.currency}{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-4 text-lg font-bold text-slate-900 border-b-2 border-slate-900">
                    <span>Total</span>
                    <span>{quoteMetadata.currency}{total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {terms && (
                <div className="text-sm text-slate-500 bg-slate-50 p-6 border-l-2 border-amber-500 rounded-r-xl">
                  <h3 className="font-bold text-slate-900 mb-2">Terms & Information</h3>
                  <p className="whitespace-pre-wrap">{terms}</p>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
