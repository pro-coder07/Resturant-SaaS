# Restaurant Management SaaS - Backend API

Production-ready REST API for multi-tenant restaurant management system with QR-based ordering.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication with refresh tokens
- 👥 **Multi-Tenant Architecture** - Complete data isolation by restaurant
- 🍽️ **Menu Management** - Categories, items, pricing, availability
- 📋 **Order Management** - Order creation, status tracking, real-time updates
- 🧑‍🍳 **Kitchen Dashboard** - Real-time order display with status updates
- 📊 **Analytics** - Sales reports, revenue tracking, item popularity
- 🖼️ **Image Upload** - Cloudinary integration for menu images
- 🔒 **Security** - Rate limiting, input validation, CORS, XSS protection
- 📝 **Logging** - Winston-based structured logging
- ⚡ **Performance** - MongoDB optimization, indexing, pagination

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Bcrypt
- **Storage**: Cloudinary
- **Logging**: Winston
- **Validation**: Joi

## Environment Variables

Create `.env.production` file:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-min-32-chars
REFRESH_TOKEN_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register restaurant
- `POST /api/v1/auth/login` - Login restaurant owner
- `POST /api/v1/auth/staff/login` - Login staff member
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/change-password` - Change password

### Restaurant Management
- `GET /api/v1/restaurants/profile` - Get restaurant profile
- `PUT /api/v1/restaurants/profile` - Update profile
- `PUT /api/v1/restaurants/settings` - Update settings
- `POST /api/v1/restaurants/staff` - Create staff user
- `GET /api/v1/restaurants/staff` - List staff
- `DELETE /api/v1/restaurants/staff/:staffId` - Deactivate staff

### Menu Management
- `GET /api/v1/menu/categories` - List categories
- `POST /api/v1/menu/categories` - Create category
- `PUT /api/v1/menu/categories/:categoryId` - Update category
- `DELETE /api/v1/menu/categories/:categoryId` - Delete category
- `GET /api/v1/menu/items` - List menu items
- `POST /api/v1/menu/items` - Create menu item
- `GET /api/v1/menu/items/:itemId` - Get item details
- `PUT /api/v1/menu/items/:itemId` - Update item
- `DELETE /api/v1/menu/items/:itemId` - Delete item
- `PATCH /api/v1/menu/items/:itemId/availability` - Toggle availability

### Order Management
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:orderId` - Get order details
- `PUT /api/v1/orders/:orderId/status` - Update order status
- `GET /api/v1/orders/analytics/daily` - Daily revenue
- `GET /api/v1/orders/analytics/monthly` - Monthly revenue
- `GET /api/v1/orders/analytics/top-items` - Top selling items

### Kitchen Dashboard
- `GET /api/v1/kitchen/orders` - Get active orders
- `GET /api/v1/kitchen/orders/:orderId` - Get order details
- `PUT /api/v1/kitchen/orders/:orderId/status` - Update status

### Tables & QR
- `GET /api/v1/tables` - List tables
- `POST /api/v1/tables` - Create table
- `POST /api/v1/tables/batch` - Create multiple tables
- `PUT /api/v1/tables/:tableId` - Update table
- `DELETE /api/v1/tables/:tableId` - Delete table
- `POST /api/v1/tables/qr/generate` - Generate QR URLs

### Analytics
- `GET /api/v1/analytics/daily-sales` - Daily report
- `GET /api/v1/analytics/monthly-sales` - Monthly report
- `GET /api/v1/analytics/top-items` - Top items

### Customer (Public)
- `GET /api/v1/customer/menu/:qrCodeData/items` - Get menu via QR
- `POST /api/v1/customer/orders` - Place order

## Security Features

✅ JWT token validation  
✅ Role-based access control (RBAC)  
✅ Tenant data isolation  
✅ Rate limiting  
✅ Input validation & sanitization  
✅ Password hashing (bcrypt)  
✅ CORS enabled  
✅ XSS protection  
✅ MongoDB injection prevention  
✅ Structured error responses  

## Performance Optimizations

✅ MongoDB indexing on key fields  
✅ Compound indexes for queries  
✅ Pagination for large datasets  
✅ Lean queries where applicable  
✅ Efficient aggregation pipelines  

## Error Handling

All errors return standardized response:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

## Logging

Logs are written to:
- Console (development)
- `logs/app.log` (all)
- `logs/error.log` (errors only)

## Deployment

### Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy with `npm install && npm start`

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploy on push

## Testing

```bash
npm test
```

## License

MIT
