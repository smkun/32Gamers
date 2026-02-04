# 32Gamers Club - Image Compression Helper
# Run: powershell -ExecutionPolicy Bypass -File scripts/compress-images.ps1

$assetsPath = Join-Path $PSScriptRoot "..\assets\images"
$threshold = 300KB

Write-Host "`n=== 32Gamers Image Compression Report ===" -ForegroundColor Cyan
Write-Host "Target: All images should be under 300KB`n"

# Get all images sorted by size
$images = Get-ChildItem $assetsPath -Include *.png,*.jpg,*.jpeg,*.webp -Recurse |
    Sort-Object Length -Descending

$needsCompression = @()
$totalSavings = 0

foreach ($img in $images) {
    $sizeMB = [math]::Round($img.Length / 1MB, 2)
    $sizeKB = [math]::Round($img.Length / 1KB, 0)

    if ($img.Length -gt $threshold) {
        $needsCompression += $img
        $potentialSavings = $img.Length - $threshold
        $totalSavings += $potentialSavings

        Write-Host "  [!] $($img.Name)" -ForegroundColor Red -NoNewline
        Write-Host " - $sizeMB MB" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] $($img.Name)" -ForegroundColor Green -NoNewline
        Write-Host " - $sizeKB KB"
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total images: $($images.Count)"
Write-Host "Need compression: $($needsCompression.Count)" -ForegroundColor $(if ($needsCompression.Count -gt 0) { "Red" } else { "Green" })
Write-Host "Potential savings: $([math]::Round($totalSavings / 1MB, 1)) MB`n"

if ($needsCompression.Count -gt 0) {
    Write-Host "=== Compression Options ===" -ForegroundColor Yellow
    Write-Host @"

OPTION 1: TinyPNG (Recommended - Best Quality)
  1. Go to https://tinypng.com/
  2. Drag and drop these files:
"@
    foreach ($img in $needsCompression) {
        Write-Host "     - $($img.Name)" -ForegroundColor White
    }
    Write-Host @"
  3. Download compressed versions
  4. Replace files in assets/images/

OPTION 2: Squoosh (Free, No Upload Limit)
  1. Go to https://squoosh.app/
  2. Process each image individually
  3. Use "OxiPNG" or "MozJPEG" compression
  4. Target: Quality 80-85%, resize if >1000px

OPTION 3: Python Script (Local, Requires Pillow)
  pip install Pillow
  python -c "
from PIL import Image
import os
for f in ['sotsw.png', 'agenthub.png', 'theGildedPixel.png', 'theRoguesGallery.png']:
    path = f'assets/images/{f}'
    if os.path.exists(path):
        img = Image.open(path)
        img = img.convert('RGB')  # Remove alpha if present
        img.thumbnail((800, 800), Image.LANCZOS)  # Resize to max 800px
        img.save(path.replace('.png', '.jpg'), 'JPEG', quality=85, optimize=True)
        print(f'Compressed: {f}')
"

OPTION 4: ImageMagick (If Installed)
  magick convert assets/images/sotsw.png -resize 800x800 -quality 85 assets/images/sotsw.jpg
"@

    Write-Host "`nAfter compression, run this script again to verify." -ForegroundColor Cyan
}
