@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: === CONFIG ===
SET PORT=3001
SET RUNNER_SCRIPT=replicon-local-runner\index.js
SET ENV_FILE=replicon-local-runner\.env

:: === Kill Process on PORT if running ===
echo Checking for any process on port %PORT%...
FOR /F "tokens=5" %%A IN ('netstat -aon ^| findstr :%PORT%') DO (
    echo Port %PORT% in use by PID %%A, killing...
    taskkill /F /PID %%A >nul 2>&1
)

:: === Check if ENV file exists ===
IF NOT EXIST "%ENV_FILE%" (
    echo [ERROR] .env file not found at %ENV_FILE%
    pause
    exit /b 1
)

:: === Check Node.js Installed ===
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Install it from https://nodejs.org
    pause
    exit /b 1
)

:: === Install dependencies if missing ===
echo Installing dependencies...
cd replicon-local-runner
call npm install
cd ..

:: === Start the runner ===
echo Starting local runner on port %PORT%...
start "" cmd /k "node %RUNNER_SCRIPT%"
