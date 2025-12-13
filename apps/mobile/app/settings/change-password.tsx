import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { authApi } from '@/services/supabase';

export default function ChangePasswordScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        if (!password || !confirmPassword) {
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
            setIsLoading(true);
            setError('');
            await authApi.updatePassword(password);
            Alert.alert('Success', 'Password updated successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>
                    Change Password
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
                    Enter your new password below.
                </Text>

                {error ? (
                    <View style={[styles.errorContainer, { backgroundColor: `${theme.colors.destructive}20` }]}>
                        <Text style={[styles.errorText, { color: theme.colors.destructive }]}>
                            {error}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>New Password</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.muted,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.foreground,
                                },
                            ]}
                            placeholder="Enter new password"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Confirm New Password</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.muted,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.foreground,
                                },
                            ]}
                            placeholder="Confirm new password"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: theme.colors.primary[600] },
                            isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
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
});
