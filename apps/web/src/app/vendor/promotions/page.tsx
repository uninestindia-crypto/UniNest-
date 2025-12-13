import type { Metadata } from 'next';
import VendorPromotionsContent from '@/components/vendor/promotions/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { VendorPromotionsByStatus } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Vendor Promotions | UniNest',
  description: 'Manage campaigns, budgets, and performance for your promotions.',
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

  const { data: promotionsSetting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'vendor_promotions')
    .maybeSingle();

  const rawPromotions = promotionsSetting?.value as VendorPromotionsByStatus | null;
  const promotions = Array.isArray(rawPromotions?.active) && Array.isArray(rawPromotions?.scheduled) && Array.isArray(rawPromotions?.completed)
    ? rawPromotions
    : null;

  return <VendorPromotionsContent promotions={promotions} />;
}
