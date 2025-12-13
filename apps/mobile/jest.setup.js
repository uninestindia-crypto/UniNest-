/* eslint-disable no-undef */
import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => [],
    Link: 'Link',
    Stack: {
        Screen: 'Screen',
    },
    Tabs: {
        Screen: 'Screen',
    },
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'test-token' })),
}));

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getSession: jest.fn(),
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe: jest.fn() } },
            })),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
        })),
    })),
}));

// Silence the warning about useNativeDriver
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Global test utilities
global.console = {
    ...console,
    // Suppress console.log in tests (uncomment if needed)
    // log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
