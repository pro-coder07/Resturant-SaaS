#!/bin/bash
# RestroMaxx - Quick Start Commands

# ============================================
# 1. START DEVELOPMENT ENVIRONMENT
# ============================================

## Terminal 1 - Backend
cd backend
npm install
npm start

## Terminal 2 - Frontend  
cd frontend
npm install
npm run dev

## Terminal 3 - E2E Tests (optional)
cd frontend
npm run test:e2e


# ============================================
# 2. LOGIN CREDENTIALS
# ============================================

Email:    test@example.com
Password: Test123@456


# ============================================
# 3. ACCESS YOUR APPLICATION
# ============================================

Frontend:  http://localhost:5173
Backend:   http://localhost:3000
API Base:  http://localhost:3000/api/v1

Reports:   http://localhost:9323 (after running tests)


# ============================================
# 4. E2E TEST COMMANDS
# ============================================

npm run test:e2e               # Run all tests (headless)
npm run test:e2e:ui           # Run with Playwright UI
npm run test:e2e:debug        # Debug mode


# ============================================
# 5. CLEANUP COMMANDS
# ============================================

# Kill all Node processes (Windows/PowerShell)
taskkill /F /IM node.exe

# Kill all Node processes (macOS/Linux)
pkill -f node


# ============================================
# 6. API ENDPOINTS FOR TESTING
# ============================================

# Register
POST http://localhost:3000/api/v1/auth/register
{
  "name": "Restaurant Name",
  "email": "newuser@example.com",
  "phone": "9876543210",
  "password": "Test123@456",
  "city": "Bellary"
}

# Login
POST http://localhost:3000/api/v1/auth/login
{
  "email": "test@example.com",
  "password": "Test123@456"
}

# Get Menu (with bearer token)
GET http://localhost:3000/api/v1/menu
Headers: Authorization: Bearer <access_token>

# Create Order
POST http://localhost:3000/api/v1/orders
{
  "items": [
    {
      "menuItemId": "item-id",
      "quantity": 2
    }
  ],
  "tableLocation": "Table 1"
}

# Get Kitchen Orders
GET http://localhost:3000/api/v1/kitchen/active-orders


# ============================================
# 7. HELPFUL SHORTCUTS
# ============================================

# View logs (Linux/macOS)
tail -f backend/logs/app.log

# View logs (Windows PowerShell)
Get-Content backend/logs/app.log -Tail 50 -Wait

# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format


# ============================================
# 8. COMMON ISSUES
# ============================================

Issue: Port 3000 already in use
Fix: taskkill /F /IM node.exe

Issue: Playwright browser not found
Fix: npx playwright install chromium

Issue: MongoDB connection timeout
Status: Automatically falls back to mock database

Issue: Tests failing
Fix: Make sure both servers are running on ports 3000 and 5173


# ============================================
# 9. PROJECT STRUCTURE
# ============================================

Restaurant_management/
├── backend/
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── utils/          # Helpers, logger, etc.
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API client
│   │   ├── context/        # State management
│   │   └── hooks/          # Custom hooks
│   ├── tests/e2e/          # Playwright tests
│   └── package.json
│
├── E2E_TESTING_GUIDE.md    # Full testing guide
└── README.md               # Project overview
