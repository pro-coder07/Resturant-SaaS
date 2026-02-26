# QR Code Flow - URL Reference 

## 📌 The Problem & Solution

### ❌ BEFORE (404 Error)
```
User scans QR code → https://resturant-saas.onrender.com/menu?table=1
                    ↓
              BACKEND API
              (has no /menu route)
                    ↓
              404 NOT FOUND
```

### ✅ AFTER (Working)
```
User scans QR code → https://restromaxsaas.vercel.app/menu?table=1
                    ↓
              FRONTEND (Vercel)
              (has /menu route)
                    ↓
              Load CustomerMenu component
                    ↓
              Call backend API
              GET /api/v1/customer/menu/items?table=1
                    ↓
              Backend looks up restaurant
              and returns menu items
```

---

## 🔗 All URLs in the System

### Production URLs

| Purpose | URL | Notes |
|---------|-----|-------|
| **Frontend App** | `https://restromaxsaas.vercel.app` | Deployed on Vercel |
| **Backend API** | `https://resturant-saas.onrender.com` | Deployed on Render |
| **QR Code Destination** | `https://restromaxsaas.vercel.app/menu?table=1` | Points to frontend |
| **Menu API** | `https://resturant-saas.onrender.com/api/v1/customer/menu/items` | Backend endpoint |

### Development URLs (Local)

| Purpose | URL | Notes |
|---------|-----|-------|
| **Frontend** | `http://localhost:5173` | Vite dev server |
| **Backend** | `http://localhost:3000` | Node/Express dev server |
| **Menu API** | `http://localhost:3000/api/v1/customer/menu/items` | Local backend |

---

## 🎯 Key Routes

### Frontend Routes (React Router)
```
GET /                    → Dashboard (protected)
GET /login              → Login page (public)
GET /register           → Register page (public)
GET /menu?table=1       → Customer menu (public) ✅
GET /order-status?...   → Order tracking (public)
```

### Backend Routes (Express)
```
GET  /api/health                           → Health check
GET  /api/v1/auth/...                      → Auth endpoints
POST /api/v1/admin/...                     → Admin endpoints (protected)
GET  /api/v1/customer/menu/items?table=X  → Public menu ✅
POST /api/v1/customer/orders               → Create order (public)
```

---

## 🔄 Data Flow Example

### When customer scans Table #1 QR code:

1. **QR Code triggers**
   ```
   Click/Scan → https://restromaxsaas.vercel.app/menu?table=1
   ```

2. **Frontend Route matches**
   ```javascript
   <Route path="/menu" element={<CustomerMenu />} />
   //      ↓ matches
   // CustomerMenu extracts ?table=1
   ```

3. **Extract table number**
   ```javascript
   const tableNumber = searchParams.get('table');  // "1"
   ```

4. **Call API**
   ```javascript
   customerAPI.getPublicMenu(1)
   // Makes request to:
   // GET https://resturant-saas.onrender.com/api/v1/customer/menu/items?table=1
   ```

5. **Backend processes**
   ```javascript
   // Route: /v1/customer/menu/items?table=1
   // 1. Get table number from query params
   const table = 1
   
   // 2. Query database
   SELECT restaurant_id FROM tables WHERE table_number=1
   // Result: restaurant_id = "abc-123"
   
   // 3. Fetch menu items
   SELECT * FROM menu_items WHERE restaurant_id="abc-123"
   // Result: [{id, name, price, ...}, {...}]
   
   // 4. Return JSON
   {
     statusCode: 200,
     success: true,
     data: [
       {id: "item-1", name: "Burger", price: 250},
       {id: "item-2", name: "Pizza", price: 350}
     ]
   }
   ```

6. **Frontend displays menu**
   ```
   ┌─────────────────────────┐
   │  Table 1 - Menu         │
   ├─────────────────────────┤
   │  [ ] Burger      ₹250   │
   │  [ ] Pizza       ₹350   │
   │         Add to Cart     │
   └─────────────────────────┘
   ```

---

## 🔐 Security Notes

- ❌ Do NOT expose API directly: `https://resturant-saas.onrender.com/menu`
- ✅ Always route through frontend first: `https://restromaxsaas.vercel.app/menu`
- ✅ Backend `/v1/customer/*` routes are public (no auth required)
- ✅ Backend `/v1/admin/*` routes are protected (require auth token)

---

## 📱 Testing QR Code Manually

### Test in Browser
```
1. Open: https://restromaxsaas.vercel.app/menu?table=1
2. Should load customer menu for table 1
3. Open DevTools → Network
4. Should see GET request to /api/v1/customer/menu/items?table=1
5. Should get 200 response with menu items
```

### Test with QR Scanner
```
1. Go to /tables page in admin
2. Look for "View QR Code" button
3. Click it to see the QR modal
4. Scan with phone camera
5. Should navigate to menu page
```

---

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 GET /menu on backend | QR points to backend | Update QR to point to Vercel frontend |
| Menu doesn't load | Table not found in DB | Ensure table was created with correct table_number |
| Blank menu | Restaurant has no menu items | Add menu items for the restaurant |
| CORS error | Backend blocks Vercel domain | Add `https://restromaxsaas.vercel.app` to CORS origins |
| API returns 500 | Database connection issue | Check Supabase credentials in .env |

---

## ✅ Verification Commands

### Check Frontend Builds
```bash
cd frontend
npm run build
# Check dist/ folder has index.html
```

### Test Backend Endpoint
```bash
curl "http://localhost:3000/api/v1/customer/menu/items?table=1"
# Should return JSON with menu items
```

### Check Environment
```bash
# Frontend should have
echo $VITE_API_BASE_URL  # https://resturant-saas.onrender.com/api

# Backend should have
echo $SUPABASE_URL  # https://pzjjuuqwpbfbfosgblzv.supabase.co
```

---

## 📞 Support Flowchart

```
Customer scans QR
         ↓
    Does page load?
    ├─ NO  → Check QR URL in browser address bar
    │       Should be: https://restromaxsaas.vercel.app/menu?table=X
    │
    └─ YES → Does menu appear?
            ├─ NO  → Open DevTools
            │       Check Network tab for API call
            │       Should be status 200
            │
            └─ YES → Can customer place order?
                    ├─ NO  → Check console for errors
                    │       Check API/database connection
                    │
                    └─ YES → 🎉 Everything works!
```
