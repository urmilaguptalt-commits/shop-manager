# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🚀 SHOP MANAGER PRO - LIVE BUILD HELPER 🚀" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Ask user for Backend URL
$backendUrl = Read-Host "Enter your live backend URL (e.g., https://shop-manager-backend.onrender.com)"
if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "❌ Error: Backend URL cannot be empty." -ForegroundColor Red
    Exit
}

# Trim trailing slash if present
$backendUrl = $backendUrl.TrimEnd('/')

Write-Host "`nSetting environment variable VITE_API_URL to: $backendUrl" -ForegroundColor Green
$env:VITE_API_URL = $backendUrl

# Check if node_modules exists in shop-manager/frontend, install if not
$frontendDir = "shop-manager/frontend"
if (-not (Test-Path "$frontendDir/node_modules")) {
    Write-Host "`nInstalling frontend dependencies (npm install)..." -ForegroundColor Yellow
    npm.cmd --prefix $frontendDir install
}

# Run build
Write-Host "`nBuilding frontend for production..." -ForegroundColor Yellow
npm.cmd --prefix $frontendDir run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Exit
}

# Target directory
$targetDir = "Shop_Manager_Live"

# Recreate target directory if it doesn't exist
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
}

# Copy built files
Write-Host "`nUpdating $targetDir directory..." -ForegroundColor Yellow

# Clean files but keep _redirects if it exists
Get-ChildItem -Path $targetDir -Exclude "_redirects" | Remove-Item -Recurse -Force

# Copy dist files
Copy-Item -Path "$frontendDir/dist/*" -Destination $targetDir -Recurse -Force

# Verify _redirects exists, if not write it
$redirectsFile = Join-Path $targetDir "_redirects"
if (-not (Test-Path $redirectsFile)) {
    "/*  /index.html  200" | Out-File -FilePath $redirectsFile -Encoding ascii
}

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "✅ Success! Frontend built & updated in Shop_Manager_Live" -ForegroundColor Green
Write-Host "📂 You can now upload the 'Shop_Manager_Live' folder to Netlify." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
