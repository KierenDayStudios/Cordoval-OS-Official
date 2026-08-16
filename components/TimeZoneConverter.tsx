import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Plus, Trash2, Sun, Moon, Globe, Sliders } from 'lucide-react';

const COMMON_ZONES = [
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { id: 'America/Denver', label: 'Denver (MT)' },
  { id: 'America/Chicago', label: 'Chicago (CT)' },
  { id: 'America/New_York', label: 'New York (ET)' },
  { id: 'Europe/London', label: 'London (GMT)' },
  { id: 'Europe/Paris', label: 'Paris (CET)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Asia/Kolkata', label: 'India (IST)' },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST)' }
];

export const TimeZoneConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedZones, setSelectedZones] = useState<string[]>(['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [baseTimeOffsetMinutes, setBaseTimeOffsetMinutes] = useState(0); // Offset from *now* in minutes for the "what if" slider
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addZone = (zoneId: string) => {
    if (!selectedZones.includes(zoneId)) {
      setSelectedZones([...selectedZones, zoneId]);
    }
  };

  const removeZone = (zoneId: string) => {
    setSelectedZones(selectedZones.filter(id => id !== zoneId));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseTimeOffsetMinutes(parseInt(e.target.value, 10));
  };

  const resetTime = () => setBaseTimeOffsetMinutes(0);

  // The simulated time is "now" + offset
  const simulatedTime = new Date(now.getTime() + baseTimeOffsetMinutes * 60000);

  const formatTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDateInfo = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getHourInZone = (date: Date, timeZone: string) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(date);
    const hourPart = parts.find(p => p.type === 'hour');
    return hourPart ? parseInt(hourPart.value, 10) : 0;
  };

  const isNightTime = (date: Date, timeZone: string) => {
    const hour = getHourInZone(date, timeZone);
    return hour < 6 || hour >= 20; // 8 PM to 6 AM is night
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#FAFAFA] text-slate-800">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe size={16} />
            </div>
            <h1 className="font-bold text-slate-900">World Clock</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Travel Slider</label>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Sliders size={14} /> Adjust Time
                  </div>
                  {baseTimeOffsetMinutes !== 0 && (
                     <button onClick={resetTime} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase tracking-widest hover:bg-blue-200 transition-colors">
                       Reset to Now
                     </button>
                  )}
                </div>
                <input 
                  type="range" 
                  min="-1440" 
                  max="1440" 
                  step="15"
                  value={baseTimeOffsetMinutes}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                   <span>-24h</span>
                   <span className={baseTimeOffsetMinutes === 0 ? 'text-blue-600' : ''}>Now</span>
                   <span>+24h</span>
                </div>
             </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Add Region</label>
            <div className="space-y-1">
               {COMMON_ZONES.map(zone => (
                 <button 
                   key={zone.id}
                   onClick={() => addZone(zone.id)}
                   disabled={selectedZones.includes(zone.id)}
                   className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                 >
                   <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {zone.label}</span>
                   {!selectedZones.includes(zone.id) && <Plus size={14} className="text-slate-400" />}
                 </button>
               ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-4">
           {selectedZones.length === 0 && (
             <div className="p-12 text-center text-slate-400">
               <Globe size={48} className="mx-auto mb-4 opacity-50" />
               <p className="font-bold text-lg">No time zones selected.</p>
               <p className="text-sm mt-1">Add regions from the sidebar.</p>
             </div>
           )}

           {selectedZones.map(zoneId => {
             const label = COMMON_ZONES.find(z => z.id === zoneId)?.label || zoneId;
             const isNight = isNightTime(simulatedTime, zoneId);
             
             return (
               <div key={zoneId} className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${isNight ? 'bg-slate-900 border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                 <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 ${isNight ? 'bg-slate-800 text-indigo-400' : 'bg-orange-50 text-orange-500'}`}>
                        {isNight ? <Moon size={24} /> : <Sun size={24} />}
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">{label}</h2>
                        <p className={`text-sm font-medium mt-1 uppercase tracking-widest ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                           {formatDateInfo(simulatedTime, zoneId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-current border-opacity-10">
                       <div className="text-right">
                         <div className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                           {formatTime(simulatedTime, zoneId)}
                         </div>
                       </div>
                       
                       <button 
                         onClick={() => removeZone(zoneId)}
                         className={`p-3 rounded-xl transition-colors ${isNight ? 'hover:bg-slate-800 text-slate-600 hover:text-slate-400' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>

                 </div>
                 
                 {/* Decorative background gradients based on time of day */}
                 {isNight ? (
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                 ) : (
                   <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                 )}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
