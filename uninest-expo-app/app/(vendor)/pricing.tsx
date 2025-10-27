import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function VendorPricingScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const layout = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  if (isChecking) {
    return (
      <AppShell title="Dynamic Pricing" subtitle="Loading rate intelligence…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Fetching vendor pricing access…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dynamic Pricing"
      subtitle="Balance occupancy, seasonal trends, and competitor rates with AI-backed guidance."
    >
      <View style={[styles.row, { flexDirection: layout }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate suggestions</Text>
          <Text style={styles.cardCopy}>
            Present your daily recommendations. Tie this screen to the Supabase `vendor_pricing_insights` RPC to show
            the same uplift indicators already live on the web dashboard.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Demand heatmap</Text>
          <Text style={styles.cardCopy}>
            Render the weekly heatmap of demand and competitor rate benchmarks. Use `react-native-svg` or Lottie as
            needed to mirror the analytics flair of the web counterpart.
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bulk updates</Text>
        <Text style={styles.cardCopy}>
          Allow quick adjustments to price bands, minimum stays, and promo codes. This is connected to the same Supabase
          mutation endpoint as the React app.
        </Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  loader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  loaderCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
  row: {
    width: '100%',
    gap: spacing.xl,
  },
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowColor: '#00000014',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardTitle: {
    ...typography.headingMd,
    color: colors.textPrimary,
  },
  cardCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
