// Run with: node scripts/rpc_test.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function test() {
    console.log('Testing execute_sql with SELECT 1');
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: "SELECT 1 as val" }),
    });

    if (res.ok) {
        const data = await res.json();
        console.log('Result:', JSON.stringify(data));
    } else {
        const err = await res.text();
        console.log('Error:', err);
    }
}

test().catch(console.error);
