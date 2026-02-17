import React from 'react';
import { ScrollView, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing } from '@tokens/spacing';
import { onboardingColors } from '@design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, OnboardingFooter, Title, Subtitle, PrimaryButton } from '@design-system/onboarding/components';
import { VariantPage } from '../../types/onboardingSchema';
import { useOnboardingStore } from '../../store/onboardingStore';
import { getStepNumber } from '../../utils/getStepNumber';
import * as Haptics from 'expo-haptics';

interface VariantRendererProps {
  page: VariantPage;
  onNavigate: (nextPageId: string) => void;
}

export function VariantRenderer({ page, onNavigate }: VariantRendererProps) {
  const { userProfile } = useOnboardingStore();
  const selectedVariantKey = (userProfile && userProfile in page.variants ? userProfile : 'default') as keyof typeof page.variants;
  const variant = page.variants[selectedVariantKey] || page.variants.default;

  const handleNavigate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(page.next);
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Title>{page.title}</Title>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Subtitle>{variant.text}</Subtitle>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={{ fontSize: 12, color: onboardingColors.text.muted, fontStyle: 'italic', marginTop: spacing.lg, textAlign: 'center' }}>Ton : {variant.tone}</Text>
        </Animated.View>
      </ScrollView>
      <OnboardingFooter>
        <Animated.View entering={FadeInDown.delay(400).springify()} pointerEvents="auto" style={{ width: '100%' }}>
          <PrimaryButton testID={`button-${page.cta_primary.action}`} onPress={handleNavigate}>
            {page.cta_primary.children}
          </PrimaryButton>
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
