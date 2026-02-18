import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AppErrorBoundary } from '@/lib/components/AppErrorBoundary';

export default function RootLayout() {
  const { initializeAuth, isLoading } = useAuthStore();

  // Initialize auth on app startup (run only once at mount)
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth?.();
      } catch (error) {
        // Silent fail - user will see login screen
      }
    };

    init();
  }, []); // Empty deps: only run once at mount, never again

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="plant/[id]" />
      </Stack>
    </AppErrorBoundary>
  );
}
