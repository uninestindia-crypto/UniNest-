// Run with: node scripts/apply_e2ee_mgmt.mjs
const projectRef = 'dfkgefoqodjccrrqmqis';
const accessToken = 'sbp_fb0620bbc758651c8c7d2ea9d4d33ae3e1f2bf56';

const sql = `
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key_digest TEXT;

CREATE TABLE IF NOT EXISTS public.chat_room_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_session_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

ALTER TABLE public.chat_room_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own room keys') THEN
        CREATE POLICY "Users can read their own room keys" ON public.chat_room_keys FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own room keys') THEN
        CREATE POLICY "Users can insert their own room keys" ON public.chat_room_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS encryption_v INTEGER DEFAULT 1;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS iv TEXT;
`;

async function run() {
    console.log('Sending SQL migration to Supabase Management API...\n');

    try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql }),
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ Migration successful!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const err = await res.text();
            console.log('❌ Migration failed!');
            console.log('Status:', res.status);
            console.log('Error:', err);
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}

run().catch(console.error);
