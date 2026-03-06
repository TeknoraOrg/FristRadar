import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t('home.title')}
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={[styles.emptyIcon, { color: colors.text.muted }]}>&#9993;</Text>
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          {t('home.empty')}
        </Text>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: colors.primary.default }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.scanButtonText, { color: colors.primary.foreground }]}>
            {t('home.scan')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  scanButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  scanButtonText: { fontSize: 16, fontWeight: '600' },
});
