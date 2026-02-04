# 32Gamers Club - Deployment Script
# Creates a clean dist/ folder with only production files
# Run from project root: powershell -ExecutionPolicy Bypass -File tools/deploy.ps1

$ErrorActionPreference = "Stop"

# Get project root (script is in tools/ subfolder)
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$projectRoot = Split-Path -Parent $scriptDir

# Fallback: if still empty, use current directory
if (-not $projectRoot -or $projectRoot -eq "") {
    $projectRoot = Get-Location
}

Write-Host "=== 32Gamers Club - Preparing deployment ===" -ForegroundColor Cyan
Write-Host "    Project root: $projectRoot" -ForegroundColor Gray

# Verify we're in the right place
if (-not (Test-Path (Join-Path $projectRoot "index.html"))) {
    Write-Host "ERROR: index.html not found. Run this script from the project root." -ForegroundColor Red
    Write-Host "    Example: powershell -ExecutionPolicy Bypass -File tools/deploy.ps1" -ForegroundColor Yellow
    exit 1
}

# Clean and create dist folder
$distPath = Join-Path $projectRoot "dist"
if (Test-Path $distPath) {
    Remove-Item -Recurse -Force $distPath
    Write-Host "    Cleaned existing dist/" -ForegroundColor Yellow
}
New-Item -ItemType Directory -Path $distPath | Out-Null

# Copy production files
Write-Host "`nCopying production files..." -ForegroundColor Cyan

# Root HTML/CSS files
Copy-Item (Join-Path $projectRoot "index.html") $distPath
Copy-Item (Join-Path $projectRoot "firebase-admin.html") $distPath
Copy-Item (Join-Path $projectRoot "style.css") $distPath
Copy-Item (Join-Path $projectRoot "robots.txt") $distPath
Copy-Item (Join-Path $projectRoot "sitemap.xml") $distPath
Write-Host "    [OK] HTML, CSS, SEO files" -ForegroundColor Green

# Scripts folder (production JS only)
$distScripts = Join-Path $distPath "scripts"
New-Item -ItemType Directory -Path $distScripts | Out-Null
Copy-Item (Join-Path $projectRoot "scripts\firebase-config.js") $distScripts
Copy-Item (Join-Path $projectRoot "scripts\app.js") $distScripts
Copy-Item (Join-Path $projectRoot "scripts\admin.js") $distScripts
Write-Host "    [OK] JavaScript files" -ForegroundColor Green

# Assets folder (images and favicons)
Copy-Item -Recurse (Join-Path $projectRoot "assets") (Join-Path $distPath "assets")
Write-Host "    [OK] Assets (images, favicons)" -ForegroundColor Green

# Calculate size
$totalSize = (Get-ChildItem -Recurse $distPath | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "`n=== Deployment package ready! ===" -ForegroundColor Green
Write-Host "    Location: dist/" -ForegroundColor White
Write-Host "    Size: $sizeMB MB" -ForegroundColor White
Write-Host "`nTo deploy: Upload contents of dist/ folder to ifastnet" -ForegroundColor Cyan
