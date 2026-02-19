// Run with: node scripts/test_token.mjs
const accessToken = 'sbp_fb0620bbc758651c8c7d2ea9d4d33ae3e1f2bf56';

async function test() {
    console.log('Testing access token against Supabase projects API...');
    try {
        const res = await fetch('https://api.supabase.com/v1/projects', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ Token is valid!');
            console.log('Projects:', JSON.stringify(data, null, 2));
        } else {
            const err = await res.text();
            console.log('❌ Failed:', res.status, err);
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}

test().catch(console.error);
