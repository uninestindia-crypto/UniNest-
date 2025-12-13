import { Stack } from 'expo-router';

/**
 * Auth stack layout - for login, signup, password reset screens
 */
export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="password-reset" />
        </Stack>
    );
}
