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
import { LogBox } from 'react-native';
import { notificationService } from '@lib/services/notifications';
import { performanceMonitor } from '@utils/performanceMonitor';
import { initializeNotificationHandler, scheduleDailyCheckInNotification } from '@gamification/services/dailyNotificationService';
import { logger } from '@lib/services/logger';

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

  // Initialize auth on app startup
  useEffect(() => {
    const init = async () => {
      await initializeAuth?.();
    };
    init();
  }, [initializeAuth]);

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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? (
        // Authenticated routes - user has signed up
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Unauthenticated routes - onboarding as primary entry point
        // (signup modal appears at end of onboarding step5)
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      )}
      {/* Auth routes accessible if user wants to login with existing account */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* Debug/test routes - always available */}
      <Stack.Screen name="test-nav" options={{ headerShown: false }} />
      <Stack.Screen name="debug" options={{ headerShown: false }} />
    </Stack>
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
