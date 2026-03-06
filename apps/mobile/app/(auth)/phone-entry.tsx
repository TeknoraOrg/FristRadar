import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { sendOtp, ApiError } from '../../src/lib/api';
import { COUNTRY_CODES, type CountryCode } from '../../src/lib/validation';

export default function PhoneEntryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('DE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode)!;

  const handleSendOtp = async () => {
    setError('');
    const cleaned = phone.replace(/[\s\-().]/g, '');
    if (!cleaned) { setError(t('auth.phoneEntry.error.phoneRequired')); return; }
    setLoading(true);
    try {
      await sendOtp(cleaned, countryCode);
      router.push({ pathname: '/(auth)/verify-otp', params: { phone: cleaned, countryCode } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.primary.default }]}>{t('brand.name')}</Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>{t('auth.phoneEntry.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{t('auth.phoneEntry.subtitle')}</Text>
          </View>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text.primary }]}>{t('auth.phoneEntry.phoneLabel')}</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={[styles.countryPicker, { backgroundColor: colors.background.card, borderColor: colors.border.default }]}
                onPress={() => setPickerVisible(true)} disabled={loading}>
                <Text style={[styles.countryPickerText, { color: colors.text.primary }]}>
                  {selectedCountry.flag} {selectedCountry.dialCode}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.phoneInput, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary }]}
                placeholder={t('auth.phoneEntry.phonePlaceholder')} placeholderTextColor={colors.text.muted}
                value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!loading} autoFocus
              />
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary.default }]}
              onPress={handleSendOtp} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color={colors.primary.foreground} /> :
                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>{t('auth.phoneEntry.sendOtp')}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={pickerVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{t('auth.phoneEntry.selectCountry')}</Text>
            <FlatList data={COUNTRY_CODES} keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryItem, { backgroundColor: item.code === countryCode ? colors.primary.default + '20' : 'transparent' }]}
                  onPress={() => { setCountryCode(item.code as CountryCode); setPickerVisible(false); }}>
                  <Text style={[styles.countryItemText, { color: colors.text.primary }]}>
                    {item.flag}  {item.name} ({item.dialCode})
                  </Text>
                </TouchableOpacity>
              )} />
          </View>
        </TouchableOpacity>
      </Modal>
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
  phoneRow: { flexDirection: 'row', gap: 8 },
  countryPicker: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
  countryPickerText: { fontSize: 16 },
  phoneInput: { flex: 1, height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 16 },
  button: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  buttonText: { fontSize: 17, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  countryItem: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8 },
  countryItemText: { fontSize: 16 },
});
