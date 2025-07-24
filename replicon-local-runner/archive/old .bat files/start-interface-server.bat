@echo off
echo 🌐 Starting interface server at http://localhost:5500

:: Start the Node.js backend server in its own terminal
start cmd /k "cd /d %~dp0 && node interface-server.js"

:: Open the interface in the default browser
start http://localhost:5500
