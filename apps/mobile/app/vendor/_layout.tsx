import { Stack } from 'expo-router';

/**
 * Vendor stack layout - for dashboard, listings, orders
 */
export default function VendorLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="dashboard" options={{ headerTitle: 'Vendor Dashboard' }} />
            <Stack.Screen name="listings" options={{ headerTitle: 'My Listings' }} />
            <Stack.Screen name="add-listing" options={{ headerTitle: 'Add Listing' }} />
            <Stack.Screen name="order/[id]" options={{ headerTitle: 'Order Details' }} />
        </Stack>
    );
}
