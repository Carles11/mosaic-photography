# Set local and S3 base paths
$localBase = "C:\Users\elcar\Documents\WEBs\Mosaic\IMGs"
$s3Base = "s3://mosaic.photography/mosaic-collections/public-domain-collection"

# Get all photographer folders (directories only)
$photographers = Get-ChildItem $localBase -Directory

foreach ($photographer in $photographers) {
    $webpFolder = Join-Path $photographer.FullName "originalsWEBP"
    if (Test-Path $webpFolder) {
        $s3Dest = "$s3Base/$($photographer.Name)/originals/"
        Write-Host "Syncing $webpFolder -> $s3Dest"
        aws s3 sync "$webpFolder" "$s3Dest" --exclude "*" --include "*.webp" --content-type "image/webp" --cache-control "max-age=31536000" --delete
    } else {
        Write-Host "No originalsWEBP folder in $($photographer.Name), skipping."
    }
}