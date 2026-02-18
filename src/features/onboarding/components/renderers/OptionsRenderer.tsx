import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, Title, Subtitle, PrimaryButton } from '@/design-system/onboarding/components';
import { OptionsPage } from '@/features/onboarding/types/onboardingSchema';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { executeActions } from '@/features/onboarding/utils/actionExecutor';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import { FeedbackModal } from './FeedbackModal';
import * as Haptics from 'expo-haptics';

interface OptionsRendererProps {
  page: OptionsPage;
  onNavigate: (nextPageId: string) => void;
}

export function OptionsRenderer({ page, onNavigate }: OptionsRendererProps) {
  const store = useOnboardingStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleOptionSelect = async (option: any, index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(option.value || option.profile || '');

    // Execute page actions with the selected option
    try {
      executeActions(page.on_select, {
        option: {
          profile: option.profile,
          value: option.value,
          xp: option.xp,
          feedback: option.feedback,
        },
        store,
      });

      // Show feedback modal if provided
      if (option.feedback) {
        setFeedbackText(option.feedback);
        setFeedbackVisible(true);
      } else {
        // Auto-advance if no feedback
        onNavigate(page.next);
      }
    } catch (error) {
      console.error('[OptionsRenderer] Error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleFeedbackConfirm = () => {
    setFeedbackVisible(false);
    onNavigate(page.next);
  };

  return (
    <>
      <OnboardingScreen testID={`onboarding-${page.id}`}>
        <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Title>{page.title}</Title>
          </Animated.View>
          {page.text && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Subtitle>{page.text}</Subtitle>
            </Animated.View>
          )}

          {/* Options List */}
          <View style={{ gap: spacing.md, marginTop: spacing['2xl'], paddingBottom: spacing['3xl'] }}>
            {page.options.map((option, index) => (
              <Animated.View
                key={option.value || option.profile || index}
                entering={FadeInDown.delay(300 + index * 100).springify()}
                pointerEvents="auto"
              >
                <TouchableOpacity
                  testID={`option-${page.id}-${option.value || option.profile || index}`}
                  activeOpacity={0.7}
                  onPress={() => handleOptionSelect(option, index)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    borderRadius: radius.md,
                    borderWidth: 2,
                    borderColor:
                      selectedOption === (option.value || option.profile)
                        ? onboardingColors.green[500]
                        : onboardingColors.gray[200],
                    backgroundColor:
                      selectedOption === (option.value || option.profile)
                        ? onboardingColors.green[100]
                        : 'white',
                  }}
                >
                  <Subtitle style={{ fontSize: 16, fontWeight: '600' }}>
                    {option.children}
                  </Subtitle>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
        <OnboardingFooter>
          {/* No button needed - options auto-navigate */}
        </OnboardingFooter>
      </OnboardingScreen>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        title="Personnalisation activée"
        message={feedbackText}
        buttonText="Continuer"
        onConfirm={handleFeedbackConfirm}
      />
    </>
  );
}
