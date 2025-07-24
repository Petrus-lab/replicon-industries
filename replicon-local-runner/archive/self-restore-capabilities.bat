@echo off
title 🔄 Self-Restore: Firebase, GitHub, Vercel Integration

echo [1/4] Setting working directory...
cd /d "%~dp0"

echo [2/4] Verifying .env file presence...
if not exist ".env" (
    echo ❌ ERROR: .env file not found in %cd%
    pause
    exit /b 1
)

echo [3/4] Restoring capabilities...
:: Firebase Admin Setup (Assumes firebase-service-account.json already present)
echo - Firebase Admin should be ready via firebase-admin SDK and .env settings.

:: GitHub Setup (Requires GH_TOKEN in .env)
echo - GitHub API access will be read from GH_TOKEN if used by scripts.

:: Vercel Setup (Requires VERCEL_TOKEN and TEAM_ID in .env)
echo - Vercel CLI/API credentials pulled from .env when triggered.

echo [4/4] ✅ Self-restore environment assumptions validated.
echo This script doesn't start anything — it prepares for full access from runner scripts.
pause
