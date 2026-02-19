// Run with: node scripts/check_rpc_params.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function run() {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        }
    });

    if (res.ok) {
        const data = await res.json();
        const execute_sql_spec = data.paths['/rpc/execute_sql'];
        console.log('execute_sql spec:', JSON.stringify(execute_sql_spec, null, 2));
    }
}

run().catch(console.error);
