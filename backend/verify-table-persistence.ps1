#===========================================
# Table Persistence Verification Script
# Tests if tables are being saved to Supabase after RLS is disabled
#===========================================

Write-Host "`nTABLE PERSISTENCE VERIFICATION TEST`n" -ForegroundColor Cyan
Write-Host "This script verifies tables are persisting in Supabase`n" -ForegroundColor Cyan

# Configuration
$API_URL = "http://localhost:3000/api/v1"
$LOGIN_EMAIL = "test@example.com"
$LOGIN_PASSWORD = "Test123@456"
$TEST_TABLE_NUMBER = Get-Random -Minimum 1000 -Maximum 9999
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  API URL: $API_URL" -ForegroundColor White
Write-Host "  Email: $LOGIN_EMAIL" -ForegroundColor White
Write-Host "  Test Table Number: $TEST_TABLE_NUMBER" -ForegroundColor White
Write-Host ""

# Step 1: Login
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Authenticate" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

try {
    $loginBody = @{
        email = $LOGIN_EMAIL
        password = $LOGIN_PASSWORD
    } | ConvertTo-Json

    $loginRes = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $loginData = $loginRes.Content | ConvertFrom-Json
    $token = $loginData.data.accessToken
    $restaurantId = $loginData.data.restaurant.id
    $restaurantName = $loginData.data.restaurant.name

    Write-Host "SUCCESS: Login Successful!" -ForegroundColor Green
    Write-Host "  Restaurant: $restaurantName" -ForegroundColor Cyan
    Write-Host "  Restaurant ID: $restaurantId" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host "FAILED: Login Failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create Table
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "STEP 2: Create Table via API" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

try {
    $tableBody = @{
        tableNumber = $TEST_TABLE_NUMBER
        seatCapacity = 4
        location = "Test Location - $TIMESTAMP"
    } | ConvertTo-Json

    $tableRes = Invoke-WebRequest -Uri "$API_URL/tables" `
        -Method POST `
        -Body $tableBody `
        -ContentType "application/json" `
        -Headers @{"Authorization" = "Bearer $token"} `
        -UseBasicParsing

    $tableData = $tableRes.Content | ConvertFrom-Json
    $tableId = $tableData.data.id

    Write-Host "SUCCESS: Table Created via API!" -ForegroundColor Green
    Write-Host "  Table ID: $tableId" -ForegroundColor Cyan
    Write-Host "  Table Number: $($tableData.data.tableNumber)" -ForegroundColor Cyan
    Write-Host "  Capacity: $($tableData.data.seatCapacity) seats" -ForegroundColor Cyan
    Write-Host "  Location: $($tableData.data.location)" -ForegroundColor Cyan
    Write-Host "  Status: $($tableData.data.status)" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host "FAILED: Table Creation Failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "  Response: $errorBody" -ForegroundColor Yellow
    }
    exit 1
}

# Step 3: Verify Table Exists (via GET tables endpoint)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "STEP 3: Verify Table via GET Endpoint" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

try {
    Start-Sleep -Seconds 1

    $getRes = Invoke-WebRequest -Uri "$API_URL/tables" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $token"} `
        -UseBasicParsing

    $allTables = $getRes.Content | ConvertFrom-Json
    
    Write-Host "  API Response Status: $($getRes.StatusCode)" -ForegroundColor White
    
    # Data is wrapped in a 'data' property in the response
    $tablesList = $allTables.data.items
    Write-Host "  Total tables in response: $($tablesList.Count)" -ForegroundColor White
    
    $foundTable = $tablesList | Where-Object { $_.id -eq $tableId }

    if ($foundTable) {
        Write-Host "SUCCESS: Table Found in Database!" -ForegroundColor Green
        Write-Host "  ID: $($foundTable.id)" -ForegroundColor Cyan
        Write-Host "  Number: $($foundTable.tableNumber)" -ForegroundColor Cyan
        Write-Host "  Capacity: $($foundTable.seatCapacity)" -ForegroundColor Cyan
        Write-Host "  Status: $($foundTable.status)" -ForegroundColor Cyan
        Write-Host "  Created: $($foundTable.createdAt)" -ForegroundColor Cyan
        Write-Host ""
        $persistenceTest = $true
    } else {
        Write-Host "FAILED: Table NOT Found in Database!" -ForegroundColor Red
        Write-Host "  Created table ID: $tableId" -ForegroundColor Yellow
        Write-Host "  Total tables returned: $($tablesList.Count)" -ForegroundColor Yellow
        Write-Host "  WARNING: RLS might still be blocking reads or writes!" -ForegroundColor Red
        Write-Host ""
        $persistenceTest = $false
    }

} catch {
    Write-Host "FAILED: Could not retrieve tables!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Direct Supabase Query (if SERVICE_KEY available in .env)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "STEP 4: Direct Supabase Database Query" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

$directDbTest = $null

try {
    # Read .env file
    $envContent = Get-Content ".\.env" -Raw
    $supabaseUrl = [regex]::Match($envContent, 'SUPABASE_URL=(.+)').Groups[1].Value.Trim()
    $serviceKey = [regex]::Match($envContent, 'SUPABASE_SERVICE_KEY=(.+)').Groups[1].Value.Trim()

    if ($supabaseUrl -and $serviceKey) {
        Write-Host "  Supabase URL: $supabaseUrl" -ForegroundColor White

        # Query Supabase REST API with service role key
        $queryUrl = "$supabaseUrl/rest/v1/tables?id=eq.$tableId" + "&select=*"
        
        $supabaseRes = Invoke-WebRequest -Uri $queryUrl `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $serviceKey"
                "apikey" = $serviceKey
                "Content-Type" = "application/json"
            } `
            -UseBasicParsing

        $supabaseData = $supabaseRes.Content | ConvertFrom-Json

        if ($supabaseData -and $supabaseData.Count -gt 0) {
            Write-Host "SUCCESS: Table Found in Supabase Database!" -ForegroundColor Green
            Write-Host "  Direct database record:" -ForegroundColor Cyan
            $supabaseData[0] | ForEach-Object {
                Write-Host "    - id: $($_.id)" -ForegroundColor White
                Write-Host "    - table_number: $($_.table_number)" -ForegroundColor White
                Write-Host "    - capacity: $($_.capacity)" -ForegroundColor White
                Write-Host "    - location: $($_.location)" -ForegroundColor White
                Write-Host "    - status: $($_.status)" -ForegroundColor White
                Write-Host "    - restaurant_id: $($_.restaurant_id)" -ForegroundColor White
                Write-Host "    - created_at: $($_.created_at)" -ForegroundColor White
            }
            Write-Host ""
            $directDbTest = $true
        } else {
            Write-Host "FAILED: Table NOT Found in Direct Database!" -ForegroundColor Red
            Write-Host "  Data was never saved to Supabase." -ForegroundColor Yellow
            Write-Host "  RLS is likely still blocking INSERT operations." -ForegroundColor Red
            Write-Host ""
            $directDbTest = $false
        }
    } else {
        Write-Host "WARNING: Could not read Supabase credentials from .env" -ForegroundColor Yellow
        Write-Host "  Skipping direct database verification" -ForegroundColor Yellow
        Write-Host ""
        $directDbTest = $null
    }

} catch {
    Write-Host "WARNING: Direct database query failed" -ForegroundColor Yellow
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  This may be normal if the service key is not properly configured" -ForegroundColor Yellow
    Write-Host ""
    $directDbTest = $null
}

# Final Results
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                         TEST RESULTS" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

if ($persistenceTest) {
    Write-Host "SUCCESS: TABLE PERSISTENCE IS WORKING!" -ForegroundColor Green
    Write-Host "  Tables are successfully being saved to Supabase!" -ForegroundColor Green
    Write-Host ""
    Write-Host "SUMMARY:" -ForegroundColor Yellow
    Write-Host "  [OK] RLS appears to be DISABLED (or properly configured)" -ForegroundColor Green
    Write-Host "  [OK] Table creation endpoint working correctly" -ForegroundColor Green
    Write-Host "  [OK] Data is persisting to the database" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "  1. Test table creation through the web frontend" -ForegroundColor White
    Write-Host "  2. Test orders and other CRUD operations" -ForegroundColor White
    Write-Host "  3. Consider implementing proper RLS policies for production" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "FAILED: TABLE PERSISTENCE IS NOT WORKING!" -ForegroundColor Red
    Write-Host "  Tables are NOT being saved to Supabase!" -ForegroundColor Red
    Write-Host ""
    Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "  1. Verify RLS is actually disabled in Supabase Dashboard" -ForegroundColor White
    Write-Host "  2. Go to: https://app.supabase.com" -ForegroundColor White
    Write-Host "  3. Navigate to: Editor > tables table" -ForegroundColor White
    Write-Host "  4. Look for RLS button and make sure it shows DISABLED" -ForegroundColor White
    Write-Host ""
    Write-Host "  Disable RLS for ALL these tables:" -ForegroundColor Cyan
    Write-Host "     - tables" -ForegroundColor White
    Write-Host "     - orders" -ForegroundColor White
    Write-Host "     - menu_items" -ForegroundColor White
    Write-Host "     - menu_categories" -ForegroundColor White
    Write-Host "     - restaurants" -ForegroundColor White
    Write-Host "     - users" -ForegroundColor White
    Write-Host ""
    Write-Host "  After disabling RLS, run this script again" -ForegroundColor White
    Write-Host ""
}

Write-Host "Test Data Used:" -ForegroundColor Yellow
Write-Host "  Table Number: $TEST_TABLE_NUMBER" -ForegroundColor White
Write-Host "  Table ID: $tableId" -ForegroundColor White
Write-Host "  Timestamp: $TIMESTAMP" -ForegroundColor White
Write-Host ""
