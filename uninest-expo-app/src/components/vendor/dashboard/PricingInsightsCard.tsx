import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { PricingDay } from '@/src/state/stores/vendorDashboardStore';
import { colors } from '@/src/theme/colors';

export type PricingInsightsCardProps = {
  days: PricingDay[];
};

const PricingInsightsCardComponent = ({ days }: PricingInsightsCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dynamic Pricing & Insights</Text>
          <Text style={styles.copy}>
            Occupancy is trending up for the coming weekend. Adjust your rates and watch profitability.
          </Text>
        </View>
        <View style={styles.badge}> 
          <Text style={styles.badgeLabel}>Live</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {days.map((day) => (
          <View key={day.label} style={[styles.dayCard, day.highlight ? styles.dayHighlighted : styles.dayDefault]}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Text style={styles.dayOccupancy}>{day.occupancy}%</Text>
            <Text style={styles.dayHint}>Occupancy</Text>
            <Text style={styles.dayRate}>{day.rate}</Text>
            <Text style={styles.dayStatus}>{day.demand}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 24,
    gap: 16,
    shadowColor: '#00000022',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  copy: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    width: '30%',
    minWidth: 120,
    gap: 6,
  },
  dayHighlighted: {
    borderColor: '#bfdbfe',
    backgroundColor: '#f8fbff',
  },
  dayDefault: {
    borderColor: colors.borderMuted,
    backgroundColor: '#f8fafc',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  dayOccupancy: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dayRate: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  dayStatus: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export const PricingInsightsCard = memo(PricingInsightsCardComponent);
