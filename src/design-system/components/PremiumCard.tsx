import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { shadows } from '@/design-system/tokens/shadows';
import { onboardingColors } from '@/design-system/onboarding/colors';

interface PremiumCardProps {
  children: React.ReactNode;
  elevation?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  borderColor?: string;
  backgroundColor?: string;
  enterDelay?: number;
  style?: ViewStyle;
}

export type { PremiumCardProps };

const getPaddingValue = (pad?: string) => {
  switch (pad) {
    case 'sm':
      return spacing.md;
    case 'md':
      return spacing.lg;
    case 'lg':
      return spacing['2xl'];
    default:
      return spacing.lg;
  }
};

const getElevationShadow = (elevation?: string) => {
  switch (elevation) {
    case 'sm':
      return shadows.sm;
    case 'lg':
      return shadows.lg;
    case 'md':
    default:
      return shadows.md;
  }
};

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  elevation = 'md',
  padding = 'md',
  borderColor,
  backgroundColor = 'white',
  enterDelay = 0,
  style,
}) => {
  const paddingValue = getPaddingValue(padding);
  const elevationShadow = getElevationShadow(elevation);

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)}>
      <View
        style={[
          {
            borderRadius: radius.lg,
            padding: paddingValue,
            backgroundColor,
            borderWidth: borderColor ? 1.5 : 0,
            borderColor: borderColor || 'transparent',
          },
          elevationShadow,
          style,
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
};

export default PremiumCard;
