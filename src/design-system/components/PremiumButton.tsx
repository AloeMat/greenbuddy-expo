import React from 'react';
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { shadows } from '@tokens/shadows';
import { onboardingColors } from '../onboarding/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PremiumButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
  enterDelay?: number;
}

const getVariantStyle = (variant: ButtonVariant): {containerStyle: ViewStyle; textStyle: TextStyle} => {
  switch (variant) {
    case 'primary':
      return {
        containerStyle: {
          backgroundColor: onboardingColors.green[500],
          borderColor: 'transparent',
        },
        textStyle: {
          color: 'white',
        },
      };
    case 'secondary':
      return {
        containerStyle: {
          backgroundColor: onboardingColors.green[50],
          borderColor: onboardingColors.green[500],
          borderWidth: 2,
        },
        textStyle: {
          color: onboardingColors.green[500],
        },
      };
    case 'outline':
      return {
        containerStyle: {
          backgroundColor: 'transparent',
          borderColor: onboardingColors.text.primary,
          borderWidth: 2,
        },
        textStyle: {
          color: onboardingColors.text.primary,
        },
      };
    case 'ghost':
      return {
        containerStyle: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        textStyle: {
          color: onboardingColors.green[500],
        },
      };
    default:
      return {
        containerStyle: {},
        textStyle: {},
      };
  }
};

const getSizeStyle = (size: ButtonSize): {padding: number; fontSize: number} => {
  switch (size) {
    case 'sm':
      return { padding: spacing.md, fontSize: 14 };
    case 'md':
      return { padding: spacing.lg, fontSize: 16 };
    case 'lg':
      return { padding: spacing['2xl'], fontSize: 18 };
    default:
      return { padding: spacing.lg, fontSize: 16 };
  }
};

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onPress,
  children,
  disabled = false,
  icon,
  testID,
  enterDelay = 0,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const variantStyle = getVariantStyle(variant);
  const sizeStyle = getSizeStyle(size);

  const handlePress = async () => {
    setIsPressed(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.85}
        testID={testID}
        accessible
        accessibilityRole="button"
      >
        <View
          style={[
            {
              borderRadius: radius.md,
              paddingVertical: sizeStyle.padding,
              paddingHorizontal: sizeStyle.padding + spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              opacity: disabled ? 0.6 : 1,
              transform: [{ scale: isPressed ? 0.98 : 1 }],
            },
            variantStyle.containerStyle,
            // Shadow based on variant
            variant === 'primary' && !isPressed ? shadows.md : {},
            // Pressed state
            isPressed && variant === 'primary' ? shadows.sm : {},
          ]}
        >
          {icon && <View>{icon}</View>}
          <Text
            style={[
              {
                fontSize: sizeStyle.fontSize,
                fontWeight: '600',
                letterSpacing: 0.3,
              },
              variantStyle.textStyle,
            ]}
          >
            {children}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default PremiumButton;
