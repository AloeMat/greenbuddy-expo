import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import React from 'react';
import { BottomTabsBar } from '@/design-system/components';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * DashboardTabsLayout Component
 *
 * Renders the main app interface with bottom navigation tabs.
 *
 * Primary auth guard is in app/index.tsx.
 * This layout adds a defensive redirect for deep-link / direct navigation
 * scenarios that bypass index.tsx routing.
 *
 * Features:
 * - Auth guard (redirect if unauthenticated)
 * - Stack navigator for main app screens
 * - BottomTabsBar for tab-based navigation
 *
 * This component is part of the dashboard feature's layout encapsulation (Phase 5).
 */
export const DashboardTabsLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Defensive guard: redirect unauthenticated deep-link access
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="garden" />
          <Stack.Screen name="progress" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="scan" />
        </Stack>
      </View>
      <BottomTabsBar />
    </View>
  );
};
