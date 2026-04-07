$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080/api"

Write-Host "Running Smart Spending API Tests..." -ForegroundColor Cyan

# 1. Register User
Write-Host "1. Testing Registration Endpoint..."
$registerBody = @{
    name = "Test User"
    email = "testrunner@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration successful for $($regResponse.email)" -ForegroundColor Green
} catch {
    Write-Host "User might already exist or error occurred. Proceeding to login." -ForegroundColor Yellow
}

# 2. Login
Write-Host "2. Testing Login Endpoint..."
$loginBody = @{
    email = "testrunner@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Login successful, Token acquired." -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
}

# 3. Add Expense
Write-Host "3. Testing Add Expense Endpoint..."
$expenseBody = @{
    amount = 45.50
    category = "Food"
    description = "Test lunch"
    date = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$expenseResponse = Invoke-RestMethod -Uri "$baseUrl/expenses" -Method Post -Headers $headers -Body $expenseBody -ContentType "application/json"
Write-Host "Expense added with ID: $($expenseResponse.id)" -ForegroundColor Green

# 4. Get Expenses
Write-Host "4. Testing Get Expenses Endpoint..."
$expensesList = Invoke-RestMethod -Uri "$baseUrl/expenses" -Method Get -Headers $headers
Write-Host "Retrieved $($expensesList.Count) expenses." -ForegroundColor Green

# 5. Get Analytics
Write-Host "5. Testing Get Analytics Endpoint..."
$leaks = Invoke-RestMethod -Uri "$baseUrl/analysis/leaks" -Method Get -Headers $headers
Write-Host "Retrieved $($leaks.Count) leak alerts." -ForegroundColor Green

Write-Host "All API endpoints verified successfully!" -ForegroundColor Cyan
