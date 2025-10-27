import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export type Donor = {
  userId: string;
  name: string;
  avatar: string | null;
  total: number;
};

type TopDonorsListProps = {
  donors: Donor[];
  loading?: boolean;
};

const TopDonorsListComponent = ({ donors, loading = false }: TopDonorsListProps) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.loadingText}>Loading top donors…</Text>
      </View>
    );
  }

  if (!donors.length) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.emptyText}>No donor activity yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top donor supporters</Text>
      <Text style={styles.subtitle}>Latest 5 donor contributions</Text>
      <View style={styles.list}>
        {donors.map((donor, index) => (
          <View key={donor.userId ?? index} style={styles.row}>
            {donor.avatar ? (
              <Image source={{ uri: donor.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLabel}>{donor.name.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.rowCopy}>
              <Text style={styles.rowName}>{donor.name}</Text>
              <Text style={styles.rowMeta}>₹{Math.round(donor.total).toLocaleString()}</Text>
            </View>
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
  emptyText: {
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
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  rowCopy: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export const TopDonorsList = memo(TopDonorsListComponent);
