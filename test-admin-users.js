const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseServiceKey?.substring(0, 10) + '...');

async function main() {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });
    console.log('Auth Users Count:', authUsers?.length);
    if (authError) console.error('Auth Error:', authError);

    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*');
    
    console.log('Profiles Count:', profiles?.length);
    if (profileError) console.error('Profiles Error:', profileError);
}
main();
