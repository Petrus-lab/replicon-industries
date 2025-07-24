# restart-lite-server.ps1
# Kills and restarts lite-server for this project
$runnerPath = "C:\replicon-industries\replicon-local-runner"
Write-Host "Killing existing lite-server processes..."
Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and $_.CommandLine -like "*lite-server*ai-interface*"
} | ForEach-Object {
    Write-Host "Killing PID $($_.ProcessId): $($_.CommandLine)"
    Stop-Process -Id $_.ProcessId -Force
}
Start-Sleep -Seconds 2
Write-Host "Restarting lite-server..."
Start-Process "cmd.exe" -ArgumentList "/c cd `"$runnerPath`" && npx lite-server --config bs-config.js"
Write-Host "lite-server restarted."