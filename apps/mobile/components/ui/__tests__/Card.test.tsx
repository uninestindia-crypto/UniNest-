import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';
import { ThemeProvider } from '@/theme';
import { Text } from 'react-native';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('Card Component', () => {
    it('renders with children', () => {
        render(
            <TestWrapper>
                <Card>
                    <Text>Card Content</Text>
                </Card>
            </TestWrapper>
        );

        expect(screen.getByText('Card Content')).toBeTruthy();
    });

    it('renders sub-components correctly', () => {
        render(
            <TestWrapper>
                <Card>
                    <CardHeader><Text>Header</Text></CardHeader>
                    <CardContent><Text>Body</Text></CardContent>
                    <CardFooter><Text>Footer</Text></CardFooter>
                </Card>
            </TestWrapper>
        );

        expect(screen.getByText('Header')).toBeTruthy();
        expect(screen.getByText('Body')).toBeTruthy();
        expect(screen.getByText('Footer')).toBeTruthy();
    });

    it('handles press when pressable', () => {
        const onPressMock = jest.fn();
        render(
            <TestWrapper>
                <Card pressable onPress={onPressMock} testID="card">
                    <Text>Press Me</Text>
                </Card>
            </TestWrapper>
        );

        fireEvent.press(screen.getByTestId('card'));
        expect(onPressMock).toHaveBeenCalled();
    });
});
