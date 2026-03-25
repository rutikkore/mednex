import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useHospital } from '../../hooks/useHospital';
import { Hospital } from '../../types';

export const HospitalSelector: React.FC = () => {
    const { setHospitalId } = useHospital();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState('');

    useEffect(() => {
        const fetchHospitals = async () => {
            const { data, error } = await supabase.from('hospitals').select('*');
            if (data) {
                setHospitals(data as Hospital[]);
                if (data.length > 0) setSelectedId(data[0].id);
            }
            setLoading(false);
        };
        fetchHospitals();
    }, []);

    const handleConfirm = () => {
        if (selectedId) {
            setHospitalId(selectedId);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md"></div>
            <div className="relative w-full max-w-xl bg-slate-900 rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-12 text-center border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12">
                        <span className="material-icons-round text-[15rem]">domain</span>
                    </div>
                    <h3 className="text-impact text-5xl sm:text-6xl text-white tracking-tighter uppercase relative z-10">
                        Node Authentication
                    </h3>
                    <p className="text-slate-400 text-[10px] font-black mt-4 uppercase tracking-[0.4em] relative z-10">
                        Select your assigned hub to establish uplink
                    </p>
                </div>
                
                <div className="p-10 space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 ml-4">Available Metropolitan Hubs</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full bg-[#020617] border border-white/10 rounded-[2rem] px-8 py-6 text-white font-black text-xl focus:bg-white/5 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer tracking-tight"
                        >
                            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={handleConfirm}
                        className="w-full py-6 bg-blue-600 hover:bg-white hover:text-black text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 group"
                    >
                        Establish Link
                        <span className="material-icons-round text-2xl group-hover:translate-x-3 transition-transform">cell_tower</span>
                    </button>
                    
                    <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-6">
                        Warning: Database records will be tied to this station ID.
                    </p>
                </div>
            </div>
        </div>
    );
};
