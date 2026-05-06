import type { Metadata } from 'next';
import VendorAnalyticsContent from '@/components/vendor/analytics/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor Analytics | UniNest',
  description: 'Track your revenue, orders, and business performance.',
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

  // Fetch detailed orders for analytics (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [productsResult, ordersResult, reviewsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, status, created_at', { count: 'exact' })
      .eq('seller_id', user.id),
    supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('vendor_id', user.id)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
    supabase
      .from('product_reviews')
      .select('rating, product_id')
      .in(
        'product_id',
        (await supabase.from('products').select('id').eq('seller_id', user.id)).data?.map((p: any) => p.id) || []
      ),
  ]);

  const orders = ordersResult.data || [];
  const allProducts = productsResult.data || [];
  const reviews = reviewsResult.data || [];

  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
      : null;

  return (
    <VendorAnalyticsContent
      userName={user.user_metadata?.full_name || 'Vendor'}
      orders={orders}
      products={allProducts}
      avgRating={avgRating}
      reviewCount={reviews.length}
    />
  );
}
