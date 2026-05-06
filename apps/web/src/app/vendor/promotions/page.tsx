import type { Metadata } from 'next';
import VendorPromotionsContent from '@/components/vendor/promotions/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Offers & Discounts | UniNest Vendor',
  description: 'Create simple discount offers for your listings to attract more students.',
};

export default async function VendorPromotionsPage() {
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

  // Fetch this vendor's offers stored in platform_settings keyed by vendor ID
  const { data: offersData } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', `vendor_offers_${user.id}`)
    .maybeSingle();

  // Fetch vendor's products for the offer form dropdown
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, category')
    .eq('seller_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const offers = Array.isArray(offersData?.value) ? offersData.value : [];

  return (
    <VendorPromotionsContent
      vendorId={user.id}
      initialOffers={offers}
      products={products || []}
    />
  );
}
