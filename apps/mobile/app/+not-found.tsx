import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.code, { color: colors.text.muted }]}>404</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>Page not found</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary.default }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
            Go Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  code: { fontSize: 64, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '500', marginBottom: 32 },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
