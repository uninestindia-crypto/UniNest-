import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Award, Crown, ShieldCheck, Star } from 'lucide-react-native';

import type { TierMetric } from '@/state/stores/vendorDashboardStore';
import { colors } from '@/theme/colors';

export type TierStatusCardProps = {
  metrics: TierMetric[];
};

const TierStatusCardComponent = ({ metrics }: TierStatusCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Vendor Tier & Badges</Text>
          <Text style={styles.subtitle}>Gold status unlocked · maintain momentum to reach Platinum.</Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.badgeChip, { backgroundColor: '#fef3c7' }]}> 
            <Crown size={14} color="#b45309" />
            <Text style={[styles.badgeLabel, { color: '#b45309' }]}>Gold partner</Text>
          </View>
          <View style={[styles.badgeChip, styles.outlineChip]}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={[styles.badgeLabel, { color: colors.primary }]}>Verified</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Star size={14} color={colors.primary} />
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(metric.progress, 100)}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.highlightCard}>
        <View style={styles.highlightCopy}>
          <Text style={styles.highlightTitle}>68% progress towards Platinum badge</Text>
          <Text style={styles.highlightDetail}>
            Complete 5 more five-star reviews and maintain response time under 1 hour.
          </Text>
        </View>
        <View style={styles.highlightActions}>
          <Pressable style={[styles.primaryAction, styles.actionPill]} onPress={() => {}}>
            <Text style={styles.primaryActionText}>View checklist</Text>
          </Pressable>
          <Pressable style={[styles.secondaryAction, styles.actionPill]} onPress={() => {}}>
            <Text style={styles.secondaryActionText}>Share badge</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={styles.infoTitle}>Verified listing</Text>
          </View>
          <Text style={styles.infoDetail}>Documents reviewed · visible badge increases trust by 24%.</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Award size={16} color="#f59e0b" />
            <Text style={styles.infoTitle}>Platinum preview</Text>
          </View>
          <Text style={styles.infoDetail}>Maintain 30-day satisfaction score above 4.8 to unlock.</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ArrowUpRight size={16} color="#10b981" />
            <Text style={styles.infoTitle}>Upsell insights</Text>
          </View>
          <Text style={styles.infoDetail}>Offer late checkout and breakfast bundle for weekday stays.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 24,
    gap: 20,
    shadowColor: '#00000014',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  outlineChip: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '30%',
    minWidth: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  highlightCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: '#f8fbff',
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  highlightCopy: {
    flex: 1,
    minWidth: 200,
    gap: 8,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  highlightDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  highlightActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  secondaryActionText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minWidth: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export const TierStatusCard = memo(TierStatusCardComponent);
