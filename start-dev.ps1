# Start OCDS Mapping Explorer dev server (http://127.0.0.1:5173)
# Run from repo root:  .\start-dev.ps1

$ErrorActionPreference = "Stop"
$Port = 5173
$Root = $PSScriptRoot

Set-Location $Root

Write-Host ""
Write-Host "OCDS Mapping Explorer — dev server" -ForegroundColor Cyan
Write-Host "  Local:   http://127.0.0.1:$Port/" -ForegroundColor Green
Write-Host ""

$inUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
    Write-Host "Warning: port $Port is already in use (PID $($inUse.OwningProcess -join ', '))." -ForegroundColor Yellow
    Write-Host ""
}

if (-not (Test-Path "$Root\node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Starting npm run dev ..." -ForegroundColor Cyan
npm run dev
exit $LASTEXITCODE
