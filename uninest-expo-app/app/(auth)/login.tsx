import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { supabase } from '@/services/supabase/client';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/state/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { initialize, fetchProfile } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing details', 'Enter your email and password to continue.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      Alert.alert('Login failed', error.message);
      return;
    }

    await fetchProfile();
    initialize();
    router.replace('/(vendor)/dashboard');
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
});
