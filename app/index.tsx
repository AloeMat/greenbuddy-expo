/**
 * Root Index - Session-based Redirect
 *
 * Handles initial navigation based on auth session:
 * - No session → onboarding
 * - Session exists → (tabs) dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@auth/store/authStore';
import { ActivityIndicator, View, Text } from 'react-native';
import { logger } from '@lib/services/logger';

export default function RootIndex() {
  const router = useRouter();
  const { session, isLoading } = useAuthStore();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const navigate = async () => {
      try {
        if (isLoading) {
          logger.debug('🔐 Auth still loading...');
          return;
        }

        if (hasNavigated) {
          logger.debug('✅ Already navigated, skipping...');
          return;
        }

        // Determine target route
        const target = session ? '/(tabs)' : '/onboarding';
        logger.info('🎯 Navigation info:', {
          target,
          hasSession: !!session,
          isLoading
        });

        // Mark as navigated to prevent double navigation
        setHasNavigated(true);

        // Add small delay to ensure navigation stack is ready
        await new Promise(resolve => setTimeout(resolve, 200));

        // Navigate with error handling
        if (session) {
          logger.info('📱 Navigating to dashboard...');
          router.replace('/(tabs)');
        } else {
          logger.info('🎬 Navigating to onboarding...');
          router.replace('/onboarding');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('❌ Navigation error:', errorMsg);
        setError(errorMsg);
      }
    };

    navigate();
  }, [session, isLoading, hasNavigated, router]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          Navigation Error
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', fontSize: 12 }}>
          {error}
        </Text>
      </View>
    );
  }

  // Show loading while determining auth state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={{ marginTop: 16, color: '#666' }}>
        Loading...
      </Text>
    </View>
  );
}
