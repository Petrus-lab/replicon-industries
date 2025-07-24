@echo off
setlocal

:: Set working dir
cd /d "%~dp0"

set BACKUP_DIR=backup-before-cleanup

if not exist "%BACKUP_DIR%\" (
    echo ❌ No backup folder found. Nothing to restore.
    pause
    exit /b
)

echo.
echo 🔁 Restoring files from "%BACKUP_DIR%"...

move /Y "%BACKUP_DIR%\start-full-system.bat" .\ >nul 2>&1
move /Y "%BACKUP_DIR%\index.html.txt" .\ >nul 2>&1
move /Y "%BACKUP_DIR%\.gitignore" .\ >nul 2>&1
move /Y "%BACKUP_DIR%\.env" .\ >nul 2>&1
move /Y "%BACKUP_DIR%\firebase-service-account.json" .\ >nul 2>&1

echo.
echo ✅ Restoration complete.
echo 🔎 Review restored files before restarting system.

pause
endlocal
