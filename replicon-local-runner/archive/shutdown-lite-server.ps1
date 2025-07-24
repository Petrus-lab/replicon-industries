# shutdown-lite-server.ps1
# Kills only lite-server for this project
Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and $_.CommandLine -like "*lite-server*ai-interface*"
} | ForEach-Object {
    Write-Host "Killing UI (lite-server) PID $($_.ProcessId): $($_.CommandLine)"
    Stop-Process -Id $_.ProcessId -Force
}
Write-Host "lite-server shutdown complete."