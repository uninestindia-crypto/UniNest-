import type { Metadata } from 'next';
import VendorSubscriptionContent from '@/components/vendor/subscription/subscription-content';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor Subscription | UniNest',
  description: 'Manage your UniNest vendor subscription, trials, and billing access.',
};

export default async function VendorSubscriptionPage() {
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

  return <VendorSubscriptionContent />;
}
