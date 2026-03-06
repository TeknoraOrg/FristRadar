import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  AUTH_TOKEN: 'fristradar_auth_token',
  PASSWORD_HASH: 'fristradar_password_hash',
  ONBOARDING_COMPLETED: 'fristradar_onboarding_completed',
} as const;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ─── Auth Token ──────────────────────────────────────────────────────────────

export async function saveAuthToken(token: string): Promise<void> {
  await setItem(KEYS.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  return getItem(KEYS.AUTH_TOKEN);
}

export async function removeAuthToken(): Promise<void> {
  await removeItem(KEYS.AUTH_TOKEN);
}

export async function hasAuthToken(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}

// ─── Local Password ──────────────────────────────────────────────────────────

export async function savePasswordHash(hash: string): Promise<void> {
  await setItem(KEYS.PASSWORD_HASH, hash);
}

export async function getPasswordHash(): Promise<string | null> {
  return getItem(KEYS.PASSWORD_HASH);
}

export async function hasPassword(): Promise<boolean> {
  const hash = await getPasswordHash();
  return hash !== null;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export async function setOnboardingCompleted(value: boolean): Promise<void> {
  if (value) {
    await setItem(KEYS.ONBOARDING_COMPLETED, 'true');
  } else {
    await removeItem(KEYS.ONBOARDING_COMPLETED);
  }
}

export async function getOnboardingCompleted(): Promise<boolean> {
  const val = await getItem(KEYS.ONBOARDING_COMPLETED);
  return val === 'true';
}
