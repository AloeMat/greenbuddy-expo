import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, Easing, FadeIn, ZoomIn } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { FeedbackScreen } from '@onboarding/components';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS, PROFILES } from '@onboarding/constants/onboardingFlow';

export default function Page3Feedback() {
  const { setCurrentPage, userProfile } = useOnboardingStore();
  const scale = useSharedValue(0);

  useEffect(() => {
    trackPageView('page3_feedback');
    setCurrentPage('page3_feedback');
  }, [setCurrentPage]);

  // Checkmark animation
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 300, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 100 })
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const profileFeedback =
    userProfile && PROFILES[userProfile as keyof typeof PROFILES]
      ? PROFILES[userProfile as keyof typeof PROFILES].feedback
      : '';

  return (
    <View testID="onboarding-page3_feedback">
      <FeedbackScreen
        title="Personnalisation activée"
        text={profileFeedback}
        icon={
          <Animated.View style={animatedStyle}>
            <CheckCircle2 size={100} color="#10B981" strokeWidth={1.5} />
          </Animated.View>
        }
        autoAdvanceMs={2000}
        nextRoute="/onboarding/page4"
        progress={PAGE_PROGRESS.page3_feedback}
      />
    </View>
  );
}
