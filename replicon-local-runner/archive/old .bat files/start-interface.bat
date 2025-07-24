@echo off
title 🧠 Starting Replicon AI UI (Port 5500)
echo.
echo [1/1] Launching Interface UI on port 5500...
start "Interface UI" cmd /k "npm run start-ui"
echo.
echo ✅ Interface UI launched at http://localhost:5500
pause
