import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { queryClient } from '@/lib/queryClient';
import { initializeSentry } from '@/lib/services/sentry';

// Initialize Sentry before app renders (no-ops if no DSN configured)
initializeSentry();

/**
 * Root Layout
 * Initializes auth on mount and provides QueryClient to the app tree
 */
export default function RootLayout() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth once on app launch
  useEffect(() => {
    initializeAuth?.();
  }, [initializeAuth]);

  // Show loader while auth initializes
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D5A27" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="plant/[id]" />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
