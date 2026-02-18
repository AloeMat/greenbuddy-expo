import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';

interface FeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onConfirm: () => void;
}

export function FeedbackModal({
  visible,
  title,
  message,
  buttonText,
  onConfirm,
}: FeedbackModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={ZoomIn.springify()}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 320,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: onboardingColors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: onboardingColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: onboardingColors.green[500],
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
