import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomTabsBar } from '@/design-system/components';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Tabs Layout
 *
 * Renders the main app interface with bottom navigation
 *
 * Primary auth guard is in app/index.tsx.
 * This layout adds a defensive redirect for deep-link / direct navigation
 * scenarios that bypass index.tsx routing.
 */
export default function TabsLayout() {
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
}
