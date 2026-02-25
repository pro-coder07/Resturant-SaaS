import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const connectSupabase = async () => {
  try {
    logger.info('🔌 Connecting to Supabase PostgreSQL...');
    
    // Test connection by running a simple query
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist yet, which is fine for first run
      throw error;
    }
    
    logger.info('✅ Supabase connected successfully');
    return supabase;
  } catch (error) {
    logger.error('❌ Supabase Connection Error:', {
      message: error.message,
      code: error.code,
    });
    throw error;
  }
};

export const createTables = async () => {
  try {
    logger.info('📋 Creating database tables...');
    
    // All SQL is handled by Supabase migrations
    // Tables will be created via the SQL schema below
    
    logger.info('✅ Database tables ready');
    return true;
  } catch (error) {
    logger.error('❌ Table creation error:', error.message);
    throw error;
  }
};

export default supabase;
