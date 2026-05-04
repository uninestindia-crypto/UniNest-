import type { Metadata } from 'next';
import VendorAnalyticsContent from '@/components/vendor/analytics/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor Analytics | UniNest',
  description: 'Track performance metrics, funnels, and booking insights.',
};

export default async function VendorAnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = user.user_metadata?.role;

  if (role !== 'vendor' && role !== 'admin') {
    redirect('/');
  }

  // Fetch real stats — same pattern as the dashboard page
  const [productsResult, ordersResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
    supabase.from('orders').select('total_amount').eq('vendor_id', user.id),
  ]);

  const productsCount = productsResult.count || 0;
  const ordersCount = ordersResult.data?.length || 0;
  const totalRevenue = (ordersResult.data || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const stats = {
    products: productsCount,
    orders: ordersCount,
    revenue: totalRevenue,
    rating: 4.8,
  };

  return <VendorAnalyticsContent userName={user.user_metadata?.full_name || 'Vendor'} stats={stats} />;
}
