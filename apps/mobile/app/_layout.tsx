import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/theme';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/services/supabase';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { GlobalError } from '@/components/ui/GlobalError';

// Production services
import { initSentry, setSentryUser, withSentry, addBreadcrumb } from '@/services/sentry';
import { analytics, identifyUser, resetAnalytics, trackScreen } from '@/services/analytics';
import { offlineQueue } from '@/services/offlineQueue';

export { GlobalError as ErrorBoundary };

// Initialize production services
initSentry();
analytics.initialize();
offlineQueue.initialize();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep cache for a day for offline support)
            retry: 2,
        },
    },
});

const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    throttleTime: 3000,
});

/**
 * Protected route wrapper - handles auth redirects
 */
function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, profile, role, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        // Update Sentry and Analytics user context
        if (user) {
            setSentryUser({
                id: user.id,
                email: user.email,
                role
            });
            identifyUser(user.id, {
                email: user.email,
                role,
                signUpDate: user.created_at,
            });
            addBreadcrumb('auth', 'User authenticated', { role });
        } else {
            setSentryUser(null);
            resetAnalytics();
        }

        if (!user && !inAuthGroup) {
            // User is not signed in and not on auth screen
            router.replace('/login');
        } else if (user && inAuthGroup) {
            // User is signed in but on auth screen
            router.replace('/');
        }

        // Push Notifications Logic
        const registerForPushNotificationsAsync = async () => {
            if (!user) return;

            try {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    return;
                }

                const token = (await Notifications.getExpoPushTokenAsync()).data;
                // Save token to profile
                if (token) {
                    // We use direct supabase client here, assuming 'profiles' table has RLS allowing update to own row
                    // If 'push_token' column doesn't exist, this will fail silently in production apps usually, 
                    // or we should handle error.
                    await supabase.from('profiles').update({ push_token: token }).eq('id', user.id);
                }
            } catch (error) {
                console.log('Error registering for push notifications:', error);
            }
        };

        if (user) {
            registerForPushNotificationsAsync();

            // Handle notification tap (when user taps on a notification)
            const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
                const data = response.notification.request.content.data;

                // Route based on notification type/data
                if (data?.screen) {
                    router.push(data.screen as any);
                } else if (data?.orderId) {
                    router.push(`/vendor/order/${data.orderId}`);
                } else if (data?.type === 'order_update') {
                    router.push('/orders');
                } else {
                    // Default: go to notifications screen
                    router.push('/notifications');
                }
            });

            return () => {
                responseSubscription.remove();
            };
        }

        // Hide splash screen once we know auth state
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [user, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return <>{children}</>;
}

/**
 * Root layout with all providers
 */
export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <PersistQueryClientProvider
                    client={queryClient}
                    persistOptions={{ persister: asyncStoragePersister }}
                    onSuccess={() => console.log('Query cache restored')}
                >
                    <ThemeProvider>
                        <AuthProvider>
                            <AuthGate>
                                <OfflineBanner />
                                <Stack
                                    screenOptions={{
                                        headerShown: false,
                                        animation: 'slide_from_right',
                                    }}
                                >
                                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                    <Stack.Screen
                                        name="product/[id]"
                                        options={{
                                            headerShown: true,
                                            headerTitle: 'Product Details',
                                            headerBackTitle: 'Back',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="booking/[productId]"
                                        options={{
                                            headerShown: true,
                                            headerTitle: 'Book Now',
                                            presentation: 'modal',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="hostels"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="workspace"
                                        options={{
                                            headerShown: false, // Let workspace/_layout handle it
                                        }}
                                    />
                                    <Stack.Screen
                                        name="notifications"
                                        options={{
                                            headerShown: true,
                                            headerTitle: 'Notifications',
                                        }}
                                    />
                                </Stack>
                                <StatusBar style="auto" />
                            </AuthGate>
                        </AuthProvider>
                    </ThemeProvider>
                </PersistQueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
});
