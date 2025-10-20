'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import { AlertTriangle, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

const TRIAL_MONTHS = 3;

export default function VendorSubscriptionContent() {
  const { toast } = useToast();
  const { user, supabase, loading, vendorCategories: userVendorCategories } = useAuth();
  const { openCheckout } = useRazorpay();
  const [monetizationSettings, setMonetizationSettings] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  useEffect(() => {
    const fetchMonetization = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load subscription settings.' });
        return;
      }

      setMonetizationSettings(data?.value);
    };

    fetchMonetization();
  }, [supabase, toast]);

  const vendorCategories = useMemo(() => {
    if (userVendorCategories && userVendorCategories.length > 0) {
      return userVendorCategories;
    }
    return (user?.user_metadata?.vendor_categories ?? []) as string[];
  }, [user, userVendorCategories]);

  const vendorCategoryCount = vendorCategories.length;
  const pricePerService = monetizationSettings?.vendor?.price_per_service_per_month ?? 0;
  const totalCost = vendorCategoryCount * pricePerService;
  const monetizationStartDate = monetizationSettings?.start_date
    ? new Date(monetizationSettings.start_date)
    : null;
  const monetizationHasStarted = !monetizationStartDate || new Date() >= monetizationStartDate;
  const isChargeEnabled = Boolean(monetizationSettings?.vendor?.charge_for_platform_access && monetizationHasStarted);

  const rawVendorActive = Boolean(user?.user_metadata?.is_vendor_active);
  const vendorTrialStartedAt = user?.user_metadata?.vendor_trial_started_at
    ? new Date(user.user_metadata.vendor_trial_started_at)
    : null;
  const vendorTrialExpiresAt = user?.user_metadata?.vendor_trial_expires_at
    ? new Date(user.user_metadata.vendor_trial_expires_at)
    : null;
  const isTrialActive = vendorTrialExpiresAt ? new Date() <= vendorTrialExpiresAt : false;
  const isTrialEligible = !vendorTrialStartedAt;
  const hasRecordedPayment = Boolean(user?.user_metadata?.last_payment_id);
  const isVendorActive = rawVendorActive && (isTrialActive || hasRecordedPayment);
  const shouldCharge = isChargeEnabled && vendorCategoryCount > 0;
  const requiresImmediatePayment =
    shouldCharge && !isTrialEligible && !isTrialActive && !isVendorActive && totalCost > 0;
  const showPaymentAlert = shouldCharge && !isVendorActive && vendorCategoryCount > 0;
  const formattedTrialEnd = vendorTrialExpiresAt
    ? vendorTrialExpiresAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;
  const canCancelSubscription = isVendorActive || isTrialActive;

  const statusLabel = (() => {
    if (isVendorActive) return 'Active';
    if (isTrialActive) return formattedTrialEnd ? `Trial until ${formattedTrialEnd}` : 'Trial running';
    if (showPaymentAlert) return 'Activation pending';
    if (isTrialEligible) return 'Free trial available';
    return 'Inactive';
  })();

  const statusHelper = (() => {
    if (isVendorActive && hasRecordedPayment) return 'Auto-renews monthly.';
    if (isVendorActive && isTrialActive) return 'Trial live with full access.';
    if (isTrialActive && !isVendorActive) return 'Finish setup to unlock your trial.';
    if (showPaymentAlert) return 'Complete payment to go live.';
    if (isTrialEligible) return 'Start your free trial after adding services.';
    return 'Reactivate from here anytime.';
  })();

  const ctaLabel = (() => {
    if (!shouldCharge && isVendorActive) return 'Subscription active';
    if (shouldCharge && isTrialEligible) return 'Start free trial';
    if (requiresImmediatePayment) return `Pay ₹${totalCost.toLocaleString('en-IN')}/mo`;
    if (shouldCharge && totalCost > 0) return `Pay ₹${totalCost.toLocaleString('en-IN')}/mo`;
    if (!isVendorActive) return 'Activate access';
    return 'Manage subscription';
  })();

  const isPrimaryDisabled =
    isActionLoading || vendorCategoryCount === 0 || (!shouldCharge && isVendorActive);

  const ensureAuthReady = () => {
    if (!user || !supabase) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please log in again.' });
      return false;
    }
    return true;
  };

  const updateMetadata = async (updates: Record<string, any>) => {
    if (!ensureAuthReady() || !user || !supabase) throw new Error('Not authenticated.');

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...(user.user_metadata || {}),
        vendor_categories: vendorCategories,
        ...updates,
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }
  };

  const handleStartTrial = async () => {
    if (!ensureAuthReady()) return;
    if (!isTrialEligible) {
      toast({ title: 'Trial unavailable', description: 'Free trial has already been used.' });
      return;
    }

    setIsActionLoading(true);
    try {
      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + TRIAL_MONTHS);

      await updateMetadata({
        is_vendor_active: true,
        vendor_trial_started_at: start.toISOString(),
        vendor_trial_expires_at: end.toISOString(),
        vendor_subscription_start_at: null,
        vendor_subscription_end_at: null,
      });

      toast({ title: 'Trial started', description: `Enjoy ${TRIAL_MONTHS} months on us.` });
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start trial.';
      toast({ variant: 'destructive', title: 'Trial error', description: message });
      setIsActionLoading(false);
    }
  };

  const handleActivateWithoutPayment = async () => {
    if (!ensureAuthReady()) return;

    setIsActionLoading(true);
    try {
      const now = new Date();
      await updateMetadata({
        is_vendor_active: true,
        vendor_subscription_start_at: now.toISOString(),
      });
      toast({ title: 'Access activated', description: 'You are now visible on UniNest.' });
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not activate access.';
      toast({ variant: 'destructive', title: 'Activation error', description: message });
      setIsActionLoading(false);
    }
  };

  const handlePaidActivation = async () => {
    if (!ensureAuthReady()) return;

    setIsActionLoading(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalCost * 100, currency: 'INR' }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');

      const paidAmount = order.amount / 100;

      openCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'UniNest Vendor Subscription',
        description: `Monthly access for ${vendorCategoryCount} service${vendorCategoryCount === 1 ? '' : 's'}.`,
        order_id: order.id,
        handler: async (paymentResponse: any, accessToken: string) => {
          if (!ensureAuthReady()) {
            setIsActionLoading(false);
            return;
          }

          try {
            const billingStart = new Date();
            const billingEnd = new Date(billingStart);
            billingEnd.setMonth(billingEnd.getMonth() + 1);

            const verificationResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                orderId: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                type: 'vendor_subscription',
                amount: paidAmount,
                servicesCount: vendorCategoryCount,
                categories: vendorCategories,
                currency: order.currency,
                billingPeriodStart: billingStart.toISOString(),
                billingPeriodEnd: billingEnd.toISOString(),
              }),
            });

            const verificationResult = await verificationResponse.json();
            if (!verificationResponse.ok) {
              throw new Error(verificationResult.error || 'Failed to verify payment.');
            }

            const subscription = verificationResult.subscription ?? {
              billingPeriodStart: billingStart.toISOString(),
              billingPeriodEnd: billingEnd.toISOString(),
            };

            await updateMetadata({
              is_vendor_active: true,
              last_payment_id: paymentResponse.razorpay_payment_id,
              vendor_subscription_start_at: subscription.billingPeriodStart,
              vendor_subscription_end_at: subscription.billingPeriodEnd,
            });

            toast({ title: 'Payment successful', description: 'Subscription renewed successfully.' });
            window.location.reload();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to verify payment.';
            toast({ variant: 'destructive', title: 'Payment error', description: message });
            setIsActionLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsActionLoading(false);
          },
        },
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
        },
        notes: { type: 'vendor_subscription', userId: user?.id },
        theme: { color: '#4A90E2' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect to payment gateway.';
      toast({ variant: 'destructive', title: 'Payment error', description: message });
      setIsActionLoading(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (vendorCategoryCount === 0) {
      toast({ variant: 'destructive', title: 'Add services first', description: 'Choose at least one service in settings.' });
      return;
    }

    if (shouldCharge) {
      if (isTrialEligible) {
        await handleStartTrial();
        return;
      }

      await handlePaidActivation();
      return;
    }

    if (!isVendorActive) {
      await handleActivateWithoutPayment();
      return;
    }

    toast({ title: 'All set', description: 'Your subscription is already active.' });
  };

  const handleCancelSubscription = async () => {
    if (!ensureAuthReady()) return;
    if (!canCancelSubscription) {
      toast({ title: 'Nothing to cancel', description: 'Your subscription is already inactive.' });
      return;
    }

    setIsCancelLoading(true);
    try {
      await updateMetadata({
        is_vendor_active: false,
        vendor_trial_started_at: null,
        vendor_trial_expires_at: null,
        last_payment_id: null,
        vendor_subscription_start_at: null,
        vendor_subscription_end_at: null,
      });

      toast({ title: 'Subscription paused', description: 'You can reactivate anytime.' });
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not cancel subscription.';
      toast({ variant: 'destructive', title: 'Cancellation error', description: message });
      setIsCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="mr-2 size-5 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading subscription details...</span>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-sm text-muted-foreground">Please log in to manage your subscription.</div>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          Subscription
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Keep your listings live</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review plan status, start a trial, or renew access in a few clicks.
        </p>
      </div>

      <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ShieldCheck className="size-5 text-primary" /> Subscription overview
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Short summary of what is active right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Plan status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{statusLabel}</p>
              <p className="text-xs text-slate-500">{statusHelper}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Services selected</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{vendorCategoryCount}</p>
              <p className="text-xs text-slate-500">From vendor settings.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Monthly cost</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {shouldCharge && pricePerService > 0 ? `₹${totalCost.toLocaleString('en-IN')}` : 'Included'}
              </p>
              <p className="text-xs text-slate-500">Auto-calculated per service.</p>
            </div>
          </div>

          {vendorCategoryCount === 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="size-4 text-amber-500" />
              <AlertTitle>Add services to continue</AlertTitle>
              <AlertDescription>Select at least one service in vendor settings to unlock subscription actions.</AlertDescription>
            </Alert>
          )}

          {showPaymentAlert && vendorCategoryCount > 0 && (
            <Alert className="border-primary/30">
              <AlertTriangle className="size-4 text-primary" />
              <AlertTitle>Action needed</AlertTitle>
              <AlertDescription>Complete payment to unlock marketplace visibility.</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>Your selected services determine pricing.</span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Sparkles className="size-3.5 text-primary" />
              Update services anytime from settings.
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handlePrimaryAction} disabled={isPrimaryDisabled} className="min-w-[180px]">
              {isActionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {ctaLabel}
            </Button>
            <Button asChild variant="outline">
              <Link href="/vendor/settings">Manage services</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelSubscription}
              disabled={isCancelLoading || !canCancelSubscription}
            >
              {isCancelLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Pause subscription
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
