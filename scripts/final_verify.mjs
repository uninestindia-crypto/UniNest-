// Run with: node scripts/final_verify.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

async function verify() {
    console.log('Final verification of database schema...\n');

    // Check profiles columns
    const resProfiles = await fetch(`${supabaseUrl}/rest/v1/profiles?select=public_key,public_key_digest&limit=1`, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        }
    });
    console.log(`Profiles columns: ${resProfiles.ok ? '✅ OK' : '❌ FAILED'}`);

    // Check chat_room_keys table
    const resRoomKeys = await fetch(`${supabaseUrl}/rest/v1/chat_room_keys?select=id&limit=1`, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        }
    });
    console.log(`chat_room_keys table: ${resRoomKeys.ok ? '✅ OK' : '❌ FAILED'}`);

    // Check chat_messages columns
    const resMessages = await fetch(`${supabaseUrl}/rest/v1/chat_messages?select=encryption_v,iv&limit=1`, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        }
    });
    console.log(`chat_messages columns: ${resMessages.ok ? '✅ OK' : '❌ FAILED'}`);

    if (resProfiles.ok && resRoomKeys.ok && resMessages.ok) {
        console.log('\nAll verified!');
    } else {
        console.log('\nVerification failed.');
    }
}

verify().catch(console.error);
