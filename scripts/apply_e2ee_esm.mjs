// Run with: node --input-type=module < scripts/apply_e2ee_esm.mjs
// OR: node scripts/apply_e2ee_esm.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use fetch directly to hit the PostgREST SQL endpoint
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
    `DO $$ BEGIN CREATE POLICY "Users can read their own room keys" ON public.chat_room_keys FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "Users can insert their own room keys" ON public.chat_room_keys FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS encryption_v INTEGER DEFAULT 1`,
    `ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS iv TEXT`,
];

for (const stmt of statements) {
    const shortStmt = stmt.trim().substring(0, 60);
    process.stdout.write(`>> ${shortStmt}...\n`);

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: stmt }),
    });

    if (!res.ok) {
        const errText = await res.text();
        // If the function doesn't exist, try pg_query
        const res2 = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: stmt }),
        });
        if (!res2.ok) {
            const errText2 = await res2.text();
            console.log(`   ❌ Both failed: ${errText2.substring(0, 100)}`);
        } else {
            console.log(`   ✅ Success via pg_query`);
        }
    } else {
        console.log(`   ✅ Success`);
    }
}

console.log('\nDone!');
