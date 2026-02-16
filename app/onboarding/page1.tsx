import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';

export default function Page1() {
  const { setCurrentPage, markPageComplete } = useOnboardingStore();

  useEffect(() => {
    trackPageView('page1');
    setCurrentPage('page1');
  }, [setCurrentPage]);

  const handleStart = () => {
    markPageComplete('page1');
    router.push('/onboarding/page2');
  };

  return (
    <View className="flex-1 bg-green-50" testID="onboarding-page1">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2" testID="progress-bar">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page1}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 1/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="flex-1 justify-center px-6">
        {/* Icon */}
        <View className="items-center mb-8">
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Leaf size={80} color="#10B981" strokeWidth={1.5} />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-3xl font-bold text-green-900 text-center mb-4"
        >
          Vos plantes ont déjà une voix
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(600)}
          className="text-lg text-gray-700 text-center mb-8"
        >
          Nous allons simplement vous aider à l'entendre.
        </Animated.Text>
      </Animated.View>

      {/* Footer buttons */}
      <View className="px-6 pb-8 gap-3">
        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            testID="button-start"
            onPress={handleStart}
            className="bg-green-500 rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Commencer</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity testID="button-how-it-works" className="border-2 border-green-500 rounded-lg py-4 items-center">
            <Text className="text-green-700 font-semibold text-lg">Comment ça marche ?</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
