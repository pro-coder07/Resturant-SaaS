import logger from '../utils/logger.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import TableService from '../services/tableService.js';

export const createTable = asyncHandler(async (req, res) => {
  logger.info(`📨 POST /tables - Creating table: ${req.body.tableNumber}`);
  const table = await TableService.createTable(req.user.restaurantId, req.body);

  logger.info(`✅ Table created in controller: ${table.id}`);
  return sendSuccess(res, 201, table, 'Table created successfully');
});

export const createMultipleTables = asyncHandler(async (req, res) => {
  const tables = await TableService.createMultipleTables(req.user.restaurantId, req.body.tables);

  return sendSuccess(res, 201, tables, 'Tables created successfully');
});

export const getTables = asyncHandler(async (req, res) => {
  const filters = {
    isActive: req.query.isActive === 'true' ? true : undefined,
    limit: parseInt(req.query.limit) || 100,
    skip: parseInt(req.query.skip) || 0,
  };

  logger.info(`📨 GET /tables - Fetching tables with filters:`, filters);
  const result = await TableService.getTables(req.user.restaurantId, filters);

  logger.info(`✅ Retrieved ${result.tables?.length || 0} tables`);
  return sendSuccess(res, 200, result, 'Tables fetched successfully');
});

export const getTableByQRCode = asyncHandler(async (req, res) => {
  // This is for customer accessing via QR code (no auth)
  const { qrCodeData } = req.params;

  // First verify this is a valid QR code for a restaurant
  const table = await TableService.getTableByQRCode(req.user?.restaurantId, qrCodeData);

  return sendSuccess(res, 200, table, 'Table fetched successfully');
});

export const updateTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  logger.info(`📨 PUT /tables/${tableId} - Updating table with data:`, req.body);

  const table = await TableService.updateTable(req.user.restaurantId, tableId, req.body);

  logger.info(`✅ Table updated: ${tableId}`);
  return sendSuccess(res, 200, table, 'Table updated successfully');
});

export const deleteTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  logger.info(`📨 DELETE /tables/${tableId} - Deleting table`);

  const result = await TableService.deleteTable(req.user.restaurantId, tableId);

  logger.info(`✅ Table deleted: ${tableId}`);
  return sendSuccess(res, 200, result, 'Table deleted successfully');
});

export const generateQRUrls = asyncHandler(async (req, res) => {
  const { tableIds } = req.body;

  const qrUrls = await Promise.all(
    tableIds.map(tableId => TableService.generateQRUrl(req.user.restaurantId, tableId))
  );

  return sendSuccess(res, 200, qrUrls, 'QR URLs generated successfully');
});
