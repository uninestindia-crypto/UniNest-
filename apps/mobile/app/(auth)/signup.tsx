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
    ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';
import type { UserRole } from '@uninest/shared-types';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp, isLoading } = useAuth();
    const { theme } = useTheme();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [error, setError] = useState('');

    const handleSignup = async () => {
        if (!fullName || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setError('');
            await signUp(email, password, { full_name: fullName, role });
            // Navigation will happen automatically via auth state change
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create account');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.foreground }]}>
                            Create Account
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
                            Join Uninest today
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
                        {/* Full Name */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.foreground }]}>Full Name</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.colors.muted,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.foreground,
                                    },
                                ]}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.colors.mutedForeground}
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email */}
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

                        {/* Role Selection */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.foreground }]}>I am a</Text>
                            <View style={styles.roleContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        {
                                            backgroundColor: role === 'student' ? theme.colors.primary[600] : theme.colors.muted,
                                            borderColor: theme.colors.border,
                                        },
                                    ]}
                                    onPress={() => setRole('student')}
                                >
                                    <Text
                                        style={[
                                            styles.roleText,
                                            { color: role === 'student' ? '#ffffff' : theme.colors.foreground },
                                        ]}
                                    >
                                        Student
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        {
                                            backgroundColor: role === 'vendor' ? theme.colors.primary[600] : theme.colors.muted,
                                            borderColor: theme.colors.border,
                                        },
                                    ]}
                                    onPress={() => setRole('vendor')}
                                >
                                    <Text
                                        style={[
                                            styles.roleText,
                                            { color: role === 'vendor' ? '#ffffff' : theme.colors.foreground },
                                        ]}
                                    >
                                        Vendor
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Password */}
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
                                placeholder="Create a password"
                                placeholderTextColor={theme.colors.mutedForeground}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.foreground }]}>Confirm Password</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.colors.muted,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.foreground,
                                    },
                                ]}
                                placeholder="Confirm your password"
                                placeholderTextColor={theme.colors.mutedForeground}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: theme.colors.primary[600] },
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={[styles.termsText, { color: theme.colors.mutedForeground }]}>
                        By creating an account, you agree to our{' '}
                        <Text style={{ color: theme.colors.primary[600] }}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={{ color: theme.colors.primary[600] }}>Privacy Policy</Text>
                    </Text>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                            Already have an account?{' '}
                        </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: theme.colors.primary[600] }]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    header: {
        marginBottom: 24,
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
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '500',
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
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
