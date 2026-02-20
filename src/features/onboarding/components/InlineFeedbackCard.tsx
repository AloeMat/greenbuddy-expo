import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';

interface InlineFeedbackCardProps {
  /**
   * The feedback text to display
   */
  text: string;

  /**
   * Duration in milliseconds before auto-advancing (0 = no auto-advance)
   * Default: 3000ms
   */
  autoDismissDelay?: number;

  /**
   * Type of feedback to determine icon and colors
   * Default: 'success'
   */
  type?: 'success' | 'warning' | 'info' | 'error';

  /**
   * Callback when user dismisses the feedback or auto-dismiss occurs
   */
  onDismiss?: () => void;

  /**
   * Show the card or not
   */
  visible?: boolean;

  /**
   * Optional icon to override the default type icon
   */
  customIcon?: React.ReactNode;
}

const getConfig = (type: 'success' | 'warning' | 'info' | 'error') => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: onboardingColors.green[50],
        borderColor: onboardingColors.green[300],
        textColor: onboardingColors.green[900],
        icon: <CheckCircle size={24} color={onboardingColors.green[600]} strokeWidth={2} />,
      };
    case 'warning':
      return {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        textColor: '#92400E',
        icon: <AlertCircle size={24} color="#D97706" strokeWidth={2} />,
      };
    case 'error':
      return {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
        textColor: '#7F1D1D',
        icon: <AlertCircle size={24} color="#DC2626" strokeWidth={2} />,
      };
    case 'info':
    default:
      return {
        backgroundColor: onboardingColors.gray[50],
        borderColor: onboardingColors.gray[300],
        textColor: onboardingColors.text.secondary,
        icon: <Info size={24} color={onboardingColors.gray[600]} strokeWidth={2} />,
      };
  }
};

/**
 * InlineFeedbackCard
 *
 * Displays feedback messages inline instead of in modals
 * Features:
 * - Animated entrance (FadeInDown + ZoomIn)
 * - Auto-dismiss with configurable delay
 * - Type-based styling (success, warning, error, info)
 * - Manual dismiss button
 * - Haptic feedback on render
 *
 * Usage:
 * ```tsx
 * <InlineFeedbackCard
 *   visible={showFeedback}
 *   text="Super ! Vous avez choisi le profil actif."
 *   type="success"
 *   autoDismissDelay={2500}
 *   onDismiss={() => setShowFeedback(false)}
 * />
 * ```
 */
export function InlineFeedbackCard({
  text,
  autoDismissDelay = 3000,
  type = 'success',
  onDismiss,
  visible = true,
  customIcon,
}: InlineFeedbackCardProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const config = getConfig(type);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (!isVisible || autoDismissDelay <= 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [isVisible, autoDismissDelay, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify().withInitialValues({
        opacity: 0,
        translateY: -20,
      })}
      exiting={FadeOutUp.springify()}
      style={styles.container}
    >
      <Animated.View
        entering={ZoomIn.delay(150)}
        style={[
          styles.card,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          {customIcon || config.icon}
        </View>

        {/* Text Content */}
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text
            style={[
              styles.text,
              {
                color: config.textColor,
              },
            ]}
          >
            {text}
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          onPress={handleDismiss}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.dismissButton}
        >
          <Text style={{ fontSize: 18, color: config.textColor }}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  dismissButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
});
