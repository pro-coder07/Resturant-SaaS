import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { validateParams } from '../middleware/validation.js';
import Joi from 'joi';
import MenuService from '../services/menuService.js';
import TableService from '../services/tableService.js';
import * as orderController from '../controllers/orderController.js';
import supabase from '../config/supabase.js';

const router = express.Router();

const tableSchema = Joi.object({
  qrCodeData: Joi.string().required(),
});

// Get public menu items (no auth required)
// This endpoint is called by customers who scanned a QR code
// Pass ?table=X to get the menu for that table's restaurant
router.get('/menu/items', async (req, res) => {
  try {
    const { table } = req.query;

    if (!table) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Table number is required',
      });
    }

    // Get restaurant ID from table lookup
    const { data: tableData, error: tableError } = await supabase
      .from('tables')
      .select('restaurant_id')
      .eq('table_number', parseInt(table))
      .limit(1)
      .single();

    if (tableError || !tableData) {
      console.error('Table lookup error:', tableError);
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Table not found',
      });
    }

    const restaurantId = tableData.restaurant_id;

    // Get all menu items for this restaurant
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
    console.error('❌ Error fetching public menu:', error.message);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
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
