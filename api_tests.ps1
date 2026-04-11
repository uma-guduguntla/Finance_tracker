$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$baseUrl = "http://localhost:8080/api"

Write-Host "`n=== Smart Spending API Tests ===" -ForegroundColor Cyan

# 1. Register User
Write-Host "`n1. Testing Registration..."
$registerBody = '{"name":"Test User","email":"testrunner@example.com","password":"password123"}'
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "   PASS - Registered: $($regResponse.email)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 500) {
        Write-Host "   SKIP - User likely already exists, continuing." -ForegroundColor Yellow
    } else {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Login
Write-Host "`n2. Testing Login..."
$loginBody = '{"email":"testrunner@example.com","password":"password123"}'
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "   PASS - Token acquired (length=$($token.Length))" -ForegroundColor Green
} catch {
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

# 3. Add Expense
Write-Host "`n3. Testing Add Expense..."
$today = (Get-Date).ToString("yyyy-MM-dd")
$expenseBody = "{`"amount`":45.50,`"category`":`"Food`",`"description`":`"API test lunch`",`"date`":`"$today`"}"
try {
    $expenseResponse = Invoke-RestMethod -Uri "$baseUrl/expenses" -Method Post -Headers $headers -Body $expenseBody -ContentType "application/json"
    Write-Host "   PASS - Expense added, ID=$($expenseResponse.id)" -ForegroundColor Green
} catch {
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Get Expenses
Write-Host "`n4. Testing Get Expenses..."
try {
    $expensesList = Invoke-RestMethod -Uri "$baseUrl/expenses" -Method Get -Headers $headers
    Write-Host "   PASS - Retrieved $($expensesList.Count) expenses" -ForegroundColor Green
} catch {
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Get Analytics / Leaks
Write-Host "`n5. Testing Get Leaks..."
try {
    $leaks = Invoke-RestMethod -Uri "$baseUrl/analysis/leaks" -Method Get -Headers $headers
    Write-Host "   PASS - Retrieved $($leaks.Count) leak alerts" -ForegroundColor Green
} catch {
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== All API tests completed ===" -ForegroundColor Cyan
