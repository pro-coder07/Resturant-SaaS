import logger from '../utils/logger.js';
import supabase from '../config/supabase.js';

export class RestaurantService {
  // ============ RESTAURANT MANAGEMENT ============

  static async createRestaurant(restaurantData) {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert([{
          business_name: restaurantData.businessName,
          email: restaurantData.email,
          password_hash: restaurantData.passwordHash,
          phone: restaurantData.phone || '',
          address: restaurantData.address || '',
          city: restaurantData.city || '',
          cuisine_type: restaurantData.cuisineType || '',
          subscription_status: 'active',
          subscription_start: new Date(),
        }])
        .select()
        .single();

      if (error) throw error;

      logger.info(`✅ Restaurant created: ${restaurant.id}`);
      return restaurant;
    } catch (error) {
      logger.error('❌ Create restaurant error:', error);
      throw error;
    }
  }

  static async getRestaurantById(restaurantId) {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error || !restaurant) throw error || new Error('Restaurant not found');

      return restaurant;
    } catch (error) {
      logger.error('❌ Get restaurant error:', error);
      throw error;
    }
  }

  static async updateRestaurant(restaurantId, updateData) {
    try {
      const updateFields = {
        updated_at: new Date(),
      };

      if (updateData.businessName) updateFields.business_name = updateData.businessName;
      if (updateData.phone) updateFields.phone = updateData.phone;
      if (updateData.address) updateFields.address = updateData.address;
      if (updateData.city) updateFields.city = updateData.city;
      if (updateData.cuisineType) updateFields.cuisine_type = updateData.cuisineType;

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update(updateFields)
        .eq('id', restaurantId)
        .select()
        .single();

      if (error || !restaurant) throw error || new Error('Restaurant not found');

      logger.info(`✅ Restaurant updated: ${restaurantId}`);
      return restaurant;
    } catch (error) {
      logger.error('❌ Update restaurant error:', error);
      throw error;
    }
  }

  static async getRestaurantStats(restaurantId) {
    try {
      // Get orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      if (ordersError) throw ordersError;

      // Get menu items count
      const { count: menuItemsCount, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('status', 'active');

      if (menuError) throw menuError;

      // Get tables count
      const { count: tablesCount, error: tablesError } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      if (tablesError) throw tablesError;

      // Get staff count
      const { count: staffCount, error: staffError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('role', 'staff');

      if (staffError) throw staffError;

      return {
        totalOrders: ordersCount || 0,
        menuItemsCount: menuItemsCount || 0,
        tablesCount: tablesCount || 0,
        staffCount: staffCount || 0,
      };
    } catch (error) {
      logger.error('❌ Get restaurant stats error:', error);
      throw error;
    }
  }

  static async updateSubscriptionStatus(restaurantId, status) {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update({
          subscription_status: status,
          updated_at: new Date(),
        })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error || !restaurant) throw error || new Error('Restaurant not found');

      logger.info(`✅ Subscription status updated: ${restaurantId} → ${status}`);
      return restaurant;
    } catch (error) {
      logger.error('❌ Update subscription error:', error);
      throw error;
    }
  }

  static async getRestaurantByEmail(email) {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('email', email)
        .single();

      if (error?.code === 'PGRST116') {
        return null; // No restaurant found
      }

      if (error) throw error;

      return restaurant;
    } catch (error) {
      logger.error('❌ Get restaurant by email error:', error);
      throw error;
    }
  }

  static async deleteRestaurant(restaurantId) {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);

      if (error) throw error;

      logger.info(`✅ Restaurant deleted: ${restaurantId}`);
      return { message: 'Restaurant deleted successfully' };
    } catch (error) {
      logger.error('❌ Delete restaurant error:', error);
      throw error;
    }
  }

  static async getAllRestaurants() {
    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, business_name, email, subscription_status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return restaurants || [];
    } catch (error) {
      logger.error('❌ Get all restaurants error:', error);
      throw error;
    }
  }
}

export default RestaurantService;
