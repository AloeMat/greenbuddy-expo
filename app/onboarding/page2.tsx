import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Droplet } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';

export default function Page2() {
  const { setCurrentPage, markPageComplete } = useOnboardingStore();
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    trackPageView('page2');
    setCurrentPage('page2');
  }, [setCurrentPage]);

  // Shake animation for "plante_fremit"
  useEffect(() => {
    shakeAnimation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      ),
      -1,
      false
    );
  }, [shakeAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  const handleContinue = () => {
    markPageComplete('page2');
    router.push('/onboarding/page3');
  };

  return (
    <View className="flex-1 bg-green-50" testID="onboarding-page2">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2" testID="progress-bar">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page2}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 2/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="flex-1 justify-center px-6">
        {/* Icon with shake animation */}
        <View className="items-center mb-8">
          <Animated.View entering={FadeInDown.delay(200).springify()} style={animatedStyle}>
            <Droplet size={80} color="#10B981" strokeWidth={1.5} />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-3xl font-bold text-green-900 text-center mb-4"
        >
          Projection émotionnelle
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(600)}
          className="text-lg text-gray-700 text-center mb-8"
        >
          Elles ressentent plus que vous ne le pensez…{'\n'}💧☀️🌡️🌿
        </Animated.Text>
      </Animated.View>

      {/* Footer button */}
      <View className="px-6 pb-8">
        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            testID="button-continue"
            onPress={handleContinue}
            className="bg-green-500 rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Continuer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
