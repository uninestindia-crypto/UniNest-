# UniNest Mobile (Capacitor)

Native Android & iOS wrapper for the UniNest web app using Capacitor.

## What It Does

Wraps `https://uninest-india.vercel.app` in a native WebView. All API calls work unchanged — they resolve relative to the live URL.

## Directory Structure

```
apps/mobile/
├── capacitor.config.json       ← Capacitor config (server URL, plugins)
├── package.json                ← Capacitor dependencies
├── android/                    ← Android Studio project (auto-generated)
│   ├── app/
│   │   └── src/main/assets/   ← Capacitor config injected here on sync
│   └── gradlew.bat            ← Gradle wrapper for Windows builds
└── ios/                        ← Xcode project (Mac only, in .gitignore)
```

## Android (Build on Windows ✅)

### Setup (one-time)
Install [Android Studio](https://developer.android.com/studio) and set up an Android SDK.

### Development
```powershell
# 1. Sync web assets (run after any config changes)
$node = "D:\Zeaul\UniNest-\.node\node-v22.14.0-win-x64\node.exe"
& $node node_modules\@capacitor\cli\bin\capacitor sync android

# 2. Open in Android Studio
& $node node_modules\@capacitor\cli\bin\capacitor open android
# → In Android Studio: Run → Run 'app'
```

### Build APK (Debug)
From Android Studio: **Build → Build APK(s)**
Or via command line:
```powershell
cd android
.\gradlew.bat assembleDebug
# Output: android\app\build\outputs\apk\debug\app-debug.apk
```

### Build AAB (Release — for Play Store)
```powershell
cd android
.\gradlew.bat bundleRelease
# Output: android\app\build\outputs\bundle\release\app-release.aab
```

> ⚠️ Release builds require a keystore for signing. See:  
> https://developer.android.com/studio/publish/app-signing

## iOS (Mac Only ⚠️)

All iOS steps REQUIRE a Mac with Xcode 15+.

```bash
# On Mac:
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
# → In Xcode: Select team → Product → Run (⌘R)
```

For distribution:
- **TestFlight**: Product → Archive → Distribute App → App Store Connect
- **Ad Hoc**: Product → Archive → Distribute App → Ad Hoc

## Updating the App

When the web app is deployed to production, the native apps automatically load the latest version (no app store update needed) since they load via `server.url`.

To trigger an update sync after changing `capacitor.config.json` or adding plugins:
```powershell
$node = "D:\Zeaul\UniNest-\.node\node-v22.14.0-win-x64\node.exe"
& $node node_modules\@capacitor\cli\bin\capacitor sync android
```

## Installed Capacitor Plugins

| Plugin | Purpose |
|--------|---------|
| `@capacitor/splash-screen` | Dark splash screen on launch |
| `@capacitor/status-bar` | Dark status bar styling |
| `@capacitor/keyboard` | Keyboard resize handling |
| `@capacitor/push-notifications` | FCM push notifications |
| `@capacitor/app` | App lifecycle events |
| `@capacitor/haptics` | Haptic feedback |
| `@capacitor/browser` | In-app browser for external links |

## Detecting Capacitor in Web Code

```typescript
import { isCapacitor, getPlatform } from '@/lib/platform';

if (isCapacitor()) {
  const platform = getPlatform(); // 'capacitor-android' or 'capacitor-ios'
  console.log('Running on:', platform);
}
```
