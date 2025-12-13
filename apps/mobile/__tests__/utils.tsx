import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a fresh query client for each test
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

// Custom render with providers
export const renderWithProviders = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
};

// Re-export everything from testing-library
export * from '@testing-library/react-native';
export { renderWithProviders as render };
