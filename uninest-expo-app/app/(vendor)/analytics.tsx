import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function VendorAnalyticsScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const layout = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  if (isChecking) {
    return (
      <AppShell title="Analytics" subtitle="Loading insights…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Calibrating analytics workspace…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Analytics"
      subtitle="Review performance across occupancy, revenue, and campaigns."
    >
      <View style={[styles.row, { flexDirection: layout }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Occupancy trends</Text>
          <Text style={styles.cardCopy}>
            Mirror the React line charts with weekly and monthly snapshots. Integrate `vendor_metrics_summary` to feed
            real data.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Channel mix</Text>
          <Text style={styles.cardCopy}>
            Display bookings sourced from marketplace vs. direct conversions. Hook into Supabase analytics views.
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Experiment results</Text>
        <Text style={styles.cardCopy}>
          Surface A/B test outcomes and listing experiments. Reuse the AI optimizer signals already exposed in the web
          UI.
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
