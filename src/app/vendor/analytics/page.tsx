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

  return <VendorAnalyticsContent userName={user.user_metadata?.full_name || 'Vendor'} />;
}
