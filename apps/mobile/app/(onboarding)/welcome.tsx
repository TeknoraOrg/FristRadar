import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { completeOnboarding } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary.default }]}>
            {t('brand.name')}
          </Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('onboarding.welcome.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem label={t('tabs.letters')} colors={colors} />
          <FeatureItem label={t('tabs.calendar')} colors={colors} />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary.default }]}
          onPress={handleGetStarted}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary.foreground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
              {t('onboarding.welcome.getStarted')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={[featureStyles.row, { backgroundColor: colors.background.card, borderColor: colors.border.light }]}>
      <View style={[featureStyles.dot, { backgroundColor: colors.primary.default }]} />
      <Text style={[featureStyles.text, { color: colors.text.primary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  brand: { fontSize: 38, fontWeight: '700', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  features: { marginBottom: 40, gap: 12 },
  button: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '600' },
});

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { fontSize: 16, fontWeight: '500' },
});
