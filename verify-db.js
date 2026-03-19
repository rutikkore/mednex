import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from frontend folder
dotenv.config({ path: path.resolve(__dirname, 'frontend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in frontend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Checking Supabase Connection...');
    console.log(`URL: ${supabaseUrl}`);

    // Check 1: Connection
    const { data: healthData, error: healthError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (healthError) {
        console.error('❌ Connection Failed or Table "profiles" missing.');
        console.error('Error:', healthError.message);
        console.log('\nPotential causes:');
        console.log('1. You have not run the "backend/schema.sql" script in Supabase.');
        console.log('2. The Anon Key is invalid.');
    } else {
        console.log('✅ Connected to Supabase!');
        console.log('✅ Table "profiles" exists.');
    }

    // Check 2: Hospitals (Public table)
    const { data: hospitals, error: hospError } = await supabase.from('hospitals').select('id').limit(1);
    if (hospError) {
        console.error('❌ Table "hospitals" missing or not accessible.');
    } else {
        console.log('✅ Table "hospitals" exists.');
    }

    // Check 3: Check if any user exists
    // We can't query auth.users directly easily, but we can check profiles count is > 0?
    // We already did a count check.
}

checkDatabase();
