# UniNest Desktop (Electron)

Native desktop wrapper for the UniNest web app using Electron.

## What It Does

Wraps the UniNest production web app (`https://uninest-india.vercel.app`) in a native borderless window. No local server — the app requires internet access.

## Directory Structure

```
apps/desktop/
├── main.js                 ← Electron main process
├── preload.js              ← Context bridge (safe IPC to renderer)
├── package.json            ← electron-builder config
├── generate-icons.js       ← Icon converter (JPEG→PNG, ICNS)
├── make-ico.ps1            ← ICO generator (multi-size Windows icon)
├── start-dev.bat           ← Launch dev mode (loads localhost:9002)
├── build-win.bat           ← Build Windows .exe
├── LICENSE.txt             ← License for NSIS installer
└── assets/
    ├── icon.png            ← 1024×1024 source icon (PNG)
    ├── icon.ico            ← Windows multi-size ICO (16,32,48,64,128,256px)
    ├── icon.icns           ← macOS ICNS (ic09+ic10 format)
    ├── dmg-background.png  ← macOS DMG installer background
    ├── installer-header.bmp← NSIS installer header
    └── entitlements.mac.plist ← macOS notarization entitlements
```

## Development

**Dev mode** (loads local Next.js dev server):
1. Start web: `cd apps/web && pnpm dev` (waits on port 9002)
2. Launch Electron: double-click `start-dev.bat`

Or set env var and run electron directly:
```cmd
set UNINEST_URL=http://localhost:9002
.\node_modules\electron\dist\electron.exe .
```

## Production Builds

### Windows (.exe) — Build on Windows ✅
```cmd
REM Double-click build-win.bat, OR run manually:
set PATH=D:\Zeaul\UniNest-\.node\node-v22.14.0-win-x64;%PATH%
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
node ..\..\.node\node-v22.14.0-win-x64\node_modules\npm\bin\npm-cli.js run build:win
```
Output: `dist\UniNest Setup 1.0.0.exe` + `dist\UniNest 1.0.0.exe`

### macOS (.dmg) — Requires Mac ⚠️
```bash
# On macOS:
npm run build:mac
```
Output: `dist/UniNest-1.0.0.dmg`

**Or use GitHub Actions** (free macOS runners — see `.github/workflows/build-all-platforms.yml`)

## Regenerating Icons

If you change the source icon:
1. Replace `assets/icon.png` with a new 1024×1024 PNG
2. Run: `powershell -ExecutionPolicy Bypass -File make-ico.ps1` (regenerates icon.ico)
3. Run: `node generate-icons.js` (regenerates icon.icns)

## Custom Title Bar

The window is frameless (`frame: false`). To add custom minimize/maximize/close buttons in your web UI:

```javascript
// In any React component:
if (window.electronAPI) {
  window.electronAPI.minimize(); // minimize window
  window.electronAPI.maximize(); // maximize/restore
  window.electronAPI.close();    // close window
}
```

Use the platform utility:
```typescript
import { isElectron, getWindowControls } from '@/lib/platform';

if (isElectron()) {
  const controls = getWindowControls();
  controls?.close();
}
```
