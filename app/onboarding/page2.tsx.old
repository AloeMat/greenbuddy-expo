import React, { useEffect } from 'react';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Droplet } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import {
  OnboardingScreen,
  OnboardingHeader,
  OnboardingContent,
  OnboardingFooter,
  IconContainer,
  Title,
  Subtitle,
} from '@design-system/onboarding';
import { PremiumButton } from '@design-system/components';

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
    <OnboardingScreen testID="onboarding-page2">
      <OnboardingHeader progress={PAGE_PROGRESS.page2} step={2} />

      <OnboardingContent entering={FadeInDown.springify()}>
        <IconContainer entering={FadeInDown.delay(200).springify()}>
          <Animated.View style={animatedStyle}>
            <Droplet size={80} color="#10B981" strokeWidth={1.5} />
          </Animated.View>
        </IconContainer>

        <Title>Projection émotionnelle</Title>

        <Subtitle>{`Elles ressentent plus que vous ne le pensez…\n💧☀️🌡️🌿`}</Subtitle>
      </OnboardingContent>

      <OnboardingFooter>
        <Animated.View entering={FadeInDown.delay(800)}>
          <PremiumButton
            testID="button-continue"
            variant="primary"
            size="md"
            onPress={handleContinue}
          >
            Continuer
          </PremiumButton>
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
