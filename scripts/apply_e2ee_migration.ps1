$envPath = "d:\studio-uninest-deployed-main\.env"
$envData = Get-Content $envPath
$supabaseUrl = ""
$supabaseServiceKey = ""

foreach ($line in $envData) {
    if ($line -match "^NEXT_PUBLIC_SUPABASE_URL=`"?(.*?)`"?$") {
        $supabaseUrl = $matches[1]
    }
    if ($line -match "^SUPABASE_SERVICE_KEY=`"?(.*?)`"?$") {
        $supabaseServiceKey = $matches[1]
    }
}

if (-not $supabaseUrl -or -not $supabaseServiceKey) {
    Write-Error "Missing Supabase URL or Service Key in .env"
    exit 1
}

$rpcUrl = "$supabaseUrl/rest/v1/rpc/exec_sql"
$headers = @{
    "apikey"        = $supabaseServiceKey
    "Authorization" = "Bearer $supabaseServiceKey"
    "Content-Type"  = "application/json"
}

$migrationFile = "C:\Users\user\.gemini\antigravity\brain\a663e7a5-d0d2-4091-bb29-bd56fd47c84a\e2ee_migration.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Error "Migration file not found at $migrationFile"
    exit 1
}

$sql = Get-Content $migrationFile -Raw
$statements = $sql -split ';'

Write-Host "Starting migration with $($statements.Count) segments..."

foreach ($s in $statements) {
    $s = $s.Trim()
    if ($s.Length -eq 0 -or $s.StartsWith("--")) { continue }
    
    Write-Host "Executing: $($s.Substring(0, [Math]::Min(50, $s.Length)))..."
    $body = @{ "sql_query" = $s } | ConvertTo-Json -Compress
    
    try {
        $response = Invoke-RestMethod -Uri $rpcUrl -Method Post -Headers $headers -Body $body
        Write-Host "  ✅ Success"
    }
    catch {
        # Try execute_sql as fallback
        $fallbackUrl = "$supabaseUrl/rest/v1/rpc/execute_sql"
        try {
            $response = Invoke-RestMethod -Uri $fallbackUrl -Method Post -Headers $headers -Body $body
            Write-Host "  ✅ Success (via execute_sql)"
        }
        catch {
            Write-Host "  ❌ Failed: $($_.Exception.Message)"
        }
    }
}

Write-Host "`nMigration finished."
