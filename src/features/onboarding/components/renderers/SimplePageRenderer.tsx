import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, OnboardingFooter, Title, Subtitle, PrimaryButton, SecondaryButton } from '@/design-system/onboarding/components';
import { SimplePage } from '@/features/onboarding/types/onboardingSchema';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import * as Haptics from 'expo-haptics';

interface SimplePageRendererProps {
  page: SimplePage;
  onNavigate: (nextPageId: string) => void;
}

/**
 * SimplePageRenderer
 *
 * Renders simple onboarding pages with title, text, and primary/secondary buttons
 * Examples: page1 (Welcome), page2 (Projection)
 *
 * Features:
 * - Animated entrance with FadeInDown
 * - Progress bar (from OnboardingHeader)
 * - Optional animation placeholder
 * - Haptic feedback on button press
 */
export function SimplePageRenderer({ page, onNavigate }: SimplePageRendererProps) {
  const handlePrimaryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(page.next);
  };

  const handleSecondaryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (page.cta_secondary?.action === 'show_info') {
      // TODO: Show info modal or bottom sheet
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Title>{page.title}</Title>
        </Animated.View>

        {/* Subtitle */}
        {page.text && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Subtitle>{page.text}</Subtitle>
          </Animated.View>
        )}

        {/* Animation placeholder - enhance later with Lottie */}
        {page.animation && (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={{
              alignItems: 'center',
              marginVertical: spacing['3xl'],
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: radius.full,
                backgroundColor: onboardingColors.green[50],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 60 }}>🌿</Text>
            </View>
          </Animated.View>
        )}

        {/* Note if provided */}
        {page.note && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text
              style={{
                fontSize: 12,
                color: onboardingColors.text.muted,
                fontStyle: 'italic',
                marginTop: spacing.lg,
              }}
            >
              {page.note}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <OnboardingFooter>
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          pointerEvents="auto"
          style={{ width: '100%', gap: spacing.md }}
        >
          <PrimaryButton
            testID={`button-${page.cta_primary.action}`}
            onPress={handlePrimaryPress}
          >
            {page.cta_primary.children}
          </PrimaryButton>

          {page.cta_secondary && (
            <SecondaryButton
              testID={`button-${page.cta_secondary.action}`}
              onPress={handleSecondaryPress}
            >
              {page.cta_secondary.children}
            </SecondaryButton>
          )}
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
