import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../lib/api';
import * as tokenStorage from '../lib/tokenStorage';
import type { User, UpdateUserInput } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'verify-email';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  pendingEmail: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    pendingEmail: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const setIfMounted = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) setState(updater);
  }, []);

  // Bootstrap: check for existing tokens and load user
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await tokenStorage.getTokens();
        if (!accessToken) {
          setIfMounted(() => ({ status: 'unauthenticated', user: null, pendingEmail: null }));
          return;
        }

        // Try to load cached user first for fast startup
        const cachedUser = await tokenStorage.getUser();
        if (cachedUser) {
          setIfMounted(() => ({ status: 'authenticated', user: cachedUser, pendingEmail: null }));
        }

        // Then refresh from server
        try {
          const freshUser = await api.getMe();
          await tokenStorage.saveUser(freshUser);
          setIfMounted(() => ({ status: 'authenticated', user: freshUser, pendingEmail: null }));
        } catch (err) {
          if (err instanceof api.ApiError && err.status === 401) {
            await tokenStorage.clearTokens();
            setIfMounted(() => ({ status: 'unauthenticated', user: null, pendingEmail: null }));
          }
          // If network error but we have a cached user, stay authenticated
          if (!cachedUser) {
            setIfMounted(() => ({ status: 'unauthenticated', user: null, pendingEmail: null }));
          }
        }
      } catch {
        setIfMounted(() => ({ status: 'unauthenticated', user: null, pendingEmail: null }));
      }
    })();
  }, [setIfMounted]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    await tokenStorage.saveTokens(result.access_token, result.refresh_token);
    await tokenStorage.saveUser(result.user);
    setIfMounted(() => ({ status: 'authenticated', user: result.user, pendingEmail: null }));
    return result.user;
  }, [setIfMounted]);

  const signUp = useCallback(async (params: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    const result = await api.register(params);
    if (result.access_token) {
      // Server auto-verified or doesn't require email verification
      await tokenStorage.saveTokens(result.access_token, result.refresh_token);
      await tokenStorage.saveUser(result.user);
      setIfMounted(() => ({ status: 'authenticated', user: result.user, pendingEmail: null }));
    } else {
      // Email verification required
      setIfMounted((prev) => ({ ...prev, status: 'verify-email', pendingEmail: params.email }));
    }
  }, [setIfMounted]);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const result = await api.verifyOtp(email, code);
    await tokenStorage.saveTokens(result.access_token, result.refresh_token);
    await tokenStorage.saveUser(result.user);
    setIfMounted(() => ({ status: 'authenticated', user: result.user, pendingEmail: null }));
    return result.user;
  }, [setIfMounted]);

  const resendVerificationEmail = useCallback(async (email: string) => {
    await api.resendVerification(email);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Still clear local tokens even if server call fails
    }
    await tokenStorage.clearTokens();
    setIfMounted(() => ({ status: 'unauthenticated', user: null, pendingEmail: null }));
  }, [setIfMounted]);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    await api.forgotPassword(email);
    await tokenStorage.setPasswordRecoveryFlag(true);
  }, []);

  const updatePassword = useCallback(async (token: string, newPassword: string) => {
    const result = await api.resetPassword(token, newPassword);
    await tokenStorage.saveTokens(result.access_token, result.refresh_token);
    await tokenStorage.saveUser(result.user);
    await tokenStorage.setPasswordRecoveryFlag(false);
    setIfMounted(() => ({ status: 'authenticated', user: result.user, pendingEmail: null }));
    return result.user;
  }, [setIfMounted]);

  const refreshProfile = useCallback(async () => {
    try {
      const user = await api.getMe();
      await tokenStorage.saveUser(user);
      setIfMounted((prev) => ({ ...prev, user }));
      return user;
    } catch {
      return state.user;
    }
  }, [setIfMounted, state.user]);

  const updateProfile = useCallback(async (data: UpdateUserInput) => {
    const user = await api.updateMe(data);
    await tokenStorage.saveUser(user);
    setIfMounted((prev) => ({ ...prev, user }));
    return user;
  }, [setIfMounted]);

  return {
    status: state.status,
    user: state.user,
    pendingEmail: state.pendingEmail,
    signIn,
    signUp,
    signOut,
    verifyOtp,
    resendVerificationEmail,
    resetPasswordForEmail,
    updatePassword,
    refreshProfile,
    updateProfile,
  };
}
