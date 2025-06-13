@@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM restart-server.bat — kills whatever’s on port 3000 and launches npm start
REM Usage: double-click this file in Explorer (or run from CMD/Powershell)
REM ─────────────────────────────────────────────────────────────────────────────

REM 1) Change into this script’s folder (your project root)
cd /d "%~dp0"

REM 2) Open a new PowerShell window, free up port 3000, then start your React server
start "React Dev Server" powershell -NoExit -Command ^
  "npx kill-port 3000; npm run start"

