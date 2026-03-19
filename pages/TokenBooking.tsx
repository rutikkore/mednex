
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INDIAN_HOSPITALS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';

const TokenBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emit } = useSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    hospitalId: INDIAN_HOSPITALS[0].id,
    service: 'General Medicine',
    severity: 'normal' as 'normal' | 'priority' | 'emergency'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tokenNumber = `A-${100 + Math.floor(Math.random() * 899)}`;
    const newToken = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id,
      number: tokenNumber,
      patientName: formData.name,
      service: formData.service,
      hospitalName: INDIAN_HOSPITALS.find(h => h.id === formData.hospitalId)?.name,
      severity: formData.severity,
      status: 'waiting',
      eta: '25m',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const existingTokens = JSON.parse(localStorage.getItem('smartflow_db_tokens') || '[]');
    localStorage.setItem('smartflow_db_tokens', JSON.stringify([...existingTokens, newToken]));

    emit('TOKEN_BOOKED', newToken);

    setTimeout(() => {
      navigate('/patient');
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>
      
      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        
        <div className="lg:col-span-5 space-y-10 reveal active">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge-yellow">Virtual Triage Active</span>
              <span className="badge-tag">Skip the Congestion</span>
            </div>
            
            <h1 className="text-impact text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none">
              ESTABLISH<br/><span className="text-blue-500">TOKEN</span>
            </h1>
            
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-xl font-medium">
              Initialize your digital identity in the metropolitan health grid. Your token will be synchronized across all node displays in real-time.
            </p>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/10 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-1000">
                <span className="material-icons-round text-[12rem] text-blue-500">sync</span>
             </div>
             <h3 className="text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-blue-500">Live Grid Logic</h3>
             <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                    <span className="material-icons-round text-xl">radar</span>
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed uppercase tracking-widest text-[10px]">
                    Decentralized triage ensures sub-minute accuracy for arrival estimates.
                  </p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-premium rounded-[3rem] sm:rounded-[4rem] p-10 sm:p-16 border border-white/10 shadow-3xl">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Identity Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-7 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
                    placeholder="Enter Profile Name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Phone Matrix</label>
                  <input 
                    required
                    type="tel" 
                    placeholder="+91 00000 00000"
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-7 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Target Node (Hospital)</label>
                <select 
                  value={formData.hospitalId}
                  onChange={e => setFormData({...formData, hospitalId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-7 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {INDIAN_HOSPITALS.map(h => <option key={h.id} value={h.id} className="bg-[#020617]">{h.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Service Type</label>
                  <select 
                    onChange={e => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-7 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option className="bg-[#020617]">General Medicine</option>
                    <option className="bg-[#020617]">Pediatrics</option>
                    <option className="bg-[#020617]">Cardiology</option>
                    <option className="bg-[#020617]">Orthopedics</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Urgency Level</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['normal', 'priority'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({...formData, severity: lvl as any})}
                        className={`py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                          formData.severity === lvl 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xl' 
                            : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-8 bg-white hover:bg-blue-600 hover:text-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl transition-all duration-700 active:scale-95 flex items-center justify-center gap-5 group mt-6"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border-slate-400 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Triage
                    <span className="material-icons-round text-2xl group-hover:translate-x-3 transition-transform">bolt</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBooking;
