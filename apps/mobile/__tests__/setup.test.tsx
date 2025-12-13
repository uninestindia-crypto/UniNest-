import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock theme for tests
const mockTheme = {
    colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 600: '#2563eb', 700: '#1d4ed8' },
        background: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        muted: '#f8fafc',
        mutedForeground: '#64748b',
        border: '#e2e8f0',
        destructive: '#ef4444',
        success: '#22c55e',
    },
    shadows: {
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    },
};

// Mock ThemeProvider
jest.mock('@/theme', () => ({
    useTheme: () => ({ theme: mockTheme, isDark: false, toggleTheme: jest.fn() }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useAuth
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
};

const mockProfile = {
    id: 'test-user-id',
    full_name: 'Test User',
    handle: 'testuser',
    role: 'student',
};

jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: mockUser,
        profile: mockProfile,
        role: 'student',
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Test Setup', () => {
    it('should render a basic component', () => {
        const { Text } = require('react-native');
        const TestComponent = () => <Text testID="test">Hello</Text>;

        render(<TestComponent />);
        expect(screen.getByTestId('test')).toBeTruthy();
    });

    it('should have mock user available', () => {
        const { useAuth } = require('@/hooks/useAuth');
        const auth = useAuth();

        expect(auth.user.id).toBe('test-user-id');
        expect(auth.profile.full_name).toBe('Test User');
    });

    it('should have mock theme available', () => {
        const { useTheme } = require('@/theme');
        const { theme } = useTheme();

        expect(theme.colors.primary[600]).toBe('#2563eb');
    });
});
