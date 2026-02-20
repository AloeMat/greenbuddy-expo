import React from 'react';
import {
  View,
  Text,
  Modal,
  ModalProps,
  TouchableOpacity,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { shadows } from '@/design-system/tokens/shadows';
import { onboardingColors } from '@/design-system/onboarding/colors';

export interface PremiumDialogProps extends Omit<ModalProps, 'children'> {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDangerous?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const PremiumDialog: React.FC<PremiumDialogProps> = ({
  visible,
  onDismiss,
  title,
  description,
  children,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isDangerous = false,
  icon,
  style,
  ...modalProps
}) => {
  const { width } = useWindowDimensions();
  const dialogWidth = Math.min(width - spacing.lg * 2, 400);

  const handleCancel = () => {
    onCancel?.();
    onDismiss();
  };

  const handleConfirm = () => {
    onConfirm?.();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
      {...modalProps}
    >
      <Animated.View
        entering={FadeIn}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, width: '100%' }}
          onPress={onDismiss}
        />

        <Animated.View entering={SlideInUp.springify()}>
          <View
            style={[
              {
                width: dialogWidth,
                backgroundColor: 'white',
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginHorizontal: spacing.lg,
                ...shadows.lg,
              },
              style,
            ]}
          >
            {/* Header with icon */}
            {(icon || title) && (
              <View
                style={{
                  marginBottom: spacing.md,
                  alignItems: 'center',
                }}
              >
                {icon && (
                  <View
                    style={{
                      marginBottom: spacing.md,
                    }}
                  >
                    {icon}
                  </View>
                )}
                {title && (
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: isDangerous
                        ? onboardingColors.error
                        : onboardingColors.text.primary,
                      textAlign: 'center',
                    }}
                  >
                    {title}
                  </Text>
                )}
              </View>
            )}

            {/* Description */}
            {description && (
              <Text
                style={{
                  fontSize: 14,
                  color: onboardingColors.text.secondary,
                  textAlign: 'center',
                  marginBottom: spacing.lg,
                  lineHeight: 22,
                }}
              >
                {description}
              </Text>
            )}

            {/* Custom children */}
            {children && (
              <View
                style={{
                  marginBottom: spacing.lg,
                }}
              >
                {children}
              </View>
            )}

            {/* Action buttons */}
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  backgroundColor: onboardingColors.gray[100],
                  borderRadius: radius.md,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: onboardingColors.gray[300],
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: onboardingColors.text.primary,
                  }}
                >
                  {cancelLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  backgroundColor: isDangerous
                    ? onboardingColors.error
                    : onboardingColors.green[500],
                  borderRadius: radius.md,
                  alignItems: 'center',
                  ...shadows.md,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: 'white',
                  }}
                >
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, width: '100%' }}
          onPress={onDismiss}
        />
      </Animated.View>
    </Modal>
  );
};

export default PremiumDialog;
