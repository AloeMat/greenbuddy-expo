import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withRepeat,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { FeedbackScreen } from '@onboarding/components';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS, PAIN_POINTS } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

const painPointFeedbackMap = {
  oui_une:
    'On comprend cette douleur. Cette fois, on va faire en sorte que ça ne se reproduise plus.',
  plusieurs:
    'On va vous aider à briser ce cycle. Cette fois, vous aurez un guide pour chaque étape.',
  jamais: 'Excellent ! On va vous aider à continuer sur cette lancée.',
};

export default function Page4Reassurance() {
  const { setCurrentPage, painPoint } = useOnboardingStore();
  const scale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    trackPageView('page4_reassurance');
    setCurrentPage('page4_reassurance');

    // Entrance animation: pop in with spring bounce
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 100 }),
      withSpring(1.0, { damping: 10 })
    );

    // Continuous gentle pulse (after entrance completes ~800ms)
    const pulseTimer = setTimeout(() => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.bezier(0.4, 0.0, 0.2, 1.0) }),
          withTiming(1.0, { duration: 1000, easing: Easing.bezier(0.4, 0.0, 0.2, 1.0) })
        ),
        -1, // Infinite loop
        false
      );
    }, 800);

    logger.debug('Heart pulse animation started on page4_reassurance');
    return () => clearTimeout(pulseTimer);
  }, [scale, pulseScale, setCurrentPage]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const feedback =
    painPoint && painPointFeedbackMap[painPoint as keyof typeof painPointFeedbackMap]
      ? painPointFeedbackMap[painPoint as keyof typeof painPointFeedbackMap]
      : '';

  return (
    <View testID="onboarding-page4_reassurance">
      <FeedbackScreen
        title="Vous n'êtes plus seul·e"
        text={feedback}
        icon={
          <Animated.View style={animatedStyle} testID="icon-heart-animated">
            <Heart size={100} color="#10B981" fill="#10B981" strokeWidth={1.5} />
          </Animated.View>
        }
        autoAdvanceMs={3000}
        nextRoute="/onboarding/page5"
        progress={PAGE_PROGRESS.page4_reassurance}
      />
    </View>
  );
}
