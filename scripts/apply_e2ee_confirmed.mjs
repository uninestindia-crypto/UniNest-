// Run with: node scripts/apply_e2ee_confirmed.mjs
const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

const statements = [
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key TEXT`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key_digest TEXT`,
    `CREATE TABLE IF NOT EXISTS public.chat_room_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_session_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
  )`,
    `ALTER TABLE public.chat_room_keys ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own room keys') THEN
            CREATE POLICY "Users can read their own room keys" ON public.chat_room_keys FOR SELECT USING (auth.uid() = user_id);
        END IF;
    END $$`,
    `DO $$ BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own room keys') THEN
            CREATE POLICY "Users can insert their own room keys" ON public.chat_room_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
    END $$`,
    `ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS encryption_v INTEGER DEFAULT 1`,
    `ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS iv TEXT`,
];

async function run() {
    console.log('Starting confirmed migration...\n');

    for (const stmt of statements) {
        const shortStmt = stmt.trim().substring(0, 60).replace(/\n/g, ' ');
        process.stdout.write(`>> ${shortStmt}...\n`);

        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: stmt }),
            });

            if (res.ok) {
                console.log(`   ✅ Success`);
            } else {
                const err = await res.text();
                console.log(`   ❌ Failed: ${err}`);
            }
        } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
        }
    }

    console.log('\nMigration finished.');
}

run().catch(console.error);
