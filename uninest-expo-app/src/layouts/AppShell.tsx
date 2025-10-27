import { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';
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
  const verticalPadding = useResponsiveValue({ base: spacing.xl, md: spacing['2xl'] });
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
            paddingBottom: spacing['3xl'],
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
        {(title || subtitle || headerSlot) && (
          <View style={[styles.header, { gap: spacing.sm }]}> 
            <View style={styles.headerCopy}>
              {title && <View><View><View></View></View></View>}
            </View>
          </View>
        )}
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
  },
  content: {
    backgroundColor: colors.background,
  },
  header: {
    width: '100%',
  },
  headerCopy: {
    gap: spacing.xs,
  },
});
