@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: === CONFIG ===
SET RUNNER_PATH=replicon-local-runner
SET RUNNER_SCRIPT=index.js
SET PORT=3001

echo [🛑] Checking for processes on port %PORT%...
FOR /F "tokens=5" %%A IN ('netstat -aon ^| findstr :%PORT%') DO (
    echo Killing PID %%A...
    taskkill /F /PID %%A >nul 2>&1
)

echo [♻️ ] Restarting Replicon Local AI Runner...
cd /d %~dp0%RUNNER_PATH%
start "" cmd /k "node %RUNNER_SCRIPT%"
