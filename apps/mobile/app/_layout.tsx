import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { AuthProvider, useAuthContext } from '../src/contexts/AuthContext';
import { initLanguage } from '../src/lib/languageService';
import '../src/i18n/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AuthGuard() {
  const { status, user } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAppGroup = segments[0] === '(app)';

    if (status === 'unauthenticated') {
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
    } else if (status === 'verify-email') {
      router.replace('/(auth)/verify-email');
    } else if (status === 'authenticated') {
      if (user && !user.onboarding_completed) {
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)/language');
        }
      } else if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(app)/(tabs)');
      }
    }
  }, [status, user, segments, router]);

  return <Slot />;
}

function RootContent() {
  const { colors, isDark } = useTheme();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initLanguage().then(() => setI18nReady(true)).catch(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <AuthGuard />
      </AuthProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootContent />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
