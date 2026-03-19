import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { supabase } from '../src/lib/supabase';

// Dummy data for the chart - in a real app this would come from the backend
const chartData = [
  { name: '08:00', patients: 12 },
  { name: '10:00', patients: 25 },
  { name: '12:00', patients: 45 },
  { name: '14:00', patients: 30 },
  { name: '16:00', patients: 15 },
  { name: '18:00', patients: 10 },
];

const StaffDashboard: React.FC = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  // New UI States
  const [doctorStatus, setDoctorStatus] = useState<'available' | 'busy' | 'break'>('available');
  const [isEmergency, setIsEmergency] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('Room 304 (General)');

  /* ======================
     Fetch Tokens
  ====================== */
  const fetchTokens = async () => {
    if (tokens.length === 0) setLoading(true);

    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch error:', error);
    } else {
      setTokens(data || []);

      // Derive initial activities from existing tokens
      const recentActions = (data || [])
        .filter(t => t.status !== 'waiting')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          text: `Token ${t.number} ${t.status}`,
          time: formatTime(t.created_at)
        }));
      setActivities(recentActions);
    }
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  /* ======================
     Realtime Subscription
  ====================== */
  useEffect(() => {
    fetchTokens();

    const channel = supabase
      .channel('staff-live-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokens',
        },
        (payload) => {
          fetchTokens();

          // Log specific events
          if (payload.eventType === 'UPDATE') {
            const { new: updatedToken } = payload;
            const actionText = updatedToken.status === 'called' ? 'called' :
              updatedToken.status === 'completed' ? 'completed' :
                updatedToken.status === 'cancelled' ? 'cancelled' : 'updated';

            setActivities(prev => [
              {
                id: Date.now(),
                text: `Token ${updatedToken.number} ${actionText}`,
                time: 'now'
              },
              ...prev.slice(0, 4)
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ======================
     Active Token Logic
  ====================== */
  const activeToken = useMemo(() => {
    return tokens.find((t) => t.status === 'called') || null;
  }, [tokens]);

  const queueTokens = useMemo(() => {
    return tokens.filter((t) => t.status === 'waiting');
  }, [tokens]);

  /* ======================
     Actions
  ====================== */
  const callNext = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const nextToken = queueTokens[0];
      if (!nextToken) {
        setProcessing(false);
        return;
      }

      const { error } = await supabase
        .from('tokens')
        .update({ status: 'called' })
        .eq('id', nextToken.id);

      if (error) throw error;
      await fetchTokens();
    } catch (err) {
      console.error('Error calling next:', err);
    } finally {
      setProcessing(false);
    }
  };

  const completeToken = async () => {
    if (!activeToken || processing) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('tokens')
        .update({ status: 'completed' })
        .eq('id', activeToken.id);

      if (error) throw error;
      await fetchTokens();
    } catch (err) {
      console.error('Error completing token:', err);
    } finally {
      setProcessing(false);
    }
  };

  const callTokenManual = async (id: string) => {
    if (processing) return;
    setProcessing(true);

    try {
      if (activeToken) {
        await supabase
          .from('tokens')
          .update({ status: 'waiting' })
          .eq('status', 'called');
      }

      const { error } = await supabase
        .from('tokens')
        .update({ status: 'called' })
        .eq('id', id);

      if (error) throw error;
      await fetchTokens();
    } catch (err) {
      console.error('Error manual call:', err);
    } finally {
      setProcessing(false);
    }
  };

  const toggleEmergency = () => setIsEmergency(!isEmergency);

  if (loading && tokens.length === 0) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  /* ======================
     UI Render
  ====================== */
  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-1000 ${isEmergency ? 'bg-red-950/30' : 'bg-[#020617]'}`}>
      <div className="mesh-gradient opacity-30"></div>

      <div className="relative z-10 max-w-[1800px] mx-auto pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 flex flex-col min-h-screen pb-12">

        {/* --- Header --- */}
        <header className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 p-4 rounded-3xl reveal active">
          <div className="flex flex-col gap-4">
            <h1 className="text-impact text-6xl tracking-tighter text-white leading-none">
              STAFF<span className="text-blue-500">CONSOLE</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="badge-tag">Node Identity v4.0</span>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{currentRoom}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              {(['available', 'break'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setDoctorStatus(status)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${doctorStatus === status
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {status === 'available' ? 'Available' : 'On Break'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-tight uppercase tracking-tight">Dr. Sarah Jen</p>
                <p className="text-[10px] text-blue-500 font-black tracking-widest uppercase mt-1">Metropolitan Node</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-2xl border border-white/10">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* --- Main Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">

          {/* Left Panel: Active Patient & Controls */}
          <div className="lg:col-span-8 flex flex-col gap-10">

            <div className={`flex-1 glass-premium rounded-[4rem] p-16 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-700 reveal active shadow-3xl ${isEmergency ? 'border-red-500/30' : ''}`}>

              {activeToken ? (
                <div className="relative z-10 animate-in fade-in zoom-in-95 duration-1000" key={activeToken.id}>
                  <span className="badge-yellow mb-12">Now Serving</span>

                  <h2 className="text-impact text-[14rem] sm:text-[20rem] text-white leading-none drop-shadow-3xl hover:text-blue-500 transition-colors duration-700">
                    {activeToken.number}
                  </h2>

                  <div className="mt-12 space-y-4">
                    <h3 className="text-5xl font-black text-white uppercase tracking-tighter">
                      {activeToken.patient_name}
                    </h3>
                    <div className="inline-block px-10 py-4 bg-white/5 border border-white/10 rounded-full">
                      <p className="text-sm font-black text-blue-500 uppercase tracking-[0.4em]">
                        {activeToken.severity || 'General Checkup'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="z-10 flex flex-col items-center opacity-30 animate-in fade-in duration-1000">
                  <span className="material-icons-round text-[12rem] mb-8">hail</span>
                  <h3 className="text-4xl font-black text-slate-400 uppercase tracking-widest">Station Idle</h3>
                  <p className="text-slate-600 mt-4 font-bold uppercase tracking-widest text-xs">Awaiting Network Signal...</p>
                </div>
              )}

              {isEmergency && (
                <div className="absolute inset-0 z-20 bg-red-950/90 backdrop-blur-md flex items-center justify-center flex-col animate-in fade-in duration-500">
                  <span className="material-icons-round text-[10rem] text-red-600 mb-8 animate-pulse">report_problem</span>
                  <h2 className="text-6xl font-black text-white uppercase tracking-tighter">Emergency Mode</h2>
                  <p className="text-red-400 mt-4 uppercase tracking-[0.4em] font-black">Normal operations inhibited</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={completeToken}
                disabled={!activeToken || processing || isEmergency}
                className="group relative h-24 glass-premium rounded-3xl overflow-hidden disabled:opacity-30 transition-all border border-emerald-500/20 hover:border-emerald-500/50"
              >
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xl font-black text-emerald-500 uppercase tracking-widest group-hover:scale-105 transition-transform">Finalize Session</span>
                  <span className="material-icons-round text-3xl text-emerald-500 group-hover:rotate-12 transition-transform">task_alt</span>
                </div>
              </button>

              <button
                onClick={callNext}
                disabled={!!activeToken || processing || queueTokens.length === 0 || isEmergency}
                className="group relative h-24 glass-premium rounded-3xl overflow-hidden disabled:opacity-30 transition-all border border-blue-500/20 hover:border-blue-500/50"
              >
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xl font-black text-blue-500 uppercase tracking-widest group-hover:scale-105 transition-transform">Summon Next Patient</span>
                  <span className="material-icons-round text-3xl text-blue-500 group-hover:translate-x-3 transition-transform">bolt</span>
                </div>
              </button>
            </div>

            <div className="h-48 glass-premium rounded-[3rem] p-10 flex flex-col shadow-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Network Loading Matrix</h3>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Node-Flux</span>
                </div>
              </div>
              <div className="flex-1 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                    <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPat)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 flex flex-col gap-10">

            <div className="flex-1 glass-premium rounded-[3.5rem] flex flex-col overflow-hidden shadow-3xl">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                  <span className="material-icons-round text-blue-500">sensors</span> Triage Row
                </h3>
                <div className="badge-tag">{queueTokens.length} Hubs</div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {queueTokens.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40">
                    <span className="material-icons-round text-5xl mb-4">visibility_off</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Signal Detected</p>
                  </div>
                ) : (
                  queueTokens.map((token, idx) => (
                    <div
                      key={token.id}
                      className="group flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-500 animate-in slide-in-from-right-8"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl font-black text-blue-500 tracking-tighter shadow-2xl group-hover:scale-110 transition-transform">
                          {token.number}
                        </div>
                        <div>
                          <p className="font-black text-white text-base uppercase leading-tight group-hover:text-blue-500 transition-colors">{token.patient_name}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{token.severity || 'General'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => callTokenManual(token.id)}
                        disabled={processing || isEmergency}
                        className="opacity-0 group-hover:opacity-100 p-3 rounded-2xl bg-blue-600 text-white hover:bg-white hover:text-blue-600 transition-all shadow-3xl active:scale-90"
                      >
                        <span className="material-icons-round text-xl">play_arrow</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-premium rounded-[2.5rem] p-8 space-y-8 shadow-3xl">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] px-4">Global Signal Log</h4>
                <div className="space-y-3">
                  {activities.map(act => (
                    <div key={act.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all">
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">{act.text}</span>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{act.time}</span>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-[9px] text-slate-700 uppercase font-black text-center py-6">Inbound quiet...</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-white/10 mx-4" />

              <button
                onClick={toggleEmergency}
                className={`w-full py-6 rounded-2xl border font-black text-[10px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-4 ${isEmergency
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse'
                  : 'bg-red-600/10 text-red-500 border-red-500/20 hover:bg-red-600 hover:text-white'
                  }`}
              >
                <span className="material-icons-round text-xl">{isEmergency ? 'cancel' : 'notification_important'}</span>
                {isEmergency ? 'Inhibit Emergency' : 'Broadcast Emergency'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
