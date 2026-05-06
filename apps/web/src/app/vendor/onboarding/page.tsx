import type { Metadata } from 'next';
import VendorOnboardingContent from '@/components/vendor/onboarding/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Get Started | Uninest Vendor',
  description: 'Complete your vendor setup and start reaching students on UniNest.',
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

  // Check what the vendor has completed
  const [productsResult, subscriptionResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
    Promise.resolve({
      isActive: Boolean(user.user_metadata?.is_vendor_active),
      isTrialActive: user.user_metadata?.vendor_trial_expires_at
        ? new Date() <= new Date(user.user_metadata.vendor_trial_expires_at)
        : false,
    }),
  ]);

  const checklistStatus = {
    hasProfile: Boolean(user.user_metadata?.full_name && user.user_metadata?.contact_number),
    hasAvatar: Boolean(user.user_metadata?.avatar_url),
    hasCategories: (user.user_metadata?.vendor_categories?.length || 0) > 0,
    hasListing: (productsResult.count || 0) > 0,
    hasActiveSubscription: subscriptionResult.isActive || subscriptionResult.isTrialActive,
  };

  return (
    <VendorOnboardingContent
      userName={user.user_metadata?.full_name || 'Vendor'}
      checklistStatus={checklistStatus}
    />
  );
}
