import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function HostelsLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.card,
                },
                headerTintColor: theme.colors.foreground,
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Hostels',
                    headerLargeTitle: false,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Hostel Details',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}
