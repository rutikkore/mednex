import React, { useState, useEffect, useRef } from 'react';
import { useNotifications, AppNotification } from '../../hooks/useNotifications';
import { useHospital } from '../../hooks/useHospital';

export const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { hospitalId } = useHospital();
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications(hospitalId);
    
    // Auto-close when clicking outside
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIconInfo = (type: AppNotification['type']) => {
        switch (type) {
            case 'blood_low': return { icon: 'bloodtype', color: 'text-red-500', bg: 'bg-red-500/10' };
            case 'bed_critical': return { icon: 'warning', color: 'text-orange-500', bg: 'bg-orange-500/10' };
            case 'queue_alert': return { icon: 'people', color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'transfer_request': return { icon: 'change_circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            default: return { icon: 'notifications', color: 'text-slate-500', bg: 'bg-white/10' };
        }
    };

    const getRelativeTime = (timestamp: string) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hr ago`;
        return `${Math.floor(diffHours / 24)} d ago`;
    };

    if (!hospitalId) return null; // Don't show bell if not a staff member with a hospital assigned

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-11 h-11 rounded-[1rem] flex items-center justify-center transition-all bg-white/5 border border-white/10 text-slate-500 hover:text-white relative"
            >
                <span className="material-icons-round text-xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black items-center justify-center text-white">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 sm:w-96 bg-[#020617] border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-black text-white uppercase tracking-widest text-xs">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-black bg-blue-600/20 text-blue-500 px-3 py-1 rounded-full uppercase">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">
                                <span className="material-icons-round text-4xl mb-4 opacity-50">notifications_paused</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silence Detected</p>
                                <p className="text-xs mt-2 opacity-50">No alerts in your sector.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.slice(0, 10).map((notif) => {
                                    const { icon, color, bg } = getIconInfo(notif.type);
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                            className={`p-5 flex gap-4 transition-all hover:bg-white/5 cursor-pointer ${notif.is_read ? 'opacity-60' : 'bg-white/[0.02]'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                                                <span className="material-icons-round text-lg">{icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${notif.is_read ? 'text-slate-400' : 'text-white font-bold leading-tight'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                                                    {getRelativeTime(notif.created_at)}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <button
                                onClick={markAllRead}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Mark All As Read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
