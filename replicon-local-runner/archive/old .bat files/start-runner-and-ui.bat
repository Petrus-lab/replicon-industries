@echo off
title 🚀 Starting Replicon Local AI Runner - One Click Bootstrap

echo [1/3] ✅ Starting AI backend on port 3001...
start "AI Backend" cmd /k "node interface-server.js"

echo [2/3] ✅ Launching Interface UI on port 5500 using bs-config.js...
start "Interface UI" cmd /k "npx lite-server"

echo [3/3] ✅ All systems launching...
echo.
echo You may now open http://localhost:5500 in your browser.
pause
y