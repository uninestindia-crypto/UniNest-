import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderStatus } from '@uninest/shared-types';

/**
 * Orders API module
 */
export function createOrdersApi(supabase: SupabaseClient) {
    return {
        /**
         * Get orders for a buyer
         */
        async getBuyerOrders(buyerId: string): Promise<Order[]> {
            const { data, error } = await supabase
                .from('orders')
                .select(
                    `
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            seat_number,
            products (name, image_url)
          ),
          buyer:profiles!buyer_id (id, full_name, avatar_url, handle)
        `
                )
                .eq('buyer_id', buyerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Order[];
        },

        /**
         * Get orders for a vendor
         */
        async getVendorOrders(vendorId: string): Promise<Order[]> {
            const { data, error } = await supabase
                .from('orders')
                .select(
                    `
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            seat_number,
            products (name, image_url)
          ),
          buyer:profiles!buyer_id (id, full_name, avatar_url, handle)
        `
                )
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Order[];
        },

        /**
         * Get a single order by ID
         */
        async getOrder(orderId: number): Promise<Order | null> {
            const { data, error } = await supabase
                .from('orders')
                .select(
                    `
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            seat_number,
            products (name, image_url)
          ),
          buyer:profiles!buyer_id (id, full_name, avatar_url, handle)
        `
                )
                .eq('id', orderId)
                .single();

            if (error) throw error;
            return data as Order;
        },

        /**
         * Update order status (for vendors)
         */
        async updateOrderStatus(
            orderId: number,
            status: OrderStatus
        ): Promise<void> {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;
        },

        /**
         * Create a new order
         */
        async createOrder(order: {
            buyer_id: string;
            vendor_id: string;
            total_amount: number;
            razorpay_payment_id: string;
            booking_date?: string;
            booking_slot?: string;
            items: {
                product_id: number;
                quantity: number;
                price: number;
                seat_number?: number;
            }[];
        }): Promise<Order> {
            // Start a transaction-like operation
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: order.buyer_id,
                    vendor_id: order.vendor_id,
                    total_amount: order.total_amount,
                    razorpay_payment_id: order.razorpay_payment_id,
                    booking_date: order.booking_date,
                    booking_slot: order.booking_slot,
                    status: 'pending_approval',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = order.items.map((item) => ({
                order_id: orderData.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                seat_number: item.seat_number,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Return the full order
            return this.getOrder(orderData.id) as Promise<Order>;
        },
    };
}
