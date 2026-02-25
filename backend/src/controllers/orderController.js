import logger from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import OrderService from '../services/orderService.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await OrderService.createOrder(req.restaurantId, req.body);

  return sendSuccess(res, 201, order, 'Order created successfully');
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await OrderService.getOrderById(req.restaurantId, orderId);

  return sendSuccess(res, 200, order, 'Order fetched successfully');
});

export const getOrders = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    tableNumber: req.query.tableNumber ? parseInt(req.query.tableNumber) : undefined,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    limit: parseInt(req.query.limit) || 50,
    skip: parseInt(req.query.skip) || 0,
  };

  const result = await OrderService.getOrders(req.user.restaurantId, filters);

  return sendSuccess(res, 200, result, 'Orders fetched successfully');
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, cancelReason } = req.body;

  const order = await OrderService.updateOrderStatus(
    req.restaurantId,
    orderId,
    status,
    cancelReason
  );

  return sendSuccess(res, 200, order, 'Order status updated successfully');
});

export const getDailyRevenue = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return sendError(res, 400, 'Date is required in query parameters');
  }

  const revenue = await OrderService.getDailyRevenue(req.user.restaurantId, date);

  return sendSuccess(res, 200, revenue, 'Daily revenue fetched successfully');
});

export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return sendError(res, 400, 'Start date and end date are required');
  }

  const revenue = await OrderService.getMonthlyRevenue(req.user.restaurantId, startDate, endDate);

  return sendSuccess(res, 200, revenue, 'Monthly revenue fetched successfully');
});

export const getMostSoldItems = asyncHandler(async (req, res) => {
  const { days } = req.query;

  const items = await OrderService.getMostSoldItems(req.user.restaurantId, parseInt(days) || 30);

  return sendSuccess(res, 200, items, 'Most sold items fetched successfully');
});
