Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path ".").Path
$iconDir = Join-Path $projectRoot "public/icons"
$shotDir = Join-Path $projectRoot "public/screenshots"

if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

if (-not (Test-Path $shotDir)) {
    New-Item -ItemType Directory -Path $shotDir -Force | Out-Null
}

function New-SolidPng {
    param(
        [string]$Path,
        [int]$Width,
        [int]$Height,
        [string]$Hex
    )

    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $color = [System.Drawing.ColorTranslator]::FromHtml($Hex)

    $graphics.Clear($color)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $bitmap.Dispose()
}

New-SolidPng -Path (Join-Path $iconDir 'icon-192x192.png') -Width 192 -Height 192 -Hex '#38BDF8'
New-SolidPng -Path (Join-Path $iconDir 'icon-512x512.png') -Width 512 -Height 512 -Hex '#1D4ED8'
New-SolidPng -Path (Join-Path $iconDir 'icon-1024x1024.png') -Width 1024 -Height 1024 -Hex '#0F172A'

New-SolidPng -Path (Join-Path $shotDir 'dashboard-desktop.png') -Width 1280 -Height 720 -Hex '#0F172A'
New-SolidPng -Path (Join-Path $shotDir 'dashboard-mobile.png') -Width 540 -Height 960 -Hex '#1E293B'
