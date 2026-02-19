// Run with: node scripts/find_exec_sql.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function find() {
    const query = `
        SELECT p.proname, n.nspname, pg_get_functiondef(p.oid) as def
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname IN ('exec_sql', 'execute_sql')
    `;
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
        console.log('Found functions:', JSON.stringify(data, null, 2));
    } else {
        const err = await res.text();
        console.log('Error:', err);
    }
}

find().catch(console.error);
