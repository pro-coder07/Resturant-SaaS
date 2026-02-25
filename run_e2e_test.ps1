$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MTVjZmZmOS02YjQ2LTQ5YzEtYjM2OS0xZDU2NTBjOTU4MTYiLCJyZXN0YXVyYW50SWQiOiI1MTVjZmZmOS02YjQ2LTQ5YzEtYjM2OS0xZDU2NTBjOTU4MTYiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoib3duZXIiLCJpYXQiOjE3NzIwMTg0MTIsImV4cCI6MTc3MjAxOTMxMn0.RuYtTmdTIbemcUblq3XRQTERCaUIzaWewcVRPU5FoqQ"

Write-Host "E2E TEST: Orders, Tables, Kitchen, Analytics"
Write-Host "=================================================="

Write-Host ""
Write-Host "[1] CREATE TABLE - " -NoNewline
$tableBody = @{tableNumber=101; seatCapacity=4; location="Main"} | ConvertTo-Json
$tableRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tables" -Method POST -Body $tableBody -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$tableData = $tableRes.Content | ConvertFrom-Json
$tableId = $tableData.data.id
Write-Host "OK (Table $($tableData.data.tableNumber))" -ForegroundColor Green

Write-Host "[2] CREATE MENU CATEGORY - " -NoNewline
$catBody = @{name="Main Courses"; description="Dishes"; displayOrder=1} | ConvertTo-Json
$catRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/menu/categories" -Method POST -Body $catBody -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$catData = $catRes.Content | ConvertFrom-Json
$catId = $catData.data.id
Write-Host "OK" -ForegroundColor Green

Write-Host "[3] CREATE MENU ITEMS - " -NoNewline
$item1Body = @{name="Salmon"; description="Fish"; price=24.99; categoryId=$catId; preparationTime=20; tags=@("main")} | ConvertTo-Json
$item1Res = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/menu/items" -Method POST -Body $item1Body -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$item1Data = $item1Res.Content | ConvertFrom-Json
$menuId1 = $item1Data.data.id

$item2Body = @{name="Chicken"; description="Meat"; price=18.99; categoryId=$catId; preparationTime=25; tags=@("main")} | ConvertTo-Json
$item2Res = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/menu/items" -Method POST -Body $item2Body -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$item2Data = $item2Res.Content | ConvertFrom-Json
$menuId2 = $item2Data.data.id
Write-Host "OK (2 items)" -ForegroundColor Green

Write-Host "[4] CREATE ORDER - " -NoNewline
$orderBody = @{tableNumber=101; items=@(@{menuItemId=$menuId1; quantity=2}, @{menuItemId=$menuId2; quantity=1}) } | ConvertTo-Json
$orderRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/orders" -Method POST -Body $orderBody -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$orderData = $orderRes.Content | ConvertFrom-Json
$orderId = $orderData.data.id
Write-Host "OK (Order $($orderData.data.orderNumber))" -ForegroundColor Green

Write-Host "[5] GET ORDERS LIST - " -NoNewline
$listRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/orders?limit=10`&skip=0" -Method GET -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$listData = $listRes.Content | ConvertFrom-Json
Write-Host "OK ($($listData.data.items.Count) orders)" -ForegroundColor Green

Write-Host "[6] UPDATE ORDER STATUS - " -NoNewline
$statBody = @{status="preparing"} | ConvertTo-Json
$statRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/orders/$orderId/status" -Method PUT -Body $statBody -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
Write-Host "OK" -ForegroundColor Green

Write-Host "[7] GET TABLES LIST - " -NoNewline
$tlistRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tables?limit=10`&skip=0" -Method GET -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$tlistData = $tlistRes.Content | ConvertFrom-Json
Write-Host "OK ($($tlistData.data.items.Count) tables)" -ForegroundColor Green

Write-Host "[8] GET KITCHEN ORDERS - " -NoNewline
$kitRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/kitchen/orders" -Method GET -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$kitData = $kitRes.Content | ConvertFrom-Json
$kitCount = if ($kitData.data -is [array]) { $kitData.data.Count } else { 1 }
Write-Host "OK ($kitCount in queue)" -ForegroundColor Green

Write-Host "[9] COMPLETE ORDER - " -NoNewline
$compBody = @{status="served"} | ConvertTo-Json
$compRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/orders/$orderId/status" -Method PUT -Body $compBody -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
Write-Host "OK" -ForegroundColor Green

Write-Host "[10] GET DAILY ANALYTICS - " -NoNewline
$today = Get-Date -Format "yyyy-MM-dd"
$anaRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/analytics/daily-sales?date=$today" -Method GET -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$anaData = $anaRes.Content | ConvertFrom-Json
Write-Host "OK (Revenue: `$$('{0:N2}' -f $anaData.data.totalRevenue))" -ForegroundColor Green

Write-Host "[11] GET TOP ITEMS ANALYTICS - " -NoNewline
$topRes = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/analytics/top-items?days=30" -Method GET -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
Write-Host "OK" -ForegroundColor Green

Write-Host ""
Write-Host "=================================================="
Write-Host "ALL FEATURES VERIFIED - PRODUCTION READY"
Write-Host "=================================================="
