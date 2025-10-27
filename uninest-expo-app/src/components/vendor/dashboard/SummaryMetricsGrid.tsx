import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { TrendingUp, Wallet, Users, Coins, Info } from 'lucide-react-native';

import type { SummaryMetric } from '@/state/stores/vendorDashboardStore';
import { colors } from '@/theme/colors';

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Wallet,
  Users,
  Coins,
  Info,
};

export type SummaryMetricsGridProps = {
  metrics: SummaryMetric[];
};

const SummaryMetricsGridComponent = ({ metrics }: SummaryMetricsGridProps) => {
  const normalized = useMemo(() => {
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return [] as SummaryMetric[];
    }
    return metrics;
  }, [metrics]);

  return (
    <View style={styles.grid}>
      {normalized.map((metric) => {
        const Icon = iconMap[metric.icon] ?? iconMap.Info;
        const toneStyle = metric.tone === 'positive' ? styles.tonePositive : metric.tone === 'negative' ? styles.toneNegative : styles.toneNeutral;
        return (
          <View key={metric.label} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.iconPill}>
                <Icon size={18} color={colors.primary} />
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            </View>
            <View style={styles.valuesRow}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={[styles.metricTrend, toneStyle]}>{metric.trend}</Text>
            </View>
            <Text style={styles.metricDescription}>{metric.description}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 20,
    gap: 12,
    shadowColor: '#00000022',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricTrend: {
    fontSize: 14,
    fontWeight: '600',
  },
  tonePositive: {
    color: '#047857',
  },
  toneNeutral: {
    color: colors.textSecondary,
  },
  toneNegative: {
    color: '#b91c1c',
  },
  metricDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
});

export const SummaryMetricsGrid = memo(SummaryMetricsGridComponent);
