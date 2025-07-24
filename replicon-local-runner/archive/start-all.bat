@echo off
title 🚀 Starting Replicon Local AI Runner
echo [1/3] Starting AI backend on port 3001...
start "AI Backend" cmd /c "node interface-server.js"

echo [2/3] Launching Interface UI on port 5500...
start "Interface UI" cmd /c "npx lite-server"

echo [3/3] ✅ All systems launching...
echo You may now open http://localhost:5500 in your browser.
exit
