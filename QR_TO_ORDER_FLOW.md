# 🎯 Complete QR Code to Order Flow - Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SCAN QR CODE                                                │
│     └─→ Points to: /menu?table=TABLE_NUMBER                     │
│                                                                  │
│  2. LOAD MENU (CustomerMenu.jsx)                                │
│     └─→ Fetch menu items via menuAPI.getItems()                │
│     └─→ Display categories and items                            │
│                                                                  │
│  3. ADD TO CART                                                 │
│     └─→ State management via useState                           │
│     └─→ Calculate total price                                   │
│                                                                  │
│  4. REVIEW ORDER & PLACE                                        │
│     └─→ Submit via customerAPI.placeOrder()                     │
│     └─→ POST /v1/customer/orders (table-based)                  │
│                                                                  │
│  5. ORDER CONFIRMATION                                          │
│     └─→ Redirect to /order-status?order=ORDER_ID&table=X       │
│     └─→ Poll for real-time updates (2s interval)                │
│                                                                  │
│  6. TRACK ORDER                                                 │
│     └─→ See status: pending → preparing → ready → completed     │
│     └─→ Real-time updates via Supabase subscriptions             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ADMIN/KITCHEN JOURNEY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. KITCHEN DASHBOARD (Kitchen.jsx)                             │
│     └─→ Real-time order updates via Supabase subscriptions      │
│     └─→ Display pending & preparing orders                      │
│                                                                  │
│  2. ORDER MANAGEMENT                                            │
│     └─→ Change order status: pending → preparing → ready        │
│     └─→ Mark items as completed                                 │
│                                                                  │
│  3. REAL-TIME NOTIFICATIONS                                     │
│     └─→ New orders appear instantly                             │
│     └─→ Order counters update live                              │
│                                                                  │
│  4. ORDER HISTORY & ANALYTICS                                   │
│     └─→ View completed orders                                   │
│     └─→ Track revenue and metrics                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Status

### ✅ Completed Components

1. **QR Code Generation** (QRCodeModal.jsx)
   - Individual QR codes per table
   - Bulk export for printing
   - Downloadable PNG format

2. **Customer Menu Interface** (CustomerMenu.jsx)
   - Browse menu items
   - Add to cart functionality
   - Cart management (quantity, remove)
   - Order placement with validation

3. **Order Status Page** (OrderStatus.jsx)
   - Real-time status tracking
   - Visual progress timeline
   - Order details display
   - Auto-polling for updates

4. **API Endpoints** (apiEndpoints.js)
   - customerAPI.placeOrder()
   - customerAPI.getOrder()
   - customerAPI.getOrderByTable()

5. **Real-time Subscriptions** (useOrderSubscription.js)
   - Live order updates
   - Order item tracking
   - Status change notifications

## Step-by-Step User Flow

### 1️⃣ Customer Scans QR Code

**URL Generated:**
```
https://yourdomain.com/menu?table=5
```

**QR Code Data:**
```javascript
{
  tableNumber: 5,
  restaurantUrl: "https://yourdomain.com"
}
```

### 2️⃣ Customer Views Menu

**Component:** `CustomerMenu.jsx`

```javascript
// Retrieves table number from URL
const tableNumber = searchParams.get('table');

// Fetches all menu items
const { data: menuItems } = useApi(
  () => menuAPI.getItems({ limit: 100 })
);
```

### 3️⃣ Customer Adds Items to Cart

```javascript
// Cart state management
const [cart, setCart] = useState([]);

const addToCart = (item) => {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    // Increment quantity
    setCart(cart.map(c =>
      c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
    ));
  } else {
    // Add new item
    setCart([...cart, { ...item, quantity: 1 }]);
  }
};
```

**Cart Item Structure:**
```javascript
{
  id: "menu-item-1",
  name: "Chicken Biryani",
  price: 250,
  quantity: 2,
  description: "..."
}
```

### 4️⃣ Customer Places Order

