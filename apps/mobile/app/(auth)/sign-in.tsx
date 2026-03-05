import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { validateEmail } from '../../src/utils/validation';
import { ApiError } from '../../src/lib/api';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuthContext();
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!password) {
      setError(t('auth.signIn.error.passwordRequired'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.signIn.error.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('auth.signIn.error.invalidCredentials'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('auth.signIn.error.unexpected'));
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.primary.default }]}>
              {t('brand.name')}
            </Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('auth.signIn.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.signIn.subtitle')}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.signIn.emailLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.signIn.emailPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
            />

            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.signIn.passwordLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.signIn.passwordPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              disabled={loading}
            >
              <Text style={[styles.forgotPassword, { color: colors.primary.default }]}>
                {t('auth.signIn.forgotPassword')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary.default }]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary.foreground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                  {t('auth.signIn.button')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>
              {t('auth.signIn.noAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} disabled={loading}>
              <Text style={[styles.footerLink, { color: colors.primary.default }]}>
                {t('auth.signIn.createAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32, alignItems: 'center' },
  brand: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 15 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  form: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  forgotPassword: { fontSize: 14, textAlign: 'right', marginTop: 8, marginBottom: 20 },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: '600' },
});
