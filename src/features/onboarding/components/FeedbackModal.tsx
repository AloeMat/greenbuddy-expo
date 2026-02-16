/**
 * FeedbackModal.tsx
 * Styled modal for onboarding feedback (replaces Alert.alert)
 * Matches design system with animations
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { onboardingColors } from '@design-system/onboarding/colors';

interface FeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onConfirm: () => void;
  icon?: React.ReactNode;
}

export function FeedbackModal({
  visible,
  title,
  message,
  buttonText = 'Continuer',
  onConfirm,
  icon,
}: FeedbackModalProps) {
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      {/* Backdrop */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
        {/* Modal Content */}
        <Animated.View
          entering={ZoomIn.springify()}
          style={{
            width: width - 48,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
          }}
        >
          {/* Icon */}
          {icon && (
            <Animated.View entering={FadeIn.delay(100)} style={{ marginBottom: 16 }}>
              {icon}
            </Animated.View>
          )}

          {/* Title */}
          <Animated.Text
            entering={FadeIn.delay(200)}
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: onboardingColors.text.primary,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {title}
          </Animated.Text>

          {/* Message */}
          <Animated.Text
            entering={FadeIn.delay(300)}
            style={{
              fontSize: 16,
              color: onboardingColors.text.secondary,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            {message}
          </Animated.Text>

          {/* Button */}
          <Animated.View entering={FadeIn.delay(400)} style={{ width: '100%' }}>
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                backgroundColor: onboardingColors.green[500],
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}
