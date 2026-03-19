import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Link } from 'react-router-dom';

const BedManagement: React.FC = () => {
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHospitalData = async () => {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Hospital fetch error:', error);
    } else {
      setHospital(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitalData();

    const channel = supabase
      .channel('hospital-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'hospitals' },
        (payload) => {
          if (hospital && payload.new.id === hospital.id) {
            setHospital(payload.new);
          } else if (!hospital) {
            fetchHospitalData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hospital?.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!hospital) return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-12 text-center reveal active">
      <span className="material-icons-round text-[10rem] text-slate-900 mb-8">domain_disabled</span>
      <h1 className="text- impact text-5xl font-black mb-6 uppercase tracking-tight">Grid Link Severed</h1>
      <p className="text-slate-600 max-w-md uppercase tracking-[0.4em] text-[10px] font-black leading-loose">
        Protocol Error: System could not establish a link to the Regional Capacity Hub. Signal lost at METRO-NODE.
      </p>
    </div>
  );

  const wardMatrix = [
    { name: 'ICU / Critical Nodes', available: hospital.icu_available, total: hospital.icu_total, icon: 'emergency', tint: 'red-500' },
    { name: 'General Ward Block', available: hospital.general_available, total: hospital.general_total, icon: 'bed', tint: 'blue-500' },
    { name: 'Cardiac Sync Hub', available: hospital.cardiac_available, total: hospital.cardiac_total, icon: 'favorite', tint: 'emerald-500' },
  ];

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden selection:bg-blue-500">
      <div className="mesh-gradient opacity-30"></div>

      <div className="w-full max-w-[1800px] mx-auto space-y-20 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 reveal active">
          <div className="space-y-6">
            <h1 className="text-impact text-7xl sm:text-9xl tracking-tighter leading-none">
              WARD<span className="text-blue-500">CONTROL</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="badge-tag">{hospital.name}</span>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Active Hub Matrix</span>
            </div>
          </div>
          <button className="px-12 py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-3xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center gap-4">
            <span className="material-icons-round">person_add</span> Admit Registration
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 reveal active">
          {[
            { label: 'Total Node Capacity', val: hospital.icu_total + hospital.general_total + hospital.cardiac_total, color: 'text-white' },
            { label: 'Occupied Segments', val: (hospital.icu_total - hospital.icu_available) + (hospital.general_total - hospital.general_available) + (hospital.cardiac_total - hospital.cardiac_available), color: 'text-slate-400' },
            { label: 'Open Channels', val: hospital.icu_available + hospital.general_available + hospital.cardiac_available, color: 'text-blue-500' },
            { label: 'Critical Alert', val: hospital.icu_available < 2 ? 'YES' : 'NO', color: 'text-red-500', alert: hospital.icu_available < 2 },
          ].map((kpi, i) => (
            <div key={i} className={`glass-premium rounded-[3rem] p-12 border border-white/5 text-center shadow-3xl transition-all duration-700 hover:border-blue-500/30 ${kpi.alert ? 'border-red-500/50 bg-red-950/20' : ''}`}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mb-6">{kpi.label}</p>
              <p className={`text-8xl font-black ${kpi.color} tracking-tighter drop-shadow-2xl`}>{kpi.val}</p>
              {kpi.alert && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-4 animate-pulse">Low ICU Warning</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="glass-premium rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden p-12 sm:p-20 reveal active hover:border-blue-500/20 transition-all duration-700">
              <div className="flex justify-between items-center mb-16">
                <h3 className="text-impact text-5xl sm:text-6xl text-white tracking-tight">LIVE HUB MATRIX</h3>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Real-time Flux</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {wardMatrix.map((ward, i) => {
                  const isFull = ward.available === 0;
                  const isLow = ward.available < 3;
                  const percent = Math.min(100, (ward.available / ward.total) * 100);
                  return (
                    <div key={i} className="space-y-10 text-center group">
                      <div className={`w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center border transition-all duration-700 ${isFull ? 'bg-red-600/10 border-red-600/30 text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/50'}`}>
                        <span className="material-icons-round text-4xl group-hover:scale-110 transition-transform">{ward.icon}</span>
                      </div>
                      <div className="space-y-2">
                        <p className={`text-8xl font-black transition-colors duration-700 ${isFull ? 'text-red-700' : isLow ? 'text-orange-500' : 'text-white group-hover:text-blue-500'}`}>{ward.available}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">OPEN / {ward.total}</p>
                      </div>
                      <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)] ${isFull ? 'bg-red-600' : isLow ? 'bg-orange-500' : 'bg-blue-600'}`} style={{ width: `${percent}%` }}></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] leading-none transition-colors group-hover:text-slate-300">{ward.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-premium rounded-[4rem] p-12 sm:p-24 border border-white/5 shadow-3xl group relative overflow-hidden reveal active">
              <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-1000 rotate-12">
                <span className="material-icons-round text-[30rem]">neurology</span>
              </div>
              <div className="relative z-10 max-w-3xl space-y-12">
                <div className="badge-tag !bg-blue-600/10 !text-blue-500">AI Recommendation</div>
                <h3 className="text-impact text-7xl sm:text-8xl text-white tracking-tighter leading-[0.9]">SMARTFLOW<br /><span className="text-blue-500">REDISTRIBUTE</span></h3>
                <p className="text-slate-400 text-xl sm:text-2xl leading-relaxed font-black uppercase tracking-tight">
                  Neural engine predicts surge in <span className="text-white">ICU-NODE-7</span>. Initiate bypass to <span className="text-blue-500">BREACH-CANDY-HUB</span> (Current Load: 42%).
                </p>
                <div className="pt-6">
                  <button className="px-16 py-8 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.5em] shadow-3xl hover:bg-white hover:text-black transition-all flex items-center gap-6 active:scale-95 group/btn">
                    Authorize Sync <span className="material-icons-round group-hover/btn:rotate-90 transition-transform">sync_alt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 h-full reveal active">
            <div className="glass-premium rounded-[4rem] border border-white/5 shadow-3xl p-12 flex flex-col h-full max-h-[1000px] hover:border-blue-500/20 transition-all duration-700">
              <div className="mb-12 border-b border-white/5 pb-10">
                <h3 className="text-3xl font-black text-white tracking-tight uppercase">Transfer Queue</h3>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Node-to-Node Flux</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
                  <div key={i} className="group p-8 rounded-[3.5rem] bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] leading-none transition-all group-hover:tracking-[0.8em]">ID-GRID-{8800 + i}</p>
                      <span className="material-icons-round text-slate-700 group-hover:text-blue-500 transition-colors">swap_horiz</span>
                    </div>
                    <p className="font-black text-white text-xl uppercase leading-tight group-hover:text-blue-500 transition-colors tracking-tighter">Seven Hills Hub</p>
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest group-hover:text-slate-400">Transit Status</p>
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{Math.floor(Math.random() * 10) + 2}m Remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedManagement;
