import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../src/lib/supabase';
import { Token } from '../types';

const CounterConsole: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<{
    name: string;
    service: string;
    severity: 'normal' | 'priority' | 'emergency';
  }>({ name: '', service: 'General Medicine', severity: 'normal' });

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch error:', error);
    } else {
      const mappedData = (data || []).map(t => ({
        id: t.id,
        number: t.number,
        patientName: t.patient_name,
        service: t.service,
        severity: t.severity,
        status: t.status,
        eta: t.eta || 'Waiting',
        timestamp: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setTokens(mappedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();

    const channel = supabase
      .channel('counter-tokens')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tokens' },
        () => {
          if (isSyncing) fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSyncing]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nowServing = useMemo(() => {
    return tokens.find(t => t.status === 'called') || null;
  }, [tokens]);

  const waitingList = useMemo(() => {
    return tokens.filter(t => t.status === 'waiting');
  }, [tokens]);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = newPatient.service.charAt(0).toUpperCase();
    const count = tokens.length + 1;
    const number = `${prefix}-${100 + count}`;

    const { error } = await supabase
      .from('tokens')
      .insert([
        {
          number,
          patient_name: newPatient.name,
          service: newPatient.service,
          severity: newPatient.severity,
          status: 'waiting'
        }
      ]);

    if (error) {
      console.error('Entry error:', error);
    } else {
      setIsModalOpen(false);
      setNewPatient({ name: '', service: 'General Medicine', severity: 'normal' });
      fetchTokens();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden flex flex-col pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-12 relative selection:bg-blue-500">
      <div className="mesh-gradient opacity-30"></div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10 reveal active">
        <div className="space-y-4">
          <h1 className="text-impact text-7xl sm:text-8xl tracking-tighter leading-none">GRID<span className="text-blue-500">DISPLAY</span></h1>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">Node Cluster Sync Active</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95">Manual Registration</button>
          <div className="text-right hidden sm:block">
            <p className="text-7xl font-black tracking-tighter text-white font-mono leading-none">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-[9px] mt-2">Temporal Node: METRO-01</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0 relative z-10 reveal active">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="flex-1 glass-premium rounded-[4rem] p-16 flex flex-col items-center justify-center text-center shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000 rotate-12">
              <span className="material-icons-round text-[30rem]">sensors</span>
            </div>
            {nowServing ? (
              <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700" key={nowServing.id}>
                <span className="badge-yellow mb-16">Active Occupancy</span>
                <h2 className="text-impact text-[14rem] sm:text-[22rem] text-white leading-none drop-shadow-3xl group-hover:text-blue-500 transition-colors duration-700">
                  {nowServing.number}
                </h2>
                <div className="mt-16 space-y-4">
                  <h3 className="text-5xl font-black text-white uppercase tracking-tighter">{nowServing.patientName}</h3>
                  <div className="inline-block px-12 py-5 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-2xl">
                    <p className="text-sm font-black text-blue-500 uppercase tracking-[0.5em]">{nowServing.service}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="z-10 flex flex-col items-center opacity-30 animate-in fade-in duration-1000">
                <span className="material-icons-round text-[12rem] mb-8">wifi_off</span>
                <h3 className="text-4xl font-black text-slate-400 uppercase tracking-widest leading-none">No Link Detected</h3>
                <p className="text-slate-600 mt-6 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Signal Stream...</p>
              </div>
            )}
          </div>

          <div className="h-32 glass-premium rounded-[3rem] border border-white/10 p-8 flex items-center overflow-hidden shadow-3xl">
            <div className="flex-shrink-0 font-black text-blue-500 uppercase tracking-[0.5em] text-[10px] mr-12 flex items-center gap-4">
              <span className="material-icons-round text-2xl">campaign</span> EMERGENCY ALERT
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="whitespace-nowrap animate-marquee flex gap-20">
                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                  Follow health grid protocol v8.2 • Cardiology units proceed to Hub-04 • Oxygen levels nominal in Sector 7 • All staff report for sync at 09:00 temporal.
                </p>
                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                  Follow health grid protocol v8.2 • Cardiology units proceed to Hub-04 • Oxygen levels nominal in Sector 7 • All staff report for sync at 09:00 temporal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col min-h-0">
          <div className="flex-1 glass-premium rounded-[4rem] border border-white/10 flex flex-col overflow-hidden shadow-3xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                <span className="material-icons-round text-blue-500">grid_view</span> Row Inbound
              </h3>
              <div className="badge-tag">{waitingList.length} Nodes</div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {waitingList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40 uppercase tracking-[0.4em] font-black text-xs">
                  <span className="material-icons-round text-6xl mb-6">inbox_customize</span>
                  Cluster Empty
                </div>
              ) : (
                waitingList.map((t) => (
                  <div key={t.id} className="p-10 rounded-[3rem] bg-white/5 border border-white/5 flex justify-between items-center group hover:border-blue-500/30 hover:bg-white/10 transition-all duration-500 animate-in slide-in-from-right-12">
                    <div>
                      <div className="flex items-center gap-4">
                        <p className="text-5xl font-black text-white group-hover:text-blue-500 transition-colors tracking-tighter">{t.number}</p>
                        {t.severity === 'emergency' && <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shadow-[0_0_15px_red]" />}
                      </div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-3">{t.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Impact</p>
                      <p className="text-3xl font-black text-blue-500 tracking-tighter">{t.eta}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-12 bg-white/5 border-t border-white/5">
              <button onClick={() => setIsSyncing(!isSyncing)} className="w-full py-6 rounded-[2rem] border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all hover:bg-white/5">
                {isSyncing ? 'Break Telemetry Link' : 'Establish Telemetry Stream'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-500 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#020617]/95" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#020617] rounded-[4rem] border border-white/10 shadow-3xl overflow-hidden reveal active zoom-in-95">
            <div className="p-12 border-b border-white/10 bg-white/5">
              <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Network Entry</h3>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Registering Manual Node to Grid</p>
            </div>
            <form onSubmit={handleManualAdd} className="p-12 space-y-10">
              <div className="space-y-4 text-center sm:text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 ml-6">Identity Signature</label>
                <input required type="text" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-8 text-xl text-white font-black uppercase tracking-widest focus:bg-white/10 focus:outline-none focus:border-blue-500/50 placeholder:text-slate-800 transition-all shadow-inner" placeholder="Subject Name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 ml-6">Target Sector</label>
                  <div className="relative">
                    <select value={newPatient.service} onChange={e => setNewPatient({ ...newPatient, service: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-8 text-sm text-white font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer">
                      <option className="bg-[#020617]">General Medicine</option>
                      <option className="bg-[#020617]">Cardiology</option>
                      <option className="bg-[#020617]">Pediatrics</option>
                    </select>
                    <span className="material-icons-round absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 ml-6">Threat Level</label>
                  <div className="flex gap-4 p-2 bg-white/5 rounded-[2.5rem] border border-white/10">
                    {(['normal', 'emergency'] as const).map((lvl) => (
                      <button key={lvl} type="button" onClick={() => setNewPatient({ ...newPatient, severity: lvl })} className={`flex-1 py-7 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${newPatient.severity === lvl ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-600 hover:text-slate-300'}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-10 flex flex-col sm:flex-row gap-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-8 bg-white/5 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Abnormal Termination</button>
                <button type="submit" className="flex-1 py-8 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl hover:bg-white hover:text-blue-600 transition-all active:scale-95">Establish Connection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Animation for Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CounterConsole;
