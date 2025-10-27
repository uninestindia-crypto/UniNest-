import type { User } from '@supabase/supabase-js';

export function getVendorSubscriptionState(user: User | null) {
  const metadata = user?.user_metadata ?? {};
  const rawVendorActive = Boolean(metadata.is_vendor_active);
  const trialExpiresAt = metadata.vendor_trial_expires_at ? new Date(metadata.vendor_trial_expires_at) : null;
  const subscriptionStartAt = metadata.vendor_subscription_start_at ? new Date(metadata.vendor_subscription_start_at) : null;
  const subscriptionEndAt = metadata.vendor_subscription_end_at ? new Date(metadata.vendor_subscription_end_at) : null;
  const hasRecordedPayment = Boolean(metadata.last_payment_id);

  const now = new Date();
  const trialActive = trialExpiresAt ? now <= trialExpiresAt : false;
  const subscriptionWindowActive = subscriptionEndAt
    ? now <= subscriptionEndAt
    : Boolean(subscriptionStartAt) || hasRecordedPayment;

  const canManageListings = rawVendorActive && (trialActive || subscriptionWindowActive);

  return {
    rawVendorActive,
    trialActive,
    subscriptionWindowActive,
    canManageListings,
  };
}
