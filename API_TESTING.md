# API Testing Guide

## Prerequisites
1. MongoDB running locally or MongoDB Atlas connection
2. Create `.env` file from `.env.example`
3. Install dependencies: `npm install`
4. Start server: `npm start`

## Test Authentication

### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "plan": "free",
    "downloadsUsed": 0,
    "downloadsLimit": 10
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Downloads

### 1. Download Reel (requires auth)
```bash
curl -X POST http://localhost:5000/api/downloads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"url":"https://www.instagram.com/reel/SAMPLE_ID/"}'
```

### 2. Get Download History
```bash
curl -X GET http://localhost:5000/api/downloads/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Download Stats
```bash
curl -X GET http://localhost:5000/api/downloads/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Admin (requires admin user)

### 1. Create Admin User (via MongoDB)
```bash
# Connect to MongoDB
mongosh

# Use database
use reel-downloader

# Update user to admin
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { plan: "admin" } }
)
```

### 2. Get All Users
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Get Analytics
```bash
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Update User Plan
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"plan":"premium"}'
```

## PowerShell Examples

### Signup
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token
```

### Download with Auth
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    url = "https://www.instagram.com/reel/SAMPLE_ID/"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/downloads" -Method Post -Headers $headers -Body $body
```

## Expected Behaviors

### Free User Limits
- 10 downloads per day
- After 10 downloads, returns 429 error with upgrade message
- Resets after 24 hours

### Premium User
- Unlimited downloads
- No daily limits

### Admin User
- Unlimited downloads
- Access to admin endpoints
- Can manage all users
