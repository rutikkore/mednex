
import React, { useEffect, useState, useCallback } from 'react';
import { MOCK_TOKENS } from '../constants';
import { Token } from '../types';

const Marquee: any = 'marquee';

const CounterConsole: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [nowServing, setNowServing] = useState<Token>(MOCK_TOKENS.find(t => t.status === 'called') || MOCK_TOKENS[1]);
  const [waitingList, setWaitingList] = useState<Token[]>(MOCK_TOKENS.filter(t => t.status === 'waiting'));
  const [isSyncing, setIsSyncing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<{
    name: string;
    service: string;
    severity: 'normal' | 'priority' | 'emergency';
  }>({ name: '', service: 'General Medicine', severity: 'normal' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const simulateSocketEvent = useCallback(() => {
    const callNextPatient = () => {
      if (waitingList.length > 0) {
        setWaitingList(prev => {
          const newList = [...prev];
          const next = newList.shift();
          if (next) setNowServing({ ...next, status: 'called' });
          return newList;
        });
      }
    };
    const addNewToken = () => {
      const number = `A-${100 + Math.floor(Math.random() * 900)}`;
      const names = ['Amit', 'Sunita', 'Vikram', 'Anjali', 'Rohan', 'Kavita'];
      const services = ['General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics'];
      const newToken: Token = {
        id: Math.random().toString(36).substr(2, 9),
        number,
        patientName: names[Math.floor(Math.random() * names.length)],
        service: services[Math.floor(Math.random() * services.length)],
        severity: 'normal',
        status: 'waiting',
        eta: `${10 + Math.floor(Math.random() * 20)}m`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setWaitingList(prev => [...prev, newToken]);
    };
    const callInterval = setInterval(callNextPatient, 30000);
    const addInterval = setInterval(addNewToken, 45000); 
    return () => { clearInterval(callInterval); clearInterval(addInterval); };
  }, [waitingList]);

  useEffect(() => {
    if (isSyncing) return simulateSocketEvent();
  }, [isSyncing, simulateSocketEvent]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newToken: Token = {
      id: Math.random().toString(36).substr(2, 9),
      number: `M-${200 + Math.floor(Math.random() * 700)}`,
      patientName: newPatient.name,
      service: newPatient.service,
      severity: newPatient.severity,
      status: 'waiting',
      eta: 'Waiting',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWaitingList(prev => [...prev, newToken]);
    setIsModalOpen(false);
    setNewPatient({ name: '', service: 'General Medicine', severity: 'normal' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-12 relative selection:bg-blue-500">
      <div className="mesh-gradient opacity-30"></div>
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10">
        <div className="space-y-4">
          <h1 className="text-impact text-6xl sm:text-7xl tracking-tighter leading-none">GRID<span className="text-blue-500">DISPLAY</span></h1>
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></span>
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">Live Telemetry Sync</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95">Manual Entry</button>
          <div className="text-right hidden sm:block">
            <p className="text-6xl font-black tracking-tighter text-white">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] mt-1">Mumbai Metropolitan Node</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0 relative z-10">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="flex-1 glass-premium rounded-[4rem] p-16 flex flex-col items-center justify-center text-center shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
              <span className="material-icons-round text-[25rem]">broadcast_on_home</span>
            </div>
            <div className="relative z-10 animate-in zoom-in-95 duration-700" key={nowServing.id}>
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-10 block">Currently Occupying</span>
              <h2 className="text-impact text-[14rem] sm:text-[20rem] text-white leading-none drop-shadow-2xl group-hover:text-blue-500 transition-colors duration-700">
                {nowServing.number}
              </h2>
              <div className="inline-block mt-12 px-12 py-5 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                <p className="text-4xl font-black uppercase tracking-widest text-white">{nowServing.service}</p>
              </div>
            </div>
          </div>

          <div className="h-32 glass-premium rounded-[2.5rem] border border-white/10 p-8 flex items-center overflow-hidden">
             <div className="flex-shrink-0 font-black text-blue-500 uppercase tracking-[0.4em] text-[10px] mr-12 flex items-center gap-3">
                <span className="material-icons-round text-xl">campaign</span> Announcement
             </div>
             <Marquee className="text-xl font-black text-slate-400 uppercase tracking-widest">
               Please keep mobile nodes on silent • Follow safety protocols v4.1 • Direct all blood bank requests to Point B • Next patient for cardiology proceed to Counter 04 immediately.
             </Marquee>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col min-h-0">
          <div className="flex-1 glass-premium rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-3xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                <span className="material-icons-round text-blue-500">list_alt</span> Incoming
              </h3>
              <div className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">{waitingList.length} Units</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {waitingList.map((t) => (
                <div key={t.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex justify-between items-center group hover:border-blue-500/30 hover:bg-white/10 transition-all animate-in slide-in-from-right-8 duration-500">
                  <div>
                    <div className="flex items-center gap-3">
                       <p className="text-4xl font-black text-white group-hover:text-blue-500 transition-colors">{t.number}</p>
                       {t.severity === 'emergency' && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{t.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Velocity</p>
                    <p className="text-2xl font-black text-blue-500 tracking-tighter">{t.eta}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 bg-white/5 border-t border-white/5">
              <button onClick={() => setIsSyncing(!isSyncing)} className="w-full py-4 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all">
                {isSyncing ? 'Inhibit Live Sync' : 'Resume Live Sync'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#020617] rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/10 bg-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">Grid Entry</h3>
              <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">Manual Hub Registration</p>
            </div>
            <form onSubmit={handleManualAdd} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Full Identity</label>
                <input required type="text" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-bold focus:bg-white/10 focus:outline-none placeholder:text-slate-800" placeholder="Identity Name" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Target Node</label>
                  <select value={newPatient.service} onChange={e => setNewPatient({...newPatient, service: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-bold focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-[#020617]">General Medicine</option>
                    <option className="bg-[#020617]">Cardiology</option>
                    <option className="bg-[#020617]">Pediatrics</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Priority</label>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-[2rem] border border-white/5">
                    {(['normal', 'emergency'] as const).map((lvl) => (
                      <button key={lvl} type="button" onClick={() => setNewPatient({...newPatient, severity: lvl})} className={`flex-1 py-5 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all ${newPatient.severity === lvl ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-white/5 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-6 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all">Establish Node</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterConsole;
