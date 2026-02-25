import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { validateParams } from '../middleware/validation.js';
import Joi from 'joi';
import MenuService from '../services/menuService.js';
import TableService from '../services/tableService.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

const tableSchema = Joi.object({
  qrCodeData: Joi.string().required(),
});

// Get menu for customer via QR code (no auth required)
router.get('/menu/:qrCodeData/items', validateParams(tableSchema), async (req, res) => {
  try {
    const { qrCodeData } = req.params;

    // Extract restaurantId from QR code
    const restaurantId = qrCodeData.split('-')[0];

    // Get menu items
    const result = await MenuService.getMenuItems(restaurantId, {
      limit: 100,
      skip: 0,
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: result,
      message: 'Menu fetched successfully',
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
});

// Create order as customer (no auth required, but table must be valid)
router.post('/orders', optionalAuth, orderController.createOrder);

export default router;