**Trigger:**
```javascript
const handlePlaceOrder = async () => {
  const orderData = {
    tableNumber: parseInt(tableNumber),
    items: cart.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
    totalAmount: cartTotal,
    paymentMethod: 'cash',
    notes: '',
  };

  const response = await customerAPI.placeOrder(orderData);
};
```

**API Call:**
```
POST /v1/customer/orders
Content-Type: application/json

{
  "tableNumber": 5,
  "items": [
    {
      "menuItemId": "abc123",
      "quantity": 2,
      "unitPrice": 250
    }
  ],
  "totalAmount": 500,
  "paymentMethod": "cash",
  "notes": ""
}
```

### 5️⃣ Backend Creates Order

**Endpoint:** `POST /v1/customer/orders`

**Process:**
1. Extract table number from request
2. Find restaurant by table ID
3. Create order record
4. Add order items
5. Return order with ID

**Database Structure:**
```sql
-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  table_id UUID REFERENCES tables(id),
  status TEXT, -- pending, preparing, ready, completed
  total_amount DECIMAL,
  payment_method TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT,
  unit_price DECIMAL,
  created_at TIMESTAMP
);
```

### 6️⃣ Customer Sees Order Confirmation

**Redirect:**
```javascript
navigate(`/order-status?order=${response.id}&table=${tableNumber}`);
```

**Page:** `OrderStatus.jsx`

**Features:**
- Visual progress timeline
- Order items display
- Real-time status updates
- Polling every 2 seconds

### 7️⃣ Admin Kitchen Sees New Order

**Real-time Update via Supabase:**

```javascript
// Kitchen.jsx uses real-time subscription
const { data: orders } = useApi(() => kitchenAPI.getActiveOrders());

// When new order comes in via subscription
useOrderSubscription(restaurantId, (payload) => {
  if (payload.eventType === 'INSERT') {
    // New order received
    addNewOrder(payload.new);
  }
});
```

### 8️⃣ Admin Updates Order Status

**Status Flow:**
```
pending (✅ Customer sees order received)
   ↓
preparing (⏳ Customer waits - animating spinner)
   ↓
ready (✅ Customer sees "Ready to Serve")
   ↓
completed (✅ All done)
```

**Update Call:**
```javascript
await orderAPI.updateStatus(orderId, {
  status: 'preparing'
});
```

## Key Features Implemented

### 🔄 Real-time Synchronization

**Customer Side:**
```javascript
// Polls every 2 seconds for status updates
useEffect(() => {
  const interval = setInterval(() => {
    refetchOrder();
  }, 2000);
  return () => clearInterval(interval);
}, [orderId]);
```

**Admin Side:**
```javascript
// Supabase subscriptions for instant updates
useOrderSubscription(restaurantId, (payload) => {
  console.log('New order:', payload.new);
  setOrders([...orders, payload.new]);
});
```

### 🎯 Table-based Order Routing

**Without Authentication:**
```javascript
// Customer's table number identifies the restaurant
// via the table → restaurant relationship
const { data: table } = await supabase
  .from('tables')
  .select('restaurant_id')
  .eq('id', tableId)
  .single();
```

### 📊 Order Data Flow

```
Customer Places Order
        ↓
POST /v1/customer/orders
        ↓
Backend validates table exists
        ↓
Creates order in Supabase
        ↓
Supabase triggers real-time event
        ↓
Kitchen subscribed to orders → sees new order
Customer polling order-status → sees "pending"
        ↓
Admin marks "preparing"
        ↓
Both update in real-time
```

## Configuration Needed

### Backend Environment Variables
```bash
# Already in backend/.env
SUPABASE_URL=https://pzjjuuqwpbfbfosgblzv.supabase.co
SUPABASE_ANON_KEY=sb_publishable_h2HoLV5oiZpBIaMK4EQHiQ_UY6HjMZn
SUPABASE_SERVICE_KEY=sb_publishable_h2HoLV5oiZpBIaMK4EQHiQ_UY6HjMZn
```

