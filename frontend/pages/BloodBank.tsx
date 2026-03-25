import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { BLOOD_GROUPS } from '../constants';
import { supabase } from '../src/lib/supabase';
import { BloodBankData } from '../types';
import { FreshnessBadge } from '../src/components/FreshnessBadge';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
  useEffect(() => { map.flyTo(center, 13, { duration: 1.5 }); }, [center, map]);
  return null;
};

const BloodBank: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'transfers'>('inventory');
  
  const [bloodBanks, setBloodBanks] = useState<BloodBankData[]>([]);
  const [sourceBankId, setSourceBankId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  // Transfers States
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestUnits, setRequestUnits] = useState(1);
  const [requestingBank, setRequestingBank] = useState<BloodBankData | null>(null);
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);

  // DB Fetching
  const fetchBloodBanks = async () => {
    const { data } = await supabase.from('blood_banks').select('*');
    if (data) {
      const mapped = data.map((b: any) => ({ ...b, location: [b.lat, b.lng] }));
      setBloodBanks(mapped as any);
      if (mapped.length > 0 && !sourceBankId) setSourceBankId(mapped[0].id);
    }
  };

  const fetchTransfers = async () => {
      const { data } = await supabase
          .from('blood_transfer_requests')
          .select(`
              id, units, blood_type, status, created_at,
              requester:requester_bank_id(id, name),
              supplier:supplier_bank_id(id, name)
          `)
          .order('created_at', { ascending: false });
      if (data) setTransfers(data);
  };

  useEffect(() => {
    fetchBloodBanks().then(() => {
        fetchTransfers();
        setLoading(false);
    });

    const channel1 = supabase.channel('bb_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blood_banks' }, (payload) => {
        setBloodBanks(prev => prev.map(b => b.id === payload.new.id ? { ...b, stock: payload.new.stock, last_updated_at: payload.new.last_updated_at } : b));
      })
      .subscribe();

    const channel2 = supabase.channel('transfer_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_transfer_requests' }, () => {
          fetchTransfers();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel1); supabase.removeChannel(channel2); }
  }, []);

  const sourceBank = bloodBanks.find(b => b.id === sourceBankId) || bloodBanks[0];

  const alternatives = useMemo(() => {
    if (!sourceBank) return [];
    return bloodBanks
      .filter(b => b.id !== sourceBankId && b.stock[selectedGroup] > 0)
      .map(b => ({
        ...b,
        distance: calculateDistance(sourceBank.location[0], sourceBank.location[1], b.location[0], b.location[1])
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [sourceBankId, selectedGroup, bloodBanks, sourceBank]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => { setShowResults(true); setIsSearching(false); }, 1200);
  };

  const initiateRequest = (bank: BloodBankData) => {
    setRequestingBank(bank);
    setRequestUnits(1);
    setIsRequestModalOpen(true);
  };

  const handleFinalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingBank || !sourceBankId) return;

    setIsRequestSubmitting(true);
    const { error } = await supabase.from('blood_transfer_requests').insert([{
        requester_bank_id: sourceBankId,
        supplier_bank_id: requestingBank.id,
        blood_type: selectedGroup,
        units: requestUnits,
        status: 'pending'
    }]);
    
    setIsRequestSubmitting(false);
    if (!error) {
        setIsRequestModalOpen(false);
        setActiveTab('transfers'); // auto-redirect to see request
    }
  };

  const handleApproveTransfer = async (transfer: any) => {
       try {
           const supplier = bloodBanks.find(b => b.id === transfer.supplier.id);
           const currentStock = supplier?.stock[transfer.blood_type] || 0;
           
           if (!supplier || currentStock < transfer.units) {
               alert(`Insufficient Stock!\nYou only have ${currentStock} units of ${transfer.blood_type} available.`);
               return; 
           }

           const newStock = { ...supplier.stock, [transfer.blood_type]: currentStock - transfer.units };
           
           // Update db transactionally
           const [res1, res2] = await Promise.all([
               supabase.from('blood_transfer_requests').update({ status: 'approved' }).eq('id', transfer.id),
               supabase.from('blood_banks').update({ stock: newStock }).eq('id', supplier.id)
           ]);

           if (res1.error) throw new Error("Request Update Failed: " + res1.error.message);
           if (res2.error) throw new Error("Stock Update Failed: " + res2.error.message);

           // Manually refresh so we don't rely entirely on sockets
           await fetchTransfers();
           await fetchBloodBanks();

       } catch (err: any) {
           console.error('Approve error:', err);
           alert('Failed to approve transfer: ' + err.message);
       }
  };

  const handleUpdateTransferStatus = async (transfer: any, status: string) => {
       try {
           if (status === 'delivered') {
               const requester = bloodBanks.find(b => b.id === transfer.requester.id);
               if (requester) {
                   const reqStock = { ...requester.stock, [transfer.blood_type]: (requester.stock[transfer.blood_type] || 0) + transfer.units };
                   const [res1, res2] = await Promise.all([
                       supabase.from('blood_banks').update({ stock: reqStock }).eq('id', requester.id),
                       supabase.from('blood_transfer_requests').update({ status }).eq('id', transfer.id)
                   ]);
                   if (res1.error) throw new Error("Receiver Stock Update Failed: " + res1.error.message);
                   if (res2.error) throw new Error("Request Update Failed: " + res2.error.message);
                   
                   await fetchTransfers();
                   await fetchBloodBanks();
                   return;
               }
           }
           const { error } = await supabase.from('blood_transfer_requests').update({ status }).eq('id', transfer.id);
           if (error) throw new Error("Status Update Failed: " + error.message);
           
           await fetchTransfers();
           await fetchBloodBanks();
           
       } catch (err: any) {
           console.error('Status update error:', err);
           alert('Failed to update status: ' + err.message);
       }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading Blood Matrix...</div>;
  if (!sourceBank) return <div className="h-screen flex items-center justify-center text-white">No Blood Banks Found</div>;

  const isOutOfStock = sourceBank.stock[selectedGroup] === 0;

  // Split transfers into inbound (I am supplier) and outbound (I am requester)
  const inboundTransfers = transfers.filter(t => t.supplier?.id === sourceBankId);
  const outboundTransfers = transfers.filter(t => t.requester?.id === sourceBankId);

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white relative flex flex-col">
      <div className="mesh-gradient opacity-30"></div>

      <div className="w-full max-w-[1800px] mx-auto space-y-12 relative z-10 flex-1 flex flex-col">

        <div className="space-y-8 reveal active pb-4 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge-yellow">Blood Inventory command</span>
            <span className="badge-tag">Metropolitan Transit Protocol</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <h1 className="text-impact text-7xl sm:text-9xl tracking-tighter leading-none">
                BLOOD<br /><span className="text-blue-500">MATRIX</span>
              </h1>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                  <button onClick={() => setActiveTab('inventory')} className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}>Inventory Scan</button>
                  <button onClick={() => setActiveTab('transfers')} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'transfers' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}>
                      Transfer Registry 
                      {inboundTransfers.filter(t => t.status === 'pending').length > 0 && (
                          <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-[9px]">{inboundTransfers.filter(t => t.status === 'pending').length}</span>
                      )}
                  </button>
              </div>
          </div>
        </div>

        {activeTab === 'inventory' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in slide-in-from-bottom-8 duration-500">
            <div className="lg:col-span-5 space-y-10">
                <div className="glass-premium rounded-[3rem] p-10 sm:p-12 border border-white/10 shadow-3xl">
                <div className="space-y-10">
                    <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Authorized Station (Your Hub)</label>
                    <select
                        value={sourceBankId}
                        onChange={(e) => { setSourceBankId(e.target.value); setShowResults(false); }}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-bold text-lg focus:bg-white/10 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                        {bloodBanks.map(b => <option key={b.id} value={b.id} className="bg-[#020617]">{b.name}</option>)}
                    </select>
                    </div>

                    <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Required Blood Type</label>
                    <div className="grid grid-cols-4 gap-3">
                        {BLOOD_GROUPS.map(g => (
                        <button key={g} onClick={() => { setSelectedGroup(g); setShowResults(false); }} className={`py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${selectedGroup === g ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'}`}>
                            {g}
                        </button>
                        ))}
                    </div>
                    </div>

                    <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className={`w-full py-7 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 group ${isOutOfStock ? 'bg-red-600 hover:bg-white hover:text-red-500' : 'bg-blue-600 hover:bg-white hover:text-blue-500'}`}
                    >
                    {isSearching ? <div className="w-6 h-6 border-3 border-slate-400 border-t-white rounded-full animate-spin"></div> : <>{isOutOfStock ? 'Trigger Scarcity Scan' : 'Check Inventory'}<span className="material-icons-round text-2xl group-hover:translate-x-3 transition-transform">radar</span></>}
                    </button>
                </div>
                
                {/* Visual Batch/Expiry Tracking */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 px-4">Active Batches ({selectedGroup})</h3>
                    <div className="space-y-3">
                        {Array.from({ length: Math.min(3, sourceBank.stock[selectedGroup] || 0) }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <div>
                                    <p className="text-white font-black uppercase text-sm">{selectedGroup} <span className="text-slate-500 font-bold ml-2">Batch-{sourceBank.id.slice(0,4).toUpperCase()}-{i+1}</span></p>
                                    <p className="text-[9px] text-emerald-500 uppercase tracking-widest mt-1">Status: Viable</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Expires In</p>
                                    <p className="text-white font-bold">{24 + (i * 12)} Days</p>
                                </div>
                            </div>
                        ))}
                        {sourceBank.stock[selectedGroup] === 0 && (
                            <p className="text-center text-xs text-slate-600 font-black uppercase tracking-widest py-4">No viable batches</p>
                        )}
                    </div>
                </div>

                </div>
            </div>

            <div className="lg:col-span-7 h-full">
                {!showResults && !isSearching ? (
                <div className="h-full min-h-[500px] glass-premium rounded-[3rem] flex flex-col items-center justify-center p-12 text-center opacity-40 border border-dashed border-white/10">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center shadow-sm mb-6 border border-white/10">
                    <span className="material-icons-round text-slate-300 text-5xl">manage_search</span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Ready to Sync</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Metropolitan Node Scan Pending</p>
                </div>
                ) : isSearching ? (
                <div className="h-full min-h-[500px] glass-premium rounded-[3rem] flex flex-col items-center justify-center p-20 text-center animate-pulse">
                    <div className="w-32 h-32 border-4 border-white/5 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Querying Hubs...</h3>
                </div>
                ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className={`rounded-[2rem] p-8 text-white flex items-center gap-6 shadow-xl ${isOutOfStock ? 'bg-red-600 shadow-red-600/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><span className="material-icons-round">{isOutOfStock ? 'warning' : 'verified'}</span></div>
                    <div>
                        <h3 className="font-black text-lg leading-none uppercase tracking-widest">{isOutOfStock ? 'Source Node Depleted' : 'Node Optimized'}</h3>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] mt-2 mb-3">{isOutOfStock ? `Redirecting request to nearest available metropolitan hub.` : `Sufficient inventory verified at point A.`}</p>
                        <FreshnessBadge timestamp={sourceBank.last_updated_at} />
                    </div>
                    </div>

                    <div className="glass-premium rounded-[3rem] p-12 border border-white/10 shadow-3xl group relative overflow-hidden">
                    {isOutOfStock && alternatives[0] ? (
                        <>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
                            <div>
                                <span className="px-4 py-2 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 mb-4 inline-block">Transit Point B</span>
                                <h4 className="text-impact text-5xl sm:text-6xl text-white tracking-tighter leading-none mb-4">{alternatives[0].name}</h4>
                                <FreshnessBadge timestamp={alternatives[0].last_updated_at} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Distance</p>
                            <p className="text-4xl font-black text-white tracking-tighter">{alternatives[0].distance.toFixed(1)} <span className="text-lg text-slate-500 ml-1">km</span></p>
                            </div>
                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Inventory</p>
                            <p className="text-4xl font-black text-emerald-500 tracking-tighter">{alternatives[0].stock[selectedGroup]} <span className="text-lg text-slate-500 ml-1">Units</span></p>
                            </div>
                        </div>

                        <div className="h-[250px] rounded-[2rem] border border-white/10 overflow-hidden mb-12 shadow-inner">
                            <MapContainer center={sourceBank.location} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <MapFocus center={alternatives[0].location} />
                            <Marker position={sourceBank.location} icon={redIcon} />
                            <Marker position={alternatives[0].location} icon={blueIcon} />
                            <Polyline positions={[sourceBank.location, alternatives[0].location]} pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 15' }} />
                            </MapContainer>
                        </div>

                        <button onClick={() => initiateRequest(alternatives[0])} className="w-full py-8 bg-blue-600 hover:bg-white hover:text-black text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-95">
                            <span className="material-icons-round">emergency_share</span> Request Inter-Node Transfer
                        </button>
                        </>
                    ) : (
                        <div className="text-center py-20">
                           <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 text-emerald-500 border border-emerald-500/20 shadow-2xl"><span className="material-icons-round text-7xl">check_circle</span></div>
                           <h4 className="text-impact text-5xl text-white tracking-tight">POINT A SECURED</h4>
                           <p className="text-slate-500 mt-6 max-w-sm mx-auto font-black uppercase tracking-[0.2em] text-[10px]">{sourceBank.name} has verified {sourceBank.stock[selectedGroup]} units available for immediate dispatch.</p>
                        </div>
                    )}
                    </div>
                </div>
                )}
            </div>
            </div>
        ) : (
            /* TRANSFERS TAB */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in slide-in-from-right-8 duration-500 flex-1">
                
                {/* Inbound Requests (To me) */}
                <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl h-full flex flex-col">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2 flex items-center gap-3"><span className="material-icons-round text-blue-500">download</span> Inbound Transfer Requests</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Other hubs requesting heavily from {sourceBank.name}</p>
                    
                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {inboundTransfers.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <span className="material-icons-round text-6xl text-slate-500 mb-4">inventory</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No inbound requests</p>
                            </div>
                        ) : (
                            inboundTransfers.map(t => (
                                <div key={t.id} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-3xl font-black text-white tracking-tighter">{t.blood_type}</span>
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase">{t.units} Units</span>
                                        </div>
                                        <p className="text-blue-400 text-sm font-black uppercase tracking-widest">{t.requester.name}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">{new Date(t.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="w-full sm:w-auto text-right flex flex-col items-end gap-3">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            t.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 
                                            t.status === 'approved' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                            t.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 
                                            'bg-slate-500/10 text-slate-500 border-slate-500/30'
                                        }`}>{t.status}</span>
                                        
                                        {t.status === 'pending' && (
                                            <button 
                                                onClick={() => handleApproveTransfer(t)}
                                                className="px-6 py-3 bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                            >Approve & Dispatch</button>
                                        )}
                                        {t.status === 'approved' && (
                                            <button 
                                                onClick={() => handleUpdateTransferStatus(t, 'delivered')}
                                                className="px-6 py-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                            >Mark Delivered</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Outbound Requests (From me) */}
                <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-3xl h-full flex flex-col">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2 flex items-center gap-3"><span className="material-icons-round text-emerald-500">upload</span> Outbound Transfer Requests</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Your open requests to other hubs</p>
                    
                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {outboundTransfers.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <span className="material-icons-round text-6xl text-slate-500 mb-4">drafts</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No outbound requests</p>
                            </div>
                        ) : (
                            outboundTransfers.map(t => (
                                <div key={t.id} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-3xl font-black text-white tracking-tighter">{t.blood_type}</span>
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase">{t.units} Units</span>
                                        </div>
                                        <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Supplier: <span className="text-white">{t.supplier.name}</span></p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">{new Date(t.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="w-full sm:w-auto text-right">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            t.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 
                                            t.status === 'approved' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                            t.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 
                                            'bg-slate-500/10 text-slate-500 border-slate-500/30'
                                        }`}>{t.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        )}

      </div>

      {isRequestModalOpen && requestingBank && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/10">
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase relative z-10 text-impact mb-2">Initiate Transfer</h3>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] relative z-10">Formally requesting from {requestingBank.name}</p>
            </div>
            <form onSubmit={handleFinalRequest} className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Units Required (Max {requestingBank.stock[selectedGroup]})</label>
                </div>
                <div className="flex items-center justify-between gap-6 bg-[#020617] p-4 rounded-[2rem] border border-white/10">
                  <button type="button" onClick={() => setRequestUnits(Math.max(1, requestUnits - 1))} className="w-16 h-16 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:text-blue-500 transition-all active:scale-95"><span className="material-icons-round text-2xl">remove</span></button>
                  <div className="flex-1 text-center text-5xl font-black text-white">{requestUnits}</div>
                  <button type="button" onClick={() => setRequestUnits(Math.min(requestingBank.stock[selectedGroup] || 0, requestUnits + 1))} className="w-16 h-16 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:text-blue-500 transition-all active:scale-95"><span className="material-icons-round text-2xl">add</span></button>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-6 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancel Vector</button>
                <button type="submit" disabled={isRequestSubmitting} className="flex-1 py-6 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-3 justify-center">
                  {isRequestSubmitting ? 'Syncing...' : 'Transmit Request'} <span className="material-icons-round text-lg">public</span>
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
