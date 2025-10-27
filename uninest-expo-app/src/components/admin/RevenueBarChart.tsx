import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export type RevenueDatum = {
  name: string;
  revenue: number;
};

type RevenueBarChartProps = {
  data: RevenueDatum[];
  loading?: boolean;
};

const RevenueBarChartComponent = ({ data, loading = false }: RevenueBarChartProps) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.loadingText}>Loading revenue trend…</Text>
      </View>
    );
  }

  const max = data.reduce((acc, item) => Math.max(acc, item.revenue), 0) || 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Monthly revenue</Text>
      <Text style={styles.subtitle}>Last 12 months</Text>
      <View style={styles.barList}>
        {data.map((item) => {
          const widthPercent = Math.min(100, Math.round((item.revenue / max) * 100));
          return (
            <View key={item.name} style={styles.barRow}>
              <View style={styles.barLabelBlock}>
                <Text style={styles.barLabel}>{item.name}</Text>
                <Text style={styles.barValue}>₹{Math.round(item.revenue).toLocaleString()}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
              </View>
            </View>
          );
        })}
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
    padding: 20,
    gap: 12,
    shadowColor: '#00000010',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  barList: {
    gap: 12,
  },
  barRow: {
    gap: 8,
  },
  barLabelBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  barTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  barFill: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
});

export const RevenueBarChart = memo(RevenueBarChartComponent);
