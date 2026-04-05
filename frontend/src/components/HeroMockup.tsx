import React, { useState, useEffect } from 'react';

export const HeroMockup: React.FC = () => {
    // Generate some mock live data
    const [tokens, setTokens] = useState(12432);
    const [activeNodes, setActiveNodes] = useState(84);
    const [cpuLoad, setCpuLoad] = useState(32);

    useEffect(() => {
        const interval = setInterval(() => {
            setTokens(t => t + Math.floor(Math.random() * 3));
            setActiveNodes(n => n + (Math.random() > 0.5 ? 1 : -1));
            setCpuLoad(Math.floor(Math.random() * 20) + 20);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-6 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] transform lg:rotate-2 group transition-all duration-700 hover:rotate-0 overflow-hidden min-h-[350px] flex flex-col cursor-pointer">
            {/* Window Controls */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors duration-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors duration-500 delay-75"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors duration-500 delay-150"></div>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-md text-[8px] uppercase tracking-widest text-slate-400 font-black border border-white/10 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                    Grid Protocol v4.0.2
                </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                <div className="bg-[#020617]/80 p-4 sm:p-6 rounded-3xl border border-white/5 relative overflow-hidden group-hover:bg-[#020617] group-hover:border-blue-500/30 transition-all duration-500">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500">Live Tokens</p>
                    <p className="text-3xl sm:text-5xl font-black text-white mt-2">{tokens.toLocaleString()}</p>
                    <div className="absolute right-[-15px] bottom-[-15px] material-icons-round text-7xl text-blue-500/5 rotate-12 group-hover:text-blue-500/10 transition-all duration-500 group-hover:scale-110">confirmation_number</div>
                </div>
                <div className="bg-[#020617]/80 p-4 sm:p-6 rounded-3xl border border-white/5 flex flex-col justify-between group-hover:bg-[#020617] group-hover:border-indigo-500/30 transition-all duration-500">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500">Active Nodes</p>
                    <div className="flex items-end gap-3 mt-2">
                        <p className="text-3xl sm:text-5xl font-black text-indigo-400">{activeNodes}</p>
                        <span className="w-2 h-2 mb-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_#6366f1]"></span>
                    </div>
                </div>
            </div>

            <div className="bg-[#020617]/80 p-4 sm:p-5 rounded-3xl border border-white/5 space-y-4 relative group-hover:border-emerald-500/20 transition-all duration-500">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Telemetry CPU</p>
                    <p className="text-xs font-black text-emerald-400">{cpuLoad}%</p>
                </div>
                {/* Simulated Chart Bars */}
                <div className="flex items-end gap-2 h-16 sm:h-20">
                    {[40, 20, 60, 30, 80, 50, 90, 40, cpuLoad].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-t-md relative group-hover:bg-white/10 transition-all duration-500 hover:!bg-white/20">
                            <div 
                                className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-emerald-600/50 to-emerald-400 transition-all duration-500 shadow-[0_-5px_15px_rgba(16,185,129,0.2)]" 
                                style={{ height: `${h}%` }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Elements (similar matching scale to previous iteration) */}
            <div className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 bg-blue-600 text-white px-6 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-3xl border border-white/20 animate-float hidden xs:block">
                <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.3em] opacity-80 leading-none">Grid Sync</p>
                <p className="text-xl sm:text-4xl font-black mt-1 leading-none">99.9%</p>
            </div>
            
            <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 bg-[#020617] backdrop-blur-3xl border border-white/10 px-6 sm:px-8 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl flex items-center gap-3 sm:gap-6 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/30">
                    <span className="material-icons-round text-xl sm:text-3xl animate-pulse">sensors</span>
                </div>
                <div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Eff. Load</p>
                    <p className="text-xl sm:text-3xl font-black text-white mt-1 leading-none">+32%</p>
                </div>
            </div>

            {/* Custom Tooltip Cursor Hint */}
            <div className="absolute inset-0 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-duration-500 flex items-center justify-center bg-[#020617]/40 backdrop-blur-[2px]">
                <div className="bg-white text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-3">
                    <span className="material-icons-round text-base hover:rotate-90 transition-transform">visibility</span>
                    View Live Dashboard
                </div>
            </div>
        </div>
    );
};
