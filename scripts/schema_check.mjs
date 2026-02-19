// Run with: node scripts/schema_check.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function check() {
    const queries = [
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'public_key'",
        "SELECT table_name FROM information_schema.tables WHERE table_name = 'chat_room_keys'",
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'iv'"
    ];

    for (const query of queries) {
        console.log(`Checking: ${query}`);
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
            console.log('Result:', JSON.stringify(data));
        } else {
            const err = await res.text();
            console.log('Error:', err);
        }
    }
}

check().catch(console.error);
