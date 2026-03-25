import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

export interface AppNotification {
    id: string;
    hospital_id: string;
    type: 'blood_low' | 'bed_critical' | 'queue_alert' | 'transfer_request';
    message: string;
    is_read: boolean;
    created_at: string;
}

export function useNotifications(hospitalId: string | null) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial fetch
    useEffect(() => {
        if (!hospitalId) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setNotifications(data as AppNotification[]);
                setUnreadCount(data.filter((n) => !n.is_read).length);
            }
        };

        fetchNotifications();
    }, [hospitalId]);

    // Setup real-time subscription
    useEffect(() => {
        if (!hospitalId) return;

        const channel = supabase
            .channel(`notifications:hospital_id=eq.${hospitalId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `hospital_id=eq.${hospitalId}`,
                },
                (payload) => {
                    const newNotif = payload.new as AppNotification;
                    setNotifications((prev) => [newNotif, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `hospital_id=eq.${hospitalId}`,
                },
                (payload) => {
                    const updatedNotif = payload.new as AppNotification;
                    setNotifications((prev) => 
                        prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
                    );
                    
                    // Recalculate unread count
                    setNotifications((current) => {
                        const newCount = current.map(n => n.id === updatedNotif.id ? updatedNotif : n).filter(n => !n.is_read).length;
                        setUnreadCount(newCount);
                        return current;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [hospitalId]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    };

    const markAllRead = async () => {
        const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    };

    return { notifications, unreadCount, markAsRead, markAllRead };
}
