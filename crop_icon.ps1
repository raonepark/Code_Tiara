Add-Type -AssemblyName System.Drawing
$imagePath = Join-Path (Get-Location) "assets\icon.png"
$outputPath = Join-Path (Get-Location) "assets\icon_cropped.png"

$bmp = [System.Drawing.Bitmap]::FromFile($imagePath)
$width = $bmp.Width
$height = $bmp.Height

# Find bounding box (non-transparent, non-pure-white pixels)
$top = $height
$bottom = 0
$left = $width
$right = 0

for ($y = 0; $y -lt $height; $y += 5) { # Sampling for speed
    for ($x = 0; $x -lt $width; $x += 5) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if not fully transparent and not pure white
        if ($pixel.A -gt 10 -and ($pixel.R -lt 250 -or $pixel.G -lt 250 -or $pixel.B -lt 250)) {
            if ($y -lt $top) { $top = $y }
            if ($y -gt $bottom) { $bottom = $y }
            if ($x -lt $left) { $left = $x }
            if ($x -gt $right) { $right = $x }
        }
    }
}

# If no non-white pixels found (extremely unlikely), use full image
if ($bottom -le $top -or $right -le $left) {
    Write-Host "No non-white pixels found. Using full image."
    $top = 0
    $bottom = $height - 1
    $left = 0
    $right = $width - 1
}

$objWidth = $right - $left
$objHeight = $bottom - $top

# Add some margin (10%)
$margin = [int]($objWidth * 0.1)
$newLeft = [Math]::Max(0, $left - $margin)
$newTop = [Math]::Max(0, $top - $margin)
$newRight = [Math]::Min($width - 1, $right + $margin)
$newBottom = [Math]::Min($height - 1, $bottom + $margin)

$cropWidth = $newRight - $newLeft
$cropHeight = $newBottom - $newTop

# Ensure square
$size = [Math]::Max($cropWidth, $cropHeight)
$croppedBmp = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($croppedBmp)
$graphics.Clear([System.Drawing.Color]::Transparent)

# Draw original onto cropped with centering
$destX = [int](($size - $cropWidth) / 2)
$destY = [int](($size - $cropHeight) / 2)
$graphics.DrawImage($bmp, (New-Object System.Drawing.Rectangle($destX, $destY, $cropWidth, $cropHeight)), (New-Object System.Drawing.Rectangle($newLeft, $newTop, $cropWidth, $cropHeight)), [System.Drawing.GraphicsUnit]::Pixel)

$croppedBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$croppedBmp.Dispose()
$bmp.Dispose()

Write-Host "Cropped image saved to $outputPath"
