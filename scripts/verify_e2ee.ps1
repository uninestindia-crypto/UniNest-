$url = 'https://dfkgefoqodjccrrqmqis.supabase.co'
$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y'
$headers = @{
    'apikey'        = $key
    'Authorization' = "Bearer $key"
    'Content-Type'  = 'application/json'
}

# Test 1: Does profiles have a public_key column?
Write-Host "=== Test 1: Checking profiles.public_key column ==="
try {
    $res = Invoke-RestMethod -Uri "$url/rest/v1/profiles?select=id,public_key&limit=1" -Headers $headers -Method Get
    Write-Host "✅ profiles.public_key column EXISTS"
    $res | ConvertTo-Json
}
catch {
    Write-Host "❌ profiles.public_key column NOT FOUND: $($_.Exception.Message)"
}

# Test 2: Does chat_room_keys table exist?
Write-Host ""
Write-Host "=== Test 2: Checking chat_room_keys table ==="
try {
    $res = Invoke-RestMethod -Uri "$url/rest/v1/chat_room_keys?select=id&limit=1" -Headers $headers -Method Get
    Write-Host "✅ chat_room_keys table EXISTS"
}
catch {
    Write-Host "❌ chat_room_keys table NOT FOUND: $($_.Exception.Message)"
}

# Test 3: Does chat_messages have iv column?
Write-Host ""
Write-Host "=== Test 3: Checking chat_messages.iv column ==="
try {
    $res = Invoke-RestMethod -Uri "$url/rest/v1/chat_messages?select=id,iv&limit=1" -Headers $headers -Method Get
    Write-Host "✅ chat_messages.iv column EXISTS"
}
catch {
    Write-Host "❌ chat_messages.iv column NOT FOUND: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Verification complete ==="
