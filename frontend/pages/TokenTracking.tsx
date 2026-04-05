
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';

const TokenTracking: React.FC = () => {
  const location = useLocation();
  const [tokenInput, setTokenInput] = useState(location.state?.tokenNumber || '');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const findToken = async (input: string) => {
    setError('');
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('number', input.trim())
      .single();

    if (error || !data) {
      setResult(null);
      if (input) setError('Token not found in metropolitan database.');
    } else {
      setResult(data);
    }
  };

  useEffect(() => {
    if (tokenInput) findToken(tokenInput);
  }, []);

  useEffect(() => {
    if (!result) return;

    const channel = supabase
      .channel('token-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tokens',
          filter: `id=eq.${result.id}`
        },
        (payload) => {
          setResult(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [result?.id]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Animation feel
    findToken(tokenInput);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen flex flex-col pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white overflow-hidden relative">
      <div className="mesh-gradient opacity-30"></div>

      {/* Decorative Glow Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40rem] h-[40rem] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative z-10">

        {/* Left Section: Header and Search */}
        <div className="lg:col-span-5 space-y-12 reveal active">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="badge-yellow shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse">Active Grid Sync</span>
              <span className="badge-tag border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">v4.0 Live Pulse</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-impact text-4xl sm:text-7xl md:text-9xl xl:text-[10rem] tracking-tighter leading-none relative group select-none">
                <span className="relative z-10 mix-blend-overlay">GRID</span>
                <span className="text-blue-500 relative z-10">TRACK</span>
              </h1>
              <h2 className="text-impact text-lg sm:text-2xl md:text-3xl text-slate-400 tracking-tight leading-tight uppercase">
                Metropolitan Identity <span className="text-white">Triage Status</span>
              </h2>
            </div>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Real-time monitoring of your medical node status. Input your unique identifier to synchronize with the metropolitan dispatch matrix.
            </p>
          </div>

          <div className="glass-premium rounded-[3rem] p-8 sm:p-10 border border-white/10 shadow-3xl">
            <form onSubmit={handleTrack} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Node Identifier (Token)</label>
                <div className="relative group">
                  <span className="material-icons-round absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">confirmation_number</span>
                  <div className="relative overflow-hidden rounded-[2rem]">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 animate-[scan-line_2s_linear_infinite]"></div>
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="e.g. A-102"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-white font-black text-2xl tracking-tighter focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:shadow-[0_0_30px_rgba(59,130,246,0.3)] focus:outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-5 rounded-2xl animate-in shake flex items-center gap-3">
                  <span className="material-icons-round text-lg">error</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-6 bg-blue-600 hover:bg-white hover:text-black text-white rounded-full font-black text-xs uppercase tracking-[0.5em] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 group"
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-3 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Scan
                    <span className="material-icons-round text-2xl group-hover:translate-x-3 transition-transform">radar</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Results Display */}
        <div className="lg:col-span-7 flex items-center justify-center min-h-[500px] lg:mt-52">
          {result ? (
            <div className="w-full animate-in zoom-in-95 duration-700 reveal active">
              <div className="relative glass-premium rounded-[4rem] p-12 lg:p-16 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group overflow-hidden">
                <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
                  <span className="material-icons-round text-[20rem]">broadcast_on_home</span>
                </div>

                <div className="relative z-10 space-y-16">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 animate-[pulse-glow_3s_infinite]">Live Grid Identity</span>
                      <h3 className="text-impact text-[6rem] sm:text-[10rem] md:text-[12rem] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mt-4 leading-none group-hover:text-blue-500 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        {result.number}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-8">
                        <span className="px-6 py-2.5 rounded-2xl bg-slate-900/80 text-blue-400 font-black text-[10px] border border-blue-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">{result.service}</span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          {result.hospital_name || 'General Hospital'}
                        </span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-black text-[10px] border uppercase tracking-widest mb-8 ${result.status === 'called' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-blue-600/10 text-blue-500 border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${result.status === 'called' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500 animate-pulse'}`}></span>
                        {result.status}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Est. Node Velocity</p>
                      <p className="text-5xl sm:text-7xl font-black text-white mt-2 tracking-tighter drop-shadow-2xl">~{result.eta}</p>
                    </div>
                  </div>

                  <div className="relative pt-12">
                    <div className="absolute top-[50%] left-0 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: ['called', 'completed', 'dispatch'].includes(result.status?.toLowerCase()) ? '100%' : '75%' }}
                      >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      {['Reg', 'Triage', 'Verified', 'Dispatch'].map((step, i) => {
                        const isCompleted = ['called', 'completed', 'dispatch'].includes(result.status?.toLowerCase());
                        const activeSteps = i <= (isCompleted ? 3 : 2);
                        return (
                          <div key={i} className="flex flex-col items-center gap-5 group/step">
                            <div className={`w-8 h-8 rounded-full border-[6px] transition-all duration-700 flex items-center justify-center ${activeSteps ? 'bg-blue-600 border-slate-900 shadow-[0_0_30px_rgba(37,99,235,0.5)] ring-4 ring-blue-600/20 scale-125' : 'bg-slate-900 border-slate-800'} `}>
                              {activeSteps && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${activeSteps ? 'text-white translate-y-0 opacity-100' : 'text-slate-700 translate-y-2'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-10 opacity-30 reveal active">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
                <span className="material-icons-round text-7xl text-white">location_searching</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white tracking-tight uppercase">Monitoring Grid</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500">Metropolitan Node Scan Pending</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Stats Footer - Consistent with Home Page Bento Style */}
      <section className="mt-40 reveal active">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="glass-premium rounded-[2.5rem] p-10 border border-white/10 text-center hover:border-blue-500/30 group transition-all duration-500">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-3xl text-blue-500">speed</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4">Avg Processing</p>
            <p className="text-5xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">12<span className="text-xl text-blue-500 ml-1">min</span></p>
          </div>
          <div className="glass-premium rounded-[2.5rem] p-10 border border-white/10 text-center hover:border-indigo-500/30 group transition-all duration-500">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-3xl text-indigo-500">router</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4">Network Lag</p>
            <p className="text-5xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">0.4<span className="text-xl text-indigo-500 ml-1">ms</span></p>
          </div>
          <div className="glass-premium rounded-[2.5rem] p-10 border border-white/10 text-center hover:border-emerald-500/30 group transition-all duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-3xl text-emerald-500">check_circle</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4">Grid Load</p>
            <p className="text-5xl font-black text-emerald-500 tracking-tighter group-hover:text-emerald-400 transition-colors">OPTIMAL</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TokenTracking;
