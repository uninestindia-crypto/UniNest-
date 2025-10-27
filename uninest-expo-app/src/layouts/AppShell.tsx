import { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { radii, spacing, typography } from '@/theme/tokens';
import { useResponsiveValue } from '@/hooks/useResponsiveValue';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  headerSlot?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
};

export function AppShell({
  title,
  subtitle,
  headerSlot,
  rightSlot,
  children,
  isLoading = false,
  onRefresh,
}: AppShellProps) {
  const horizontalPadding = useResponsiveValue({ base: spacing.lg, md: spacing.xl, lg: spacing['2xl'] });
  const verticalPadding = useResponsiveValue({ base: spacing.xl, md: spacing['2xl'], lg: spacing['3xl'] });
  const contentGap = useResponsiveValue({ base: spacing.lg, md: spacing.xl, lg: spacing['2xl'] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: verticalPadding,
            paddingBottom: spacing['4xl'],
            gap: contentGap,
          },
        ]}
        refreshControl={
          onRefresh
            ? (
              <RefreshControl
                tintColor={colors.primary}
                colors={[colors.primary]}
                refreshing={isLoading}
                onRefresh={onRefresh}
              />
            )
            : undefined
        }
        contentInsetAdjustmentBehavior="automatic"
      >
        {(title || subtitle || headerSlot || rightSlot) && (
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {headerSlot}
            </View>
            {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
          </View>
        )}

        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    shadowColor: '#00000022',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.headingLg,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rightSlot: {
    minHeight: spacing['2xl'],
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  body: {
    width: '100%',
    gap: spacing.xl,
  },
});
