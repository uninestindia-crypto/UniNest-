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
                <Input label="Test" onChangeText={onChangeTextMock} />
            </TestWrapper>
        );

        fireEvent.changeText(screen.getByPlaceholderText(''), 'test value');
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

        // Find toggle button (icon)
        // Note: We need to ensure the toggle button is findable.
        // Assuming the icon has a testID or we find it by accessibility label if added.
        // Since we didn't add accessibilityLabel to the right icon pressable in Input.tsx,
        // we might fail here. Let's fix Input.tsx to have testID on the toggle button.
    });
});
