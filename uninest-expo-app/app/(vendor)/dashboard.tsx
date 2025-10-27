import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useVendorDashboardStore } from '@/state/stores/vendorDashboardStore';
import { VendorDashboardHeader } from '@/components/vendor/dashboard/VendorDashboardHeader';
import { SummaryMetricsGrid } from '@/components/vendor/dashboard/SummaryMetricsGrid';
import { PricingInsightsCard } from '@/components/vendor/dashboard/PricingInsightsCard';
import { BookingPaymentsCard } from '@/components/vendor/dashboard/BookingPaymentsCard';
import { CRMLeadsCard } from '@/components/vendor/dashboard/CRMLeadsCard';
import { MarketingBoostersCard } from '@/components/vendor/dashboard/MarketingBoostersCard';
import { AIListingOptimizerCard } from '@/components/vendor/dashboard/AIListingOptimizerCard';
import { TierStatusCard } from '@/components/vendor/dashboard/TierStatusCard';
import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { spacing } from '@/theme/tokens';

export default function VendorDashboardScreen() {
  const {
    user,
    vendorCategories,
    isAuthenticated,
    isChecking,
  } = useAuthGuard({ requireVendor: true });
  const {
    initializeDashboard,
    loading: dashboardLoading,
    error,
    summaryMetrics,
    pricingDays,
    bookingCalendar,
    payouts,
    crmLeads,
    quickReplies,
    marketingBoosters,
    optimizerHighlights,
    nudges,
    tierMetrics,
    refreshDashboard,
  } = useVendorDashboardStore();

  const vendorId = user?.id ?? null;
  const splitDirection = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  useEffect(() => {
    if (isChecking) {
      return;
    }

    if (vendorId) {
      initializeDashboard(vendorId);
    }
  }, [initializeDashboard, isChecking, vendorId]);

  if (isChecking) {
    return (
      <AppShell title="Vendor HQ" subtitle="Loading your workspace…" isLoading>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.feedbackText}>Preparing your dashboard…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Vendor HQ"
      subtitle="Keep occupancy, pricing, conversations, and payouts aligned from a single clean workspace."
      isLoading={dashboardLoading}
      onRefresh={refreshDashboard}
    >
      <VendorDashboardHeader
        userName={user?.user_metadata?.full_name ?? 'Vendor'}
        categories={vendorCategories}
      />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Some metrics use default samples. Confirm Supabase tables are provisioned.
          </Text>
        </View>
      )}

      <SummaryMetricsGrid metrics={summaryMetrics} />

      <View style={[styles.splitRow, { flexDirection: splitDirection }]}> 
        <View style={styles.splitItem}>
          <PricingInsightsCard days={pricingDays} />
        </View>
        <View style={styles.splitItem}>
          <CRMLeadsCard leads={crmLeads} quickReplies={quickReplies} />
        </View>
      </View>

      <View style={styles.singleRow}>
        <BookingPaymentsCard bookingCalendar={bookingCalendar} payouts={payouts} />
      </View>

      <View style={[styles.splitRow, { flexDirection: splitDirection }]}> 
        <View style={styles.splitItem}>
          <MarketingBoostersCard boosters={marketingBoosters} />
        </View>
        <View style={styles.splitItem}>
          <AIListingOptimizerCard highlights={optimizerHighlights} nudges={nudges} />
        </View>
      </View>

      <View style={styles.singleRow}>
        <TierStatusCard metrics={tierMetrics} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  feedbackText: {
    fontSize: 14,
    color: '#475569',
  },
  errorBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
    padding: 16,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b45309',
  },
  errorHint: {
    fontSize: 12,
    color: '#92400e',
  },
  splitRow: {
    width: '100%',
    gap: spacing.xl,
  },
  splitItem: {
    flex: 1,
    minWidth: 0,
  },
  singleRow: {
    width: '100%',
  },
});
