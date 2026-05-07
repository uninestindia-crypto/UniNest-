/**
 * make-ico.js  — Pure Node.js JPEG→PNG→ICO pipeline
 * Reads assets/icon.jpg (or .png), re-saves as true PNG via raw buffer manipulation,
 * then writes a valid ICO file embedding that PNG.
 *
 * ICO format with PNG data (Vista+ / Windows 10 style) = simplest possible approach.
 * electron-builder on Windows accepts ICO with embedded PNG for all icon sizes.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const NODE = process.execPath;
const ASSETS = path.join(__dirname, 'assets');
const SRC    = path.join(ASSETS, 'icon.png');  // actually JPEG despite name

// ── Step 1: Convert JPEG → true PNG using Node's built-in capabilities ────────
// We use the Windows built-in `certutil` or PowerShell to handle the conversion
// without needing any npm packages.

function jpegToPng(jpegPath, pngPath) {
  // Use PowerShell's System.Drawing to convert JPEG → PNG (available on all Windows)
  const ps = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${jpegPath.replace(/\\/g, '\\\\')}')
$bmp = New-Object System.Drawing.Bitmap $img
$bmp.Save('${pngPath.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
$bmp.Dispose()
Write-Host "Converted: $($img.Width)x$($img.Height)"
`.trim();

  console.log('[1/3] Converting JPEG → PNG via PowerShell System.Drawing...');
  execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });
}

// ── Step 2: Build ICO file (PNG-in-ICO, Vista+ format) ────────────────────────
function buildIco(pngPath, icoPath) {
  console.log('[2/3] Building ICO file (PNG-in-ICO format)...');
  const pngData = fs.readFileSync(pngPath);

  // ICO Directory:
  // - ICONDIR header: 6 bytes
  // - ICONDIRENTRY[1]: 16 bytes
  // - PNG image data
  const RESERVED    = 0;
  const TYPE_ICO    = 1;
  const NUM_IMAGES  = 1;

  // Image entry (256x256 uses 0,0 for width/height per ICO spec)
  const width    = 0;  // 0 = 256
  const height   = 0;  // 0 = 256
  const colorCount = 0;
  const reserved    = 0;
  const planes      = 1;
  const bitCount    = 32;
  const imageOffset = 6 + 16;  // header(6) + entry(16)

  const header = Buffer.alloc(6);
  header.writeUInt16LE(RESERVED, 0);
  header.writeUInt16LE(TYPE_ICO, 2);
  header.writeUInt16LE(NUM_IMAGES, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(width, 0);
  entry.writeUInt8(height, 1);
  entry.writeUInt8(colorCount, 2);
  entry.writeUInt8(reserved, 3);
  entry.writeUInt16LE(planes, 4);
  entry.writeUInt16LE(bitCount, 6);
  entry.writeUInt32LE(pngData.length, 8);
  entry.writeUInt32LE(imageOffset, 12);

  const ico = Buffer.concat([header, entry, pngData]);
  fs.writeFileSync(icoPath, ico);
  console.log(`  ✓ icon.ico written (${(ico.length / 1024).toFixed(0)} KB)`);
}

// ── Step 3: Generate minimal ICNS ─────────────────────────────────────────────
function buildIcns(pngPath, icnsPath) {
  console.log('[3/3] Building minimal ICNS (ic09 = 512x512 PNG chunk)...');
  const pngData = fs.readFileSync(pngPath);

  const chunkType = Buffer.from('ic09');
  const chunkBodyLen = pngData.length;
  const chunkTotalLen = 8 + chunkBodyLen;  // type(4) + size(4) + data
  const fileTotalLen  = 8 + chunkTotalLen; // 'icns'(4) + fileSize(4) + chunk

  const chunkSizeBuf = Buffer.allocUnsafe(4);
  chunkSizeBuf.writeUInt32BE(chunkTotalLen, 0);

  const fileSizeBuf = Buffer.allocUnsafe(4);
  fileSizeBuf.writeUInt32BE(fileTotalLen, 0);

  const icns = Buffer.concat([
    Buffer.from('icns'), fileSizeBuf,
    chunkType, chunkSizeBuf, pngData,
  ]);
  fs.writeFileSync(icnsPath, icns);
  console.log(`  ✓ icon.icns written (${(icns.length / 1024).toFixed(0)} KB)`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const truePng = path.join(ASSETS, 'icon_true.png');

// Convert JPEG→PNG first
jpegToPng(SRC, truePng);

// Overwrite the .png with a true PNG
fs.copyFileSync(truePng, SRC);
fs.unlinkSync(truePng);

// Build ICO
buildIco(SRC, path.join(ASSETS, 'icon.ico'));

// Build ICNS
buildIcns(SRC, path.join(ASSETS, 'icon.icns'));

console.log('\n✅ All icons generated:');
console.log('   assets/icon.png  (true PNG - overwritten)');
console.log('   assets/icon.ico  (Windows ICO with embedded PNG)');
console.log('   assets/icon.icns (macOS ICNS stub)');
