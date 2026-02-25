import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation, checkPermission } from '../middleware/tenantIsolation.js';
import { validateRequest } from '../middleware/validation.js';
import { orderLimiter } from '../middleware/rateLimit.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../schemas/order.schema.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

// Create order (customer) - needs table validation
router.post('/', orderLimiter, validateRequest(createOrderSchema), orderController.createOrder);

// All other routes protected
router.use(authMiddleware, tenantIsolation);

// Retrieve orders
router.get('/', checkPermission(['manage_orders', 'view_orders']), orderController.getOrders);
router.get('/:orderId', orderController.getOrderById);

// Update order status
router.put('/:orderId/status', checkPermission(['manage_orders', 'update_order_status']), validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);

// Revenue and analytics
router.get('/analytics/daily', checkPermission(['view_analytics']), orderController.getDailyRevenue);
router.get('/analytics/monthly', checkPermission(['view_analytics']), orderController.getMonthlyRevenue);
router.get('/analytics/top-items', checkPermission(['view_analytics']), orderController.getMostSoldItems);

export default router;
