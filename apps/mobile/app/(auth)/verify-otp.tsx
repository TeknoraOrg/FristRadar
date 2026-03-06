import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { verifyOtp, sendOtp, ApiError } from '../../src/lib/api';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { phone, countryCode } = useLocalSearchParams<{ phone: string; countryCode: string }>();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== OTP_LENGTH) {
      setError(t('auth.verifyOtp.error.incomplete'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(phone!, code, countryCode);
      router.push({
        pathname: '/(auth)/setup-password',
        params: {
          phone: phone!,
          countryCode,
          verificationToken: res.data.verificationToken,
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('common.error'));
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await sendOtp(phone!, countryCode);
      setCooldown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('common.error'));
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
              {t('auth.verifyOtp.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.verifyOtp.subtitle', { phone: phone })}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.otpRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[styles.otpInput, {
                  backgroundColor: colors.background.card,
                  borderColor: digit ? colors.primary.default : colors.border.default,
                  color: colors.text.primary,
                }]}
                value={digit}
                onChangeText={(v) => handleDigitChange(i, v)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!loading}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary.default }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary.foreground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                {t('auth.verifyOtp.verify')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendRow}
            onPress={handleResend}
            disabled={cooldown > 0 || resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color={colors.primary.default} />
            ) : (
              <Text style={[styles.resendText, {
                color: cooldown > 0 ? colors.text.muted : colors.primary.default,
              }]}>
                {cooldown > 0
                  ? t('auth.verifyOtp.resendIn', { seconds: cooldown })
                  : t('auth.verifyOtp.resend')}
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
  backButton: { position: 'absolute', top: 0, left: 0 },
  backText: { fontSize: 16, fontWeight: '500' },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  otpInput: {
    width: 46,
    height: 54,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  resendRow: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  resendText: { fontSize: 15, fontWeight: '500' },
});
