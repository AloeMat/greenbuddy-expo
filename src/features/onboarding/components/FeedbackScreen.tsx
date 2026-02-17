import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';

interface FeedbackScreenProps {
  title: string;
  text: string;
  icon?: React.ReactNode; // Lucide icon or animation
  autoAdvanceMs: number; // 2000, 2500, 3000
  nextRoute: string; // '/onboarding/page4'
  progress: number; // 25, 35, 75
}

export function FeedbackScreen({
  title,
  text,
  icon,
  autoAdvanceMs,
  nextRoute,
  progress,
}: FeedbackScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(nextRoute);
    }, autoAdvanceMs);

    return () => clearTimeout(timer);
  }, [autoAdvanceMs, nextRoute]);

  return (
    <View style={{ flex: 1, backgroundColor: onboardingColors.green[50], justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'] }}>
      {/* Progress bar */}
      <View style={{ position: 'absolute', top: spacing['5xl'], left: 0, right: 0, paddingHorizontal: spacing['2xl'] }}>
        <View style={{ height: 12, backgroundColor: onboardingColors.gray[200], borderRadius: radius.full, overflow: 'hidden' }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Icon animation */}
      {icon && <Animated.View entering={ZoomIn.springify()}>{icon}</Animated.View>}

      {/* Title */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        style={{ fontSize: 28, fontWeight: '700', color: onboardingColors.text.primary, textAlign: 'center', marginTop: spacing.lg, letterSpacing: 0.5 }}
      >
        {title}
      </Animated.Text>

      {/* Text */}
      <Animated.Text
        entering={FadeIn.delay(400)}
        style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginTop: spacing.md, lineHeight: 24 }}
      >
        {text}
      </Animated.Text>
    </View>
  );
}
