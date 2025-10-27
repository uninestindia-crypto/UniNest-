import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image, UploadCloud } from 'lucide-react-native';

import type { Nudge, OptimizerHighlight } from '@/state/stores/vendorDashboardStore';
import { colors } from '@/theme/colors';

export type AIListingOptimizerCardProps = {
  highlights: OptimizerHighlight[];
  nudges: Nudge[];
};

const AIListingOptimizerCardComponent = ({ highlights, nudges }: AIListingOptimizerCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI Listing Optimizer</Text>
      <Text style={styles.subtitle}>Refresh photos and descriptions to climb search rankings.</Text>

      <View style={styles.uploadDropzone}>
        <UploadCloud size={36} color={colors.primary} />
        <Text style={styles.dropzoneTitle}>Drop photos or browse files</Text>
        <Text style={styles.dropzoneHelp}>
          We sharpen lighting, fix alignment, and generate captions in seconds.
        </Text>
        <View style={styles.dropzoneActions}>
          <Pressable style={[styles.primaryAction, styles.actionPill]} onPress={() => {}}>
            <Text style={styles.primaryActionText}>Upload photo</Text>
          </Pressable>
          <Pressable style={[styles.secondaryAction, styles.actionPill]} onPress={() => {}}>
            <Text style={styles.secondaryActionText}>Try demo listing</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.highlightsList}>
        {highlights.map((item) => (
          <View key={item.title} style={styles.highlightRow}>
            <Image size={18} color={colors.primary} />
            <View style={styles.highlightCopy}>
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.nudgeList}>
        {nudges.map((nudge) => (
          <View
            key={nudge.title}
            style={[styles.nudgeCard, { backgroundColor: nudge.accentBackground }]}
          >
            <View style={styles.nudgeCopy}>
              <Text style={[styles.nudgeTitle, { color: nudge.accentText }]}>{nudge.title}</Text>
              <Text style={[styles.nudgeDetail, { color: nudge.accentText }]}>{nudge.detail}</Text>
            </View>
            <Pressable style={styles.nudgeAction} onPress={() => {}}>
              <Text style={[styles.nudgeActionLabel, { color: nudge.accentText }]}>Action</Text>
            </Pressable>
          </View>
        ))}
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
  uploadDropzone: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  dropzoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dropzoneHelp: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  dropzoneActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
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
  highlightsList: {
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 16,
  },
  highlightCopy: {
    flex: 1,
    gap: 6,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  highlightDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  nudgeList: {
    gap: 10,
  },
  nudgeCard: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nudgeCopy: {
    flex: 1,
    gap: 6,
  },
  nudgeTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  nudgeDetail: {
    fontSize: 12,
  },
  nudgeAction: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nudgeActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export const AIListingOptimizerCard = memo(AIListingOptimizerCardComponent);
