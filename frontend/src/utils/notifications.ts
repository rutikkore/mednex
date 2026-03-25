import { supabase } from '../lib/supabase';

export type NotificationType = 'blood_low' | 'bed_critical' | 'queue_alert' | 'transfer_request';

export const triggerNotification = async (hospitalId: string, type: NotificationType, message: string) => {
    // Basic debounce to prevent spamming identical notifications
    const cacheKey = `notif_${hospitalId}_${type}_${message}`;
    const lastTriggered = localStorage.getItem(cacheKey);
    const now = Date.now();

    // Prevent duplicate alerts within 5 minutes
    if (lastTriggered && now - parseInt(lastTriggered) < 5 * 60 * 1000) {
        return { error: new Error('Throttled duplicate notification') };
    }

    localStorage.setItem(cacheKey, now.toString());

    const { data, error } = await supabase
        .from('notifications')
        .insert([{ hospital_id: hospitalId, type, message }])
        .select()
        .single();
        
    return { data, error };
};
