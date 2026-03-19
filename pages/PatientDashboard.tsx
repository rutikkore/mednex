
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lastEvent } = useSync();
  const navigate = useNavigate();
  const [activeToken, setActiveToken] = useState<any>(null);

  const fetchLatestToken = () => {
    const allTokens = JSON.parse(localStorage.getItem('smartflow_db_tokens') || '[]');
    const userTokens = allTokens.filter((t: any) => t.userId === user?.id).reverse();
    if (userTokens.length > 0) {
      setActiveToken(userTokens[0]);
    }
  };

  useEffect(() => {
    fetchLatestToken();
  }, [user]);

  useEffect(() => {
    if (lastEvent?.type === 'TOKEN_STATUS_UPDATED') {
      if (lastEvent.payload.tokenId === activeToken?.id) {
        setActiveToken((prev: any) => ({ ...prev, status: lastEvent.payload.status }));
      }
    }
    if (lastEvent?.type === 'TOKEN_BOOKED' && lastEvent.payload.userId === user?.id) {
      fetchLatestToken();
    }
  }, [lastEvent, activeToken, user]);

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>
      
      <div className="w-full max-w-[1800px] mx-auto space-y-16 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 reveal active">
          <div className="space-y-4">
             <h1 className="text-impact text-6xl sm:text-8xl tracking-tighter leading-none">
               PATIENT<span className="text-blue-500">HUB</span>
             </h1>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">
               Logged in as: <span className="text-white">{user?.name}</span> • Grid Node v4.1
             </p>
          </div>
          
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link to="/patient/book" className="px-10 py-5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-white hover:text-black transition-all duration-500 active:scale-95 flex items-center gap-3">
              <span className="material-icons-round">add_circle</span> Establish Token
            </Link>
            <Link to="/patient/emergency" className="px-10 py-5 bg-white/5 border border-white/10 text-red-500 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all duration-500 active:scale-95 flex items-center gap-3">
              <span className="material-icons-round">emergency</span> Help Me
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Active Token Area */}
          <div className="lg:col-span-8">
            <div className="glass-premium rounded-[3rem] sm:rounded-[4rem] p-10 sm:p-16 border border-white/10 shadow-3xl group relative overflow-hidden h-full flex flex-col justify-center min-h-[500px]">
              <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
                <span className="material-icons-round text-[20rem]">broadcast_on_home</span>
              </div>

              {activeToken ? (
                <div className="relative z-10 space-y-12 animate-in zoom-in-95 duration-700">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Active Metropolitan Node</span>
                      <h3 className="text-impact text-[10rem] sm:text-[13rem] text-white mt-4 leading-none group-hover:text-blue-500 transition-colors duration-500">
                        {activeToken.number}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-8">
                        <span className="px-6 py-2.5 rounded-2xl bg-white/5 text-white font-black text-[10px] border border-white/10 uppercase tracking-widest">{activeToken.service}</span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{activeToken.hospitalName}</span>
                      </div>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-black text-[10px] border uppercase tracking-widest mb-8 ${
                        activeToken.status === 'called' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${activeToken.status === 'called' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500 animate-pulse'}`}></span> 
                        {activeToken.status}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Velocity</p>
                      <p className="text-6xl sm:text-7xl font-black text-white mt-2 tracking-tighter">~{activeToken.eta}</p>
                    </div>
                  </div>

                  <div className="relative pt-12">
                    <div className="absolute top-[50%] left-0 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000 ease-out"
                        style={{ width: activeToken.status === 'called' ? '100%' : '75%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      {['Reg', 'Triage', 'Verified', 'Dispatch'].map((step, i) => {
                        const activeSteps = i <= 2;
                        return (
                          <div key={i} className="flex flex-col items-center gap-5">
                            <div className={`w-6 h-6 rounded-full border-[5px] transition-all duration-700 ${activeSteps ? 'bg-blue-600 border-white shadow-2xl ring-4 ring-blue-600/10' : 'bg-[#020617] border-white/10'} `}></div>
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${activeSteps ? 'text-white' : 'text-slate-600'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="pt-10 flex justify-center">
                    <button onClick={() => navigate('/track', { state: { tokenNumber: activeToken.number }})} className="px-12 py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all duration-500 active:scale-95 flex items-center gap-4">
                      <span className="material-icons-round">radar</span> Track Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-10 opacity-30 animate-in fade-in duration-1000">
                  <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                     <span className="material-icons-round text-7xl text-white">token</span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-white tracking-tight uppercase">Grid Idle</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500">No active metropolitan nodes established</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="lg:col-span-4 space-y-10">
            <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl text-center">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-6 block">Nearby Nodes</span>
               <div className="space-y-4">
                  {[
                    { name: 'Tata Memorial', dist: '1.2km', status: 'Optimal' },
                    { name: 'KEM Hospital', dist: '0.8km', status: 'Free Beds' }
                  ].map((h, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex justify-between items-center group hover:bg-white/10 transition-all">
                      <div className="text-left">
                        <p className="font-black text-white text-sm uppercase tracking-tight">{h.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{h.dist} • Metropolitan Node</p>
                      </div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{h.status}</span>
                    </div>
                  ))}
               </div>
            </div>

            <Link to="/patient/blood-bank" className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl text-center block group hover:border-red-500/50 transition-all duration-500">
               <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-2xl">
                  <span className="material-icons-round text-3xl">bloodtype</span>
               </div>
               <h4 className="text-xl font-black text-white uppercase tracking-tight">Blood Grid Sync</h4>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Locate rare types in transit</p>
            </Link>

            <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4">Metropolitan Load</p>
               <p className="text-5xl font-black text-emerald-500 tracking-tighter">OPTIMAL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
