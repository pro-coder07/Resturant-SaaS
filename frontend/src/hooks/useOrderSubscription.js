import { useEffect, useCallback } from 'react';
import supabase from '../config/supabase';

/**
 * Hook for real-time order updates using Supabase subscriptions
 * @param {string} restaurantId - Restaurant ID to subscribe to
 * @param {Function} onOrderUpdate - Callback when orders change
 * @param {string} status - Optional status filter (e.g., 'pending', 'preparing')
 */
export const useOrderSubscription = (restaurantId, onOrderUpdate, status = null) => {
  useEffect(() => {
    if (!restaurantId) return;

    // Subscribe to order changes
    const subscription = supabase
      .from('orders')
      .on('*', (payload) => {
        console.log('🔔 Real-time order update:', payload);

        // Filter by restaurant if needed
        if (payload.new?.restaurant_id === restaurantId) {
          onOrderUpdate(payload);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurantId, onOrderUpdate]);
};

/**
 * Hook for real-time order items updates
 * @param {string} orderId - Order ID to subscribe to
 * @param {Function} onItemsUpdate - Callback when items change
 */
export const useOrderItemsSubscription = (orderId, onItemsUpdate) => {
  useEffect(() => {
    if (!orderId) return;

    const subscription = supabase
      .from('order_items')
      .on('*', (payload) => {
        console.log('🔔 Real-time order items update:', payload);

        if (payload.new?.order_id === orderId || payload.old?.order_id === orderId) {
          onItemsUpdate(payload);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId, onItemsUpdate]);
};

/**
 * Hook to get real-time order count by status
 * @param {string} restaurantId - Restaurant ID
 * @param {Function} onCountUpdate - Callback with counts
 */
export const useOrderCountSubscription = (restaurantId, onCountUpdate) => {
  useEffect(() => {
    if (!restaurantId) return;

    const subscription = supabase
      .from('orders')
      .on('*', async (payload) => {
        // Refetch counts when any order changes
        if (payload.new?.restaurant_id === restaurantId) {
          try {
            const { data: orders, error } = await supabase
              .from('orders')
              .select('status')
              .eq('restaurant_id', restaurantId);

            if (!error && orders) {
              const counts = {
                pending: orders.filter(o => o.status === 'pending').length,
                preparing: orders.filter(o => o.status === 'preparing').length,
                ready: orders.filter(o => o.status === 'ready').length,
                completed: orders.filter(o => o.status === 'completed').length,
              };
              onCountUpdate(counts);
            }
          } catch (err) {
            console.error('Error fetching order counts:', err);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurantId, onCountUpdate]);
};
