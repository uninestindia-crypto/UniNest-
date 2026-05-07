@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  UniNest Desktop — Development Launcher
REM  Launches Electron pointing at your local Next.js dev server.
REM
REM  Prerequisites:
REM    1. Open Terminal 1: cd apps\web && pnpm dev
REM    2. Wait for "ready" message (port 9002)
REM    3. Double-click THIS file (or run from Terminal 2)
REM ═══════════════════════════════════════════════════════════════════════════

SET "NODE_EXE=D:\Zeaul\UniNest-\.node\node-v22.14.0-win-x64\node.exe"
SET "ELECTRON_EXE=D:\Zeaul\UniNest-\apps\desktop\node_modules\electron\dist\electron.exe"
SET "UNINEST_URL=http://localhost:9002"

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   UniNest Desktop — Dev Mode             ║
echo  ║   Loading: %UNINEST_URL%    ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  Make sure "pnpm dev" is running in apps\web (port 9002)
echo.

IF NOT EXIST "%ELECTRON_EXE%" (
  echo  ERROR: Electron not found at:
  echo  %ELECTRON_EXE%
  echo.
  echo  Run this first: cd apps\desktop ^&^& npm install
  pause
  exit /b 1
)

SET UNINEST_URL=%UNINEST_URL%
"%ELECTRON_EXE%" "D:\Zeaul\UniNest-\apps\desktop"
