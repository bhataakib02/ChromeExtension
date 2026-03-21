Write-Host "🚀 Booting AERO Microservices + Dashboard..." -ForegroundColor Green
Write-Host "Please wait while all terminal windows launch..." -ForegroundColor Yellow

# Use the script's own directory so relative paths always resolve correctly
$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }

# 1. Auth Service (port 5001)
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\backend-services\auth-service'; npm start`""
Start-Sleep -Seconds 2

# 2. Tracking Service (port 5002)
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\backend-services\tracking-service'; npm start`""
Start-Sleep -Seconds 1

# 3. Realtime Service (port 5003)
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\backend-services\realtime-service'; npm start`""
Start-Sleep -Seconds 1

# 4. API Gateway (port 5010) — start after downstream services are up
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\backend-services\api-gateway'; npm start`""
Start-Sleep -Seconds 1

# 5. Next.js Dashboard (port 3000)
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\dashboard'; npm run dev`""

Write-Host ""
Write-Host "✅ All services launched!" -ForegroundColor Cyan
Write-Host "👉 Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "👉 API Gateway: http://localhost:5010" -ForegroundColor White
Write-Host ""
Write-Host "Service ports:" -ForegroundColor Yellow
Write-Host "  Auth Service:     http://localhost:5001" -ForegroundColor Gray
Write-Host "  Tracking Service: http://localhost:5002" -ForegroundColor Gray
Write-Host "  Realtime Service: http://localhost:5003 (WebSocket)" -ForegroundColor Gray
Write-Host "  API Gateway:      http://localhost:5010" -ForegroundColor Gray
