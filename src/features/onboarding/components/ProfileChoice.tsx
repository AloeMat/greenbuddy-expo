import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { onboardingColors } from '@design-system/onboarding/colors';
import { useOnboardingStore } from '../store/onboardingStore';
import { trackPageView } from '../utils/analytics';
import { FeedbackModal } from './FeedbackModal';
import * as Haptics from 'expo-haptics';

interface Option {
  label: string; // "🌿 J'agis immédiatement"
  profile: string; // "actif"
  xp: number; // 5
  feedback: string; // "Parfait ! On adapte..."
}

interface ProfileChoiceProps {
  title: string;
  text: string;
  options: Option[];
  progress: number;
  nextRoute: string;
  currentPage: string;
  onSelect?: (option: Option) => void;
}

export function ProfileChoice({
  title,
  text,
  options,
  progress,
  nextRoute,
  currentPage,
  onSelect,
}: ProfileChoiceProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const { setUserProfile, addXP, markPageComplete } = useOnboardingStore();

  React.useEffect(() => {
    trackPageView(currentPage);
  }, [currentPage]);

  const handleSelect = async (option: Option) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProfile(option.profile);
    setUserProfile(option.profile as any);
    addXP(option.xp);
    markPageComplete(currentPage);

    // Call custom handler if provided
    if (onSelect) {
      onSelect(option);
    }

    // Show feedback modal instead of alert
    setFeedbackText(option.feedback);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    router.push(nextRoute);
  };

  return (
    <>
      <ScrollView
        testID={`onboarding-${currentPage}`}
        style={{ flex: 1, backgroundColor: onboardingColors.green[50], paddingHorizontal: spacing['2xl'], paddingTop: spacing['5xl'] }}
      >
      {/* Progress bar */}
      <View testID="progress-bar" style={{ height: 12, backgroundColor: onboardingColors.gray[200], borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing['3xl'] }}>
        <Animated.View entering={FadeInDown} style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${progress}%` }} />
      </View>

      {/* Title */}
      <Animated.Text entering={FadeInDown.delay(100)} style={{ fontSize: 28, fontWeight: '700', color: onboardingColors.text.primary, marginBottom: spacing.md, letterSpacing: 0.5 }}>{title}</Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200)} style={{ fontSize: 16, color: onboardingColors.text.secondary, marginBottom: spacing['3xl'], lineHeight: 24 }}>{text}</Animated.Text>

      {/* Options */}
      <View style={{ paddingBottom: spacing['5xl'] }}>
        {options.map((option, index) => (
          <Animated.View
            key={option.profile}
            entering={FadeInDown.delay(300 + index * 100).springify()}
            pointerEvents="auto"
          >
            <TouchableOpacity
              testID={`profile-${option.profile}`}
              activeOpacity={0.7}
              onPress={() => handleSelect(option)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                borderWidth: 2,
                marginBottom: spacing.md,
                backgroundColor: selectedProfile === option.profile ? onboardingColors.green[100] : 'white',
                borderColor: selectedProfile === option.profile ? onboardingColors.green[500] : onboardingColors.gray[200],
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: onboardingColors.text.primary, letterSpacing: 0.2 }}>{option.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title="Personnalisation activée"
        message={feedbackText}
        buttonText="Continuer"
        onConfirm={handleConfirm}
      />
    </>
  );
}
