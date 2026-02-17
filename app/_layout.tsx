import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function RootLayout() {
  const { initializeAuth, isLoading } = useAuthStore();

  // Initialize auth on app startup
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔐 RootLayout: Initializing auth...');
        await initializeAuth?.();
        console.log('✅ RootLayout: Auth initialized');
      } catch (error) {
        console.log('❌ RootLayout: Auth init failed:', error);
      }
    };

    init();
  }, [initializeAuth]);

  // Show nothing while loading
  if (isLoading) {
    console.log('⏳ RootLayout: Still loading...');
    return null;
  }

  console.log('🎯 RootLayout: Auth ready, rendering Stack');

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
