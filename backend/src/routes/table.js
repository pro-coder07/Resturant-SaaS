import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation, checkPermission } from '../middleware/tenantIsolation.js';
import { validateRequest } from '../middleware/validation.js';
import { createTableSchema, batchCreateTablesSchema } from '../schemas/order.schema.js';
import * as tableController from '../controllers/tableController.js';

const router = express.Router();

// All routes protected
router.use(authMiddleware, tenantIsolation);

// Create table
router.post('/', checkPermission(['manage_menu']), validateRequest(createTableSchema), tableController.createTable);
router.post('/batch', checkPermission(['manage_menu']), validateRequest(batchCreateTablesSchema), tableController.createMultipleTables);

// Get tables
router.get('/', checkPermission(['manage_menu', 'view_orders']), tableController.getTables);

// Update/delete table
router.put('/:tableId', checkPermission(['manage_menu']), tableController.updateTable);
router.delete('/:tableId', checkPermission(['manage_menu']), tableController.deleteTable);

// Generate QR URLs
router.post('/qr/generate', checkPermission(['manage_menu']), tableController.generateQRUrls);

export default router;
