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
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { authApi } from '@/services/supabase';

export default function PasswordResetScreen() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            await authApi.resetPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[styles.container, styles.successContainer, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                    <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
                </View>
                <Text style={[styles.successTitle, { color: theme.colors.foreground }]}>
                    Check Your Email
                </Text>
                <Text style={[styles.successText, { color: theme.colors.mutedForeground }]}>
                    We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
                </Text>
                <Link href="/login" asChild>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary[600] }]}
                    >
                        <Text style={styles.buttonText}>Back to Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.foreground }]}>
                        Reset Password
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
                        Enter your email address and we'll send you a link to reset your password.
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

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: theme.colors.primary[600] },
                            isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Send Reset Link</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Back to Login */}
                <View style={styles.footer}>
                    <Link href="/login" asChild>
                        <TouchableOpacity style={styles.backButton}>
                            <Ionicons name="arrow-back" size={20} color={theme.colors.primary[600]} />
                            <Text style={[styles.backText, { color: theme.colors.primary[600] }]}>
                                Back to Login
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
    successContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
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
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
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
        marginTop: 32,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    backText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
