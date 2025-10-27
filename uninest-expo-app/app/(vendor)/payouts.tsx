import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function VendorPayoutsScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const layout = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  if (isChecking) {
    return (
      <AppShell title="Payouts" subtitle="Fetching payout summary…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Validating vendor credentials…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Payouts"
      subtitle="Track settlements, pending transfers, and reconciliation insights."
    >
      <View style={[styles.row, { flexDirection: layout }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming settlements</Text>
          <Text style={styles.cardCopy}>
            Surface the next scheduled payouts with statuses, amounts, and linked listings. Attach this to the Supabase
            `vendor_payouts` query.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reconciliation alerts</Text>
          <Text style={styles.cardCopy}>
            Highlight records needing attention—failed transfers, docs required, or manual verification.
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transactions ledger</Text>
        <Text style={styles.cardCopy}>
          Display the detailed ledger with filters for time-range and listing. Mirrors the web app’s CSV-ready view.
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
