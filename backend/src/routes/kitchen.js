import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation, checkPermission } from '../middleware/tenantIsolation.js';
import { validateRequest } from '../middleware/validation.js';
import { updateOrderStatusSchema } from '../schemas/order.schema.js';
import * as kitchenController from '../controllers/kitchenController.js';

const router = express.Router();

// All routes protected
router.use(authMiddleware, tenantIsolation);

// Get active orders for kitchen (5-second polling)
router.get('/orders', checkPermission(['view_orders', 'update_order_status']), kitchenController.getKitchenOrders);
router.get('/orders/all', checkPermission(['view_orders', 'update_order_status']), kitchenController.getKitchenAllOrders);
router.get('/orders/:orderId', checkPermission(['view_orders']), kitchenController.getOrderDetails);

// Update order status (kitchen staff)
router.put('/orders/:orderId/status', checkPermission(['update_order_status']), validateRequest(updateOrderStatusSchema), kitchenController.updateOrderStatus);

export default router;
