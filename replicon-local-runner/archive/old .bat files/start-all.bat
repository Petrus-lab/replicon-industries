@echo off
echo 🔄 Launching Replicon Interface & Runner...

:: Step 1 - Start the backend runner (port 3001)
start cmd /k "cd /d %~dp0 && node index.js"

:: Step 2 - Start the UI server (port 5500)
start cmd /k "cd /d %~dp0 && npx lite-server"

:: Step 3 - Open interface in default browser
timeout /t 3 >nul
start http://localhost:5500

echo ✅ Interface and runner launched.
exit
