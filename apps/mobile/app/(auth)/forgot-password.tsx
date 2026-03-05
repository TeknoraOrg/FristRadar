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
import { validateEmail } from '../../src/utils/validation';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { resetPasswordForEmail } = useAuthContext();
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
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
              {t('auth.forgotPassword.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.forgotPassword.subtitle')}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          {sent ? (
            <View style={[styles.successBox, { backgroundColor: colors.status.successLight }]}>
              <Text style={[styles.successText, { color: colors.status.success }]}>
                {t('auth.forgotPassword.success')}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.text.primary }]}>
            {t('auth.forgotPassword.emailLabel')}
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.background.card,
              borderColor: colors.border.default,
              color: colors.text.primary,
            }]}
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading && !sent}
          />

          {!sent ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary.default, marginTop: 20 }]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary.foreground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                  {t('auth.forgotPassword.button')}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary.default, marginTop: 20 }]}
              onPress={() => router.push('/(auth)/reset-password')}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                {t('common.continue')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={[styles.linkText, { color: colors.primary.default }]}>
              {t('auth.forgotPassword.backToSignIn')}
            </Text>
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
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  linkButton: { alignItems: 'center', marginTop: 20, padding: 8 },
  linkText: { fontSize: 15, fontWeight: '500' },
});
