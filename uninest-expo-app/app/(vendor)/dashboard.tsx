import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/state/stores/authStore';
import { useVendorDashboardStore } from '@/state/stores/vendorDashboardStore';
import { VendorDashboardHeader } from '@/components/vendor/dashboard/VendorDashboardHeader';
import { SummaryMetricsGrid } from '@/components/vendor/dashboard/SummaryMetricsGrid';
import { PricingInsightsCard } from '@/components/vendor/dashboard/PricingInsightsCard';
import { BookingPaymentsCard } from '@/components/vendor/dashboard/BookingPaymentsCard';
import { CRMLeadsCard } from '@/components/vendor/dashboard/CRMLeadsCard';
import { MarketingBoostersCard } from '@/components/vendor/dashboard/MarketingBoostersCard';
import { AIListingOptimizerCard } from '@/components/vendor/dashboard/AIListingOptimizerCard';
import { TierStatusCard } from '@/components/vendor/dashboard/TierStatusCard';

export default function VendorDashboardScreen() {
  const router = useRouter();
  const { user, vendorCategories, isAuthenticated, loading, fetchProfile } = useAuthStore();
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
  } = useVendorDashboardStore();

  const vendorId = user?.id ?? null;

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (vendorId) {
      initializeDashboard(vendorId);
    }
  }, [isAuthenticated, loading, router, initializeDashboard, vendorId]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <VendorDashboardHeader
        userName={user?.user_metadata?.full_name ?? 'Vendor'}
        categories={vendorCategories}
      />

      {dashboardLoading && (
        <View style={styles.feedbackRow}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.feedbackText}>Loading dashboard insights…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Some metrics use default samples. Confirm Supabase tables are provisioned.
          </Text>
        </View>
      )}

      <SummaryMetricsGrid metrics={summaryMetrics} />

      <View style={styles.twoColumnRow}>
        <PricingInsightsCard days={pricingDays} />
        <CRMLeadsCard leads={crmLeads} quickReplies={quickReplies} />
      </View>

      <BookingPaymentsCard bookingCalendar={bookingCalendar} payouts={payouts} />

      <View style={styles.twoColumnRow}>
        <MarketingBoostersCard boosters={marketingBoosters} />
        <AIListingOptimizerCard highlights={optimizerHighlights} nudges={nudges} />
      </View>

      <TierStatusCard metrics={tierMetrics} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  twoColumnRow: {
    flexDirection: 'column',
    gap: 24,
  },
});
