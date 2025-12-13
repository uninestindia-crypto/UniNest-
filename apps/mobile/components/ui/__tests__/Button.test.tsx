import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '@/theme';

// Mock Haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
    },
}));

// Wrapper for checking theme context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('Button Component', () => {
    it('renders correctly with default props', () => {
        render(
            <TestWrapper>
                <Button onPress={() => { }}>Click Me</Button>
            </TestWrapper>
        );

        expect(screen.getByText('Click Me')).toBeTruthy();
    });

    it('handles press events', () => {
        const onPressMock = jest.fn();
        render(
            <TestWrapper>
                <Button onPress={onPressMock}>Press Me</Button>
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Press Me'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('shows loading indicator when loading prop is true', () => {
        render(
            <TestWrapper>
                <Button loading onPress={() => { }}>Loading</Button>
            </TestWrapper>
        );

        // Should show ActivityIndicator (accessibility role 'progressbar' often used, but RN default is different)
        // Adjust based on your ActivityIndicator implementation or checking for children
        expect(screen.getByTestId('button-loading')).toBeTruthy();
        expect(screen.queryByText('Loading')).toBeFalsy();
    });

    it('does not fire onPress when disabled', () => {
        const onPressMock = jest.fn();
        render(
            <TestWrapper>
                <Button disabled onPress={onPressMock}>Disabled</Button>
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Disabled'));
        expect(onPressMock).not.toHaveBeenCalled();
    });

    it('renders with variants correctly', () => {
        const { toJSON } = render(
            <TestWrapper>
                <Button variant="destructive" onPress={() => { }}>Delete</Button>
            </TestWrapper>
        );

        expect(toJSON()).toMatchSnapshot();
    });
});
