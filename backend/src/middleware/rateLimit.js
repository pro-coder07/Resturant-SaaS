import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

// Dummy limiter for development (pass-through)
const noOp = (req, res, next) => next();

// General API rate limiter (DISABLED in development)
export const apiLimiter = process.env.NODE_ENV === 'production' ? rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      statusCode: 429,
      message: 'Too many requests, please try again later',
      retryAfter: req.rateLimit.resetTime,
    });
  },
}) : noOp;

// Stricter limiter for authentication endpoints (DISABLED in development)
export const authLimiter = process.env.NODE_ENV === 'production' ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      statusCode: 429,
      message: 'Too many authentication attempts, please try again later',
      retryAfter: req.rateLimit.resetTime,
    });
  },
}) : noOp;

// Limiter for order creation
export const orderLimiter = process.env.NODE_ENV === 'production' ? rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute per restaurant
  keyGenerator: (req) => {
    // Rate limit by restaurantId instead of IP for authenticated requests
    return req.restaurantId?.toString() || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Order rate limit exceeded for restaurant: ${req.restaurantId}`);
    res.status(429).json({
      statusCode: 429,
      message: 'Too many orders, please try again later',
    });
  },
}) : noOp;

export default apiLimiter;
