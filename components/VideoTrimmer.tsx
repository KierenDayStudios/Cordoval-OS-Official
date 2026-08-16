import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, Trash2, Download, Scissors, ArrowLeft } from 'lucide-react';

export const VideoTrimmer: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setStartTime(0);
      setEndTime(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      let current = videoRef.current.currentTime;
      if (current > endTime && !isExporting) {
        videoRef.current.pause();
        videoRef.current.currentTime = startTime;
        setIsPlaying(false);
      }
      setCurrentTime(current);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleExport = async () => {
    if (!videoRef.current) return;
    
    // Check if captureStream is supported
    const videoObj = videoRef.current as any;
    if (!videoObj.captureStream && !videoObj.mozCaptureStream) {
      alert("Video export is not fully supported on this browser.");
      return;
    }

    setIsExporting(true);
    videoRef.current.pause();
    videoRef.current.currentTime = startTime;

    // Small delay to ensure seek completes
    await new Promise(r => setTimeout(r, 200));

    try {
      const stream = videoObj.captureStream ? videoObj.captureStream() : videoObj.mozCaptureStream();
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trimmed-${videoFile?.name.split('.')[0] || 'video'}.webm`;
        a.click();
        
        setIsExporting(false);
        setIsPlaying(false);
      };

      recorder.start();
      videoRef.current.play();

      const checkTime = setInterval(() => {
        if (videoRef.current && videoRef.current.currentTime >= endTime) {
          videoRef.current.pause();
          recorder.stop();
          clearInterval(checkTime);
        }
      }, 50);

    } catch (err) {
      console.error(err);
      alert("Error during export process.");
      setIsExporting(false);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((timeInSeconds % 1) * 10).toString();
    return `${m}:${s}.${ms}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] text-white overflow-hidden relative">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 bg-[#1A1A1A] z-10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white/10 text-slate-300 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center">
            <Scissors size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Timeline</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Cut & Export</p>
          </div>
        </div>

        {videoSrc && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                setVideoFile(null);
                setVideoSrc(null);
                setDuration(0);
                setIsPlaying(false);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition w-full sm:w-auto text-sm font-bold"
            >
              <Trash2 size={16} /> Discard
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition w-full sm:w-auto text-sm font-bold disabled:opacity-50"
            >
              <Download size={16} /> {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto w-full custom-scrollbar">
        {!videoSrc ? (
          <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
             <div className="text-center">
               <div className="w-20 h-20 bg-white/5 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Scissors size={32} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Trim Video</h3>
               <p className="text-slate-400 mb-8 max-w-sm mx-auto">Upload a video to quickly cut out sections and export a web-optimized clip directly on your device.</p>
               
               <label className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-500 hover:scale-105 transition-all cursor-pointer shadow-xl shadow-teal-500/20">
                 <Upload size={20} /> Select Video File
                 <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
               </label>
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full items-center p-4 lg:p-8">
            
            {/* Player Container */}
            <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center flex-1 min-h-[300px]">
              <video 
                ref={videoRef}
                src={videoSrc}
                className="max-h-full w-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
              />
              
              {/* Play Pause Overlay for Mobile */}
              <button 
                onClick={togglePlay}
                className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity bg-black/20 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
              >
                <div className="w-20 h-20 bg-teal-500/90 text-white rounded-full flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform shadow-2xl">
                   {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
                </div>
              </button>

              {isExporting && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mb-6"></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Exporting Video...</h3>
                  <p className="text-teal-400 font-mono text-xl">{formatTime(currentTime)} / {formatTime(endTime)}</p>
                  <p className="text-slate-400 mt-4 text-sm max-w-xs text-center">Please do not close this tab or change windows while rendering.</p>
                </div>
              )}
            </div>

            {/* Trimmer Controls */}
            <div className="w-full max-w-4xl mt-6 lg:mt-10 bg-white/5 border border-white/10 rounded-3xl p-4 lg:p-8 mb-4 shrink-0">
              <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                 
                 <div className="flex items-center gap-4 border-2 border-white/10 bg-black/30 p-2 rounded-2xl">
                    <span className="font-mono text-teal-400 text-lg w-20 text-center font-bold">{formatTime(currentTime)}</span>
                 </div>
                 
                 <div className="flex gap-4">
                     <div className="text-center">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Start Time</span>
                        <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 font-mono text-sm text-white min-w-[80px]">
                           {formatTime(startTime)}
                        </div>
                     </div>
                     <div className="text-center">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">End Time</span>
                        <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 font-mono text-sm text-white min-w-[80px]">
                           {formatTime(endTime)}
                        </div>
                     </div>
                 </div>

              </div>
              
              {/* Timeline Sliders */}
              <div className="space-y-8 px-2">
                 {/* IN slider */}
                 <div className="relative">
                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                     <span>Trim Start (In)</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max={duration} 
                     step="0.01"
                     value={startTime}
                     onChange={(e) => {
                       const val = Number(e.target.value);
                       if (val < endTime) {
                         setStartTime(val);
                         if (videoRef.current) videoRef.current.currentTime = val;
                       }
                     }}
                     className="w-full h-4 bg-white/10 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                   />
                 </div>

                 {/* OUT slider */}
                 <div className="relative">
                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                     <span>Trim End (Out)</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max={duration} 
                     step="0.01"
                     value={endTime}
                     onChange={(e) => {
                       const val = Number(e.target.value);
                       if (val > startTime) {
                         setEndTime(val);
                         if (videoRef.current) videoRef.current.currentTime = val;
                       }
                     }}
                     className="w-full h-4 bg-white/10 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                   />
                 </div>
              </div>
              
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
};
