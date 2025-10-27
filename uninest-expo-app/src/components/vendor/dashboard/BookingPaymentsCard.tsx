import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Download, Wallet } from 'lucide-react-native';

import type { BookingSlot, Payout } from '@/state/stores/vendorDashboardStore';
import { colors } from '@/theme/colors';

export type BookingPaymentsCardProps = {
  bookingCalendar: BookingSlot[];
  payouts: Payout[];
};

type TabKey = 'bookings' | 'payouts';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'bookings', label: 'Calendar view', icon: CalendarDays },
  { key: 'payouts', label: 'Payout summary', icon: Wallet },
];

const BookingPaymentsCardComponent = ({ bookingCalendar, payouts }: BookingPaymentsCardProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('bookings');

  const normalizedCalendar = useMemo(() => bookingCalendar ?? [], [bookingCalendar]);
  const normalizedPayouts = useMemo(() => payouts ?? [], [payouts]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bookings & Payments</Text>
          <Text style={styles.subtitle}>Glance through the calendar and keep payouts predictable.</Text>
        </View>
      </View>

      <View style={styles.tabsBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, isActive ? styles.tabButtonActive : styles.tabButtonInactive]}
            >
              <Icon size={16} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'bookings' ? (
        <View style={styles.bookingsSection}>
          <View style={styles.bookingGrid}>
            {normalizedCalendar.map((slot) => (
              <View key={slot.day} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.dayChip}>
                    <Text style={styles.dayChipText}>{slot.day}</Text>
                  </View>
                  <CalendarDays size={16} color={colors.textMuted} />
                </View>
                <Text style={styles.bookingOccupancy}>{slot.occupancy}%</Text>
                <Text style={styles.bookingHint}>Occupancy forecast</Text>
                <Text style={styles.bookingRate}>{slot.rate}</Text>
                <Text style={styles.bookingStatus}>{slot.status}</Text>
              </View>
            ))}
          </View>
          <View style={styles.bookingActionsRow}>
            <Pressable style={[styles.secondaryAction, styles.actionPill]} onPress={() => {}}>
              <Text style={styles.secondaryActionText}>Block maintenance dates</Text>
            </Pressable>
            <Pressable style={[styles.primaryAction, styles.actionPill]} onPress={() => {}}>
              <Text style={styles.primaryActionText}>Add manual booking</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.payoutSection}>
          <View style={styles.payoutList}>
            {normalizedPayouts.map((payout) => (
              <View key={payout.id} style={styles.payoutRow}>
                <View>
                  <Text style={styles.payoutListing}>{payout.listing}</Text>
                  <Text style={styles.payoutMeta}>{payout.id}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.payoutAmount}>{payout.amount}</Text>
                  <Text style={styles.payoutStatus}>{payout.status}</Text>
                </View>
              </View>
            ))}
          </View>
          <Pressable style={[styles.secondaryAction, styles.downloadButton]} onPress={() => {}}>
            <Download size={16} color={colors.textSecondary} />
            <Text style={styles.secondaryActionText}>Download payout summary</Text>
          </Pressable>
        </View>
      )}
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
    gap: 20,
    shadowColor: '#00000012',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    padding: 4,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#00000014',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
  bookingsSection: {
    gap: 16,
  },
  bookingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookingCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 16,
    gap: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bookingOccupancy: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookingHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bookingRate: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bookingStatus: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bookingActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryAction: {
    backgroundColor: '#e2e8f0',
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  payoutSection: {
    gap: 16,
  },
  payoutList: {
    gap: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  payoutListing: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  payoutMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  payoutStatus: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
});

export const BookingPaymentsCard = memo(BookingPaymentsCardComponent);
