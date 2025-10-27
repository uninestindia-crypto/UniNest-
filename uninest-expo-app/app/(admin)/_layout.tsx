import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

export default function AdminLayout() {
  const { isChecking } = useAuthGuard({ requireAdmin: true });

  if (isChecking) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.copy}>Preparing admin workspace…</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
