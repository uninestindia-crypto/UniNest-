import type { Profile } from './user';

/**
 * Order status enum
 */
export type OrderStatus = 'pending_approval' | 'approved' | 'rejected' | 'completed';

/**
 * Order item within an order
 */
export type OrderItem = {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    products: {
        name: string;
        image_url: string | null;
    };
    seat_number?: number;
    library_id?: number;
};

/**
 * Full order type
 */
export type Order = {
    id: number;
    created_at: string;
    buyer_id: string;
    vendor_id: string;
    total_amount: number;
    razorpay_payment_id: string;
    status: OrderStatus | null;
    booking_date?: string | null;
    booking_slot?: string | null;
    order_items: OrderItem[];
    buyer: Profile;
};
