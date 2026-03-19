
import React, { useState } from 'react';
import { INDIAN_HOSPITALS } from '../constants';
import { Link } from 'react-router-dom';

const BedManagement: React.FC = () => {
  const hospital = INDIAN_HOSPITALS[0];

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>
      
      <div className="w-full max-w-[1800px] mx-auto space-y-16 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 reveal active">
          <div className="space-y-4">
             <h1 className="text-impact text-6xl sm:text-8xl tracking-tighter leading-none">
               WARD<span className="text-blue-500">CONTROL</span>
             </h1>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">
               {hospital.name} Metropolitan Capacity Hub
             </p>
          </div>
          <button className="px-10 py-5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-black transition-all active:scale-95 flex items-center gap-3">
            <span className="material-icons-round">add_circle</span> Admit Identifier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Network Cap', val: '2,450', color: 'text-blue-500' },
            { label: 'Occupied', val: '2,102', color: 'text-white' },
            { label: 'Available', val: '348', color: 'text-emerald-500' },
            { label: 'Diversions', val: '14', color: 'text-red-500' },
          ].map((kpi, i) => (
            <div key={i} className="glass-premium rounded-[2.5rem] p-10 border border-white/10 text-center shadow-3xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">{kpi.label}</p>
              <p className={`text-6xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="glass-premium rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden p-12 sm:p-16">
               <h3 className="text-impact text-4xl sm:text-5xl text-white mb-12 tracking-tight">LIVE WARD MATRIX</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { name: 'ICU / Critical', ...hospital.beds.icu, icon: 'emergency', tint: 'red-500' },
                    { name: 'General Ward', ...hospital.beds.general, icon: 'bed', tint: 'blue-500' },
                    { name: 'Cardiac Hub', ...hospital.beds.cardiac, icon: 'favorite', tint: 'emerald-500' },
                  ].map((ward, i) => {
                    const isFull = ward.available === 0;
                    const percent = Math.min(100, (ward.available / ward.total) * 100);
                    return (
                      <div key={i} className="space-y-8 text-center group">
                        <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border transition-all duration-500 ${isFull ? 'bg-red-600/10 border-red-600/20 text-red-600' : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-blue-500'}`}>
                          <span className="material-icons-round text-3xl">{ward.icon}</span>
                        </div>
                        <div>
                          <p className={`text-7xl font-black ${isFull ? 'text-red-600' : 'text-white'}`}>{ward.available}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">OPEN / {ward.total}</p>
                        </div>
                        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">{ward.name}</p>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="bg-slate-900 rounded-[3.5rem] p-12 sm:p-20 border border-white/10 shadow-3xl group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <span className="material-icons-round text-[20rem]">hub</span>
               </div>
               <div className="relative z-10 max-w-2xl space-y-10">
                  <h3 className="text-impact text-6xl text-white tracking-tighter">SMARTFLOW<br/><span className="text-blue-500">REBALANCE</span></h3>
                  <p className="text-slate-400 text-lg sm:text-xl leading-relaxed font-medium uppercase tracking-tight">
                    Algorithm detects influx surge in Node-04. Recommend critical path redistribution to <span className="text-white">KEM Metropolitan Hub</span> (65% Load).
                  </p>
                  <button className="px-12 py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-4">
                    Initialize Rebalance <span className="material-icons-round">bolt</span>
                  </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 h-full">
            <div className="glass-premium rounded-[3rem] border border-white/10 shadow-3xl p-10 flex flex-col h-full max-h-[850px]">
              <div className="mb-12">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Transfer Queue</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Metropolitan Bed Swaps</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={i} className="group p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">ID #{4500 + i}</p>
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <p className="font-black text-white text-base uppercase leading-tight group-hover:text-blue-500 transition-colors">Lilavati Research Hub</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-3">En route • {i * 3 + 2}m ago</p>
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
