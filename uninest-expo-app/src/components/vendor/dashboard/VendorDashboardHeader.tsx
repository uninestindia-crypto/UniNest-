import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export type VendorDashboardHeaderProps = {
  userName: string;
  categories: string[];
};

const VendorDashboardHeaderComponent = ({ userName, categories }: VendorDashboardHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.copyWrapper}>
        <Text style={styles.kicker}>Vendor HQ</Text>
        <Text style={styles.title}>Welcome back, {userName}</Text>
        <Text style={styles.subtitle}>
          Keep occupancy, pricing, conversations, and payouts aligned from a single clean workspace.
        </Text>
      </View>
      {categories.length > 0 && (
        <View style={styles.badgeRow}>
          {categories.map((category) => (
            <View key={category} style={styles.badge}>
              <Text style={styles.badgeLabel}>{category.replace(/-/g, ' ').toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    shadowColor: '#00000022',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 16,
  },
  copyWrapper: {
    gap: 8,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.badgeBackground,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.badgeText,
  },
});

export const VendorDashboardHeader = memo(VendorDashboardHeaderComponent);