### Frontend Environment Variables
```bash
# In frontend/.env and frontend/.env.production
VITE_SUPABASE_URL=https://pzjjuuqwpbfbfosgblzv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2HoLV5oiZpBIaMK4EQHiQ_UY6HjMZn
VITE_API_BASE_URL=http://localhost:3000/api  # or production URL
```

## Testing the Complete Flow

### 1. Test QR Code Generation
```bash
cd Restaurant_management
npm run dev  # Frontend at localhost:5173
# Go to Tables page → Create table → Click "QR Code" button
# Verify QR code displays and link is correct
```

### 2. Test Order Placement
```bash
# Simulate customer visit:
# 1. Open browser (simulate mobile)
# 2. Scan QR code or visit: http://localhost:5173/menu?table=1
# 3. Browse menu items
# 4. Add items to cart
# 5. Click "Place Order"
# 6. Should redirect to order status page
```

### 3. Test Real-time Updates
```bash
# Open 2 browser windows:
# Window 1: Customer at order status page
# Window 2: Admin at Kitchen dashboard
# Admin changes order status
# Customer should see update within 2 seconds
```

### 4. Test on Production (Render)
```bash
# Frontend: https://resturant-saas-1.onrender.com
# Backend: https://resturant-saas.onrender.com
# QR code URL should be production frontend domain
```

## Troubleshooting

### Issue: "Order placed but not showing in kitchen"
**Solution:**
1. Verify SUPABASE credentials are set
2. Check browser console for subscription errors
3. Ensure table → restaurant relationship exists
4. Verify order created in Supabase dashboard

### Issue: "Customer not seeing real-time updates"
**Solution:**
1. Check polling interval (default 2 seconds)
2. Verify customerAPI.getOrder() works
3. Check browser network tab for API calls
4. Ensure order ID is correct in URL

### Issue: "QR code not working on production"
**Solution:**
1. Verify QR code URL points to production domain
2. Check CORS settings allow production frontend domain
3. Verify API_BASE_URL in frontend .env.production
4. Test with: `curl https://api.production.com/health`

## Next Steps (Optional Enhancements)

- [ ] Add payment processing integration
- [ ] SMS notifications for customers
- [ ] Order preparation time estimation
- [ ] Multi-language menu support
- [ ] Special dietary requirements notes
- [ ] Order modifications & cancellations
- [ ] Customer feedback/ratings
- [ ] Staff push notifications
- [ ] Delivery/takeaway options
- [ ] Loyalty program integration

## Files Modified/Created

```
frontend/
├── src/
│   ├── pages/
│   │   ├── CustomerMenu.jsx ✅ (Updated with order placement)
│   │   ├── OrderStatus.jsx ✅ (New - customer tracking)
│   │   └── Tables.jsx ✅ (QR code generation)
│   ├── components/
│   │   └── QRCodeModal.jsx ✅ (QR display & export)
│   ├── hooks/
│   │   └── useOrderSubscription.js ✅ (Real-time updates)
│   ├── config/
│   │   └── supabase.js ✅ (Supabase client)
│   ├── services/
│   │   └── apiEndpoints.js ✅ (Updated with order APIs)
│   ├── App.jsx ✅ (Added order-status route)
│   └── .env ✅ (Added Supabase credentials)
├── package.json ✅ (Added @supabase/supabase-js)
└── .env.production ✅ (Added Supabase credentials)

backend/
├── src/
│   ├── routes/
│   │   └── customer.js (Handles customer orders)
│   └── controllers/
│       └── orderController.js (Order logic)
└── .env ✅ (Already has Supabase credentials)
```

## Success Criteria

✅ QR code generation working
✅ Customer can scan and view menu
✅ Add items to cart
✅ Place order successfully
✅ Order saved to database
✅ Admin sees order in real-time
✅ Customer sees status updates
✅ Complete order flow end-to-end

---

**Status:** 🟢 Ready for testing and production deployment
**Last Updated:** February 26, 2026
