import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { radius } from '@tokens/radius';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';

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
    <View style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View style={{ height: 12, backgroundColor: onboardingColors.gray[200], borderRadius: radius.full, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            style={{ width: `${PAGE_PROGRESS.page5_identification}%`, height: '100%', backgroundColor: onboardingColors.green[500] }}
          />
        </View>
        <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 8/14</Text>
      </View>

      {/* Main content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown}
          style={{ fontSize: 24, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 16 }}
        >
          Identification en cours...
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginBottom: 32 }}
        >
          On analyse votre plante pour vous donner les meilleurs conseils.
        </Animated.Text>

        {/* Loading spinner */}
        <Animated.View entering={FadeInDown.delay(400)} style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color={onboardingColors.green[500]} />
          <Animated.Text
            style={[animatedStyle, { fontSize: 20, color: onboardingColors.green[500], fontWeight: '600', marginTop: 32 }]}
          >
            🌿
          </Animated.Text>
        </Animated.View>

        {/* Identified plant info (if available) */}
        {identifiedPlant && (
          <Animated.View entering={FadeInDown.delay(600)} style={{ marginTop: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: onboardingColors.text.secondary }}>
              Nous avons identifié : {identifiedPlant.commonName}
            </Text>
            <Text style={{ fontSize: 14, color: onboardingColors.text.muted, marginTop: 8 }}>{identifiedPlant.scientificName}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
