import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

export default function Page5Identification() {
  const { setCurrentPage, markPageComplete, identifiedPlant } = useOnboardingStore();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    trackPageView('page5_identification');
    setCurrentPage('page5_identification');
  }, [setCurrentPage]);

  // Fade in/out animation for plant image
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Simulate identification completion after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      markPageComplete('page5_identification');
      router.push('/onboarding/page6_dynamic');
    }, 2000);

    return () => clearTimeout(timer);
  }, [markPageComplete]);

  return (
    <View className="flex-1 bg-green-50">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            style={{ width: `${PAGE_PROGRESS.page5_identification}%` }}
            className="h-full bg-green-500"
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 8/14</Text>
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Title */}
        <Animated.Text
          entering={FadeInDown}
          className="text-2xl font-bold text-green-900 text-center mb-4"
        >
          Identification en cours...
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="text-base text-gray-700 text-center mb-8"
        >
          On analyse votre plante pour vous donner les meilleurs conseils.
        </Animated.Text>

        {/* Loading spinner */}
        <Animated.View entering={FadeInDown.delay(400)} className="items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Animated.Text
            style={animatedStyle}
            className="text-xl text-green-600 font-semibold mt-8"
          >
            🌿
          </Animated.Text>
        </Animated.View>

        {/* Identified plant info (if available) */}
        {identifiedPlant && (
          <Animated.View entering={FadeInDown.delay(600)} className="mt-8 text-center">
            <Text className="text-base text-gray-700">
              Nous avons identifié : {identifiedPlant.commonName}
            </Text>
            <Text className="text-sm text-gray-500 mt-2">{identifiedPlant.scientificName}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
