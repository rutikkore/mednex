

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('MedNexus Supabase Config:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    isConfigured: supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL'
});

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Create a client even if not configured to prevent crash on import, 
// but it won't work for actual requests until configured.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

