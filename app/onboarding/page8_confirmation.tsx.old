import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { FeedbackScreen } from '@onboarding/components';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';

export default function Page8Confirmation() {
  const { setCurrentPage, plantName, plantPersonality } = useOnboardingStore();

  useEffect(() => {
    trackPageView('page8_confirmation');
    setCurrentPage('page8_confirmation');
  }, [setCurrentPage]);

  const personalityEmoji = {
    funny: '😄',
    gentle: '💚',
    expert: '🎓',
  }[plantPersonality || 'funny'];

  const personalityLabel = {
    funny: 'Drôle',
    gentle: 'Doux',
    expert: 'Expert',
  }[plantPersonality || 'funny'];

  return (
    <View testID="onboarding-page8_confirmation">
      <FeedbackScreen
        title="Enchanté·e !"
        text={`Moi c'est ${plantName}, et je suis ${personalityLabel}. On va bien s'entendre ! 🌿`}
        icon={
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={{ fontSize: 72 }}>{personalityEmoji}</Text>
          </Animated.View>
        }
        autoAdvanceMs={2500}
        nextRoute="/onboarding/page7"
        progress={PAGE_PROGRESS.page8_confirmation}
      />
    </View>
  );
}
