import React from 'react';
import { View, TextInput, Text, ViewStyle, TextInputProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { shadows } from '@/design-system/tokens/shadows';
import { onboardingColors } from '@/design-system/onboarding/colors';

export interface PremiumInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  enterDelay?: number;
  containerStyle?: ViewStyle;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  icon,
  error,
  enterDelay = 0,
  containerStyle,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: onboardingColors.text.primary,
            marginBottom: spacing.sm,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: spacing.input.height,
            backgroundColor: isFocused ? 'white' : onboardingColors.gray[50],
            borderWidth: 2,
            borderColor: isFocused
              ? onboardingColors.green[500]
              : error
              ? onboardingColors.error
              : onboardingColors.gray[200],
          },
          isFocused ? shadows.sm : shadows.xs,
        ]}
      >
        {icon && <View style={{ marginRight: spacing.md }}>{icon}</View>}
        <TextInput
          {...inputProps}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: onboardingColors.text.primary,
              fontWeight: '500',
            },
            inputProps.style,
          ]}
          placeholderTextColor={onboardingColors.text.muted}
        />
      </View>
      {error && (
        <Text
          style={{
            color: onboardingColors.error,
            fontSize: 12,
            marginTop: spacing.xs,
            fontWeight: '500',
          }}
        >
          {error}
        </Text>
      )}
    </Animated.View>
  );
};

export default PremiumInput;
