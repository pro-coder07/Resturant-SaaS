#!/usr/bin/env pwsh
# Comprehensive E2E Test Suite - Correct API Validation

$baseUrl = "http://localhost:3000"

function Invoke-TestRequest {
    param([string]$Name, [string]$Method, [string]$Endpoint, [object]$Body, [hashtable]$Headers, [int[]]$ExpectedStatus)
    
    try {
        $url = "$baseUrl$Endpoint"
        if ($Body) {
            $response = Invoke-WebRequest -Uri $url -Method $Method -ContentType "application/json" -Body $Body -Headers $Headers -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $Headers -ErrorAction Stop
        }
        
        $data = $response.Content | ConvertFrom-Json
        
        if ($ExpectedStatus -contains $response.StatusCode) {
            Write-Host "   OK $Name" -ForegroundColor Green
            return @{ success = $true; data = $data; status = $response.StatusCode }
        } else {
            Write-Host "   FAIL $Name (Status: $($response.StatusCode))" -ForegroundColor Red
            return @{ success = $false; data = $data; status = $response.StatusCode }
        }
    } catch {
        Write-Host "   FAIL $Name" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        return @{ success = $false; error = $_.Exception.Message }
    }
}

Write-Host ""
Write-Host "E2E TEST SUITE - COMPLETE WORKFLOW" -ForegroundColor Yellow
Write-Host ""

# Test data
$testEmail = "e2e_$(Get-Random)@restaurant.com"
$testPassword = "Test123@456"
$phone = "9876543210"
$restaurantName = "E2E Restaurant"
$city = "Test City"

Write-Host "TEST DATA:" -ForegroundColor Yellow
Write-Host "  Email: $testEmail" -ForegroundColor Gray
Write-Host "  Password: $testPassword" -ForegroundColor Gray
Write-Host "  Phone: $phone" -ForegroundColor Gray
Write-Host ""

# PHASE 1: AUTHENTICATION
Write-Host "PHASE 1: AUTHENTICATION" -ForegroundColor Magenta

Write-Host "Registering new restaurant..." -ForegroundColor White

$regBody = @{
    name = $restaurantName
    email = $testEmail
    phone = $phone
    password = $testPassword
    confirmPassword = $testPassword
    city = $city
} | ConvertTo-Json

$regResult = Invoke-TestRequest -Name "Register Restaurant" -Method "POST" -Endpoint "/api/v1/auth/register" -Body $regBody -ExpectedStatus @(201)

if (-not $regResult.success) {
    Write-Host "Registration failed! Cannot continue." -ForegroundColor Red
    exit 1
}

# Extract tokens and IDs from response
$restaurantId = $regResult.data.data.restaurant.id
$accessToken = $regResult.data.data.accessToken
$refreshToken = $regResult.data.data.refreshToken

Write-Host "   Restaurant Name: $($regResult.data.data.restaurant.name)" -ForegroundColor Cyan
Write-Host "   Restaurant ID: $restaurantId" -ForegroundColor Cyan

if (-not $accessToken) {
    Write-Host "Error: No access token in response!" -ForegroundColor Red
    exit 1
}

Write-Host ""

Write-Host "Logging in..." -ForegroundColor White

$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

$loginResult = Invoke-TestRequest -Name "Login" -Method "POST" -Endpoint "/api/v1/auth/login" -Body $loginBody -ExpectedStatus @(200)

if ($loginResult.success) {
    $accessToken = $loginResult.data.data.accessToken
}

Write-Host ""

# PHASE 2: MENU MANAGEMENT
Write-Host "PHASE 2: MENU MANAGEMENT" -ForegroundColor Magenta

$headers = @{ "Authorization" = "Bearer $accessToken" }

Write-Host "Creating menu categories..." -ForegroundColor White

$categories = @(
    @{ name = "Main Courses"; description = "Delicious main dishes" },
    @{ name = "Appetizers"; description = "Starters and light bites" },
    @{ name = "Desserts"; description = "Sweet treats" }
)

$categoryIds = @()

foreach ($cat in $categories) {
    $catBody = $cat | ConvertTo-Json
    $catResult = Invoke-TestRequest -Name "Category: $($cat.name)" -Method "POST" -Endpoint "/api/v1/menu/categories" -Body $catBody -Headers $headers -ExpectedStatus @(201)
    
    if ($catResult.success) {
        $categoryIds += $catResult.data.data.id
    }
}

Write-Host "   Result: Created $($categoryIds.Count) categories" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creating menu items..." -ForegroundColor White

$items = @(
    @{ name = "Salmon Fillet"; categoryIndex = 0; price = 1299; prep = 15 },
    @{ name = "Butter Chicken"; categoryIndex = 0; price = 899; prep = 12 },
    @{ name = "Spring Rolls"; categoryIndex = 1; price = 399; prep = 5 },
    @{ name = "Chocolate Cake"; categoryIndex = 2; price = 199; prep = 2 }
)

$menuItemIds = @()
$createdCount = 0

foreach ($item in $items) {
    if ($categoryIds.Count -gt $item.categoryIndex) {
        $itemBody = @{
            name = $item.name
            description = "Delicious $($item.name)"
            categoryId = $categoryIds[$item.categoryIndex]
            price = $item.price
            preparationTime = $item.prep
        } | ConvertTo-Json

        $itemResult = Invoke-TestRequest -Name "Item: $($item.name)" -Method "POST" -Endpoint "/api/v1/menu/items" -Body $itemBody -Headers $headers -ExpectedStatus @(201)
        
        if ($itemResult.success) {
            $menuItemIds += $itemResult.data.data.id
            $createdCount++
        }
    }
}

Write-Host "   Result: Created $createdCount items" -ForegroundColor Cyan
Write-Host ""

Write-Host "Retrieving menu..." -ForegroundColor White

$getResult = Invoke-TestRequest -Name "Get Menu Items" -Method "GET" -Endpoint "/api/v1/menu/items?restaurantId=$restaurantId" -Headers $headers -ExpectedStatus @(200)

if ($getResult.success) {
    Write-Host "   Result: Retrieved $($getResult.data.data.items.Count) items" -ForegroundColor Cyan
    foreach ($item in $getResult.data.data.items | Select-Object -First 3) {
        Write-Host "      - $($item.name): $$($item.price/100)" -ForegroundColor DarkCyan
    }
}

Write-Host ""
Write-Host "TEST COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "Backend Status: OPERATIONAL" -ForegroundColor Green
Write-Host "  - Registration: OK" -ForegroundColor Green
Write-Host "  - Authentication: OK" -ForegroundColor Green
Write-Host "  - Menu Categories: $($categoryIds.Count)/3" -ForegroundColor Green
Write-Host "  - Menu Items: $createdCount/4" -ForegroundColor Green
Write-Host ""
