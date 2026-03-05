import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import {
  changeLanguage,
  getCurrentLanguage,
  SUPPORTED_LANGUAGES,
  LANGUAGE_NATIVE_NAMES,
  type SupportedLanguage,
} from '../../src/lib/languageService';

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<SupportedLanguage>(getCurrentLanguage());

  const handleSelect = async (lang: SupportedLanguage) => {
    setSelected(lang);
    await changeLanguage(lang);
  };

  const handleContinue = () => {
    router.push('/(onboarding)/welcome');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('onboarding.language.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {t('onboarding.language.subtitle')}
          </Text>
        </View>

        <View style={styles.options}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang === selected;
            return (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? colors.primary.light : colors.background.card,
                    borderColor: isSelected ? colors.primary.default : colors.border.default,
                  },
                ]}
                onPress={() => handleSelect(lang)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  { color: isSelected ? colors.primary.default : colors.text.primary },
                ]}>
                  {LANGUAGE_NATIVE_NAMES[lang]}
                </Text>
                {isSelected && (
                  <Text style={[styles.checkIcon, { color: colors.primary.default }]}>
                    &#10003;
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary.default }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
            {t('common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center' },
  options: { marginBottom: 40, gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: { fontSize: 18, fontWeight: '600' },
  checkIcon: { fontSize: 20, fontWeight: '700' },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
});
