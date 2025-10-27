import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function VendorSettingsScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const layout = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  if (isChecking) {
    return (
      <AppShell title="Workspace settings" subtitle="Loading vendor preferences…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Syncing profile and notification defaults…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Workspace settings"
      subtitle="Manage branding, team invites, notifications, and billing preferences."
    >
      <View style={[styles.row, { flexDirection: layout }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branding & profile</Text>
          <Text style={styles.cardCopy}>
            Reuse Supabase storage helpers to upload new logos, cover imagery, and contact details.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Team access</Text>
          <Text style={styles.cardCopy}>
            Mirror the React invite flow with role-based access, using the same API endpoints for vendor teammates.
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.cardCopy}>
          Configure email, push, and WhatsApp touchpoints. This is powered by the `preferences` table already live in
          Supabase.
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
