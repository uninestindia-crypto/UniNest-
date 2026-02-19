// Run with: node scripts/check_rpcs.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function run() {
    console.log('Checking for available RPC functions...\n');

    // Query the rest/v1/ interface directly for functions
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        }
    });

    if (res.ok) {
        const data = await res.json();
        const paths = Object.keys(data.paths);
        const rpcs = paths.filter(p => p.startsWith('/rpc/')).map(p => p.replace('/rpc/', ''));
        console.log('Available RPCs:');
        rpcs.forEach(rpc => console.log(`- ${rpc}`));
    } else {
        console.error('Failed to fetch OpenAPI spec from Supabase.');
    }
}

run().catch(console.error);
