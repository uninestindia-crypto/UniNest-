import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/src/state/query-client';
import { useAppFonts } from '@/src/theme/fonts';

export default function RootLayout() {
  const fontsLoaded = useFonts(useAppFonts());

  useEffect(() => {
    if (!fontsLoaded[0]) {
      return;
    }
  }, [fontsLoaded]);

  if (!fontsLoaded[0]) {
    return <View />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
