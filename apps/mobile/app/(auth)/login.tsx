import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';

export default function LoginScreen() {
    const { signIn, isLoading } = useAuth();
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        try {
            setError('');
            await signIn(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.content}>
                {/* Logo / Brand */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.foreground }]}>
                        Welcome Back
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
                        Sign in to your Uninest account
                    </Text>
                </View>

                {/* Error Message */}
                {error ? (
                    <View style={[styles.errorContainer, { backgroundColor: `${theme.colors.destructive}20` }]}>
                        <Text style={[styles.errorText, { color: theme.colors.destructive }]}>
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Email</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.muted,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.foreground,
                                },
                            ]}
                            placeholder="Enter your email"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Password</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.muted,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.foreground,
                                },
                            ]}
                            placeholder="Enter your password"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Link href="/password-reset" asChild>
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary[600] }]}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: theme.colors.primary[600] },
                            isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                        Don't have an account?{' '}
                    </Text>
                    <Link href="/signup" asChild>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: theme.colors.primary[600] }]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    button: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
