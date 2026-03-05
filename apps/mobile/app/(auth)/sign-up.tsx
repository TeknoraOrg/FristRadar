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
import { validateEmail, validatePassword, validateName } from '../../src/utils/validation';
import { ApiError } from '../../src/lib/api';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuthContext();
  const { colors } = useTheme();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');

    const firstNameError = validateName(firstName);
    if (firstNameError) { setError(firstNameError); return; }

    const lastNameError = validateName(lastName);
    if (lastNameError) { setError(lastNameError); return; }

    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    if (!confirmPassword) {
      setError(t('auth.signUp.error.confirmPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.signUp.error.passwordsNoMatch'));
      return;
    }
    if (!agreedToTerms) {
      setError(t('auth.signUp.error.agreeTerms'));
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('auth.signUp.error.emailExists'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('auth.signUp.error.defaultError'));
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
              {t('auth.signUp.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.signUp.subtitle')}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.text.primary }]}>
                  {t('auth.signUp.firstNameLabel')}
                </Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  }]}
                  placeholder={t('auth.signUp.firstNamePlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  textContentType="givenName"
                  editable={!loading}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.text.primary }]}>
                  {t('auth.signUp.lastNameLabel')}
                </Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  }]}
                  placeholder={t('auth.signUp.lastNamePlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  textContentType="familyName"
                  editable={!loading}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.signUp.emailLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.signUp.emailPlaceholder')}
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
              {t('auth.signUp.passwordLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.signUp.passwordPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              editable={!loading}
            />

            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.signUp.confirmPasswordLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, {
                borderColor: colors.border.default,
                backgroundColor: agreedToTerms ? colors.primary.default : colors.background.card,
              }]}>
                {agreedToTerms && <Text style={styles.checkmark}>&#10003;</Text>}
              </View>
              <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                {t('auth.signUp.consent.terms')}
                <Text
                  style={{ color: colors.primary.default }}
                  onPress={() => router.push('/terms')}
                >
                  {t('auth.signUp.consent.termsLink')}
                </Text>
                {t('auth.signUp.consent.and')}
                <Text
                  style={{ color: colors.primary.default }}
                  onPress={() => router.push('/privacy')}
                >
                  {t('auth.signUp.consent.privacyLink')}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary.default, marginTop: 20 }]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary.foreground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                  {t('auth.signUp.button')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>
              {t('auth.signUp.hasAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} disabled={loading}>
              <Text style={[styles.footerLink, { color: colors.primary.default }]}>
                {t('auth.signUp.signIn')}
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
  scroll: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 24, alignItems: 'center', marginTop: 16 },
  brand: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 15 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  form: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 14, lineHeight: 20 },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 24 },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: '600' },
});
