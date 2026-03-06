import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from '../i18n/i18n';

export type SupportedLanguage = 'en' | 'de';
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'de'];

const LANGUAGE_KEY = '@fristradar:language';

export const LANGUAGE_NATIVE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
};

async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) return stored as SupportedLanguage;
  } catch {}
  return null;
}

async function setStoredLanguage(lang: SupportedLanguage): Promise<void> {
  try { await AsyncStorage.setItem(LANGUAGE_KEY, lang); } catch {}
}

function getDeviceLanguage(): SupportedLanguage {
  try {
    const locales = getLocales();
    const code = locales[0]?.languageCode?.toLowerCase();
    if (code && SUPPORTED_LANGUAGES.includes(code as SupportedLanguage)) return code as SupportedLanguage;
  } catch {}
  return 'de';
}

export async function initLanguage(): Promise<SupportedLanguage> {
  const stored = await getStoredLanguage();
  const lang = stored ?? getDeviceLanguage();
  if (!stored) await setStoredLanguage(lang);
  await i18n.changeLanguage(lang);
  return lang;
}

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await setStoredLanguage(lang);
  await i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): SupportedLanguage {
  const lng = i18n.language as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(lng) ? lng : 'de';
}
