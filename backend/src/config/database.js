import logger from '../utils/logger.js';

/**
 * Database configuration
 * Using Supabase PostgreSQL as the primary database
 * All data operations go through Supabase client
 */

const connectDB = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not defined in environment variables');
    }

    logger.info('✅ Using Supabase PostgreSQL database');
    logger.info(`📍 Database URL: ${supabaseUrl}`);
    
    return { connected: true, type: 'supabase' };
  } catch (error) {
    logger.error('❌ Database configuration error:', error.message);
    throw error;
  }
};

export default connectDB;
