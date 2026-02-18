import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';

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

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="plant/[id]" />
    </Stack>
  );
}
