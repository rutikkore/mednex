import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  icu_total: number;
  icu_available: number;
  general_total: number;
  general_available: number;
  cardiac_total: number;
  cardiac_available: number;
}

const TokenBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    hospitalId: '',
    service: 'General Medicine',
    severity: 'normal' as 'normal' | 'priority' | 'emergency',
  });

  /* ==============================
      Fetch Hospitals
  ============================== */
  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*');

      if (error) {
        console.error('Hospital fetch error:', error);
        return;
      }

      if (data) {
        setHospitals(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            hospitalId: data[0].id,
          }));
        }
      }
    };

    fetchHospitals();
  }, []);

  /* ==============================
      Submit Token
  ============================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login first');
      return;
    }

    setIsSubmitting(true);

    const tokenNumber = `A-${100 + Math.floor(Math.random() * 900)}`;

    const hospital = hospitals.find(
      (h) => h.id === formData.hospitalId
    );

    const { error } = await supabase.from('tokens').insert([
      {
        user_id: user.id,
        number: tokenNumber,
        patient_name: formData.name,
        hospital_name: hospital?.name || '',
        service: formData.service,
        severity: formData.severity,
        status: 'waiting',
        eta: '25m',
      },
    ]);

    if (error) {
      console.error('Token booking error:', error);
      alert('Failed to book token. Try again.');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/track', {
        state: { tokenNumber },
      });
    }, 1000); // Simulate processing time for UX
  };

  const services = [
    { name: 'General Medicine', icon: 'medical_services' },
    { name: 'Pediatrics', icon: 'child_care' },
    { name: 'Cardiology', icon: 'favorite' },
    { name: 'Orthopedics', icon: 'accessibility_new' },
  ];

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative overflow-hidden">
      {/* Background Mesh (Optional if GlobalLayout handles it, but adding here to be safe) */}
      <div className="mesh-gradient absolute inset-0 -z-10" />

      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4 reveal active">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase text-[10px] tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            OPD Registration
          </div>

          <h1 className="text-5xl md:text-6xl text-impact text-white tracking-tighter">
            Book <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Token</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Select your hospital, service, and urgency. Get your live queue position instantly.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-premium p-8 rounded-3xl reveal active" style={{ animationDelay: '0.1s' }}>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Patient Name */}
            <div className="group">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2 ml-1 tracking-wider group-focus-within:text-blue-400 transition-colors">
                Patient Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <span className="material-icons-round text-xl">person</span>
                </div>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="group">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2 ml-1 tracking-wider group-focus-within:text-blue-400 transition-colors">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <span className="material-icons-round text-xl">phone_iphone</span>
                </div>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            {/* Hospital Selection */}
            <div className="group">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2 ml-1 tracking-wider group-focus-within:text-blue-400 transition-colors">
                Select Hospital
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <span className="material-icons-round text-xl">apartment</span>
                </div>
                <select
                  value={formData.hospitalId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hospitalId: e.target.value,
                    })
                  }
                  className="w-full pl-12 pr-10 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white appearance-none font-medium cursor-pointer"
                >
                  {hospitals.map((h) => (
                    <option
                      key={h.id}
                      value={h.id}
                      className="bg-slate-900 text-white"
                    >
                      {h.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <span className="material-icons-round">expand_more</span>
                </div>
              </div>
            </div>

            {/* Service & Severity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Service */}
              <div className="group">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 ml-1 tracking-wider">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <span className="material-icons-round text-xl">medical_services</span>
                  </div>
                  <select
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        service: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-10 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white appearance-none font-medium text-sm cursor-pointer"
                  >
                    {services.map(s => (
                      <option key={s.name} value={s.name} className="bg-slate-900">{s.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                    <span className="material-icons-round">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 ml-1 tracking-wider">
                  Urgency Level
                </label>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
                  {(['normal', 'priority', 'emergency'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: lvl })}
                      className={`flex-1 py-3 rounded-[10px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300
                                ${formData.severity === lvl
                          ? lvl === 'emergency' ? 'bg-red-500 shadow-lg shadow-red-500/20 text-white' :
                            lvl === 'priority' ? 'bg-orange-500 shadow-lg shadow-orange-500/20 text-white' :
                              'bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

            </div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-black uppercase text-sm tracking-widest text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </div>
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default TokenBooking;
