import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { onboardingColors } from '@design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, Title, Subtitle } from '@design-system/onboarding/components';
import { FeedbackPage } from '@onboarding/types/onboardingSchema';
import { getStepNumber } from '@onboarding/utils/getStepNumber';

interface FeedbackRendererProps {
  page: FeedbackPage;
  onNavigate: (nextPageId: string) => void;
}

export function FeedbackRenderer({ page, onNavigate }: FeedbackRendererProps) {
  useEffect(() => {
    if (typeof page.auto_advance === 'number') {
      const timer = setTimeout(() => onNavigate(page.next), page.auto_advance);
      return () => clearTimeout(timer);
    }
    const defaultTimeout = 3000;
    const timer = setTimeout(() => onNavigate(page.next), defaultTimeout);
    return () => clearTimeout(timer);
  }, [page.auto_advance, page.next, onNavigate]);

  const getAnimationEmoji = () => {
    switch (page.animation) {
      case 'checkmark_success': return '✅';
      case 'avatar_reassure': return '❤️';
      default: return '🌿';
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <OnboardingContent>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Title>{page.title}</Title>
        </Animated.View>
        {page.text && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Subtitle>{page.text}</Subtitle>
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ alignItems: 'center', marginVertical: spacing['5xl'] }}>
          <View style={{ width: 100, height: 100, borderRadius: radius.full, backgroundColor: onboardingColors.green[50], justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 50 }}>{getAnimationEmoji()}</Text>
          </View>
        </Animated.View>
      </OnboardingContent>
    </OnboardingScreen>
  );
}
