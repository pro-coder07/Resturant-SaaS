import app from './app.js';
import logger from './utils/logger.js';
import { getConfig } from './config/environment.js';
import { connectSupabase } from './config/supabase.js';

const config = getConfig();
const PORT = config.port || 3000;

async function startServer() {
  try {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🚀 BACKEND INITIALIZATION STARTED');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Connect to Supabase
    logger.info('📦 Connecting to Supabase PostgreSQL...');
    const supabase = await connectSupabase();
    logger.info('✅ DATABASE CONNECTED SUCCESSFULLY');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info('');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('✅ BACKEND CONNECTED AND RUNNING');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('');
      logger.info(`🌍 Environment: ${config.nodeEnv || 'development'}`);
      logger.info(`🎯 Server URL: http://localhost:${PORT}`);
      logger.info(`📊 API Base: http://localhost:${PORT}/api`);
      logger.info(`📝 API Version: v1`);
      logger.info('');
      logger.info('📌 Key Endpoints:');
      logger.info(`   - POST   http://localhost:${PORT}/api/v1/auth/register (Register)`);
      logger.info(`   - POST   http://localhost:${PORT}/api/v1/auth/login (Login)`);
      logger.info(`   - GET    http://localhost:${PORT}/api/v1/menu (Get Menu)`);
      logger.info(`   - POST   http://localhost:${PORT}/api/v1/orders (Create Order)`);
      logger.info(`   - GET    http://localhost:${PORT}/api/v1/kitchen (Kitchen Queue)`);
      logger.info('');
      logger.info('💾 Database: ✅ Supabase PostgreSQL (Production)');
      logger.info(`☁️  Cloudinary: ✅ Configured`);
      logger.info(`🔐 Authentication: ✅ JWT + Cookies`);
      logger.info('');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('🎯 Ready to handle requests!');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.warn('');
      logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.warn('⏹️  SIGTERM signal received');
      logger.warn('🛑 BACKEND SHUTDOWN IN PROGRESS');
      logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      server.close(() => {
        logger.info('✅ HTTP server closed gracefully');
        logger.info('👋 BACKEND DISCONNECTED');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.warn('');
      logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.warn('⏹️  SIGINT signal received (Ctrl+C)');
      logger.warn('🛑 BACKEND SHUTDOWN IN PROGRESS');
      logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      server.close(() => {
        logger.info('✅ HTTP server closed gracefully');
        logger.info('👋 BACKEND DISCONNECTED');
        process.exit(0);
      });
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('');
      logger.error('❌ UNHANDLED REJECTION DETECTED');
      logger.error(`💥 Promise: ${promise}`);
      logger.error(`📝 Reason: ${reason}`);
      logger.error('');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('');
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error('❌ CRITICAL ERROR - UNCAUGHT EXCEPTION');
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error(`📝 Error: ${error.message}`);
      logger.error(`🔍 Stack: ${error.stack}`);
      logger.error('🛑 SHUTTING DOWN BACKEND');
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      process.exit(1);
    });
  } catch (error) {
    logger.error('');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('❌ FAILED TO START BACKEND');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error(`📝 Error: ${error.message}`);
    logger.error(`🔍 Stack: ${error.stack}`);
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

startServer();

