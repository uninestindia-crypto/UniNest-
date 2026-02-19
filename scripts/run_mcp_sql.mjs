import { spawn } from 'child_process';

const SUPABASE_URL = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

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
    console.log('Spawning Supabase MCP server...\n');

    // Use cmd /c to run npx on windows reliably
    const mcp = spawn('cmd', ['/c', 'npx', '-y', '@supabase/mcp-server-supabase'], {
        env: {
            ...process.env,
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY
        }
    });

    let stdout = '';
    mcp.stdout.on('data', (data) => {
        stdout += data.toString();
        // Check if we got a response
        if (stdout.includes('"id":1')) {
            console.log('Received response from MCP server:');
            console.log(stdout);
            mcp.kill();
        }
    });

    mcp.stderr.on('data', (data) => {
        console.error(`MCP Error Trace: ${data}`);
    });

    // Wait for the server to initialize (it sends its capabilities)
    await new Promise(resolve => setTimeout(resolve, 3000));

    const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'call_tool',
        params: {
            name: 'execute_sql',
            arguments: {
                sql: sql
            }
        }
    };

    console.log('Sending execute_sql request...');
    mcp.stdin.write(JSON.stringify(request) + '\n');

    // Timeout after 30 seconds
    setTimeout(() => {
        console.log('Request timed out.');
        mcp.kill();
        process.exit(1);
    }, 30000);
}

run().catch(console.error);
