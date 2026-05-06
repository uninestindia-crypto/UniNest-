
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

  // Fetch real stats + recent orders
  const [productsResult, ordersResult, recentOrdersResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
    supabase.from('orders').select('total_amount').eq('vendor_id', user.id),
    supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        order_items (
          quantity,
          products ( name )
        ),
        buyer:profiles!buyer_id(
          id, full_name, avatar_url
        )
      `)
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const productsCount = productsResult.count || 0;
  const ordersCount = ordersResult.data?.length || 0;
  const totalRevenue = (ordersResult.data || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const stats = {
    products: productsCount,
    orders: ordersCount,
    revenue: totalRevenue,
  };

  return (
    <VendorDashboardContent
      userName={user.user_metadata?.full_name || 'Vendor'}
      vendorCategories={vendorCategories}
      stats={stats}
      recentOrders={(recentOrdersResult.data as any) || []}
    />
  );
}
