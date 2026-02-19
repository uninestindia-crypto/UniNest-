// Run with: node scripts/profiles_columns.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function check() {
    const query = "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles'";
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
    });

    if (res.ok) {
        const data = await res.json();
        console.log('Columns in public.profiles:', JSON.stringify(data, null, 2));
    } else {
        const err = await res.text();
        console.log('Error:', err);
    }
}

check().catch(console.error);
