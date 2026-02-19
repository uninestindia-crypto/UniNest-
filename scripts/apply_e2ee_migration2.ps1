$projectRef = 'dfkgefoqodjccrrqmqis'
$serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y'

$baseUrl = "https://$projectRef.supabase.co"

$headers = @{
    'apikey'        = $serviceKey
    'Authorization' = "Bearer $serviceKey"
    'Content-Type'  = 'application/json'
}

$statements = @(
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key TEXT",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key_digest TEXT",
    @"
CREATE TABLE IF NOT EXISTS public.chat_room_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_session_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
)
"@,
    "ALTER TABLE public.chat_room_keys ENABLE ROW LEVEL SECURITY",
    "DROP POLICY IF EXISTS ""Users can read their own room keys"" ON public.chat_room_keys",
    "CREATE POLICY ""Users can read their own room keys"" ON public.chat_room_keys FOR SELECT USING (auth.uid() = user_id)",
    "DROP POLICY IF EXISTS ""Users can insert their own room keys"" ON public.chat_room_keys",
    "CREATE POLICY ""Users can insert their own room keys"" ON public.chat_room_keys FOR INSERT WITH CHECK (auth.uid() = user_id)",
    "ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS encryption_v INTEGER DEFAULT 1",
    "ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS iv TEXT"
)

Write-Host "Applying E2EE migration using PostgREST rpc approach..."
Write-Host ""

foreach ($stmt in $statements) {
    $stmt = $stmt.Trim()
    if (-not $stmt) { continue }
    
    $shortStmt = $stmt.Substring(0, [Math]::Min(80, $stmt.Length))
    Write-Host ">> $shortStmt..."

    # Use the query endpoint via the Supabase REST API (v2 management API)
    $body = @{ query = $stmt } | ConvertTo-Json -Compress
    
    try {
        # Try REST query endpoint available on newer Supabase
        $mgmtRes = Invoke-RestMethod `
            -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" `
            -Method Post `
            -Headers @{ 'Authorization' = "Bearer $serviceKey"; 'Content-Type' = 'application/json' } `
            -Body $body `
            -ErrorAction Stop
        Write-Host "   ✅ Done"
    }
    catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Done!"
