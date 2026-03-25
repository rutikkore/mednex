
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../src/lib/supabase';
import { Hospital } from '../types';
import { FreshnessBadge } from '../src/components/FreshnessBadge';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const redIcon = new L.DivIcon({
  html: `<div class="marker-container"><div class="marker-pulse bg-red-500"></div><div class="marker-dot bg-red-600 border-white border-2"></div></div>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const blueIcon = new L.DivIcon({
  html: `<div class="marker-container"><div class="marker-pulse bg-blue-500"></div><div class="marker-dot bg-blue-600 border-white border-2"></div></div>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const MapFocus = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const EMERGENCY_TYPES = [
    { id: 'trauma', label: 'Trauma', icon: 'personal_injury', boost: 'icu' },
    { id: 'cardiac', label: 'Cardiac Arrest', icon: 'favorite', boost: 'cardiac' },
    { id: 'stroke', label: 'Stroke', icon: 'psychology', boost: 'icu' },
    { id: 'burns', label: 'Severe Burns', icon: 'local_fire_department', boost: 'icu' },
    { id: 'pediatric', label: 'Pediatric', icon: 'child_care', boost: 'general' }
];

const EmergencyRedirect: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [currentHospitalId, setCurrentHospitalId] = useState('');
  const [requiredBedType, setRequiredBedType] = useState<'icu' | 'general' | 'cardiac'>('icu');
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [useFallbackLoc, setUseFallbackLoc] = useState(false);
  const [fallbackCity, setFallbackCity] = useState('');
  const [recommendedHospital, setRecommendedHospital] = useState<Hospital | null>(null);
  const [alternativesList, setAlternativesList] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase.from('hospitals').select('*');
      if (error) console.error('Error fetching hospitals:', error);
      else if (data) {
        const mappedHospitals: Hospital[] = data.map((h: any) => ({
          id: h.id,
          name: h.name,
          location: [h.lat, h.lng],
          address: h.address,
          contact: h.contact,
          last_updated_at: h.last_updated_at,
          beds: {
            icu: { total: h.icu_total, available: h.icu_available },
            general: { total: h.general_total, available: h.general_available },
            cardiac: { total: h.cardiac_total, available: h.cardiac_available }
          }
        }));
        setHospitals(mappedHospitals);
        if (mappedHospitals.length > 0) setCurrentHospitalId(mappedHospitals[0].id);
      }
      setLoading(false);
    };
    fetchHospitals();
  }, []);

  const currentHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0];

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading Grid...</div>;
  if (!currentHospital) return <div className="h-screen flex items-center justify-center text-white">No Hospitals Found</div>;

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate coordinates based on city text if fallback is used
    let searchLat = currentHospital.location[0];
    let searchLng = currentHospital.location[1];
    
    if (useFallbackLoc && fallbackCity.trim().length > 0) {
        // Just mock a tiny offset to simulate a different part of the city for visual effect
        searchLat += 0.05;
        searchLng += 0.05;
    }

    const alternatives = hospitals
      .filter(h => (!useFallbackLoc ? h.id !== currentHospitalId : true) && h.beds[requiredBedType].available > 0)
      .map(h => {
        let freshnessPenalty = 0;
        const now = Date.now();
        const updatedTime = h.last_updated_at ? new Date(h.last_updated_at).getTime() : 0;
        const diffMinutes = Math.floor((now - updatedTime) / 60000);
        
        if (!h.last_updated_at || diffMinutes > 60) {
            freshnessPenalty = 50; // Huge penalty for critical/null
        } else if (diffMinutes > 15) {
            freshnessPenalty = 10; // Medium penalty for stale
        }

        let exactDistance = calculateDistance(searchLat, searchLng, h.location[0], h.location[1]);
        
        // Boost score (reduce exactDistance penalty) if emergency type aligns with hospital specializations
        // In this mock, we pretend 'Trauma' prefers 'Seven Hills', 'Cardiac' prefers 'Apex', etc.
        let specializationBonus = 0;
        if (emergencyType === 'cardiac' && h.name.toLowerCase().includes('cardiac')) specializationBonus = -5;
        if (emergencyType === 'trauma' && h.icu_total > 20) specializationBonus = -3;
        
        return {
          ...h,
          distance: exactDistance,
          score: exactDistance + freshnessPenalty + specializationBonus
        };
      })
      .sort((a, b) => a.score - b.score);

    setTimeout(() => {
      setRecommendedHospital(alternatives[0] || null);
      setAlternativesList(alternatives.slice(1, 4));
      setIsSearching(false);
    }, 1200);
  };

  const openRouting = () => {
    if (!recommendedHospital) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentHospital.location[0]},${currentHospital.location[1]}&destination=${recommendedHospital.location[0]},${recommendedHospital.location[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>

      <div className="w-full max-w-[1800px] mx-auto space-y-16 relative z-10">

        <div className="space-y-8 reveal active">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge-yellow">Emergency Diversion Command</span>
            <span className="badge-tag">Real-time Metropolitan Scan</span>
          </div>

          <h1 className="text-impact text-7xl sm:text-9xl tracking-tighter leading-none">
            CRITICAL<br /><span className="text-red-500">REDIRECT</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-10">
            <div className="glass-premium rounded-[3rem] p-10 sm:p-12 border border-white/10 shadow-3xl">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Source Location</label>
                    <button onClick={() => setUseFallbackLoc(!useFallbackLoc)} className="text-[9px] text-blue-500 font-bold uppercase tracking-widest hover:text-white transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full">
                      {useFallbackLoc ? 'Select Facility' : 'Manual Entry'}
                    </button>
                  </div>
                  {useFallbackLoc ? (
                    <input
                        type="text"
                        value={fallbackCity}
                        onChange={(e) => setFallbackCity(e.target.value)}
                        placeholder="e.g. Andheri, Mumbai..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-red-500 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  ) : (
                    <select
                        value={currentHospitalId}
                        onChange={(e) => setCurrentHospitalId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-red-500 focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                        {hospitals.map(h => <option key={h.id} value={h.id} className="bg-[#020617]">{h.name}</option>)}
                    </select>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Emergency Type (1-Tap Selection)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {EMERGENCY_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => {
                            setEmergencyType(type.id);
                            setRequiredBedType(type.boost as any);
                        }}
                        className={`py-4 px-4 rounded-[1.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${emergencyType === type.id
                          ? 'bg-red-600 text-white border-red-500 shadow-xl shadow-red-600/20'
                          : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'
                          }`}
                      >
                        <span className="material-icons-round text-lg">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full py-7 bg-red-600 hover:bg-white hover:text-black text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 group"
                >
                  {isSearching ? (
                    <div className="w-6 h-6 border-3 border-slate-400 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Scan Metropolitan Grid
                      <span className="material-icons-round text-2xl group-hover:translate-x-3 transition-transform">radar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/10 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <span className="material-icons-round text-9xl text-white">hub</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4">Metropolitan Units Active</p>
              <p className="text-6xl font-black text-white tracking-tighter">04</p>
            </div>
          </div>

          <div className="lg:col-span-7 h-full">
            {!recommendedHospital && !isSearching ? (
              <div className="h-full min-h-[500px] glass-premium rounded-[3rem] sm:rounded-[4rem] flex flex-col items-center justify-center p-12 text-center opacity-40 border border-dashed border-white/10">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center shadow-sm mb-6 border border-white/10">
                  <span className="material-icons-round text-slate-300 text-5xl">location_searching</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Ready for Scan</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Select parameters and initialize command</p>
              </div>
            ) : isSearching ? (
              <div className="h-full min-h-[500px] glass-premium rounded-[3rem] sm:rounded-[4rem] flex flex-col items-center justify-center p-20 text-center animate-pulse">
                <div className="w-32 h-32 border-4 border-white/5 border-t-red-600 rounded-full animate-spin mb-8"></div>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Initializing Fleet Hubs...</h3>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="glass-premium rounded-[3rem] sm:rounded-[4rem] p-12 border border-white/10 shadow-3xl group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
                    <div>
                      <span className="px-4 py-2 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 mb-4 inline-block">Recommended Target Point</span>
                      <h4 className="text-impact text-6xl sm:text-7xl text-white tracking-tighter leading-none">{recommendedHospital.name}</h4>
                      <div className="mt-4">
                        <FreshnessBadge timestamp={recommendedHospital.last_updated_at} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                        <span className="material-icons-round text-sm">place</span>
                        {recommendedHospital.address}
                      </p>
                    </div>
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors border border-white/10">
                      <span className="material-icons-round text-5xl">domain</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Transit Distance</p>
                      <p className="text-5xl font-black text-white tracking-tighter">
                        {((recommendedHospital as any).distance || calculateDistance(currentHospital.location[0], currentHospital.location[1], recommendedHospital.location[0], recommendedHospital.location[1])).toFixed(1)}
                        <span className="text-xl text-slate-500 ml-1">km</span>
                      </p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Availability</p>
                      <p className="text-5xl font-black text-emerald-500 tracking-tighter">
                        {recommendedHospital.beds[requiredBedType].available}
                        <span className="text-xl text-slate-500 ml-1">Open</span>
                      </p>
                    </div>
                  </div>

                  <div className="h-[300px] rounded-[2.5rem] border border-white/10 overflow-hidden mb-12 shadow-inner relative z-10">
                    <MapContainer center={currentHospital.location} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <MapFocus center={recommendedHospital.location} />
                      {useFallbackLoc ? (
                        <Marker position={[currentHospital.location[0] + 0.05, currentHospital.location[1] + 0.05]} icon={redIcon} />
                      ) : (
                        <Marker position={currentHospital.location} icon={redIcon} />
                      )}
                      <Marker position={recommendedHospital.location} icon={blueIcon} />
                      <Polyline positions={[useFallbackLoc ? [currentHospital.location[0] + 0.05, currentHospital.location[1] + 0.05] : currentHospital.location, recommendedHospital.location]} pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 15' }} />
                    </MapContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button
                        onClick={openRouting}
                        className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all"
                      >
                        <span className="material-icons-round">navigation</span>
                        Maps Routing
                      </button>
                      <a
                        href="tel:108"
                        className="w-full py-6 bg-red-600 hover:bg-white hover:text-red-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-95 group border-2 border-red-500 animate-pulse relative overflow-hidden"
                      >
                        <span className="material-icons-round">emergency</span>
                        Dial 108
                      </a>
                  </div>

                  {alternativesList.length > 0 && (
                      <div className="mt-16 pt-12 border-t border-white/10">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-8 px-4">Other Nearby Options</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {alternativesList.map((alt) => (
                                  <div key={alt.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-colors">
                                      <h5 className="font-bold text-white uppercase text-sm mb-2">{alt.name}</h5>
                                      <div className="flex items-center gap-2 mb-4">
                                          <FreshnessBadge timestamp={alt.last_updated_at} />
                                      </div>
                                      <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                          <div>
                                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Added Range</p>
                                              <p className="text-white font-bold">{alt.distance.toFixed(1)} km</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Available</p>
                                              <p className="text-emerald-500 font-bold">{alt.beds[requiredBedType].available} {requiredBedType}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-div-icon { background: transparent; border: none; }
        .marker-container { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .marker-dot { width: 14px; height: 14px; border-radius: 50%; position: relative; z-index: 2; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .marker-pulse { width: 100%; height: 100%; border-radius: 50%; position: absolute; animation: marker-pulse 2s infinite; opacity: 0.5; }
        @keyframes marker-pulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default EmergencyRedirect;
