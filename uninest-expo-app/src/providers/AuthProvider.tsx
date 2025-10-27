import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthStore } from '@/state/stores/authStore';
import { colors } from '@/theme/colors';

interface AuthProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthProvider({ children, fallback }: AuthProviderProps) {
  const {
    initialize,
    cleanup,
    hasInitialized,
    loading,
  } = useAuthStore((state) => ({
    initialize: state.initialize,
    cleanup: state.cleanup,
    hasInitialized: state.hasInitialized,
    loading: state.loading,
  }));

  useEffect(() => {
    initialize();
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  if (!hasInitialized || loading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
