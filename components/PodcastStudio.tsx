import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, Pause, Download, Trash2, 
  ArrowLeft, Music, Volume2, Save, Clock, Activity,
  Settings, MoreVertical, Plus, Radio, Zap
} from 'lucide-react';
import { PodcastRecording } from '../types';

interface PodcastStudioProps {
  recordings: PodcastRecording[];
  onSave: (recording: PodcastRecording) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const PodcastStudio: React.FC<PodcastStudioProps> = ({ recordings, onSave, onDelete, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadWav = async () => {
    if (!audioBlob) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podcast_recording_${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error converting to WAV:", err);
      alert("Failed to convert audio to WAV format.");
    }
  };

  // Simple WAV encoder
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for (i = 0; i < numOfChan; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++;                                     // next source sample
    }

    return new Blob([bufferArray], { type: "audio/wav" });
  };

  const handleSaveRecording = () => {
    if (!audioBlob) return;
    const recording: PodcastRecording = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Podcast Session ${new Date().toLocaleDateString()}`,
      name: `Podcast Session ${new Date().toLocaleDateString()}`,
      duration: recordingTime,
      updatedAt: Date.now(),
      tags: ['podcast'],
      folderId: null,
      history: [],
      fileSize: audioBlob.size
    };
    onSave(recording);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F172A] text-white overflow-hidden font-sans">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/5 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 md:gap-3 truncate">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
               <Radio size={18} />
             </div>
             <div className="truncate">
               <h1 className="text-sm md:text-lg font-black text-white tracking-tighter uppercase italic truncate">Podcast Studio</h1>
               <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">Professional Audio Capture</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="h-8 md:h-10 px-3 md:px-4 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center gap-2 text-[7px] md:text-[9px] font-black text-rose-400 uppercase tracking-widest whitespace-nowrap">
              <Zap size={12} /> <span className="hidden sm:inline">Studio Mode Active</span><span className="sm:hidden">Active</span>
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Recording Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5 min-h-[500px] lg:min-h-0">
           <div className="w-full max-w-md flex flex-col items-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8 md:mb-12">
                 {/* Visualizer Animation */}
                 {isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                       {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-1 md:w-1.5 bg-rose-500 rounded-full animate-pulse"
                            style={{ 
                              height: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.5s'
                            }}
                          />
                       ))}
                    </div>
                 )}
                 <div className={`w-36 h-36 md:w-48 md:h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isRecording ? 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 'border-white/10'}`}>
                    <div className={`w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-white/5'}`}>
                       <Mic size={48} className={isRecording ? 'text-white' : 'text-slate-500'} />
                    </div>
                 </div>
              </div>

              <div className="text-center mb-8 md:mb-12">
                 <div className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums mb-2">
                    {formatTime(recordingTime)}
                 </div>
                 <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    {isRecording ? 'Recording in Progress' : audioUrl ? 'Recording Captured' : 'Ready to Record'}
                 </p>
              </div>

              <div className="flex items-center gap-4 md:gap-6 w-full px-4">
                 {!isRecording && !audioUrl ? (
                    <button 
                      onClick={startRecording}
                      className="w-full h-16 md:h-20 px-8 md:px-12 bg-rose-500 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                       <Mic size={20} /> Start Session
                    </button>
                 ) : isRecording ? (
                    <button 
                      onClick={stopRecording}
                      className="w-full h-16 md:h-20 px-8 md:px-12 bg-white text-slate-900 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                       <Square size={20} fill="currentColor" /> Stop Session
                    </button>
                 ) : (
                    <div className="flex flex-col gap-3 md:gap-4 w-full">
                       <div className="flex gap-3 md:gap-4">
                          <button 
                            onClick={() => { setAudioUrl(null); setAudioBlob(null); setRecordingTime(0); }}
                            className="flex-1 h-12 md:h-14 bg-white/5 border border-white/10 text-slate-400 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:text-white transition-all"
                          >
                             Discard
                          </button>
                          <button 
                            onClick={handleSaveRecording}
                            className="flex-1 h-12 md:h-14 bg-rose-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl flex items-center justify-center gap-2"
                          >
                             <Save size={14} /> Save
                          </button>
                       </div>
                       <button 
                        onClick={handleDownloadWav}
                        className="w-full h-12 md:h-14 bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl flex items-center justify-center gap-2"
                       >
                        <Download size={14} /> Download WAV
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Archive Sidebar */}
        <aside className="w-full lg:w-96 bg-white/5 flex flex-col shrink-0">
           <div className="p-6 md:p-8 border-b border-white/10">
              <h3 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Clock size={14} /> Session Archive
              </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 scrollbar-hide">
              {recordings.length === 0 ? (
                 <div className="py-10 md:py-20 text-center opacity-20 flex flex-col items-center gap-4">
                    <Music className="w-8 h-8 md:w-12 md:h-12" />
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">No sessions found</p>
                 </div>
              ) : (
                 recordings.map(rec => (
                    <div key={rec.id} className="p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:border-rose-500/30 transition-all group">
                       <div className="flex justify-between items-start mb-3 md:mb-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500/10 text-rose-500 rounded-lg md:rounded-xl flex items-center justify-center">
                             <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <button onClick={() => onDelete(rec.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100">
                             <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                       </div>
                       <h4 className="font-black text-xs md:text-sm text-white mb-1 truncate">{rec.title}</h4>
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">{formatTime(rec.duration)}</span>
                          <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">{new Date(rec.updatedAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </aside>
      </main>
    </div>
  );
};
