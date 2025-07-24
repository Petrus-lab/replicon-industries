@echo off
title ♻️ Restore Replicon Local Runner Backup
echo Available backups:
dir /b backups\*.zip
set /p ZIPNAME="Enter the name of the backup ZIP to restore: "
powershell -Command "Expand-Archive -Path 'backups\%ZIPNAME%' -DestinationPath . -Force"
echo ✅ Restore complete.
pause
exit
