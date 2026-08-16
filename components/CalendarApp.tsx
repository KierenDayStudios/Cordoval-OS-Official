
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowLeft,
  Calendar as CalendarIcon,
  Search,
  Zap,
  Clock,
  MapPin,
  Bell
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  onSaveEvent: (event: CalendarEvent) => void;
  onBack: () => void;
}

export const CalendarApp: React.FC<CalendarProps> = ({ events, onSaveEvent, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    type: 'work' as any,
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1));
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  const openModal = () => {
    const defaultDate = selectedDay 
      ? `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];
    
    setNewEvent({
      ...newEvent,
      date: defaultDate
    });
    setShowModal(true);
  };

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFF] overflow-hidden">
      
      {/* Dynamic Header */}
      <header className="px-4 md:px-10 py-4 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
           <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 shrink-0"><ArrowLeft size={20} /></button>
           <div>
              <h1 className="text-xl md:text-4xl font-extrabold text-slate-900 tracking-tighter flex items-center gap-2 md:gap-3">
                <span className="text-rose-500">{monthName}</span> {year}
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] mt-1">Workspace Schedule Master</p>
           </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
           <div className="flex bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
             <button onClick={handlePrevMonth} className="p-1.5 md:p-2 hover:bg-slate-50 text-slate-400 rounded-lg md:rounded-xl transition-all"><ChevronLeft size={20} /></button>
             <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date().getDate()); }} className="px-3 md:px-4 text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">Today</button>
             <button onClick={handleNextMonth} className="p-1.5 md:p-2 hover:bg-slate-50 text-slate-400 rounded-lg md:rounded-xl transition-all"><ChevronRight size={20} /></button>
           </div>
           <button 
            onClick={openModal}
            className="h-10 md:h-14 px-4 md:px-8 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 md:gap-3 shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 text-[10px] md:text-sm"
           >
             <Plus size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Create Event</span><span className="sm:hidden">New</span>
           </button>
        </div>
      </header>

      {/* Calendar Grid Container */}
      <div className="flex-1 px-4 md:px-10 pb-4 md:pb-10 flex flex-col xl:flex-row overflow-hidden gap-6 md:gap-8">
        
        {/* Main Grid */}
        <div className="flex-1 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-50 select-none">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 md:py-4 text-center text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 auto-rows-fr">
            {days.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              const isSelected = day === selectedDay;
              
              return (
                <div 
                  key={i} 
                  onClick={() => day && setSelectedDay(day)}
                  className={`border-r border-b border-slate-50 p-1 md:p-3 flex flex-col gap-1 md:gap-1.5 group transition-colors cursor-pointer ${day ? 'hover:bg-slate-50/50' : 'bg-slate-50/30'} ${isSelected ? 'bg-rose-50/30' : ''}`}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-center md:justify-between mb-1">
                        <span className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full md:rounded-xl font-black text-xs md:text-sm transition-all ${isToday ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : isSelected ? 'bg-slate-900 text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>{day}</span>
                        {dayEvents.length > 0 && <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />}
                      </div>
                      
                      {/* Mobile Event Dots */}
                      <div className="flex md:hidden justify-center gap-0.5 flex-wrap">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full ${event.type === 'work' ? 'bg-blue-500' : event.type === 'urgent' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        ))}
                        {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                      </div>

                      {/* Desktop Event List */}
                      <div className="hidden md:flex flex-1 overflow-y-auto scrollbar-hide flex-col space-y-1">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight shadow-sm border truncate transition-all hover:scale-[1.02] cursor-pointer
                              ${event.type === 'work' ? 'bg-blue-50 text-blue-600 border-blue-100' : event.type === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Schedule */}
        <aside className="w-full xl:w-80 flex flex-col gap-6 md:gap-8 shrink-0 overflow-y-auto xl:overflow-visible">
           <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm flex-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Bell size={14} className="text-rose-500" />
                {selectedDay ? `Events for ${monthName} ${selectedDay}` : 'Upcoming Highlights'}
              </h3>
              <div className="space-y-6">
                {(selectedDay ? selectedDayEvents : events).length === 0 ? (
                  <div className="py-12 text-center text-slate-300 italic text-xs">No events scheduled.</div>
                ) : (
                  (selectedDay ? selectedDayEvents : events).slice(0, 5).map(e => (
                    <div key={e.id} className="flex gap-4 group cursor-pointer">
                       <div className={`w-1 h-12 rounded-full transition-all group-hover:w-2 ${e.type === 'work' ? 'bg-blue-500' : e.type === 'urgent' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                       <div>
                          <h4 className="font-black text-slate-800 text-sm leading-tight">{e.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1.5"><Clock size={10} /> {e.date}</p>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </aside>
      </div>

      {/* Modal - Simplified */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 md:p-6">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-lg p-6 md:p-10 shadow-2xl border border-white animate-in zoom-in-95">
             <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 tracking-tighter">Schedule Milestone</h2>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Event Identity</label>
                   <input 
                    placeholder="Q4 Strategy Review..." 
                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Event Timeline</label>
                   <input 
                    type="date"
                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {['work', 'personal', 'urgent'].map(t => (
                     <button 
                      key={t}
                      onClick={() => setNewEvent({...newEvent, type: t as any})}
                      className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newEvent.type === t ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
             </div>
             <div className="flex gap-4 mt-12">
                <button onClick={() => setShowModal(false)} className="flex-1 h-14 text-slate-400 font-bold uppercase text-xs tracking-widest transition-colors hover:text-slate-900">Discard</button>
                <button 
                  onClick={() => {
                    onSaveEvent({ id: Math.random().toString(), title: newEvent.title, type: newEvent.type, date: newEvent.date });
                    setShowModal(false);
                    setNewEvent({ title: '', type: 'work', date: new Date().toISOString().split('T')[0] });
                  }}
                  className="flex-1 h-14 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-200 transition-all active:scale-95"
                >
                  Confirm Event
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
