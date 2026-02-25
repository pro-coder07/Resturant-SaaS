import logger from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';
import { ROLE_PERMISSIONS } from '../constants/index.js';

export const tenantIsolation = (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    // Extract restaurantId from JWT
    req.restaurantId = req.user.restaurantId;
    
    if (!req.restaurantId) {
      return sendError(res, 400, 'Restaurant ID not found in token');
    }

    // Accept string UUIDs from Supabase
    logger.info(`✅ Tenant isolation applied for: ${req.restaurantId}`);
    next();
  } catch (error) {
    logger.error('Tenant isolation error:', error);
    return sendError(res, 500, 'Tenant isolation failed');
  }
};

export const checkPermission = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return sendError(res, 401, 'User role not found');
      }

      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.length === 0 ||
        requiredPermissions.some(perm => userPermissions.includes(perm));

      if (!hasPermission) {
        logger.warn(`Permission denied for user ${req.user.email} with role ${userRole}`);
        return sendError(res, 403, 'Insufficient permissions for this action', {
          requiredPermissions,
          userRole,
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return sendError(res, 500, 'Permission check failed');
    }
  };
};

// Verify that restaurantId in request matches user's restaurantId
export const verifyRequestRestaurantId = (req, res, next) => {
  try {
    const requestRestaurantId = req.body.restaurantId || req.params.restaurantId || req.query.restaurantId;
    
    if (requestRestaurantId && requestRestaurantId !== req.restaurantId.toString()) {
      logger.warn(`Tenant boundary violation attempt by user ${req.user.email}`);
      return sendError(res, 403, 'Cannot access other restaurants data');
    }

    next();
  } catch (error) {
    logger.error('Restaurant verification error:', error);
    return sendError(res, 500, 'Restaurant verification failed');
  }
};
