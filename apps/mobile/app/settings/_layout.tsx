import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function SettingsLayout() {
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
                    title: 'Settings',
                    headerLargeTitle: true,
                }}
            />
        </Stack>
    );
}
