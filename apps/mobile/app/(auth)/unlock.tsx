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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function UnlockScreen() {
  const { t } = useTranslation();
  const { unlock } = useAuthContext();
  const { colors } = useTheme();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    setError('');

    if (!password) {
      setError(t('auth.unlock.error.passwordRequired'));
      return;
    }

    setLoading(true);
    try {
      const success = await unlock(password);
      if (!success) {
        setError(t('auth.unlock.error.wrongPassword'));
        setPassword('');
      }
    } catch {
      setError(t('common.error'));
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
              {t('auth.unlock.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.unlock.subtitle')}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('auth.unlock.passwordLabel')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background.card,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }]}
              placeholder={t('auth.unlock.passwordPlaceholder')}
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              onSubmitEditing={handleUnlock}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary.default }]}
              onPress={handleUnlock}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary.foreground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                  {t('auth.unlock.button')}
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
  subtitle: { fontSize: 15, textAlign: 'center' },
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
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
});
