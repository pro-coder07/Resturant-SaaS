import logger from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user?.email,
    restaurantId: req.restaurantId,
  });

  // Handle Joi validation errors
  if (err.isJoi) {
    const message = err.details.map(d => d.message).join(', ');
    return sendError(res, 400, 'Validation error', {
      details: err.details,
    });
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map(e => e.message);
    return sendError(res, 400, 'Validation error', {
      details: messages,
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists`);
  }

  // Handle custom AppError
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return sendError(res, statusCode, message);
};

// Catch 404 errors
export const notFoundHandler = (req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  return sendError(res, 404, `Route not found: ${req.method} ${req.path}`);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
