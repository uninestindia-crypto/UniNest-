import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/state/query-client';
import { AuthProvider } from '@/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { ToastProvider } from '@/providers/ToastProvider';
import { ModalProvider } from '@/providers/ModalProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <AuthProvider
            fallback={(
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          >
            <ToastProvider>
              <ModalProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </ModalProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
