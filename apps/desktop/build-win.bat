@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  UniNest Desktop — Windows Production Build
REM  Outputs:
REM    dist\UniNest Setup 1.0.0.exe   (NSIS installer with shortcuts)
REM    dist\UniNest 1.0.0.exe         (Portable, no install needed)
REM ═══════════════════════════════════════════════════════════════════════════

SET "NODE_DIR=D:\Zeaul\UniNest-\.node\node-v22.14.0-win-x64"
SET "NODE_EXE=%NODE_DIR%\node.exe"
SET "NPM_CLI=%NODE_DIR%\node_modules\npm\bin\npm-cli.js"

REM Required: add node to PATH so electron-builder sub-processes find it
SET "PATH=%NODE_DIR%;%PATH%"

REM Skip code signing (no certificate = no signing)
SET "CSC_IDENTITY_AUTO_DISCOVERY=false"
SET "WIN_CSC_LINK="

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   UniNest Desktop — Building Windows     ║
echo  ║   Output: apps\desktop\dist\             ║
echo  ╚══════════════════════════════════════════╝
echo.

IF NOT EXIST "%NODE_EXE%" (
  echo ERROR: Node.js not found at %NODE_EXE%
  pause & exit /b 1
)

cd /d "D:\Zeaul\UniNest-\apps\desktop"

"%NODE_EXE%" "%NPM_CLI%" run build:win

IF %ERRORLEVEL% EQU 0 (
  echo.
  echo  ✅ SUCCESS! Built files:
  dir /b "dist\*.exe" 2>nul
  echo.
  echo  Opening dist folder...
  explorer "D:\Zeaul\UniNest-\apps\desktop\dist"
) ELSE (
  echo.
  echo  ❌ Build FAILED — check errors above.
)

pause
