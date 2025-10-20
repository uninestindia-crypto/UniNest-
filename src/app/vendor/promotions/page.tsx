import type { Metadata } from 'next';
import VendorPromotionsContent from '@/components/vendor/promotions/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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

  return <VendorPromotionsContent />;
}
