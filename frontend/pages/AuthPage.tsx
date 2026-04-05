
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { supabase } from '../src/lib/supabase';

const AuthPage: React.FC = () => {
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as UserRole
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'patient') navigate('/patient/book');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/staff');
    }
  }, [user, loading, navigate]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    await new Promise(resolve => setTimeout(resolve, 800));

    let result;
    if (isNewUser) {
      if (!formData.name) {
        setErrorMsg('Grid profile requires an identity name.');
        setIsLoading(false);
        return;
      }
      result = await register(formData.name, formData.email, formData.password, formData.role);
    } else {
      result = await login(formData.email, formData.password);
    }

    if (!result.success) {
      setErrorMsg(result.message ? `Error: ${result.message}` : 'Node authentication failed.');
      console.error('Login Result:', result);
      setIsLoading(false);
    }
  };

  const expressAccess = (role: UserRole) => {
    setIsLoading(true);
    const emails = {
      patient: 'patient@demo.med',
      receptionist: 'staff@demo.med',
      admin: 'admin@demo.med'
    };
    const names = {
      patient: 'Demo Patient',
      receptionist: 'Staff Node-04',
      admin: 'System Admin'
    };

    setTimeout(async () => {
      // Try login first, then register if fails (simplified for demo convenience)
      const loginResult = await login(emails[role], 'password');
      if (!loginResult.success) {
        await register(names[role], emails[role], 'password', role);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#020617] pt-32 lg:pt-40">
      <div className="mesh-gradient opacity-30"></div>

      <div className="w-full max-w-xl relative z-10 space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex flex-col items-center group">
            <h1 className="text-impact text-7xl md:text-8xl tracking-tighter text-white leading-none">GRID<span className="text-blue-500">SYNC</span></h1>
            <div className="badge-yellow">Operational Entry Port (vDebug)</div>
          </Link>
        </div>

        <div className="glass-premium rounded-[4rem] p-10 lg:p-14 border border-white/10 shadow-3xl">
          <form onSubmit={handleAuthAction} className="space-y-8">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] p-5 rounded-3xl animate-in shake flex items-center gap-4">
                <span className="material-icons-round text-lg">warning</span>
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Identifier</label>
              <input
                id="email"
                name="email"
                required
                autoComplete="email"
                type="email"
                placeholder="identity@mednexus.sys"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-800"
              />
            </div>

            {isNewUser && (
              <div className="space-y-8 animate-in slide-in-from-top-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Full Identity Name</label>
                  <input
                    id="name"
                    name="name"
                    required={isNewUser}
                    autoComplete="name"
                    type="text"
                    placeholder="Enter Profile Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-800"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Metropolitan Node Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['patient', 'receptionist', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r })}
                        className={`py-4 rounded-3xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${formData.role === r
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                          }`}
                      >
                        {r === 'receptionist' ? 'Staff' : r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Secure Passkey</label>
              <input
                id="password"
                name="password"
                required
                autoComplete="current-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] px-10 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-7 bg-white hover:bg-blue-600 hover:text-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl transition-all duration-700 active:scale-95 flex items-center justify-center gap-4 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  Initialize Triage
                  <span className="material-icons-round text-xl group-hover:translate-x-3 transition-transform">bolt</span>
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsNewUser(!isNewUser)}
                className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"

              >
                {isNewUser ? 'Already verified? Access Grid' : 'Unregistered Node? Initialize Profile'}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-10 border-t border-white/10 space-y-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Express Portal Entry</p>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => expressAccess('patient')} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all group">
                <span className="material-icons-round text-2xl text-blue-500 group-hover:scale-110 transition-transform">person</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Patient</span>
              </button>
              <button onClick={() => expressAccess('receptionist')} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all group">
                <span className="material-icons-round text-2xl text-indigo-500 group-hover:scale-110 transition-transform">badge</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Staff</span>
              </button>
              <button onClick={() => expressAccess('admin')} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all group">
                <span className="material-icons-round text-2xl text-emerald-500 group-hover:scale-110 transition-transform">admin_panel_settings</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
