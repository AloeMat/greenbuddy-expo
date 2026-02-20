import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Leaf } from 'lucide-react-native';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, Title, Subtitle, PrimaryButton, SecondaryButton } from '@/design-system/onboarding/components';
import { SimplePage } from '@/features/onboarding/types/onboardingSchema';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import { GlassCard } from '../GlassCard';
import { SignupModal } from '../SignupModal';
import * as Haptics from 'expo-haptics';

interface SimplePageRendererProps {
  page: SimplePage;
  onNavigate: (nextPageId: string) => void;
}

/**
 * SimplePageRenderer
 *
 * Renders simple onboarding pages with title, text, and primary/secondary buttons
 * Examples: page1 (Welcome), page2 (Projection), page9 (Signup), page10 (Celebration)
 *
 * Features:
 * - Animated entrance with FadeInDown
 * - Progress bar (from OnboardingHeader)
 * - Optional animation placeholder
 * - Haptic feedback on button press
 * - SignupModal integration for page9 (action: "signup")
 */
export function SimplePageRenderer({ page, onNavigate }: SimplePageRendererProps) {
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handlePrimaryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Handle signup action: show SignupModal instead of navigating
    if (page.cta_primary.action === 'signup') {
      setShowSignupModal(true);
      return;
    }

    onNavigate(page.next);
  };

  const handleSecondaryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (page.cta_secondary?.action === 'show_info') {
      // TODO: Show info modal or bottom sheet
      return;
    }
    // "Plus tard" on page9: skip signup and continue
    if (page.cta_secondary?.action === 'go_next') {
      onNavigate(page.next);
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Glass Card Container */}
        <GlassCard variant="primary" padding="lg" blurIntensity="medium">
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
        </GlassCard>

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
                borderWidth: 2,
                borderColor: onboardingColors.green[200],
              }}
            >
              <Leaf size={60} color={onboardingColors.green[500]} strokeWidth={1.5} />
            </View>
          </Animated.View>
        )}

        {/* Note if provided */}
        {page.note && (
          <GlassCard variant="info" padding="md" blurIntensity="light">
            <Animated.View entering={FadeInDown.delay(400)}>
              <Text
                style={{
                  fontSize: 13,
                  color: onboardingColors.text.secondary,
                  fontStyle: 'italic',
                  lineHeight: 18,
                }}
              >
                ℹ️ {page.note}
              </Text>
            </Animated.View>
          </GlassCard>
        )}
      </ScrollView>

      <OnboardingFooter>
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
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

      {/* SignupModal for page9 */}
      <SignupModal
        visible={showSignupModal}
        onSignupSuccess={() => {
          setShowSignupModal(false);
          onNavigate(page.next);
        }}
        onCancel={() => {
          setShowSignupModal(false);
          // User cancelled signup — continue without account
          onNavigate(page.next);
        }}
      />
    </OnboardingScreen>
  );
}
