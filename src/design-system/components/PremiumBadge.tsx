import React from 'react';
import { View, Text, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface PremiumBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  loading?: boolean;
  style?: ViewStyle;
  enterDelay?: number;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: {
    bg: onboardingColors.green[50],
    text: onboardingColors.green[700],
    border: onboardingColors.green[200],
  },
  warning: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FCD34D',
  },
  error: {
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FECACA',
  },
  info: {
    bg: '#EFF6FF',
    text: '#0C2340',
    border: '#BFDBFE',
  },
  neutral: {
    bg: onboardingColors.gray[100],
    text: onboardingColors.text.secondary,
    border: onboardingColors.gray[300],
  },
};

const sizeStyles: Record<BadgeSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, fontSize: 11 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 12 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 13 },
};

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  label,
  variant = 'info',
  size = 'md',
  icon,
  loading = false,
  style,
  enterDelay = 0,
}) => {
  const colors = variantColors[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={style}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.bg,
          borderRadius: radius.sm,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.text}
            style={{ marginRight: spacing.xs }}
          />
        ) : icon ? (
          <View style={{ marginRight: spacing.xs }}>{icon}</View>
        ) : null}
        <Text
          style={{
            fontSize: sizeStyle.fontSize,
            fontWeight: '600',
            color: colors.text,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
};

export default PremiumBadge;
