
import React, { useState, useEffect } from 'react';
import { MOCK_TOKENS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSync } from '../hooks/useSync';

const data = [
  { name: '08:00', patients: 12 },
  { name: '10:00', patients: 45 },
  { name: '12:00', patients: 38 },
  { name: '14:00', patients: 65 },
  { name: '16:00', patients: 50 },
  { name: '18:00', patients: 20 },
];

const StaffDashboard: React.FC = () => {
  const { emit, lastEvent } = useSync();
  const [tokens, setTokens] = useState<any[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('smartflow_db_tokens');
    setTokens(saved ? JSON.parse(saved) : MOCK_TOKENS);
  }, []);

  useEffect(() => {
    if (lastEvent?.type === 'TOKEN_BOOKED') {
      const saved = JSON.parse(localStorage.getItem('smartflow_db_tokens') || '[]');
      setTokens(saved);
    }
  }, [lastEvent]);

  const activeToken = tokens.find(t => t.status === 'called');

  const updateStatus = (id: string, status: any) => {
    const updated = tokens.map(t => t.id === id ? { ...t, status } : t);
    setTokens(updated);
    localStorage.setItem('smartflow_db_tokens', JSON.stringify(updated));
    emit('TOKEN_STATUS_UPDATED', { tokenId: id, status });
  };

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>
      
      <div className="w-full max-w-[1800px] mx-auto space-y-16 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 reveal active">
          <div className="space-y-4">
             <h1 className="text-impact text-6xl sm:text-8xl tracking-tighter leading-none">
               QUEUE<span className="text-blue-500">COMMAND</span>
             </h1>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">
               Node #04 Dispatch • Live Grid Matrix
             </p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Shift: ALPHA-4</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="glass-premium rounded-[3rem] sm:rounded-[4rem] p-12 sm:p-20 border border-white/10 shadow-3xl group relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
                <span className="material-icons-round text-[22rem]">broadcast_on_home</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Broadcasting Identity</span>
                </div>
                <h2 className="text-impact text-[12rem] sm:text-[16rem] text-white leading-none group-hover:text-blue-500 transition-colors duration-700">
                  {activeToken?.number || '---'}
                </h2>
                <p className="text-2xl sm:text-4xl font-black text-white/90 mt-8 uppercase tracking-tight">{activeToken?.patientName || 'GRID IDLE'}</p>
                
                <div className="mt-16 flex flex-wrap justify-center gap-6">
                  <button 
                    onClick={() => updateStatus(activeToken?.id!, 'complete')}
                    disabled={!activeToken}
                    className="px-12 py-6 bg-blue-600 hover:bg-white hover:text-black text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all duration-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:hover:text-white"
                  >
                    Terminate Turn
                  </button>
                  <button disabled={!activeToken} className="px-12 py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] transition-all disabled:opacity-30">
                    Recall Node
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl h-full">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-10">Distribution Load</h3>
                  <div className="h-48 w-full opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorPat)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-600 rounded-[3rem] p-8 text-white text-center shadow-2xl">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Velocity</p>
                     <p className="text-5xl font-black mt-3 tracking-tighter">12<span className="text-xl ml-1">m</span></p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-center text-white">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lag</p>
                     <p className="text-5xl font-black mt-3 tracking-tighter text-blue-400">~2s</p>
                  </div>
                  <div className="col-span-2 glass-premium border border-white/10 rounded-[3rem] p-8 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                           <span className="material-icons-round">hub</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Throughput</p>
                          <p className="text-2xl font-black text-white uppercase">128 Nodes</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="glass-premium rounded-[3rem] border border-white/10 shadow-3xl flex flex-col h-full max-h-[850px]">
              <div className="p-10 border-b border-white/5">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Incoming Grid</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Pending verification</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {tokens.filter(t => t.status === 'waiting').map((token) => (
                  <div key={token.id} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl font-black text-white tracking-tighter">{token.number}</span>
                      <span className={`text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                        token.severity === 'emergency' ? 'bg-red-500 text-white' : 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {token.severity}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-300 uppercase tracking-tight">{token.patientName}</p>
                    <div className="mt-8 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{token.service}</span>
                       <button onClick={() => updateStatus(token.id, 'called')} className="w-12 h-12 rounded-2xl bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl transition-all flex items-center justify-center">
                         <span className="material-icons-round">play_arrow</span>
                       </button>
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

export default StaffDashboard;
