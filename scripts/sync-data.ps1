# PowerShell Script to Sync Local Data to Production
# Run this script to copy all data from local development to production server

param(
    [string]$LocalUrl = "http://localhost:3000",
    [string]$ProductionUrl = "https://www.allprosportsnc.com"
)

Write-Host "🚀 Starting Local to Production Data Sync" -ForegroundColor Green
Write-Host "📍 Local Server: $LocalUrl" -ForegroundColor Cyan
Write-Host "📍 Production Server: $ProductionUrl" -ForegroundColor Cyan
Write-Host ""

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Check if local server is running
Write-Host "🔍 Checking local server..." -ForegroundColor Yellow
$localCheck = Invoke-ApiRequest -Url "$LocalUrl/api/products"
if (-not $localCheck.Success -and $localCheck.Error -notlike "*500*") {
    Write-Host "❌ Cannot connect to local server. Please start your development server:" -ForegroundColor Red
    Write-Host "   npm run dev" -ForegroundColor White
    exit 1
}
Write-Host "✅ Local server is accessible" -ForegroundColor Green

# Check if production server is accessible
Write-Host "🔍 Checking production server..." -ForegroundColor Yellow
$prodCheck = Invoke-ApiRequest -Url "$ProductionUrl/api/firebase-test"
if (-not $prodCheck.Success -and $prodCheck.Error -notlike "*500*") {
    Write-Host "❌ Cannot connect to production server" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Production server is accessible" -ForegroundColor Green
Write-Host ""

# Sync Products
Write-Host "🔄 Syncing Products..." -ForegroundColor Blue
$localProducts = Invoke-ApiRequest -Url "$LocalUrl/api/products"

if ($localProducts.Success -and $localProducts.Data.products -and $localProducts.Data.products.Count -gt 0) {
    Write-Host "📥 Found $($localProducts.Data.products.Count) local products" -ForegroundColor Cyan
    
    $successCount = 0
    foreach ($product in $localProducts.Data.products) {
        $result = Invoke-ApiRequest -Url "$ProductionUrl/api/products" -Method "POST" -Body $product
        if ($result.Success) {
            $successCount++
            Write-Host "  ✅ Synced: $($product.title)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed: $($product.title) - $($result.Error)" -ForegroundColor Red
        }
    }
    Write-Host "📊 Products: $successCount/$($localProducts.Data.products.Count) synced" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No local products found, using populate endpoint..." -ForegroundColor Yellow
    $populateResult = Invoke-ApiRequest -Url "$ProductionUrl/api/populate-products" -Method "POST"
    if ($populateResult.Success) {
        Write-Host "✅ Successfully populated products using sample data" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to populate products: $($populateResult.Error)" -ForegroundColor Red
    }
}

Write-Host ""

# Sync Coupons
Write-Host "🔄 Syncing Coupons..." -ForegroundColor Blue
$localCoupons = Invoke-ApiRequest -Url "$LocalUrl/api/coupons"

if ($localCoupons.Success -and $localCoupons.Data.coupons -and $localCoupons.Data.coupons.Count -gt 0) {
    Write-Host "📥 Found $($localCoupons.Data.coupons.Count) local coupons" -ForegroundColor Cyan
    
    $successCount = 0
    foreach ($coupon in $localCoupons.Data.coupons) {
        $result = Invoke-ApiRequest -Url "$ProductionUrl/api/coupons" -Method "POST" -Body $coupon
        if ($result.Success) {
            $successCount++
            Write-Host "  ✅ Synced: $($coupon.code)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed: $($coupon.code) - $($result.Error)" -ForegroundColor Red
        }
    }
    Write-Host "📊 Coupons: $successCount/$($localCoupons.Data.coupons.Count) synced" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No local coupons found" -ForegroundColor Yellow
}

Write-Host ""

# Sync User Profiles
Write-Host "🔄 Syncing User Profiles..." -ForegroundColor Blue
$localProfiles = Invoke-ApiRequest -Url "$LocalUrl/api/user-profiles"

if ($localProfiles.Success -and $localProfiles.Data.profiles -and $localProfiles.Data.profiles.Count -gt 0) {
    Write-Host "📥 Found $($localProfiles.Data.profiles.Count) local user profiles" -ForegroundColor Cyan
    
    $successCount = 0
    foreach ($profile in $localProfiles.Data.profiles) {
        $result = Invoke-ApiRequest -Url "$ProductionUrl/api/user-profiles" -Method "POST" -Body $profile
        if ($result.Success) {
            $successCount++
            Write-Host "  ✅ Synced: $($profile.firstName) $($profile.lastName)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed: $($profile.firstName) $($profile.lastName) - $($result.Error)" -ForegroundColor Red
        }
    }
    Write-Host "📊 User Profiles: $successCount/$($localProfiles.Data.profiles.Count) synced" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No local user profiles found" -ForegroundColor Yellow
}

Write-Host ""

# Final verification
Write-Host "🔍 Verifying sync..." -ForegroundColor Yellow
$prodProducts = Invoke-ApiRequest -Url "$ProductionUrl/api/products"
if ($prodProducts.Success -and $prodProducts.Data.products) {
    Write-Host "✅ Production now has $($prodProducts.Data.products.Count) products" -ForegroundColor Green
} else {
    Write-Host "❌ Production products verification failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Data sync completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Verify your sync by checking:" -ForegroundColor Cyan
Write-Host "   • Products API: $ProductionUrl/api/products" -ForegroundColor White
Write-Host "   • Pricing Page: $ProductionUrl/pricing" -ForegroundColor White
Write-Host "   • Database Status: $ProductionUrl/api/database-status" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
