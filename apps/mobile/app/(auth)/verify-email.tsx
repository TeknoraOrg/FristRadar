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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ApiError } from '../../src/lib/api';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const { verifyOtp, resendVerificationEmail, pendingEmail } = useAuthContext();
  const { colors } = useTheme();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const email = pendingEmail ?? '';

  const handleVerify = async () => {
    setError('');
    if (!code.trim()) {
      setError(t('auth.verifyEmail.error.invalid'));
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, code.trim());
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        setError(t('auth.verifyEmail.error.expired'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('auth.verifyEmail.error.invalid'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await resendVerificationEmail(email);
      setSuccess(t('auth.verifyEmail.resendSuccess'));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary.default }]}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('auth.verifyEmail.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.verifyEmail.subtitle', { email })}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={[styles.successBox, { backgroundColor: colors.status.successLight }]}>
              <Text style={[styles.successText, { color: colors.status.success }]}>{success}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.text.primary }]}>
            {t('auth.verifyEmail.codeLabel')}
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.background.card,
              borderColor: colors.border.default,
              color: colors.text.primary,
            }]}
            placeholder={t('auth.verifyEmail.codePlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary.default, marginTop: 20 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary.foreground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                {t('auth.verifyEmail.button')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color={colors.primary.default} />
            ) : (
              <Text style={[styles.resendText, { color: colors.primary.default }]}>
                {t('auth.verifyEmail.resend')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 16, left: 24 },
  backText: { fontSize: 16 },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  successBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  successText: { fontSize: 14, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  resendButton: { alignItems: 'center', marginTop: 20, padding: 8 },
  resendText: { fontSize: 15, fontWeight: '500' },
});
