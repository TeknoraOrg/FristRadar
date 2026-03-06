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
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { register, ApiError } from '../../src/lib/api';
import { validatePassword } from '../../src/lib/validation';

export default function SetupPasswordScreen() {
  const { t } = useTranslation();
  const { completeRegistration } = useAuthContext();
  const { colors } = useTheme();
  const { phone, countryCode, verificationToken } = useLocalSearchParams<{
    phone: string;
    countryCode: string;
    verificationToken: string;
  }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validation = validatePassword(password);

  const handleSetup = async () => {
    setError('');

    if (!password) {
      setError(t('auth.setupPassword.error.passwordRequired'));
      return;
    }
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.setupPassword.error.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await register(phone!, password, verificationToken!, countryCode);
      await completeRegistration(res.data.token, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.checkRow}>
      <Text style={[styles.checkIcon, { color: met ? colors.status.success : colors.text.muted }]}>
        {met ? '\u2713' : '\u2022'}
      </Text>
      <Text style={[styles.checkLabel, { color: met ? colors.text.primary : colors.text.muted }]}>
        {label}
      </Text>
    </View>
  );

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
              {t('auth.setupPassword.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.setupPassword.subtitle')}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.setupPassword.passwordLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.setupPassword.passwordPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            {password.length > 0 && (
              <View style={styles.checks}>
                <CheckItem met={validation.checks.minLength} label={t('auth.setupPassword.rule.minLength')} />
                <CheckItem met={validation.checks.hasUppercase} label={t('auth.setupPassword.rule.uppercase')} />
                <CheckItem met={validation.checks.hasNumber} label={t('auth.setupPassword.rule.number')} />
              </View>
            )}

            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.setupPassword.confirmLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.setupPassword.confirmPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: validation.valid && password === confirmPassword && confirmPassword
                  ? colors.primary.default
                  : colors.primary.default + '60',
              }]}
              onPress={handleSetup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary.foreground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                  {t('auth.setupPassword.createAccount')}
                </Text>
              )}
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
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
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
  checks: { marginTop: 8, marginBottom: 4, gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkIcon: { fontSize: 14, fontWeight: '700', width: 16, textAlign: 'center' },
  checkLabel: { fontSize: 13 },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
});
