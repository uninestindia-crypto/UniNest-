/**
 * UniNest Desktop — Electron Preload Script
 * Exposes only a narrow, safe API to the renderer (web page).
 * contextIsolation: true ensures this is sandboxed from the page's JS scope.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window control — call these from your web UI for custom title bar buttons
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),

  // Expose platform so the web UI can conditionally show/hide native UI
  platform: process.platform, // 'win32' | 'darwin' | 'linux'

  // Expose whether we're running inside Electron
  isElectron: true,
});
