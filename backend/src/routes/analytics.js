import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation, checkPermission } from '../middleware/tenantIsolation.js';
import { validateQuery } from '../middleware/validation.js';
import { analyticsQuerySchema } from '../schemas/restaurant.schema.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// All routes protected
router.use(authMiddleware, tenantIsolation);

// Reports
router.get('/daily-sales', checkPermission(['view_analytics']), analyticsController.getDailySalesReport);
router.get('/monthly-sales', checkPermission(['view_analytics']), analyticsController.getMonthlySalesReport);
router.get('/top-items', checkPermission(['view_analytics']), analyticsController.getTopItems);

export default router;
