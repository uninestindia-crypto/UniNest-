import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, PhoneCall } from 'lucide-react-native';

import type { CRMLead } from '@/state/stores/vendorDashboardStore';
import { colors } from '@/theme/colors';

export type CRMLeadsCardProps = {
  leads: CRMLead[];
  quickReplies: string[];
};

const statusPalette: Record<CRMLead['status'], { background: string; text: string; label: string }> = {
  new: { background: '#e0f2fe', text: '#0369a1', label: 'New lead' },
  warm: { background: '#fef3c7', text: '#b45309', label: 'Warm' },
  followup: { background: '#ede9fe', text: '#6d28d9', label: 'Follow-up' },
};

const CRMLeadsCardComponent = ({ leads, quickReplies }: CRMLeadsCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendor CRM</Text>
        <Text style={styles.subtitle}>Reply to fresh inquiries and keep leads warm without juggling tabs.</Text>
      </View>

      <View style={styles.leadsColumn}>
        {leads.map((lead) => {
          const palette = statusPalette[lead.status];
          return (
            <View key={lead.name} style={styles.leadRow}>
              <View style={styles.leadMeta}>
                <View style={styles.initialsChip}>
                  <Text style={styles.initialsText}>{lead.initials}</Text>
                </View>
                <View style={styles.leadCopy}>
                  <View style={styles.leadHeader}>
                    <Text style={styles.leadName}>{lead.name}</Text>
                    <View style={[styles.statusPill, { backgroundColor: palette.background }]}> 
                      <Text style={[styles.statusLabel, { color: palette.text }]}>{palette.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.leadNote}>{lead.note}</Text>
                  <View style={styles.actionsRow}>
                    <Pressable style={styles.primaryAction} onPress={() => {}}>
                      <MessageCircle size={14} color={colors.primary} />
                      <Text style={styles.primaryActionLabel}>Send reply</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryAction} onPress={() => {}}>
                      <PhoneCall size={14} color={colors.textSecondary} />
                      <Text style={styles.secondaryActionLabel}>Schedule call</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              <Text style={styles.timestamp}>{lead.time}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.quickRepliesRow}>
        {quickReplies.map((reply) => (
          <Pressable key={reply} style={styles.quickReplyChip}>
            <Text style={styles.quickReplyText}>{reply}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerCopy}>Inbox sorted by newest activity.</Text>
        <Pressable onPress={() => {}}>
          <Text style={styles.footerLink}>View all conversations</Text>
        </Pressable>
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
    gap: 20,
    shadowColor: '#00000022',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  header: {
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
  leadsColumn: {
    gap: 16,
  },
  leadRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  leadMeta: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  initialsChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  leadCopy: {
    flex: 1,
    gap: 8,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  leadNote: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#0000001a',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  primaryActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
  },
  secondaryActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  quickRepliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickReplyChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerCopy: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});

export const CRMLeadsCard = memo(CRMLeadsCardComponent);
