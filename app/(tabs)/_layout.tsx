import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { BottomTabsBar } from '@/design-system/components';

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isOnboardingComplete } = useOnboardingStore();

  console.log('🎯 TabsLayout: Checking auth/onboarding', { isAuthenticated, isOnboardingComplete, authLoading });

  // Check authentication and onboarding on mount
  useEffect(() => {
    if (authLoading) return;

    console.log('✅ TabsLayout: Auth loaded, checking status');

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      console.log('❌ TabsLayout: Not authenticated, redirecting to /(auth)');
      router.replace('/(auth)');
      return;
    }

    // Authenticated but onboarding incomplete - redirect to onboarding
    if (!isOnboardingComplete) {
      console.log('⏳ TabsLayout: Onboarding incomplete, redirecting to /onboarding');
      router.replace('/onboarding');
      return;
    }

    console.log('✅ TabsLayout: All checks passed, showing dashboard');
  }, [authLoading, isAuthenticated, isOnboardingComplete, router]);

  // Show loading while auth is being checked
  if (authLoading) {
    console.log('⏳ TabsLayout: Auth still loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2D5A27" />
      </View>
    );
  }

  // Redirect if not authenticated or onboarding incomplete
  if (!isAuthenticated || !isOnboardingComplete) {
    return null;
  }

  // All checks passed - render tabs with bottom navigation
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
