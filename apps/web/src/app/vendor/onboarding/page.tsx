import type { Metadata } from 'next';
import VendorOnboardingContent from '@/components/vendor/onboarding/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor Onboarding | UniNest',
  description: 'Complete verification, catalog setup, and launch tasks to go live.',
};

export default async function VendorOnboardingPage() {
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

  return <VendorOnboardingContent />;
}
