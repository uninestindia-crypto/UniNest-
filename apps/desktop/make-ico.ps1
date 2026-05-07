Add-Type -AssemblyName System.Drawing

$srcPath = "D:\Zeaul\UniNest-\apps\desktop\assets\icon.png"
$icoPath = "D:\Zeaul\UniNest-\apps\desktop\assets\icon.ico"

# Load source image (JPEG or PNG, System.Drawing handles both)
$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image loaded: $($srcImg.Width)x$($srcImg.Height) pixels"

# Standard ICO sizes
$sizes = @(16, 32, 48, 64, 128, 256)

$ms = New-Object System.IO.MemoryStream

# ICO header: reserved(2) + type ICO=1(2) + count(2)
$count = [byte]$sizes.Count
$ms.Write([byte[]]@(0,0, 1,0, $count,0), 0, 6)

# Space for directory (16 bytes * count), will fill in later
$dirStart = [int]$ms.Position
$dirBytes = New-Object byte[] ($sizes.Count * 16)
$ms.Write($dirBytes, 0, $dirBytes.Length)

# Write each PNG-compressed frame
$entries = @()
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $sz = $sizes[$i]
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.DrawImage($srcImg, 0, 0, $sz, $sz)
    $g.Dispose()

    $imgMs = New-Object System.IO.MemoryStream
    $bmp.Save($imgMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $imgData = $imgMs.ToArray()
    $imgMs.Dispose()

    $offset = [int]$ms.Position
    $entries += [pscustomobject]@{ Size = $sz; Data = $imgData; Offset = $offset }
    $ms.Write($imgData, 0, $imgData.Length)
    Write-Host "  [$($i+1)/$($sizes.Count)] Size $sz x $sz -> $($imgData.Length) bytes at offset $offset"
}

# Go back and write directory entries
$ms.Position = $dirStart
foreach ($e in $entries) {
    $w = if ($e.Size -eq 256) { [byte]0 } else { [byte]$e.Size }
    $h = $w
    [byte[]]$dir = @($w, $h, 0, 0, 1, 0, 32, 0)
    $ms.Write($dir, 0, 8)
    $ms.Write([BitConverter]::GetBytes([int]$e.Data.Length), 0, 4)
    $ms.Write([BitConverter]::GetBytes([int]$e.Offset), 0, 4)
}

$srcImg.Dispose()
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$ms.Dispose()

$finalSize = (Get-Item $icoPath).Length
Write-Host "`n✅ icon.ico written: $finalSize bytes | $($sizes.Count) sizes: $($sizes -join ', ')px"
