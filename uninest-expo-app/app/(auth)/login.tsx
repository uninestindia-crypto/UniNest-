import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { supabase } from '@/services/supabase/client';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/state/stores/authStore';
import { trackEvent } from '@/services/analytics';

export default function LoginScreen() {
  const router = useRouter();
  const { initialize, fetchProfile } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const validationErrors: string[] = [];

    if (!trimmedEmail) {
      validationErrors.push('Enter your email.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.push('Email format looks invalid.');
    }

    if (!password) {
      validationErrors.push('Enter your password.');
    } else if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters.');
    }

    if (validationErrors.length > 0) {
      Alert.alert('Check details', validationErrors.join('\n'));
      trackEvent('auth_login_validation_failed', { errors: validationErrors.length });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    setSubmitting(false);

    if (error) {
      Alert.alert('Login failed', error.message);
      trackEvent('auth_login_failed', { reason: error.message });
      return;
    }

    await fetchProfile();
    initialize();
    trackEvent('auth_login_success', { method: 'password' });
    router.replace('/(vendor)/dashboard');
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      Alert.alert('Email required', 'Enter your email above so we can send reset instructions.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: 'https://uninest.app/auth/callback',
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Unable to send reset link', error.message);
      trackEvent('auth_password_reset_failed', { reason: error.message });
      return;
    }

    Alert.alert('Check your inbox', 'We emailed you a secure reset link.');
    trackEvent('auth_password_reset_requested', {});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.card}>
        <Text style={styles.kicker}>Vendor Access</Text>
        <Text style={styles.title}>Sign in to UniNest</Text>
        <Text style={styles.subtitle}>Manage your listings, bookings, payouts, and marketing from one place.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="vendor@uninest.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={submitting}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitLabel}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
        </Pressable>

        <Pressable onPress={handleForgotPassword} disabled={submitting}>
          <Text style={styles.forgotLink}>Forgot password? Send a reset link</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/support')} disabled={submitting}>
          <Text style={styles.supportLink}>Need help? Contact UniNest support</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: '#00000012',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface,
  },
  supportLink: {
    marginTop: 8,
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
  },
  forgotLink: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
