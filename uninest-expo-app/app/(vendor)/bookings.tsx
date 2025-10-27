import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';
import { useToast } from '@/providers/ToastProvider';

export default function VendorBookingsScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const layoutDirection = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';
  const { showToast } = useToast();

  useEffect(() => {
    showToast({
      title: 'Bookings in progress',
      message: 'Connect this screen to Supabase bookings endpoints to see live data.',
      variant: 'info',
      duration: 3500,
    });
  }, [showToast]);

  if (isChecking) {
    return (
      <AppShell title="Bookings" subtitle="Loading vendor bookings workspace…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Verifying vendor access…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Bookings"
      subtitle="Track inquiries, confirmations, and stay extensions in one place."
    >
      <View style={[styles.placeholderRow, { flexDirection: layoutDirection }]}> 
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Daily schedule</Text>
          <Text style={styles.placeholderCopy}>
            Integrate your live booking calendar and upcoming check-ins. This module mirrors the web dashboard
            timeline with quick room assignment shortcuts.
          </Text>
        </View>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Pipeline heatmap</Text>
          <Text style={styles.placeholderCopy}>
            Visualize occupancy pace, hold requests, and pending approvals. Alerts show when to adjust pricing
            or release waitlisted leads.
          </Text>
        </View>
      </View>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Automation queue</Text>
        <Text style={styles.placeholderCopy}>
          Auto-send confirmations, reminders, and review nudges. Connect this screen to Supabase functions the
          same way the web app handles post-booking touchpoints.
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
  placeholderRow: {
    width: '100%',
    gap: spacing.xl,
  },
  placeholderCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowColor: '#00000012',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  placeholderTitle: {
    ...typography.headingMd,
    color: colors.textPrimary,
  },
  placeholderCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
