import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { logger } from '@/lib/services/logger';
import { COLORS } from '@/design-system/tokens/colors';

/**
 * Root Index Screen
 *
 * Central routing logic for the entire app
 * Decides which screen to show based on onboarding & auth state
 *
 * Flow:
 * 1. Wait for navigation stack to mount
 * 2. Wait for auth initialization
 * 3. Check onboarding status FIRST (Option A: onboarding before auth)
 * 4. Route to appropriate screen:
 *    - Onboarding not done → /onboarding (regardless of auth)
 *    - Onboarding done + not authenticated → /(auth) - Login/Register
 *    - Onboarding done + authenticated → /(tabs) - Dashboard
 * 5. Always show a loader to prevent black screen
 */
export default function IndexScreen() {
  console.log('🎯 IndexScreen mounted');
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { isAuthenticated: authStoreAuth, isLoading: authLoading } = useAuthStore();
  const { isOnboardingComplete } = useOnboardingStore();

  // Use real auth & onboarding state from stores
  const isAuthenticated = authStoreAuth;

  // Track if we've already navigated to prevent duplicate navigation
  const navigationAttemptedRef = useRef(false);

  // Reset navigation lock when auth or onboarding state changes
  // This allows re-routing when user logs in from /(auth) and returns to /
  useEffect(() => {
    navigationAttemptedRef.current = false;
  }, [isAuthenticated, isOnboardingComplete]);

  useEffect(() => {
    // Skip if we've already attempted navigation
    if (navigationAttemptedRef.current) {
      return;
    }

    // Wait for navigation root to be ready
    if (!rootNavigationState?.key) {
      logger.info('[IndexScreen] Waiting for router to be ready...');
      return;
    }

    // Wait for auth to initialize from AsyncStorage
    if (authLoading) {
      logger.info('[IndexScreen] Waiting for auth initialization...');
      return;
    }

    // Mark that we're attempting navigation
    navigationAttemptedRef.current = true;

    // Add small delay to ensure Stack is fully mounted before navigation
    const navigationTimer = setTimeout(() => {
      try {
        // Route 1: Onboarding not complete → Onboarding (regardless of auth)
        if (!isOnboardingComplete) {
          logger.info('[IndexScreen] Routing to onboarding → /onboarding');
          router.replace('/onboarding');
          return;
        }

        // Route 2: Onboarding done but not authenticated → Login
        if (!isAuthenticated) {
          logger.info('[IndexScreen] Routing to login → /(auth)');
          router.replace('/(auth)');
          return;
        }

        // Route 3: Onboarding done + authenticated → Main app
        logger.info('[IndexScreen] Routing to dashboard → /(tabs)');
        router.replace('/(tabs)');
      } catch (error) {
        logger.error('[IndexScreen] Navigation error:', error);
        navigationAttemptedRef.current = false;
      }
    }, 100); // 100ms delay for Stack to fully mount

    return () => clearTimeout(navigationTimer);
    // Dependencies: only re-run when these core states change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootNavigationState?.key, authLoading, isAuthenticated, isOnboardingComplete]);

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
      <ActivityIndicator size="large" color={COLORS.brand} />
    </View>
  );
}
