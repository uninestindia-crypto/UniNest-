import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@/theme/colors';

export type StatsCardProps = {
  label: string;
  value: string;
  trend?: string;
  helpText?: string;
  icon?: LucideIcon;
};

const StatsCardComponent = ({ label, value, trend, helpText, icon: Icon }: StatsCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {Icon ? (
          <View style={styles.iconBadge}>
            <Icon size={20} color={colors.primary} />
          </View>
        ) : null}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {trend ? <Text style={styles.trend}>{trend}</Text> : null}
      </View>
      {helpText ? <Text style={styles.helpText}>{helpText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 20,
    gap: 8,
    shadowColor: '#00000010',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0ecff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trend: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  helpText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});

export const StatsCard = memo(StatsCardComponent);
