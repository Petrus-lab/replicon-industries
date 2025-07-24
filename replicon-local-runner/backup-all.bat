@echo off
title 💾 Backing Up Replicon Local Runner
set "BACKUP_DIR=backups"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
set "DATESTAMP=2025-06-23_19-59-15"
set "ZIPFILE=%BACKUP_DIR%\local-runner-backup-%DATESTAMP%.zip"
powershell -Command "Compress-Archive -Path * -DestinationPath '%ZIPFILE%'"
echo ✅ Backup completed: %ZIPFILE%
pause
exit
