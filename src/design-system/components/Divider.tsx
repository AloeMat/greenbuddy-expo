import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing } from '@tokens/spacing';
import { onboardingColors } from '@design-system/onboarding/colors';

type DividerVariant = 'solid' | 'dashed' | 'dotted';
type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  color?: string;
  thickness?: number;
  spacing?: number;
  label?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'solid',
  orientation = 'horizontal',
  color = onboardingColors.gray[200],
  thickness = 1,
  spacing: spacingProp = spacing.md,
  label,
  style,
}) => {
  if (orientation === 'horizontal') {
    return (
      <Animated.View entering={FadeInDown} style={style}>
        {label ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: spacingProp,
            }}
          >
            <View
              style={{
                flex: 1,
                height: thickness,
                backgroundColor:
                  variant === 'solid'
                    ? color
                    : variant === 'dashed'
                    ? 'transparent'
                    : 'transparent',
                borderTopWidth: thickness,
                borderTopColor: color,
                borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
              }}
            />
            <Text
              style={{
                marginHorizontal: spacing.md,
                fontSize: 12,
                color: onboardingColors.text.muted,
                fontWeight: '500',
                letterSpacing: 0.1,
              }}
            >
              {label}
            </Text>
            <View
              style={{
                flex: 1,
                height: thickness,
                backgroundColor:
                  variant === 'solid'
                    ? color
                    : variant === 'dashed'
                    ? 'transparent'
                    : 'transparent',
                borderTopWidth: thickness,
                borderTopColor: color,
                borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
              }}
            />
          </View>
        ) : (
          <View
            style={[
              {
                height: thickness,
                backgroundColor:
                  variant === 'solid'
                    ? color
                    : variant === 'dashed'
                    ? 'transparent'
                    : 'transparent',
                borderTopWidth: thickness,
                borderTopColor: color,
                borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
                marginVertical: spacingProp,
              },
              style,
            ]}
          />
        )}
      </Animated.View>
    );
  }

  // Vertical divider
  return (
    <Animated.View entering={FadeInDown} style={style}>
      <View
        style={{
          width: thickness,
          backgroundColor: variant === 'solid' ? color : 'transparent',
          borderRightWidth: thickness,
          borderRightColor: color,
          borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
          marginHorizontal: spacingProp,
        }}
      />
    </Animated.View>
  );
};

export default Divider;
