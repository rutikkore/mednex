import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Link } from 'react-router-dom';
import { FreshnessBadge } from '../src/components/FreshnessBadge';
import { triggerNotification } from '../src/utils/notifications';
import { useHospital } from '../hooks/useHospital';
import { Hospital } from '../types';

const BedManagement: React.FC = () => {
  const { hospitalId, setHospitalId } = useHospital();
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allHospitals, setAllHospitals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'icu' | 'general' | 'cardiac'>('icu');

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase.from('hospitals').select('id, name');
      if (data) setAllHospitals(data);
    };
    fetchAll();
  }, []);

  const fetchHospitalData = async () => {
    if (!hospitalId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', hospitalId)
      .single();

    if (error) {
      console.error('Hospital fetch error:', error);
    } else {
      setHospital(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitalData();

    if (!hospitalId) return;

    const channel = supabase
      .channel('hospital-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'hospitals', filter: `id=eq.${hospitalId}` },
        (payload) => {
          if (payload.new) {
            setHospital(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hospitalId]);

  useEffect(() => {
    if (!hospital) return;
    const icuTotal = hospital.icu_total || 1;
    const icuAvail = hospital.icu_available;
    const occupancyRate = (icuTotal - icuAvail) / icuTotal;
    
    if (occupancyRate > 0.95) {
        triggerNotification(hospital.id, 'bed_critical', 'URGENT: ICU Occupancy exceeded 95%');
    } else if (occupancyRate > 0.80) {
        triggerNotification(hospital.id, 'bed_critical', 'Warning: ICU Occupancy exceeded 80%');
    }
  }, [hospital]);

  const handleBedAction = async (type: 'icu' | 'general' | 'cardiac', action: 'admit' | 'discharge') => {
    if (!hospital) return;
    const fieldAvailable = `${type}_available`;
    const fieldTotal = `${type}_total`;
    
    let currentAvailable = hospital[fieldAvailable];
    let total = hospital[fieldTotal];

    if (action === 'admit') {
        if (currentAvailable <= 0) return;
        currentAvailable -= 1;
    } else {
        if (currentAvailable >= total) return;
        currentAvailable += 1;
    }

    // Optimistic UI Update
    setHospital({ ...hospital, [fieldAvailable]: currentAvailable });
    
    // DB Update
    await supabase.from('hospitals').update({ [fieldAvailable]: currentAvailable }).eq('id', hospital.id);
  };


  if (loading && !hospital) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!hospital) return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-12 text-center">
      <span className="material-icons-round text-6xl text-slate-800 mb-6">domain_disabled</span>
      <h1 className="text-xl font-black mb-2 uppercase">No Hub Assigned</h1>
      <p className="text-slate-500 text-xs mb-8">Please select an assigned hub to view its ward blocks.</p>
      
      <select 
         className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
         onChange={(e) => setHospitalId(e.target.value)}
         value={hospitalId || ''}
      >
          <option value="">Select Hospital</option>
          {allHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
      </select>
    </div>
  );

  const wardTabs = [
    { id: 'icu', name: 'ICU Block', total: hospital.icu_total, available: hospital.icu_available },
    { id: 'general', name: 'General Ward', total: hospital.general_total, available: hospital.general_available },
    { id: 'cardiac', name: 'Cardiac Sync', total: hospital.cardiac_total, available: hospital.cardiac_available }
  ];

  const currentWardData = wardTabs.find(t => t.id === activeTab)!;
  const occupiedCount = currentWardData.total - currentWardData.available;
  
  // Generate visual bed array
  const visualBeds = Array.from({ length: currentWardData.total }, (_, i) => ({
      id: `${activeTab}-bed-${i + 1}`,
      number: i + 1,
      status: i < occupiedCount ? 'occupied' : 'available'
  }));

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative">
      <div className="mesh-gradient opacity-30"></div>

      <div className="w-full max-w-[1800px] mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 reveal active">
          <div className="space-y-4">
            <h1 className="text-impact text-6xl sm:text-7xl tracking-tighter leading-none">
              WARD<span className="text-blue-500">CONTROL</span>
            </h1>
            <div className="flex items-center gap-4">
              <select 
                value={hospitalId || ''}
                onChange={(e) => setHospitalId(e.target.value)}
                className="bg-blue-600/10 text-blue-500 border border-blue-500/30 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer hover:bg-blue-600/20 transition-all appearance-none"
              >
                  {allHospitals.map(h => <option key={h.id} value={h.id} className="bg-[#020617]">{h.name}</option>)}
              </select>
              <div className="h-4 w-px bg-white/10" />
              <FreshnessBadge timestamp={hospital.last_updated_at} />
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleBedAction(activeTab, 'admit')}
              disabled={currentWardData.available <= 0}
              className="px-8 py-5 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-white hover:text-black transition-all flex items-center gap-3 active:scale-95"
            >
              <span className="material-icons-round">person_add</span> Admit to {activeTab.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Total Kpi Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 reveal active">
          {[
            { label: 'Network Capacity', val: hospital.icu_total + hospital.general_total + hospital.cardiac_total, color: 'text-white' },
            { label: 'Occupied Segments', val: (hospital.icu_total - hospital.icu_available) + (hospital.general_total - hospital.general_available) + (hospital.cardiac_total - hospital.cardiac_available), color: 'text-slate-400' },
            { label: 'Open Channels', val: hospital.icu_available + hospital.general_available + hospital.cardiac_available, color: 'text-blue-500' },
            { label: 'ICU Critical Alert', val: hospital.icu_available < 2 ? 'AT RISK' : 'STABLE', color: hospital.icu_available < 2 ? 'text-red-500' : 'text-emerald-500' },
          ].map((kpi, i) => (
            <div key={i} className="glass-premium rounded-[2.5rem] p-8 border border-white/5 shadow-3xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{kpi.label}</p>
              <p className={`text-6xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
            </div>
          ))}
        </div>

        {/* Visual Bed Grid System */}
        <div className="glass-premium rounded-[3rem] p-10 sm:p-14 border border-white/5 shadow-3xl reveal active space-y-12">
            
            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-white/10 pb-8">
              <div className="flex gap-2 p-1 bg-white/5 rounded-full overflow-x-auto custom-scrollbar">
                  {wardTabs.map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`px-8 py-4 rounded-full text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                      >
                          {tab.name} <span className="ml-2 px-2 py-0.5 rounded-full bg-black/10 text-xs">{tab.available} Open</span>
                      </button>
                  ))}
              </div>
              
              <div className="flex items-center gap-6 pr-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/10 border border-white/20"></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Available</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Occupied</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6">
                {visualBeds.map(bed => (
                    <div 
                        key={bed.id} 
                        onClick={() => handleBedAction(activeTab, bed.status === 'occupied' ? 'discharge' : 'admit')}
                        className={`aspect-square rounded-[1.5rem] border p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 group relative overflow-hidden ${bed.status === 'occupied' ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10'}`}
                    >
                        <div className="flex justify-between items-start">
                           <span className={`text-[10px] font-black tracking-widest ${bed.status === 'occupied' ? 'text-red-500' : 'text-slate-600 group-hover:text-blue-500'}`}>B-{bed.number}</span>
                           {bed.status === 'occupied' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                        </div>
                        
                        <div className="text-center w-full mt-2">
                            <span className={`material-icons-round text-3xl ${bed.status === 'occupied' ? 'text-red-500/80' : 'text-slate-700 group-hover:text-blue-500/80'}`}>
                                {bed.status === 'occupied' ? 'airline_seat_flat' : 'single_bed'}
                            </span>
                        </div>

                        {/* Hover Quick Actions */}
                        <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full ${bed.status === 'occupied' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {bed.status === 'occupied' ? 'Discharge' : 'Admit Patient'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>

      </div>
    </div>
  );
};

export default BedManagement;
