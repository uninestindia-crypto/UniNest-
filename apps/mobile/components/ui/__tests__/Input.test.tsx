import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Input } from '../Input';
import { ThemeProvider } from '@/theme';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('Input Component', () => {
    it('renders with label and placeholder', () => {
        render(
            <TestWrapper>
                <Input label="Email" placeholder="Enter email" />
            </TestWrapper>
        );

        expect(screen.getByText('Email')).toBeTruthy();
        expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('renders error message', () => {
        render(
            <TestWrapper>
                <Input label="Email" error="Invalid email address" />
            </TestWrapper>
        );

        expect(screen.getByText('Invalid email address')).toBeTruthy();
    });

    it('handles text changes', () => {
        const onChangeTextMock = jest.fn();
        render(
            <TestWrapper>
                <Input label="Test" placeholder="Type here" onChangeText={onChangeTextMock} />
            </TestWrapper>
        );

        fireEvent.changeText(screen.getByPlaceholderText('Type here'), 'test value');
        expect(onChangeTextMock).toHaveBeenCalledWith('test value');
    });

    it('toggles password visibility', () => {
        render(
            <TestWrapper>
                <Input
                    label="Password"
                    secureTextEntry
                    testID="password-input"
                    placeholder="Password" // Added placeholder for easy query
                />
            </TestWrapper>
        );

        // Initially secure
        const input = screen.getByPlaceholderText('Password');
        expect(input.props.secureTextEntry).toBe(true);

        // Find toggle button and press it
        const toggleBtn = screen.getByTestId('password-toggle');
        fireEvent.press(toggleBtn);

        // Should now be visible (not secure)
        // Query again to get fresh props
        expect(screen.getByPlaceholderText('Password').props.secureTextEntry).toBe(false);

        // Press again to hide
        fireEvent.press(toggleBtn);
        expect(screen.getByPlaceholderText('Password').props.secureTextEntry).toBe(true);
    });
});
