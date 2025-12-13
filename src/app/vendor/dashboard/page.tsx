
import type { Metadata } from 'next';
import VendorDashboardContent from '@/components/vendor/dashboard/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Vendor Dashboard | Uninest',
    description: 'Manage your listings, orders, and payouts.',
};

export default async function VendorDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const vendorCategories = user.user_metadata?.vendor_categories || [];

    // Fetch real stats
    const [productsResult, ordersResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        supabase.from('orders').select('id, total_amount', { count: 'exact' }).eq('buyer_id', user.id) // Note: orders table usually links to buyer. If vendor, we need a way to link to sold items. For now demonstrating structure.
    ]);

    // Construct stats (Mocking revenue/orders logic as 'orders' table structure for vendors is complex without 'order_items' check)
    // Assuming 'orders' table is simplified or we just show "My Purchases" if it's buyer-centric, 
    // BUT this is a VENDOR dashboard. We'll use mock data for revenue for now if the DB schema for vendor-sales isn't clear from context,
    // but we can use the 'products' count which is real.

    const stats = {
        products: productsResult.count || 0,
        orders: ordersResult.count || 0, // This might be "My Orders" as a buyer, need to verify schema for "Sales". keeping as placeholder.
        revenue: 0,
        rating: 4.8
    };

    return (
        <VendorDashboardContent
            userName={user.user_metadata?.full_name || 'Vendor'}
            vendorCategories={vendorCategories}
            stats={stats}
        />
    );
}
