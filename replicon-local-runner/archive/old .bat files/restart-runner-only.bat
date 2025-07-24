@echo off
title 🔁 Restarting Replicon Local AI Runner (with tab cleanup)

echo [1/6] 🛑 Terminating all runner tabs and background services...

:: Close tabs by window title
taskkill /F /FI "WINDOWTITLE eq AI Backend - node interface-server.js" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Interface UI - lite-server" >nul 2>&1

:: Ensure backend on port 3001 is killed
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

:: Ensure UI on port 5500 is killed
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5500" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [2/6] ✅ All stale runner instances shut down.

echo [3/6] 🚀 Starting AI backend on port 3001...
start "AI Backend - node interface-server.js" cmd /k "cd /d %cd% && node interface-server.js"

timeout /t 1 >nul

echo [4/6] 🖥️ Launching Interface UI on port 5500 using bs-config.js...
start "Interface UI - lite-server" cmd /k "cd /d %cd% && npx lite-server"

echo [5/6] ✅ All runner systems relaunched.

echo [6/6] 🌐 You may now access the Replicon Interface at:
echo http://localhost:5500
pause
