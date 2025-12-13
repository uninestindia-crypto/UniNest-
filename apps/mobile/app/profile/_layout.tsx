import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function ProfileLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.card },
                headerTintColor: theme.colors.foreground,
            }}
        >
            <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
        </Stack>
    );
}
