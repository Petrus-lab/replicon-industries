@echo off
title Restarting Replicon AI Runner

call shutdown-all.bat
timeout /t 2 /nobreak >nul
call start-all.bat
