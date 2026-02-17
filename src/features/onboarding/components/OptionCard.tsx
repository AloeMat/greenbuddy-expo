import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { FeedbackModal } from './FeedbackModal';
import * as Haptics from 'expo-haptics';

interface Option {
  label: string; // "Oui 😔"
  value: string; // "oui_une"
  xp: number; // 5
  feedback: string; // "On comprend cette douleur..."
}

interface OptionCardProps {
  title: string;
  text: string;
  options: Option[];
  progress: number;
  nextRoute: string;
  currentPage: string;
  onSelect: (option: Option) => void;
}

export function OptionCard({
  title,
  text,
  options,
  progress,
  nextRoute,
  currentPage,
  onSelect,
}: OptionCardProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSelect = async (option: Option) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedValue(option.value);
    onSelect(option);

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
            key={option.value}
            entering={FadeInDown.delay(300 + index * 100).springify()}
          >
            <TouchableOpacity
              testID={`pain-${option.value}`}
              activeOpacity={0.7}
              onPress={() => handleSelect(option)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                borderWidth: 2,
                marginBottom: spacing.md,
                backgroundColor: selectedValue === option.value ? onboardingColors.green[100] : 'white',
                borderColor: selectedValue === option.value ? onboardingColors.green[500] : onboardingColors.gray[200],
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
        title="Merci de votre confiance"
        message={feedbackText}
        buttonText="Continuer"
        onConfirm={handleConfirm}
      />
    </>
  );
}
