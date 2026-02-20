import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { CheckCircle, Heart, Leaf } from 'lucide-react-native';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, Title, Subtitle } from '@/design-system/onboarding/components';
import { FeedbackPage } from '@/features/onboarding/types/onboardingSchema';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import { GlassCard } from '../GlassCard';

interface FeedbackRendererProps {
  page: FeedbackPage;
  onNavigate: (nextPageId: string) => void;
}

export function FeedbackRenderer({ page, onNavigate }: FeedbackRendererProps) {
  const navigatedRef = useRef(false);
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(0.3);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pulse animation for emoji circle
  useEffect(() => {
    scaleAnim.value = withRepeat(
      withTiming(1.1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    opacityAnim.value = withRepeat(
      withTiming(0.6, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  // Auto-navigate with countdown
  useEffect(() => {
    if (navigatedRef.current) return;

    const delay = typeof page.auto_advance === 'number' ? page.auto_advance : 3000;
    const countdownInterval = 500; // Update countdown every 500ms

    // Start countdown display
    setCountdown(Math.ceil(delay / 1000));

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, countdownInterval);

    const timer = setTimeout(() => {
      navigatedRef.current = true;
      onNavigate(page.next);
    }, delay);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  const getAnimationIcon = () => {
    const iconSize = 60;
    const iconColor = onboardingColors.green[500];

    switch (page.animation) {
      case 'checkmark_success':
        return <CheckCircle size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'avatar_reassure':
        return <Heart size={iconSize} color={iconColor} strokeWidth={1.5} fill={iconColor} />;
      default:
        return <Leaf size={iconSize} color={iconColor} strokeWidth={1.5} />;
    }
  };

  const getAltText = () => {
    switch (page.animation) {
      case 'checkmark_success': return 'Succès !';
      case 'avatar_reassure': return 'Réassurance';
      default: return 'Continuons';
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <OnboardingContent>
        {/* Title & Message in Glass Card */}
        <GlassCard variant="success" padding="lg">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Title>{page.title}</Title>
          </Animated.View>
          {page.text && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Subtitle>{page.text}</Subtitle>
            </Animated.View>
          )}
        </GlassCard>

        {/* Icon & Countdown in Glass Card */}
        <GlassCard variant="primary" padding="xl" blurIntensity="medium">
          {/* Animated icon circle with pulse effect */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={[
              {
                alignItems: 'center',
                marginVertical: spacing['2xl'],
                width: 120,
                height: 120,
                borderRadius: radius.full,
                backgroundColor: onboardingColors.green[50],
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: onboardingColors.green[200],
                alignSelf: 'center',
              },
              animatedStyle,
            ]}
          >
            {getAnimationIcon()}
          </Animated.View>

          {/* Alt text & countdown */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={{ alignItems: 'center', gap: spacing.sm }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: onboardingColors.text.secondary,
              }}
            >
              {getAltText()}
            </Text>

            {countdown !== null && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: radius.full,
                    backgroundColor: onboardingColors.green[500],
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: onboardingColors.text.muted,
                    fontWeight: '500',
                  }}
                >
                  Continuer dans {countdown}s
                </Text>
              </View>
            )}
          </Animated.View>
        </GlassCard>
      </OnboardingContent>
    </OnboardingScreen>
  );
}
