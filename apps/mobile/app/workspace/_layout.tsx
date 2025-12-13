import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function WorkspaceLayout() {
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
                    title: 'Workspace',
                    headerLargeTitle: false,
                }}
            />
            <Stack.Screen
                name="competitions/[id]"
                options={{
                    title: 'Competition Details',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="internships/[id]"
                options={{
                    title: 'Internship Details',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}
