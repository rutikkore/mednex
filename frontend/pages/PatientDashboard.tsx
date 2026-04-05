import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../hooks/useAuth';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeToken, setActiveToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ==============================
      Fetch Latest Token
  ============================== */
  const fetchLatestToken = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Fetch token error:', error);
    } else {
      setActiveToken(data?.[0] || null);
    }

    setLoading(false);
  };

  /* ==============================
      Realtime Listener
  ============================== */
  useEffect(() => {
    if (!user) return;

    fetchLatestToken();

    const channel = supabase
      .channel('patient-token-' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokens',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('Patient realtime update');
          fetchLatestToken();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white overflow-hidden relative">
      <div className="mesh-gradient opacity-30"></div>

      {/* Decorative Glow Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[30rem] h-[30rem] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40rem] h-[40rem] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto relative z-10 space-y-16">

        {/* Header Section */}
        <div className="space-y-6 text-center lg:text-left reveal active">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <span className="badge-yellow shadow-[0_0_15px_rgba(250,204,21,0.4)]">Patient Portal</span>
            <span className="badge-tag border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">Connected</span>
          </div>

          <h1 className="text-impact text-4xl sm:text-7xl md:text-8xl xl:text-9xl tracking-tighter leading-none relative group select-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">YOUR</span>
            <span className="text-blue-500 block">DASHBOARD</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Manage your appointments and track your token status in real-time.
          </p>
        </div>

        {/* Active Token Card */}
        {activeToken ? (
          <div className="glass-premium rounded-[3rem] p-8 sm:p-12 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] reveal active group relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute -right-20 -top-20 text-[20rem] text-white opacity-[0.02] pointer-events-none rotate-12 group-hover:rotate-[20deg] transition-transform duration-700">
              <span className="material-icons-round">local_hospital</span>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Token Info */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 animate-[pulse-glow_3s_infinite] block mb-4">Current Token</span>
                <h2 className="text-impact text-[8rem] sm:text-[10rem] leading-none text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  {activeToken.number}
                </h2>

                <div className="flex flex-wrap gap-4 mt-8">
                  <div className="px-6 py-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3">
                    <span className="material-icons-round text-blue-500">business</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Hospital</p>
                      <p className="text-sm font-bold text-white">{activeToken.hospital_name}</p>
                    </div>
                  </div>

                  <div className="px-6 py-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3">
                    <span className="material-icons-round text-indigo-500">medical_services</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Service</p>
                      <p className="text-sm font-bold text-white">{activeToken.service}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Current Status</p>
                      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${activeToken.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        activeToken.status === 'called' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${activeToken.status === 'called' ? 'bg-yellow-500 animate-ping' : activeToken.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                        {activeToken.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Populated ETA</p>
                      <p className="text-3xl font-black text-white">{activeToken.eta}</p>
                    </div>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ${activeToken.status === 'completed' ? 'w-full' : activeToken.status === 'called' ? 'w-[80%]' : 'w-[40%]'
                      }`}>
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/track')}
                    className="flex-1 py-4 bg-blue-600 hover:bg-white hover:text-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                  >
                    Track Live
                    <span className="material-icons-round text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => navigate('/patient/book')}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    New Token
                  </button>
                </div>
              </div>

            </div>
          </div>

        ) : (
          <div className="glass-premium rounded-[3rem] p-12 sm:p-20 text-center border border-white/10 shadow-2xl reveal active group">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-600/10 group-hover:scale-110 transition-all duration-500">
              <span className="material-icons-round text-5xl text-slate-400 group-hover:text-blue-500 transition-colors">calendar_today</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">No Active Token</h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto mb-10">
              You haven't booked any appointments yet. Get started by booking a new token.
            </p>

            <button
              onClick={() => navigate('/patient/book')}
              className="px-10 py-5 bg-blue-600 hover:bg-white hover:text-black text-white rounded-full font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105"
            >
              Book Appointment
            </button>
          </div>
        )}

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal active">
          {/* Stat 1 */}
          <div className="glass-premium rounded-[2.5rem] p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <span className="material-icons-round">history</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Visits</p>
            </div>
            <p className="text-4xl font-black text-white">12</p>
          </div>

          {/* Stat 2 */}
          <div className="glass-premium rounded-[2.5rem] p-8 border border-white/10 hover:border-emerald-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <span className="material-icons-round">thumb_up</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Completed</p>
            </div>
            <p className="text-4xl font-black text-white">10</p>
          </div>

          {/* Stat 3 */}
          <div onClick={() => navigate('/patient/triage')} className="cursor-pointer glass-premium rounded-[2.5rem] p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-icons-round text-purple-500">arrow_outward</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <span className="material-icons-round">smart_toy</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Triage</p>
            </div>
            <p className="text-4xl font-black text-white">Ready</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
