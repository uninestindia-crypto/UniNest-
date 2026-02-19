$env:SUPABASE_ACCESS_TOKEN = "sbp_fb0620bbc758651c8c7d2ea9d4d33ae3e1f2bf56"
$projectRef = "dfkgefoqodjccrrqmqis"
$migrationFile = "d:\studio-uninest-deployed-main\temp_migration.sql"

Write-Host "Executing migration SQL via Supabase CLI..."
# Using --file to avoid passing SQL as a string argument
npx supabase db execute --project-ref $projectRef --file $migrationFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "Migration failed with exit code $LASTEXITCODE"
} else {
    Write-Host "✅ Migration successfully applied!"
}
