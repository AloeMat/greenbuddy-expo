/**
 * Root Index - Session-based Redirect
 *
 * Handles initial navigation based on auth session:
 * - No session → onboarding
 * - Session exists → (tabs) dashboard
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@auth/store/authStore';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
  const router = useRouter();
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Redirect based on session
    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [session, isLoading, router]);

  // Show loading while determining auth state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}
