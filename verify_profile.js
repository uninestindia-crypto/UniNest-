
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDgxMjQsImV4cCI6MjA3MjkyNDEyNH0._3SxtAocgCIoJ7gyBbZoMsZrHAV4yd-sFu-GFINfNqw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
    const handle = 'zeaul';
    console.log(`Checking profile for handle: ${handle}`);

    try {
        const query = supabase
            .from('profiles')
            .select('*, follower_count:followers!following_id(count), following_count:followers!follower_id(count)')
            .eq('handle', handle);

        const { data, error } = await query.single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Try simpler query
            console.log('Trying simpler query...');
            const simple = await supabase.from('profiles').select('*').eq('handle', handle).single();
            if (simple.error) {
                console.error('Error fetching simpler profile:', simple.error);
            } else {
                console.log('Simple profile found:', simple.data);
            }

        } else {
            console.log('Profile found:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkProfile();
