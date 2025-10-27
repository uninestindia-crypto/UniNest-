import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function VendorPromotionsScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const layout = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  if (isChecking) {
    return (
      <AppShell title="Promotions" subtitle="Preparing campaign tools…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Checking vendor privileges…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Promotions & Boosters"
      subtitle="Launch spotlight campaigns, boost visibility, and track uplift."
    >
      <View style={[styles.row, { flexDirection: layout }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Campaign composer</Text>
          <Text style={styles.cardCopy}>
            Configure listing boosts, seasonal coupons, and student incentives. Wire this section to the Supabase
            promotion tables used on the web dashboard.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance insights</Text>
          <Text style={styles.cardCopy}>
            Present impressions, clicks, and conversion deltas. Fetch the same aggregate view from the `vendor_marketing`
            analytics endpoint.
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Templates</Text>
        <Text style={styles.cardCopy}>
          Offer ready-to-use copy snippets and artwork previews. Mirroring the React experience keeps vendors confident
          across platforms.
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
