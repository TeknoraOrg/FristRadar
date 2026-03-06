import { useState, useEffect, useCallback, useRef } from 'react';
import * as Crypto from 'expo-crypto';
import * as store from '../lib/tokenStorage';

export type AuthStatus = 'loading' | 'setup-password' | 'locked' | 'unlocked';

interface AuthState {
  status: AuthStatus;
  onboardingCompleted: boolean;
}

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    onboardingCompleted: false,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const setIfMounted = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) setState(updater);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [hasPass, onboarded] = await Promise.all([
          store.hasPassword(),
          store.getOnboardingCompleted(),
        ]);
        if (!hasPass) {
          setIfMounted(() => ({ status: 'setup-password', onboardingCompleted: false }));
        } else {
          setIfMounted(() => ({ status: 'locked', onboardingCompleted: onboarded }));
        }
      } catch {
        setIfMounted(() => ({ status: 'setup-password', onboardingCompleted: false }));
      }
    })();
  }, [setIfMounted]);

  const setupPassword = useCallback(async (password: string) => {
    const hash = await hashPassword(password);
    await store.savePasswordHash(hash);
    setIfMounted(() => ({ status: 'unlocked', onboardingCompleted: false }));
  }, [setIfMounted]);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    const storedHash = await store.getPasswordHash();
    if (!storedHash) return false;
    const inputHash = await hashPassword(password);
    if (inputHash === storedHash) {
      setIfMounted((prev) => ({ ...prev, status: 'unlocked' }));
      return true;
    }
    return false;
  }, [setIfMounted]);

  const lock = useCallback(() => {
    setIfMounted((prev) => ({ ...prev, status: 'locked' }));
  }, [setIfMounted]);

  const completeOnboarding = useCallback(async () => {
    await store.setOnboardingCompleted(true);
    setIfMounted((prev) => ({ ...prev, onboardingCompleted: true }));
  }, [setIfMounted]);

  return {
    status: state.status,
    onboardingCompleted: state.onboardingCompleted,
    setupPassword,
    unlock,
    lock,
    completeOnboarding,
  };
}
