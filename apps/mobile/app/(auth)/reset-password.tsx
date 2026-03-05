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
import { validatePassword } from '../../src/utils/validation';
import { ApiError } from '../../src/lib/api';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { updatePassword } = useAuthContext();
  const { colors } = useTheme();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');

    if (!token.trim()) {
      setError(t('auth.verifyEmail.error.invalid'));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.signUp.error.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      await updatePassword(token.trim(), password);
      // Auth state will update automatically via the hook
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('auth.resetPassword.error.failed'));
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary.default }]}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('auth.resetPassword.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.resetPassword.subtitle')}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
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
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={[styles.label, { color: colors.text.primary }]}>
            {t('auth.resetPassword.passwordLabel')}
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.background.card,
              borderColor: colors.border.default,
              color: colors.text.primary,
            }]}
            placeholder={t('auth.resetPassword.passwordPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            editable={!loading}
          />

          <Text style={[styles.label, { color: colors.text.primary }]}>
            {t('auth.resetPassword.confirmLabel')}
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.background.card,
              borderColor: colors.border.default,
              color: colors.text.primary,
            }]}
            placeholder={t('auth.resetPassword.confirmPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary.default, marginTop: 24 }]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary.foreground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                {t('auth.resetPassword.button')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 16, left: 0 },
  backText: { fontSize: 16 },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 6, marginTop: 12 },
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
});
