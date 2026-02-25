import logger from '../utils/logger.js';

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  logger.info('✅ All required environment variables are set');
};

export const getConfig = () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  apiVersion: process.env.API_VERSION || 'v1',
});
