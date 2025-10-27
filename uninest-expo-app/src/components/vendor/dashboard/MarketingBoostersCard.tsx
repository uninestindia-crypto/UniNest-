import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import type { MarketingBooster } from '@/state/stores/vendorDashboardStore';
import { colors } from '@/theme/colors';

export type MarketingBoostersCardProps = {
  boosters: MarketingBooster[];
};

const MarketingBoostersCardComponent = ({ boosters }: MarketingBoostersCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Peak season ready</Text>
        </View>
        <Text style={styles.title}>Promotion & Marketing Booster</Text>
        <Text style={styles.subtitle}>One-click boosts keep you ahead during high-demand weeks.</Text>
      </View>

      <View style={styles.list}>
        {boosters.map((booster) => (
          <View key={booster.title} style={styles.listItem}>
            <Text style={styles.listItemTitle}>{booster.title}</Text>
            <Text style={styles.listItemDetail}>{booster.detail}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.cta} onPress={() => {}}>
        <Text style={styles.ctaLabel}>Boost listing now</Text>
        <ArrowRight size={16} color={colors.surface} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fbff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 24,
    gap: 20,
    shadowColor: '#2563eb26',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  header: {
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d4ed8',
    letterSpacing: 0.6,
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
  list: {
    gap: 12,
  },
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 16,
    shadowColor: '#1d4ed80f',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 6,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listItemDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#1d4ed826',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  ctaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.surface,
  },
});

export const MarketingBoostersCard = memo(MarketingBoostersCardComponent);
