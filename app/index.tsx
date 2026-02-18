import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';

/**
 * Root Index Screen
 *
 * Central routing logic for the entire app
 * Decides which screen to show based on auth & onboarding state
 *
 * Flow:
 * 1. Wait for auth initialization
 * 2. Check authentication status
 * 3. Route to appropriate screen:
 *    - Not authenticated → /(auth) - Login
 *    - Authenticated but no onboarding → /onboarding - Onboarding flow
 *    - Authenticated + onboarding done → /(tabs) - Dashboard + main app
 * 4. Always show a loader to prevent black screen
 */
export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isOnboardingComplete } = useOnboardingStore();

  useEffect(() => {
    // Wait for auth to initialize from AsyncStorage
    if (authLoading) return;

    // Route 1: Not authenticated → Login screen
    if (!isAuthenticated) {
      router.replace('/(auth)');
      return;
    }

    // Route 2: Authenticated but onboarding incomplete → Onboarding flow
    if (!isOnboardingComplete) {
      router.replace('/onboarding');
      return;
    }

    // Route 3: Fully onboarded → Main app with tabs
    router.replace('/(tabs)');
  }, [authLoading, isAuthenticated, isOnboardingComplete, router]);

  // Show loading indicator while auth initializes and routing decision is made
  // This prevents black screen flickering while waiting for AsyncStorage
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <ActivityIndicator size="large" color="#2D5A27" />
    </View>
  );
}
