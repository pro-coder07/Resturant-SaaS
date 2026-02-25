# RestroMaxx - Complete Startup & Testing Guide

## 📊 Current Status ✅

| Component | Status | Port | Location |
|-----------|--------|------|----------|
| **Frontend** | ✅ Running | 5173 | http://localhost:5173 |
| **Backend API** | ✅ Running | 3000 | http://localhost:3000 |
| **Database** | ✅ Ready | In-Memory | Mock DB (Development) |
| **Cloudinary** | ✅ Configured | - | Image uploads ready |

---

## 🚀 Quick Start (First Time)

### Step 1: Open Two Terminal Windows

Open PowerShell or Command Prompt and navigate to the project root:
```bash
cd c:\Restaurant_management
```

### Step 2: Start Backend (Terminal 1)

```powershell
cd backend
npm start
```

**Expected Output:**
```
✅ Cloudinary initialized successfully
✅ Express app configured successfully
✅ Server running on http://localhost:3000
📊 API Base: http://localhost:3000/api
```

### Step 3: Start Frontend (Terminal 2)

```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in 1282 ms
➜  Local:   http://localhost:5173/
```

### Step 4: Access the Application

Open your browser and go to: **http://localhost:5173**

---

## ✅ Testing Procedures

### Test 1: Frontend Loading
1. Navigate to http://localhost:5173
2. You should see the RestroMaxx login page
3. **Expected:** Full page loads with styling intact ✓

### Test 2: Backend API - Health Check
Open PowerShell and run:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"test@test.com","password":"test123"}' -UseBasicParsing
```

**Expected Response:** 
- Status Code: 400 or 422 (validation error - this is correct!)
- Response contains JSON with error message
- **Status:** ✅ Backend is responding

### Test 3: Register a Restaurant
```powershell
$body = @{
    name = "Test Restaurant"
    email = "testrest@example.com"
    password = "Password123"
    phone = "1234567890"
    city = "New York"
    address = "123 Main St"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
```

**Expected Response:**
- Status: 201 or 200
- Contains user data and JWT token
- **Status:** ✅ API is fully functional

### Test 4: Frontend-Backend Communication
1. Open http://localhost:5173
2. Try to register (you will see the form)
3. The request should be sent to backend
4. **Expected:** Either success or validation message from backend

### Test 5: Check All API Routes
```powershell
# Menu endpoints
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/menu" -UseBasicParsing

# Orders endpoints
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/orders" -UseBasicParsing

# Kitchen endpoints
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/kitchen" -UseBasicParsing
```

---

## 🔧 Troubleshooting

### Issue: Frontend won't start
**Solution:**
```powershell
cd c:\Restaurant_management\frontend
npm run dev
```

### Issue: Backend won't start
**Solution:**
```powershell
cd c:\Restaurant_management\backend
npm start
```

### Issue: Port 3000 already in use
**Solution:**
```powershell
# Kill the process using port 3000
Get-Process node | Stop-Process -Force

# Then start again
cd c:\Restaurant_management\backend
npm start
```

### Issue: Port 5173 already in use
**Solution:**
```powershell
# Kill the process using port 5173
Get-Process node | Stop-Process -Force

# Then start again
cd c:\Restaurant_management\frontend
npm run dev
```

### Issue: "Cannot find module" error
**Solution:**
```powershell
# Frontend
cd c:\Restaurant_management\frontend
rm -r node_modules
npm install
npm run dev

# Backend
cd c:\Restaurant_management\backend
rm -r node_modules
npm install
npm start
```

---

## 📝 API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - Register restaurant
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/staff/login` - Staff login
- `POST /api/v1/auth/refresh-token` - Refresh JWT token

### Menu Management
- `GET /api/v1/menu` - Get all menu items
- `POST /api/v1/menu` - Create menu item
- `PUT /api/v1/menu/:id` - Update menu item
- `DELETE /api/v1/menu/:id` - Delete menu item

### Orders
- `GET /api/v1/orders` - Get all orders
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id` - Update order status

### Kitchen
- `GET /api/v1/kitchen` - Get kitchen queue
- `PUT /api/v1/kitchen/:id` - Update status

### Restaurant
- `GET /api/v1/restaurants/profile` - Get restaurant profile
- `PUT /api/v1/restaurants/profile` - Update profile

---

## 📱 Frontend Pages Available

1. **Login Page** - `/`
2. **Register Page** - `/register`
3. **Dashboard** - `/dashboard`
4. **Menu Management** - `/menu`
5. **Orders** - `/orders`
6. **Kitchen Display** - `/kitchen`
7. **Analytics** - `/analytics`
8. **Settings** - `/settings`

---

## 🌐 Environment Info

**Frontend:**
- Framework: React 18.2
- Build Tool: Vite 5.4.21
- Styling: Tailwind CSS 3.3.6
- State Management: Zustand
- HTTP Client: Axios

**Backend:**
- Runtime: Node.js
- Framework: Express 4.18
- Database: Mock DB (Development Mode)
- Auth: JWT + Cookies
- Image Hosting: Cloudinary

---

## 💾 Database Info

**Current Setup:**
- Type: In-Memory Mock Database
- Status: ✅ Fully Functional
- Collections: users, menus, orders, branches, kitchenQueues, payments
- Purpose: Development & Testing

**To Use Live MongoDB:**
1. Get MongoDB connection string from MongoDB Atlas
2. Update `MONGODB_URI` in `.env` file
3. Restart backend with `npm start`

---

## 🎯 What You Can Do Now

✅ Register new restaurants
✅ Create user accounts
✅ Manage menus and items
✅ Create and track orders
✅ View kitchen queue
✅ Check analytics
✅ Upload images via Cloudinary
✅ Test complete authentication flow

---

## 📞 Getting Help

If you encounter any issues:

1. **Check the terminal output** - Look for error messages
2. **Verify both services are running** - Should see logs in each terminal
3. **Test endpoints individually** - Use PowerShell commands provided
4. **Restart services** - Kill process and start fresh

---

## 📋 Checklist for Full Setup

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Frontend pages load with styling
- [ ] Backend API responding to requests
- [ ] Can test register endpoint
- [ ] Can test login endpoint
- [ ] Mock database working
- [ ] Ready for feature development!

---

**Last Updated:** February 24, 2026
**Application Status:** ✅ 100% Operational
