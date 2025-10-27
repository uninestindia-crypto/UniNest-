import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/layouts/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function VendorCrmScreen() {
  const { isChecking } = useAuthGuard({ requireVendor: true });
  const columnLayout = useResponsiveValue({ base: 'column', lg: 'row' }) as 'column' | 'row';

  if (isChecking) {
    return (
      <AppShell title="CRM" subtitle="Loading conversations and pipelines…" isLoading>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderCopy}>Authenticating vendor workspace…</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Conversations & CRM"
      subtitle="Respond to leads, automate follow-ups, and keep your occupancy pipeline healthy."
    >
      <View style={[styles.grid, { flexDirection: columnLayout }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inbox</Text>
          <Text style={styles.cardCopy}>
            Surface unread inquiries, quick replies, and conversation context. Hook this section to Supabase realtime
            channels to mirror the web inbox widget.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pipeline</Text>
          <Text style={styles.cardCopy}>
            Visualize stages from New → Warm → Won. Map the existing React kanban to draggable cards or segmented lists
            here.
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Automation rules</Text>
        <Text style={styles.cardCopy}>
          Configure lead scoring, SLA reminders, and mail templates. Tie into the same Supabase functions that drive
          the web automation panel.
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
  grid: {
    width: '100%',
    gap: spacing.xl,
  },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
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
