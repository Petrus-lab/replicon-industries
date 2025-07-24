@echo off
setlocal

:: Set working dir
cd /d "%~dp0"

:: Create backup folder
set BACKUP_DIR=backup-before-cleanup
mkdir "%BACKUP_DIR%"

echo.
echo 🔄 Moving unused or legacy files to "%BACKUP_DIR%"...

:: Move legacy batch files (platform related)
move /Y start-full-system.bat "%BACKUP_DIR%"\ >nul 2>&1

:: Move accidental text copies
move /Y index.html.txt "%BACKUP_DIR%"\ >nul 2>&1

:: Move stale or duplicated config files
move /Y .gitignore "%BACKUP_DIR%"\ >nul 2>&1
move /Y .env "%BACKUP_DIR%"\ >nul 2>&1

:: Move Firebase key if already cleared
if exist firebase-service-account.json (
  echo ⚠️  Keeping service account key in backup.
  move /Y firebase-service-account.json "%BACKUP_DIR%"\ >nul 2>&1
)

:: Confirm preserved files
echo.
echo ✅ Preserved:
echo - index.js
echo - interface-server.js
echo - src\
echo - ai-interface\
echo - file outputs\
echo - start-runner-and-ui.bat
echo - start-interface-server.bat
echo - package.json and lock
echo - node_modules

echo.
echo 🧹 Cleanup complete.
pause
endlocal
