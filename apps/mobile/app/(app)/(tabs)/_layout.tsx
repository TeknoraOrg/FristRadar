import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.border.light,
        },
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.letters'),
          tabBarIcon: ({ color }) => (
            <Text style={[tabStyles.icon, { color }]}>&#9993;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarIcon: ({ color }) => (
            <Text style={[tabStyles.icon, { color }]}>&#128197;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <Text style={[tabStyles.icon, { color }]}>&#9881;</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  icon: { fontSize: 22 },
});
