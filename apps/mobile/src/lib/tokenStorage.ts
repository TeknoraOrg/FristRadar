import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '../types';

const KEYS = {
  ACCESS_TOKEN: 'fristradar_access_token',
  REFRESH_TOKEN: 'fristradar_refresh_token',
  USER: 'fristradar_user',
  DEVICE_ID: 'fristradar_device_id',
  PASSWORD_RECOVERY: 'fristradar_password_recovery',
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

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    setItem(KEYS.ACCESS_TOKEN, accessToken),
    setItem(KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

export async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [accessToken, refreshToken] = await Promise.all([
    getItem(KEYS.ACCESS_TOKEN),
    getItem(KEYS.REFRESH_TOKEN),
  ]);
  return { accessToken, refreshToken };
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeItem(KEYS.ACCESS_TOKEN),
    removeItem(KEYS.REFRESH_TOKEN),
    removeItem(KEYS.USER),
    removeItem(KEYS.PASSWORD_RECOVERY),
  ]);
}

export async function updateTokens(accessToken: string, refreshToken: string): Promise<void> {
  await saveTokens(accessToken, refreshToken);
}

export async function saveUser(user: User): Promise<void> {
  await setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const raw = await getItem(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function updateUser(updates: Partial<User>): Promise<void> {
  const current = await getUser();
  if (current) {
    await saveUser({ ...current, ...updates });
  }
}

export async function getDeviceId(): Promise<string> {
  let id = await getItem(KEYS.DEVICE_ID);
  if (!id) {
    id = generateUUID();
    await setItem(KEYS.DEVICE_ID, id);
  }
  return id;
}

export async function setPasswordRecoveryFlag(value: boolean): Promise<void> {
  if (value) {
    await setItem(KEYS.PASSWORD_RECOVERY, 'true');
  } else {
    await removeItem(KEYS.PASSWORD_RECOVERY);
  }
}

export async function getPasswordRecoveryFlag(): Promise<boolean> {
  const val = await getItem(KEYS.PASSWORD_RECOVERY);
  return val === 'true';
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
