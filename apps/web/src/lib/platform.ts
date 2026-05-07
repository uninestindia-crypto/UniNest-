/**
 * Platform detection utilities for UniNest
 * Use these to conditionally render native-specific UI (e.g., custom title bar).
 */

/**
 * Returns true when running inside the UniNest Electron desktop app.
 * Safe to call on server (returns false) and client.
 */
export function isElectron(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { electronAPI?: { isElectron: boolean } }).electronAPI?.isElectron;
}

/**
 * Returns true when running inside a Capacitor native app (Android or iOS).
 */
export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
}

/**
 * Returns true when running inside ANY native wrapper (Electron or Capacitor).
 */
export function isNativeApp(): boolean {
  return isElectron() || isCapacitor();
}

/**
 * Returns the current platform string.
 * - 'electron-win'  → Windows desktop
 * - 'electron-mac'  → macOS desktop
 * - 'electron-linux'→ Linux desktop
 * - 'capacitor-android' → Android app
 * - 'capacitor-ios'     → iOS app
 * - 'web'               → Browser
 */
export function getPlatform(): string {
  if (isElectron()) {
    const platform = (window as unknown as { electronAPI: { platform: string } }).electronAPI.platform;
    if (platform === 'win32') return 'electron-win';
    if (platform === 'darwin') return 'electron-mac';
    return 'electron-linux';
  }
  if (isCapacitor()) {
    const cap = (window as unknown as { Capacitor: { getPlatform: () => string } }).Capacitor;
    const p = cap.getPlatform();
    return `capacitor-${p}`;
  }
  return 'web';
}

/**
 * Returns the Electron window control API if available.
 * Use to wire up custom title bar minimize/maximize/close buttons.
 */
export function getWindowControls() {
  if (!isElectron()) return null;
  return (window as unknown as { electronAPI: { minimize: () => void; maximize: () => void; close: () => void } }).electronAPI;
}
