import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../../src/contexts/AuthContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import {
  changeLanguage,
  getCurrentLanguage,
  LANGUAGE_NATIVE_NAMES,
  type SupportedLanguage,
} from '../../../src/lib/languageService';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, signOut } = useAuthContext();
  const [signingOut, setSigningOut] = useState(false);
  const currentLang = getCurrentLanguage();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const toggleLanguage = async () => {
    const next: SupportedLanguage = currentLang === 'de' ? 'en' : 'de';
    await changeLanguage(next);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t('tabs.settings')}
        </Text>
      </View>

      <View style={styles.content}>
        {user && (
          <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}>
            <Text style={[styles.userName, { color: colors.text.primary }]}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={[styles.userEmail, { color: colors.text.secondary }]}>
              {user.email}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowLabel, { color: colors.text.primary }]}>
            {t('onboarding.language.title')}
          </Text>
          <Text style={[styles.rowValue, { color: colors.text.secondary }]}>
            {LANGUAGE_NATIVE_NAMES[currentLang]}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.status.errorLight }]}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.status.error} />
          ) : (
            <Text style={[styles.signOutText, { color: colors.status.error }]}>
              Sign Out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700' },
  content: { padding: 24, gap: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  userName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowValue: { fontSize: 15 },
  signOutButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signOutText: { fontSize: 16, fontWeight: '600' },
});
