import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Circle, Video, Radio, Activity, Download, Play, Save } from 'lucide-react';

export const MeetingRecorder: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<{ id: string; url: string; date: string; name: string }[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopMediaTracks = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordings(prev => [{
          id: Date.now().toString(),
          url,
          date: new Date().toLocaleString(),
          name: `Meeting Recording ${prev.length + 1}`
        }, ...prev]);
        setRecordingTime(0);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Could not access camera or microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    stopMediaTracks();
    setMediaStream(null);
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#f8fafc] text-slate-800">
      {/* Sidebar / Top Control Bar on Mobile */}
      <div className="md:w-80 w-full bg-white border-r border-b md:border-b-0 border-slate-200 flex flex-col shrink-0 z-10 shadow-xl">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between md:justify-start gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
               <ArrowLeft size={18} />
             </button>
             <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
               <Radio size={16} />
             </div>
             <h1 className="font-bold text-slate-900 hidden md:block">Meeting Recorder</h1>
             <h1 className="font-bold text-slate-900 block md:hidden">Recorder</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 font-mono">
               {formatTime(recordingTime)}
             </div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
               {isRecording ? (
                 <>
                   <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Recording Live
                 </>
               ) : 'Ready to record'}
             </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Circle size={14} className="fill-rose-500 text-rose-500" /> Start Meeting
                </button>
             ) : (
                <button 
                  onClick={stopRecording}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/25"
                >
                  <Square size={14} className="fill-white" /> Stop Recording
                </button>
             )}
          </div>
          
          {/* History */}
          <div className="pt-6 border-t border-slate-100 hidden md:block">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Saved Recordings</h3>
            <div className="space-y-3">
              {recordings.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No recordings yet
                </div>
              ) : (
                recordings.map(rec => (
                  <div key={rec.id} className="p-3 bg-white border border-slate-200 rounded-2xl text-sm flex flex-col gap-2 shadow-sm">
                     <p className="font-bold text-slate-700 text-xs truncate">{rec.name}</p>
                     <p className="text-[10px] text-slate-400">{rec.date}</p>
                     <a 
                       href={rec.url} 
                       download={`${rec.name}.webm`}
                       className="mt-2 text-[10px] font-bold uppercase text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                     >
                       <Download size={12} /> Download
                     </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900 relative">
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center max-h-full">
            {isRecording ? (
               <div className="w-full h-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                 <video 
                   ref={videoRef}
                   autoPlay 
                   muted 
                   playsInline
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Recording</span>
                 </div>
               </div>
            ) : (
               <div className="text-center flex flex-col items-center justify-center text-slate-500 h-full w-full">
                 <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                   <Video size={40} className="text-slate-600" />
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Camera Idle</h2>
                 <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                   Press Start Meeting to begin recording your session. Video and audio will be captured locally.
                 </p>
               </div>
            )}
        </div>
        
        {/* Mobile History View (only shows when not recording or just placed below) */}
        <div className="md:hidden bg-white p-4 border-t border-slate-200 h-1/3 overflow-y-auto">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Saved Recordings</h3>
          <div className="space-y-3">
            {recordings.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No recordings yet
              </div>
            ) : (
              recordings.map(rec => (
                <div key={rec.id} className="p-3 bg-white border border-slate-200 rounded-2xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                   <div>
                     <p className="font-bold text-slate-700 text-xs truncate">{rec.name}</p>
                     <p className="text-[10px] text-slate-400 mt-1">{rec.date}</p>
                   </div>
                   <a 
                     href={rec.url} 
                     download={`${rec.name}.webm`}
                     className="text-[10px] font-bold uppercase text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                   >
                     <Download size={12} /> Save
                   </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
