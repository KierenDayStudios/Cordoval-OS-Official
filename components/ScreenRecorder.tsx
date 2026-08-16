import React, { useState, useRef } from 'react';
import { ArrowLeft, Monitor, StopCircle, Download, Video, Circle } from 'lucide-react';

export const ScreenRecorder: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setVideoUrl(null);
    } catch (err) {
      console.error("Error accessing screen:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          Screen Recorder <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`} />
        </h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center gap-8 overflow-y-auto">
        <div className={`w-full max-w-3xl aspect-video bg-slate-900 rounded-3xl border shadow-2xl overflow-hidden relative flex items-center justify-center transition-all ${isRecording ? 'border-rose-500/50 shadow-rose-500/10' : 'border-white/5'}`}>
          {isRecording ? (
             <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          ) : videoUrl ? (
             <video src={videoUrl} controls className="w-full h-full object-contain bg-black" />
          ) : (
            <div className="flex flex-col items-center text-slate-500 gap-4">
              <Monitor size={48} className="opacity-50" />
              <p className="font-medium">Ready to record tab or desktop</p>
            </div>
          )}
          
          {isRecording && (
            <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
              <Circle size={8} fill="currentColor" /> Recording
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900/50 p-4 rounded-3xl backdrop-blur-md border border-white/5 w-full max-w-3xl">
          {!isRecording ? (
            <button onClick={startRecording} className="px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold flex items-center gap-2 transition-all flex-1 md:flex-none justify-center shadow-lg shadow-rose-500/20">
              <Video size={18} /> Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="px-6 py-4 bg-white/10 hover:bg-white/20 text-rose-400 rounded-2xl font-bold flex items-center gap-2 transition-all flex-1 md:flex-none justify-center">
              <StopCircle size={18} /> Stop Recording
            </button>
          )}
          
          {videoUrl && !isRecording && (
            <a href={videoUrl} download="screen-recording.webm" className="px-6 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold flex items-center gap-2 transition-all flex-1 md:flex-none justify-center shadow-lg shadow-indigo-500/20">
              <Download size={18} /> Download Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
