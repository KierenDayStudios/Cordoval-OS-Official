import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Trash2, PenTool, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Try standard worker configuration that supports Vite seamlessly
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const NativeSignatureCanvas = React.forwardRef<any, { canvasProps: { className: string } }>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    },
    isEmpty: () => {
      return !hasDrawn;
    },
    getTrimmedCanvas: () => {
      // Just returning the full canvas for now to bypass external dependencies
      return canvasRef.current;
    }
  }));

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      c.width = c.clientWidth;
      c.height = c.clientHeight;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
      }
    }
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={props.canvasProps.className} 
      onMouseDown={startDraw} 
      onMouseMove={draw} 
      onMouseUp={stopDraw} 
      onMouseLeave={stopDraw} 
      onTouchStart={startDraw} 
      onTouchMove={draw} 
      onTouchEnd={stopDraw} 
    />
  );
});

export const ESignatureTool: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const sigPad = useRef<any>(null);

  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setFileDataUrl(dataUrl);

      if (uploadedFile.type === 'application/pdf') {
        const loadingTask = pdfjsLib.getDocument(dataUrl);
        const pdfApp = await loadingTask.promise;
        const page = await pdfApp.getPage(1); // Render first page for preview
        
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          // @ts-ignore
          await page.render({ canvasContext: context, viewport }).promise;
          setPageImage(canvas.toDataURL());
          setPageDimensions({ width: viewport.width, height: viewport.height });
        }
      } else if (uploadedFile.type.startsWith('image/')) {
        setPageImage(dataUrl);
        
        // Get dimensions
        const img = new Image();
        img.onload = () => {
          setPageDimensions({ width: img.width, height: img.height });
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleClearSignature = () => {
    sigPad.current?.clear();
  };

  const handleSaveSignature = () => {
    if (sigPad.current?.isEmpty()) return;
    setSignatureData(sigPad.current.getTrimmedCanvas().toDataURL('image/png'));
    setIsSigning(false);
    // Reset to center
    setSignaturePosition({ x: 50, y: 50 });
  };

  const handleDownload = async () => {
    if (!file || !fileDataUrl || !signatureData) return;

    if (file.type === 'application/pdf') {
      const pdfBytes = await fetch(fileDataUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const signatureImageBytes = await fetch(signatureData).then(res => res.arrayBuffer());
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      
      const pages = pdfDoc.getPages();
      const firstPage = pages[0]; // Placing on first page for simplicity
      const { width, height } = firstPage.getSize();
      
      // Calculate position
      const renderContainer = document.getElementById('render-container');
      const containerWidth = renderContainer?.clientWidth || width;
      const containerHeight = renderContainer?.clientHeight || height;
      
      const xRatio = width / containerWidth;
      const yRatio = height / containerHeight;

      // In PDF, origin is bottom-left, so we need to invert Y
      const actualX = signaturePosition.x * xRatio;
      const actualY = height - (signaturePosition.y * yRatio) - 50; // Approximating signature height

      firstPage.drawImage(signatureImage, {
        x: actualX,
        y: actualY,
        width: 150 * xRatio,
        height: 50 * yRatio,
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `signed_${file.name}`;
      link.click();
      
    } else if (file.type.startsWith('image/')) {
       // Similar for images using HTML5 Canvas
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       const baseImg = new Image();
       
       baseImg.onload = () => {
         canvas.width = baseImg.width;
         canvas.height = baseImg.height;
         ctx?.drawImage(baseImg, 0, 0);

         const sigImg = new Image();
         sigImg.onload = () => {
           const renderContainer = document.getElementById('render-container');
           const containerWidth = renderContainer?.clientWidth || baseImg.width;
           const containerHeight = renderContainer?.clientHeight || baseImg.height;
           const xRatio = baseImg.width / containerWidth;
           const yRatio = baseImg.height / containerHeight;
           
           ctx?.drawImage(sigImg, signaturePosition.x * xRatio, signaturePosition.y * yRatio, 150 * xRatio, 50 * yRatio);
           
           const link = document.createElement('a');
           link.href = canvas.toDataURL(file.type);
           link.download = `signed_${file.name}`;
           link.click();
         };
         sigImg.src = signatureData;
       };
       baseImg.src = fileDataUrl;
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleDrag = (e: any) => {
    if (!isDragging) return;
    const container = document.getElementById('render-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    let x = clientX - rect.left - 75; // center offset
    let y = clientY - rect.top - 25;

    // Bounds
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > rect.width - 150) x = rect.width - 150;
    if (y > rect.height - 50) y = rect.height - 50;

    setSignaturePosition({ x, y });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 border-l border-slate-200" onMouseMove={handleDrag} onMouseUp={handleDragEnd} onTouchMove={handleDrag} onTouchEnd={handleDragEnd}>
      <header className="flex items-center justify-between p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-colors mr-2"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="w-12 h-12 bg-blue-100/50 text-blue-600 rounded-xl flex items-center justify-center">
            <PenTool size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">E-Signature</h1>
            <p className="text-sm text-slate-500">Sign PDFs and images securely.</p>
          </div>
        </div>
        <div className="flex gap-4">
          {!file ? (
            <label className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer font-medium">
               <Upload size={18} /> Upload Document
               <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          ) : (
            <>
              <button 
                onClick={() => { setFile(null); setFileDataUrl(null); setPageImage(null); setSignatureData(null); }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                <Trash2 size={18} /> Clear
              </button>
              <button 
                onClick={handleDownload}
                disabled={!signatureData}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                <Download size={18} /> Download Signed
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8 flex items-start justify-center relative">
        {!file ? (
           <div className="text-center mt-20">
             <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon size={40} />
             </div>
             <h3 className="text-2xl font-bold text-slate-700 mb-2">No document selected</h3>
             <p className="text-slate-500">Upload a PDF or image to add your signature</p>
           </div>
        ) : (
           <div className="flex flex-col items-center">
             <div className="mb-6 flex gap-4 w-full max-w-4xl">
               <button 
                  onClick={() => setIsSigning(true)}
                  className="flex-1 py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
               >
                  + Add Signature
               </button>
             </div>
             
             {pageImage && (
               <div 
                 id="render-container"
                 className="relative shadow-2xl bg-white select-none rounded-sm border border-slate-200"
                 style={{ 
                   maxWidth: '100%', 
                   maxHeight: '1000px',
                   width: pageDimensions ? `${pageDimensions.width}px` : 'auto'
                 }}
               >
                 <img 
                   src={pageImage} 
                   alt="Document preview" 
                   className="w-full h-auto pointer-events-none"
                 />
                 
                 {signatureData && (
                   <div 
                     className="absolute border border-blue-500/50 bg-blue-50/20 cursor-move rounded transition-shadow shadow-sm hover:shadow-lg"
                     style={{
                       left: signaturePosition.x,
                       top: signaturePosition.y,
                       width: 150,
                       height: 50,
                       backgroundImage: `url(${signatureData})`,
                       backgroundSize: 'contain',
                       backgroundRepeat: 'no-repeat',
                       backgroundPosition: 'center',
                     }}
                     onMouseDown={handleDragStart}
                     onTouchStart={handleDragStart}
                   />
                 )}
               </div>
             )}
           </div>
        )}
      </div>

      {isSigning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Draw your signature</h2>
              <button onClick={() => setIsSigning(false)} className="text-slate-400 hover:text-slate-900">
                <Trash2 size={24} />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl mb-8 bg-slate-50 cursor-crosshair">
              <NativeSignatureCanvas 
                ref={sigPad}
                canvasProps={{ className: 'w-full h-64 rounded-2xl' }}
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleClearSignature}
                className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
               >
                Clear
              </button>
              <button 
                onClick={handleSaveSignature}
                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
               >
                Save & Apply Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
