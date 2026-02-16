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
    <View style={{ flex: 1, backgroundColor: '#F0FDF4' }} testID="onboarding-page1">
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }} testID="progress-bar">
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: '#10B981', width: `${PAGE_PROGRESS.page1}%` }}
          />
        </View>
        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'right' }}>Étape 1/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Leaf size={80} color="#10B981" strokeWidth={1.5} />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          style={{ fontSize: 30, fontWeight: 'bold', color: '#065F46', textAlign: 'center', marginBottom: 16 }}
        >
          Vos plantes ont déjà une voix
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(600)}
          style={{ fontSize: 18, color: '#4B5563', textAlign: 'center', marginBottom: 32 }}
        >
          Nous allons simplement vous aider à l'entendre.
        </Animated.Text>
      </Animated.View>

      {/* Footer buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}>
        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            testID="button-start"
            onPress={handleStart}
            style={{ backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Commencer</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity testID="button-how-it-works" style={{ borderWidth: 2, borderColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: '#047857', fontWeight: '600', fontSize: 18 }}>Comment ça marche ?</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
