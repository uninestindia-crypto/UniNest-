/**
 * UniNest Desktop — Electron Main Process
 * Loads the production Next.js app in a native borderless window.
 */

const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');

// ─── Production URL ───────────────────────────────────────────────────────────
// Loads the deployed Vercel app. Override via UNINEST_URL env var for local dev.
// To run in dev mode: set UNINEST_URL=http://localhost:9002 before launching.
const APP_URL = process.env.UNINEST_URL || 'https://uninest-india.vercel.app';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,                 // Borderless — custom title bar via web UI
    titleBarStyle: 'hiddenInset', // macOS: traffic lights inset (looks native)
    backgroundColor: '#0a0a0a',  // Prevent white flash on startup
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,                  // Don't show until ready-to-show fires
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,     // Security: keep Node.js out of renderer
      contextIsolation: true,     // Security: isolate preload from page context
      sandbox: true,
      allowRunningInsecureContent: false,
    },
  });

  // Remove menu bar for a clean native feel
  Menu.setApplicationMenu(null);

  // Show window only when fully rendered (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the UniNest app
  mainWindow.loadURL(APP_URL);

  // IPC: Window controls (minimize / maximize / close)
  ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (!mainWindow) return;
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow && mainWindow.close());

  // Open external links in the system browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isInternal = url.startsWith(APP_URL) || url.startsWith('http://localhost');
    if (!isInternal) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    ipcMain.removeAllListeners('window-minimize');
    ipcMain.removeAllListeners('window-maximize');
    ipcMain.removeAllListeners('window-close');
  });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS apps stay active until Cmd+Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // macOS: re-create window when dock icon is clicked with no windows open
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Security: block navigation to unexpected external domains
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    const isInternal = url.startsWith(APP_URL) || url.startsWith('http://localhost');
    if (!isInternal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});
