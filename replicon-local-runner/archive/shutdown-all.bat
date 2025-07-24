@echo off
echo Shutting down backend via HTTP POST...
curl -X POST http://localhost:3001/shutdown

echo Waiting 2 seconds for backend to exit...
timeout /T 2

echo Shutting down lite-server...
powershell -ExecutionPolicy Bypass -File "%~dp0shutdown-lite-server.ps1"

echo All done.
pause