import React, { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Leaf } from 'lucide-react-native';
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
    <OnboardingScreen testID="onboarding-page1">
      {/* Header with progress bar */}
      <OnboardingHeader progress={PAGE_PROGRESS.page1} step={1} />

      {/* Main content */}
      <OnboardingContent entering={FadeInDown.springify()}>
        {/* Icon */}
        <IconContainer entering={FadeInDown.delay(200).springify()}>
          <Leaf size={80} color="#10B981" strokeWidth={1.5} />
        </IconContainer>

        {/* Title */}
        <Title>Vos plantes ont déjà une voix</Title>

        {/* Subtitle */}
        <Subtitle>Nous allons simplement vous aider à l'entendre.</Subtitle>
      </OnboardingContent>

      {/* Footer buttons */}
      <OnboardingFooter>
        <Animated.View entering={FadeInDown.delay(800)}>
          <PremiumButton
            testID="button-start"
            variant="primary"
            size="md"
            onPress={handleStart}
          >
            Commencer
          </PremiumButton>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <PremiumButton
            testID="button-how-it-works"
            variant="secondary"
            size="md"
            onPress={() => {}}
          >
            Comment ça marche ?
          </PremiumButton>
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
