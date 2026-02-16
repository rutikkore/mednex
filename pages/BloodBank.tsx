
import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { BLOOD_BANKS, BLOOD_GROUPS } from '../constants';
import { BloodBankData } from '../types';
import { useAuth } from '../hooks/useAuth';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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

const BloodBank: React.FC = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [sourceBankId, setSourceBankId] = useState(BLOOD_BANKS[0].id);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestUnits, setRequestUnits] = useState(1);
  const [requestingBank, setRequestingBank] = useState<BloodBankData | null>(null);
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('smartflow_db_blood_requests');
    if (saved && user) {
      const all = JSON.parse(saved);
      setMyRequests(all.filter((r: any) => r.userId === user.id).reverse());
    }
  }, [user]);

  const sourceBank = BLOOD_BANKS.find(b => b.id === sourceBankId)!;

  const alternatives = useMemo(() => {
    return BLOOD_BANKS
      .filter(b => b.id !== sourceBankId && b.stock[selectedGroup] > 0)
      .map(b => ({
        ...b,
        distance: calculateDistance(
          sourceBank.location[0], sourceBank.location[1],
          b.location[0], b.location[1]
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [sourceBankId, selectedGroup]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setShowResults(true);
      setIsSearching(false);
    }, 1200);
  };

  const openRouting = (dest: BloodBankData) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${sourceBank.location[0]},${sourceBank.location[1]}&destination=${dest.location[0]},${dest.location[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const initiateRequest = (bank: BloodBankData) => {
    setRequestingBank(bank);
    setRequestUnits(1);
    setIsRequestModalOpen(true);
  };

  const handleFinalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingBank || !user) return;
    
    setIsRequestSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      bankId: requestingBank.id,
      bankName: requestingBank.name,
      bloodGroup: selectedGroup,
      units: requestUnits,
      status: 'In Transit',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    const existingRequests = JSON.parse(localStorage.getItem('smartflow_db_blood_requests') || '[]');
    const updated = [...existingRequests, newRequest];
    localStorage.setItem('smartflow_db_blood_requests', JSON.stringify(updated));
    setMyRequests(updated.filter((r: any) => r.userId === user.id).reverse());

    setIsRequestSubmitting(false);
    setIsRequestModalOpen(false);
  };

  const isOutOfStock = sourceBank.stock[selectedGroup] === 0;

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="mesh-gradient opacity-30"></div>
      
      <div className="w-full max-w-[1800px] mx-auto space-y-16 relative z-10">
        
        <div className="space-y-8 reveal active">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge-yellow">Blood Inventory command</span>
            <span className="badge-tag">Metropolitan Transit Protocol</span>
          </div>
          
          <h1 className="text-impact text-7xl sm:text-9xl tracking-tighter leading-none">
            BLOOD<br/><span className="text-blue-500">MATRIX</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-10">
            <div className="glass-premium rounded-[3rem] p-10 sm:p-12 border border-white/10 shadow-3xl">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Current Hub (Point A)</label>
                  <select 
                    value={sourceBankId}
                    onChange={(e) => {
                      setSourceBankId(e.target.value);
                      setShowResults(false);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    {BLOOD_BANKS.map(b => <option key={b.id} value={b.id} className="bg-[#020617]">{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Required Blood Type</label>
                  <div className="grid grid-cols-4 gap-3">
                    {BLOOD_GROUPS.map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGroup(g);
                          setShowResults(false);
                        }}
                        className={`py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                          selectedGroup === g 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xl' 
                          : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={`w-full py-7 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 group ${
                    isOutOfStock ? 'bg-red-600 hover:bg-white hover:text-black' : 'bg-blue-600 hover:bg-white hover:text-black'
                  }`}
                >
                  {isSearching ? (
                    <div className="w-6 h-6 border-3 border-slate-400 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isOutOfStock ? 'Trigger Scarcity Scan' : 'Check Inventory'}
                      <span className="material-icons-round text-2xl group-hover:translate-x-3 transition-transform">radar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {myRequests.length > 0 && (
              <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-8">Recent Transfers</h4>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {myRequests.map((req) => (
                    <div key={req.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group">
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{req.bloodGroup} • {req.units} Units</p>
                          <p className="font-bold text-white text-sm mt-1">{req.bankName}</p>
                       </div>
                       <div className="text-right">
                          <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">{req.status}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 h-full">
            {!showResults && !isSearching ? (
              <div className="h-full min-h-[500px] glass-premium rounded-[3rem] sm:rounded-[4rem] flex flex-col items-center justify-center p-12 text-center opacity-40 border border-dashed border-white/10">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center shadow-sm mb-6 border border-white/10">
                    <span className="material-icons-round text-slate-300 text-5xl">manage_search</span>
                 </div>
                 <h3 className="text-xl font-black text-white tracking-tight uppercase">Ready to Sync</h3>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Metropolitan Node Scan Pending</p>
              </div>
            ) : isSearching ? (
              <div className="h-full min-h-[500px] glass-premium rounded-[3rem] sm:rounded-[4rem] flex flex-col items-center justify-center p-20 text-center animate-pulse">
                 <div className="w-32 h-32 border-4 border-white/5 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                 <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Querying Hubs...</h3>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                 <div className={`rounded-[2rem] p-8 text-white flex items-center gap-6 shadow-xl ${isOutOfStock ? 'bg-red-600 shadow-red-600/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons-round">{isOutOfStock ? 'warning' : 'verified'}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-lg leading-none uppercase tracking-widest">{isOutOfStock ? 'Source Node Depleted' : 'Node Optimized'}</h3>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] mt-2">
                        {isOutOfStock ? `Redirecting request to nearest available metropolitan hub.` : `Sufficient inventory verified at point A.`}
                      </p>
                    </div>
                 </div>

                 <div className="glass-premium rounded-[3rem] sm:rounded-[4rem] p-12 border border-white/10 shadow-3xl group relative overflow-hidden">
                    {isOutOfStock && alternatives[0] ? (
                      <>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
                           <div>
                              <span className="px-4 py-2 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 mb-4 inline-block">Transit Point B</span>
                              <h4 className="text-impact text-6xl sm:text-7xl text-white tracking-tighter leading-none">{alternatives[0].name}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                 <span className="material-icons-round text-sm">place</span>
                                 {alternatives[0].city} Metropolitan Hub
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                           <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Distance</p>
                              <p className="text-5xl font-black text-white tracking-tighter">
                                {alternatives[0].distance.toFixed(1)} <span className="text-xl text-slate-500 ml-1">km</span>
                              </p>
                           </div>
                           <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Inventory</p>
                              <p className="text-5xl font-black text-emerald-500 tracking-tighter">
                                {alternatives[0].stock[selectedGroup]} <span className="text-xl text-slate-500 ml-1">Units</span>
                              </p>
                           </div>
                        </div>

                        <div className="h-[300px] rounded-[2.5rem] border border-white/10 overflow-hidden mb-12 shadow-inner">
                          <MapContainer center={sourceBank.location} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <MapFocus center={alternatives[0].location} />
                            <Marker position={sourceBank.location} icon={redIcon} />
                            <Marker position={alternatives[0].location} icon={blueIcon} />
                            <Polyline positions={[sourceBank.location, alternatives[0].location]} pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 15' }} />
                          </MapContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <button onClick={() => openRouting(alternatives[0])} className="w-full py-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all">
                              <span className="material-icons-round">navigation</span> Maps Route
                           </button>
                           <button onClick={() => initiateRequest(alternatives[0])} className="w-full py-8 bg-blue-600 hover:bg-white hover:text-black text-white rounded-full font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl">
                              <span className="material-icons-round">emergency_share</span> Direct Request
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20">
                         <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 text-emerald-500 border border-emerald-500/20 shadow-2xl">
                            <span className="material-icons-round text-7xl">check_circle</span>
                         </div>
                         <h4 className="text-impact text-5xl text-white tracking-tight">POINT A SECURED</h4>
                         <p className="text-slate-500 mt-6 max-w-sm mx-auto font-black uppercase tracking-[0.2em] text-[10px]">
                           {sourceBank.name} has verified {sourceBank.stock[selectedGroup]} units available for immediate dispatch.
                         </p>
                         <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                            <button onClick={() => openRouting(sourceBank)} className="px-12 py-5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-full font-black text-xs uppercase tracking-widest transition-all">
                               Navigation
                            </button>
                            <button onClick={() => initiateRequest(sourceBank)} className="px-12 py-5 bg-blue-600 text-white hover:bg-white hover:text-black rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-2xl">
                               Request Units
                            </button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal - Re-styled for dark theme */}
      {isRequestModalOpen && requestingBank && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#020617] rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/10 bg-white/5">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Confirm Request</h3>
              <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">{requestingBank.name}</p>
            </div>
            <form onSubmit={handleFinalRequest} className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Quantity (Units)</label>
                  <span className="text-[10px] font-black text-blue-500 uppercase">Available: {requestingBank.stock[selectedGroup]}</span>
                </div>
                <div className="flex items-center gap-6 bg-white/5 p-4 rounded-[2rem] border border-white/10">
                  <button type="button" onClick={() => setRequestUnits(Math.max(1, requestUnits - 1))} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"><span className="material-icons-round text-2xl">remove</span></button>
                  <input type="number" readOnly value={requestUnits} className="flex-1 bg-transparent border-none text-center text-4xl font-black text-white focus:outline-none" />
                  <button type="button" onClick={() => setRequestUnits(Math.min(requestingBank.stock[selectedGroup], requestUnits + 1))} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"><span className="material-icons-round text-2xl">add</span></button>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-6 bg-white/5 text-slate-500 rounded-full font-black text-xs uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={isRequestSubmitting} className="flex-1 py-6 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all">
                  {isRequestSubmitting ? 'Syncing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default BloodBank;
