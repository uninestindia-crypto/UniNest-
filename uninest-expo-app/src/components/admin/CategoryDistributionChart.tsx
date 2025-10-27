import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export type CategoryDatum = {
  name: string;
  value: number;
};

type CategoryDistributionChartProps = {
  data: CategoryDatum[];
  loading?: boolean;
};

const CategoryDistributionChartComponent = ({ data, loading = false }: CategoryDistributionChartProps) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.loadingText}>Loading categories…</Text>
      </View>
    );
  }

  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Listings by category</Text>
      <Text style={styles.subtitle}>Share of active inventory</Text>
      <View style={styles.list}>
        {data.map((item) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <View key={item.name} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowLabel}>{item.name}</Text>
                <Text style={styles.rowValue}>{item.value.toLocaleString()} listings</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.percentLabel}>{percent}%</Text>
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
  list: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  percentLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export const CategoryDistributionChart = memo(CategoryDistributionChartComponent);
