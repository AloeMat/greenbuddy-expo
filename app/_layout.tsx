// Polyfill for import.meta in web environment
if (typeof globalThis !== 'undefined' && !(globalThis as any).import) {
  (globalThis as any).import = {
    meta: {
      env: {
        MODE: typeof window !== 'undefined' ? 'production' : 'development'
      }
    }
  };
}

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@auth/store/authStore';
import { ErrorBoundary } from '@lib/components/ErrorBoundary';
import { LogBox, View, ActivityIndicator } from 'react-native';
import { notificationService } from '@lib/services/notifications';
import { performanceMonitor } from '@lib/utils/performanceMonitor';
import { initializeNotificationHandler, scheduleDailyCheckInNotification } from '@gamification/services/dailyNotificationService';
import { logger } from '@lib/services/logger';
import { GamificationListener } from '@gamification/listeners/GamificationListener';
import { avatarFactory } from '@plants/factories/AvatarImageFactory';

// Empêcher le splash screen de disparaître automatiquement
SplashScreen.preventAutoHideAsync();

// Start monitoring app launch performance
performanceMonitor.startAppLaunch();

// Ignorer certains avertissements non critiques
LogBox.ignoreLogs(['Require cycle:']);

// Initialize React Query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Root layout component
 * Handles authentication state and navigation structure
 */
function RootLayoutNav() {
  const { session, isLoading: authLoading, initializeAuth } = useAuthStore();
  const [splashHidden, setSplashHidden] = useState(false);

  // Initialize auth on app startup (only once)
  useEffect(() => {
    const init = async () => {
      try {
        logger.info('🔐 RootLayout: Initializing auth...');
        await initializeAuth?.();
        logger.info('✅ RootLayout: Auth initialized');
      } catch (error) {
        logger.error('❌ RootLayout: Auth init failed:', error);
      }
    };
    init();
  }, []); // Empty dependency array - run only once on mount

  // Preload avatar images on app startup (Flyweight Pattern optimization)
  useEffect(() => {
    const preloadAvatars = async () => {
      try {
        logger.info('🎨 Preloading avatar images for Flyweight Pattern...');
        await avatarFactory.preloadAvatarImages();
        const stats = avatarFactory.getStats();
        logger.info('✅ Avatar preloading complete', {
          preloaded: stats.preloadedCount,
          totalAvatars: stats.poolSize,
          memorySavings: avatarFactory.getMemorySavingsEstimate(100)
        });
      } catch (error: any) {
        logger.warn('⚠️ Avatar preloading failed (non-critical)', {
          message: error instanceof Error ? error.message : String(error)
        });
      }
    };

    preloadAvatars();
  }, []);

  // Hide splash screen after auth is initialized
  useEffect(() => {
    const hideSplash = async () => {
      try {
        console.log('🔐 Auth loading state:', authLoading);
        if (authLoading) return;

        console.log('🎬 Hiding splash screen...');
        await SplashScreen.hideAsync();
        performanceMonitor.endAppLaunch();
        performanceMonitor.logMetricsSummary();
        setSplashHidden(true);
        console.log('✅ Splash screen hidden');
      } catch (error) {
        console.error('Error hiding splash:', error);
        setSplashHidden(true); // Hide anyway
      }
    };

    if (!splashHidden) {
      hideSplash();
    }
  }, [splashHidden, authLoading]);

  // Initialize notifications when auth is loaded
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize base notification handler
        await notificationService.initialize();
        await notificationService.registerForPushNotificationsAsync();

        // Initialize daily check-in notification handler
        initializeNotificationHandler();

        // Schedule daily notification if user has it enabled
        // (check will be done in hook when settings are loaded)
        logger.info('All notification systems initialized');
      } catch (error) {
        logger.error('Failed to initialize notifications', error);
      }
    };

    if (!authLoading) {
      initializeNotifications();
    }
  }, [authLoading]);

  // Determine initial route based on session
  const initialRouteName = session ? '(tabs)' : 'onboarding';

  if (authLoading) {
    // Show loading while auth initializes
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <>
      {/* Mediator Pattern: GamificationListener (invisible but listens to all events) */}
      <GamificationListener />

      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        {/* Auth groups - always available */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Onboarding - for new users */}
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />

        {/* Main app - for authenticated users */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Hidden: index.tsx is not used anymore */}
        {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
