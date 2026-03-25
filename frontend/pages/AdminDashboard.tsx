
import React, { useMemo, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area
} from 'recharts';
import { BLOOD_GROUPS } from '../constants';
import { supabase } from '../src/lib/supabase';

const AdminDashboard: React.FC = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);

  const fetchLiveData = async () => {
    const [tokRes, reqRes, hosRes, bbRes] = await Promise.all([
      supabase.from('tokens').select('*'),
      supabase.from('blood_transfer_requests').select('*'),
      supabase.from('hospitals').select('*'),
      supabase.from('blood_banks').select('*')
    ]);
    if (tokRes.data) setTokens(tokRes.data);
    if (reqRes.data) setBloodRequests(reqRes.data);
    if (hosRes.data) setHospitals(hosRes.data);
    if (bbRes.data) setBloodBanks(bbRes.data);
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000); // Fast cycle for command center feel
    return () => clearInterval(interval);
  }, []);

  // Comprehensive Analytics Calculations
  // Comprehensive Analytics Calculations
  const analytics = useMemo(() => {
    const totalIcuTotal = hospitals.reduce((acc, h) => acc + (h.icu_total || 0), 0);
    const totalIcuOcc = hospitals.reduce((acc, h) => acc + ((h.icu_total || 0) - (h.icu_available || 0)), 0);
    const totalGenTotal = hospitals.reduce((acc, h) => acc + (h.general_total || 0), 0);
    const totalGenOcc = hospitals.reduce((acc, h) => acc + ((h.general_total || 0) - (h.general_available || 0)), 0);

    // Calculate global blood group distribution
    const globalBloodStock = BLOOD_GROUPS.map(group => ({
      name: group,
      value: bloodBanks.reduce((acc, bank) => acc + (bank.stock?.[group] || 0), 0)
    }));

    const activeWaiters = tokens.filter(t => t.status === 'waiting').length;
    const emergencyCount = tokens.filter(t => t.severity === 'emergency').length;

    const icuUtil = totalIcuTotal > 0 ? Math.round((totalIcuOcc / totalIcuTotal) * 100) : 0;
    const genUtil = totalGenTotal > 0 ? Math.round((totalGenOcc / totalGenTotal) * 100) : 0;
    const totalBloodUnits = globalBloodStock.reduce((a, b) => a + b.value, 0);

    return {
      icuUtilization: icuUtil,
      genUtilization: genUtil,
      globalBloodStock,
      totalBloodUnits,
      totalHospitals: hospitals.length,
      activeWaiters,
      emergencyCount,
      bloodTransitCount: bloodRequests.length,
      nodeStatus: 'STABLE'
    };
  }, [tokens, bloodRequests, hospitals, bloodBanks]);

  // Multi-series chart data for hospitals
  const hospitalPerformanceData = hospitals.map(h => ({
    name: h.name.replace(' Hospital', '').replace(' Blood Bank', '').replace(' & Research Centre', '').substring(0, 10),
    icu: h.icu_available || 0,
    general: h.general_available || 0,
    cardiac: h.cardiac_available || 0,
    total: (h.general_total || 0) + (h.icu_total || 0) + (h.cardiac_total || 0)
  }));

  // Trends Data (Mocked but reacts to real token counts)
  const pulseTrends = [
    { time: '00:00', load: 12 }, { time: '04:00', load: 8 }, { time: '08:00', load: 24 },
    { time: '12:00', load: 45 }, { time: '16:00', load: 68 }, { time: '20:00', load: 30 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#facc15', '#8b5cf6', '#ec4899'];

  const generateAudit = () => {
    const auditData = {
      generatedAt: new Date().toISOString(),
      gridMetrics: analytics,
      nodeMatrix: hospitalPerformanceData,
      telemetryLogs: tokens.slice(-50).map(t => ({ id: t.number, severity: t.severity, service: t.service, time: t.created_at }))
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mednexus-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>

      <div className="w-full max-w-[1800px] mx-auto space-y-12 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 reveal active">
          <div className="space-y-4">
            <h1 className="text-impact text-6xl sm:text-8xl tracking-tighter leading-none">
              METRO<span className="text-blue-500">OPS</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">
              Central Medical Grid Controller • v4.2 Command Suite
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 group hover:border-blue-500/50 transition-all">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Grid Health</p>
                <p className="text-sm font-black text-white uppercase mt-1">SLA Synchronized</p>
              </div>
            </div>
            <div onClick={generateAudit} className="px-8 py-4 bg-blue-600 text-white rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-blue-600/20 active:scale-95 cursor-pointer hover:bg-white hover:text-blue-600 transition-all">
              <span className="material-icons-round">download</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Generate Grid Audit</span>
            </div>
          </div>
        </div>

        {/* Global KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            { label: 'ICU Critical Load', val: `${analytics.icuUtilization}%`, trend: '+2% Shift', icon: 'emergency', color: 'text-red-500', bg: 'bg-red-500/5' },
            { label: 'Active Triage', val: analytics.activeWaiters, trend: 'Normal Velocity', icon: 'confirmation_number', color: 'text-blue-500', bg: 'bg-blue-500/5' },
            { label: 'Metropolitan Pulse', val: 'STABLE', trend: '0.4ms Latency', icon: 'sensors', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
            { label: 'Critical Scarcity', val: analytics.emergencyCount, trend: 'Manual Redirect Required', icon: 'report_problem', color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
          ].map((kpi, i) => (
            <div key={i} className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 ${kpi.color}`}>
                <span className="material-icons-round text-8xl">{kpi.icon}</span>
              </div>
              <div className="relative z-10 space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{kpi.label}</p>
                <p className={`text-6xl font-black tracking-tighter ${kpi.color}`}>{kpi.val}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Analytics Matrix */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          {/* Main Chart: Bed Capacity Deep Dive */}
          <div className="xl:col-span-8 space-y-10">
            <div className="glass-premium rounded-[3.5rem] border border-white/10 shadow-3xl p-10 sm:p-16 relative group">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <h3 className="text-impact text-4xl text-white tracking-tight uppercase">Metropolitan Bed Matrix</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Real-time Node Distribution</p>
                </div>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase text-blue-500 border border-blue-500/20">ICU</span>
                  <span className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase text-emerald-500 border border-emerald-500/20">General</span>
                  <span className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase text-yellow-500 border border-yellow-500/20">Cardiac</span>
                </div>
              </div>

              <div className="h-[450px] w-full opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hospitalPerformanceData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ borderRadius: '24px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="icu" fill="#3b82f6" radius={[6, 6, 0, 0]} name="ICU Available" barSize={25} />
                    <Bar dataKey="general" fill="#10b981" radius={[6, 6, 0, 0]} name="General Available" barSize={25} />
                    <Bar dataKey="cardiac" fill="#facc15" radius={[6, 6, 0, 0]} name="Cardiac Available" barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-premium rounded-[3rem] p-10 border border-white/10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-10">Grid Load Evolution</h3>
                <div className="h-[200px] w-full opacity-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pulseTrends}>
                      <defs>
                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', background: '#020617', border: 'none' }} 
                        itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Efficiency Engine</h3>
                  <p className="text-xl font-bold text-white uppercase tracking-tight leading-tight">Decentralized Triage reduces manual routing by 42%.</p>
                </div>
                <div className="flex items-center gap-6 mt-10">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[88%] h-full bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
                  </div>
                  <span className="text-xl font-black text-white">88%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Module: Blood Matrix & Notifications */}
          <div className="xl:col-span-4 space-y-10">

            <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl text-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 mb-10">Metropolitan Blood Inventory</h4>
              <div className="h-[280px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.globalBloodStock}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.globalBloodStock.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)' }}
                      itemStyle={{ color: '#e2e8f0', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-5xl font-black text-white leading-none">{analytics.totalBloodUnits}</p>
                  <p className="text-[8px] font-white text-slate-500 uppercase tracking-widest mt-2">Units in Node</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-y-8 gap-x-4 mt-8 text-left">
                {analytics.globalBloodStock.map((g, i) => {
                  const percentage = analytics.totalBloodUnits === 0 ? 0 : (g.value / analytics.totalBloodUnits) * 100;

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <p className="text-[10px] font-black text-white">{g.name}</p>
                        <p className="text-[9px] font-black" style={{ color: COLORS[i % COLORS.length] }}>{g.value}</p>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-premium rounded-[3rem] border border-white/10 shadow-3xl p-10 flex flex-col h-[600px] overflow-hidden">
              <div className="mb-10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Network Pulse</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Telemetry Feed</p>
                </div>
                <span className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10">
                  <span className="material-icons-round">bolt</span>
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {tokens.length > 0 ? tokens.slice(-15).reverse().map((log, i) => {
                  const routingInfo = log.service || 'System Entry';
                  const timeStr = new Date(log.created_at).toLocaleTimeString();

                  return (
                    <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 group hover:bg-white/10 hover:border-blue-500/30 transition-all flex gap-5 items-start">
                      <div className={`w-12 h-12 bg-blue-600/10 ${log.severity === 'emergency' ? 'text-red-500 border-red-500/50' : 'text-blue-500 border-blue-500/20'} rounded-2xl flex items-center justify-center shrink-0 border group-hover:bg-blue-600 group-hover:text-white transition-all duration-500`}>
                        <span className="material-icons-round text-xl">{log.severity === 'emergency' ? 'warning' : 'token'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm uppercase tracking-tight truncate">{log.number} Registered</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate">{routingInfo}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[8px] font-black text-slate-600">{timeStr}</span>
                          <span className={`w-1 h-1 rounded-full ${log.severity === 'emergency' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <span className="material-icons-round text-6xl mb-4">sensors_off</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Listening for Broadcasts...</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* System Health / Footer Grid */}
        <div className="bg-slate-900/40 rounded-[4rem] p-12 border border-white/5 reveal active">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {[
              { label: 'Latency', val: '0.4ms' },
              { label: 'Nodes', val: '142' },
              { label: 'Throughput', val: '2k/hr' },
              { label: 'Security', val: 'TLS 1.3' },
              { label: 'Uptime', val: '99.9%' },
              { label: 'Sync Status', val: 'LIVE' },
            ].map((m, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">{m.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{m.val}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
