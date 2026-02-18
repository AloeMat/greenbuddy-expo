import { Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomTabsBar } from '@/design-system/components';

/**
 * Tabs Layout
 *
 * Renders the main app interface with bottom navigation
 *
 * IMPORTANT: Auth guards are handled upstream in app/index.tsx
 * This layout assumes the user is fully authenticated + onboarded
 * Do NOT add guards here to avoid black screen on redirect
 */
export default function TabsLayout() {
  // Render tabs with bottom navigation
  // (Guards already enforced by app/index.tsx)
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
