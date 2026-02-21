import type { Metadata } from 'next';
import VendorOnboardingContent from '@/components/vendor/onboarding/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'List Your Student Business Free | Uninest Vendor Registration',
  description: 'Register your hostel, library, food mess, or student product business on Uninest. Reach thousands of college students. Free to start. AI tools included.',
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
