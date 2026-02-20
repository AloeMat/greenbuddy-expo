import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';

interface GlassCardProps {
  /**
   * The content to display inside the glass card
   */
  children: React.ReactNode;

  /**
   * Intensity of the blur effect (0-100)
   * Default: 85
   */
  blurIntensity?: number | 'light' | 'medium' | 'dark';

  /**
   * The theme of the glass card
   * - 'success': Green gradient
   * - 'info': Blue gradient
   * - 'warning': Amber gradient
   * - 'primary': Plant green theme
   * Default: 'primary'
   */
  variant?: 'success' | 'info' | 'warning' | 'primary' | 'neutral';

  /**
   * Padding inside the card
   * Default: 'lg'
   */
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * Border radius
   * Default: 'md'
   */
  borderRadius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional style overrides
   */
  style?: ViewStyle;

  /**
   * Show a subtle border
   * Default: true
   */
  bordered?: boolean;

  /**
   * Additional className if using Tailwind
   */
  testID?: string;
}

const getBlurIntensity = (intensity?: number | 'light' | 'medium' | 'dark'): number => {
  if (typeof intensity === 'number') return intensity;
  switch (intensity) {
    case 'light':
      return 40;
    case 'medium':
      return 70;
    case 'dark':
      return 95;
    default:
      return 85;
  }
};

const getGradient = (variant: 'success' | 'info' | 'warning' | 'primary' | 'neutral') => {
  switch (variant) {
    case 'success':
      return {
        colors: [
          onboardingColors.green[50],
          onboardingColors.green[100],
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
    case 'info':
      return {
        colors: ['#E0F2FE', '#BAE6FD'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
    case 'warning':
      return {
        colors: ['#FEF3C7', '#FDE68A'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
    case 'primary':
      return {
        colors: [
          onboardingColors.green[50],
          onboardingColors.green[100],
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
    case 'neutral':
    default:
      return {
        colors: ['#F9FAFB', '#F3F4F6'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
  }
};

const getBorderColor = (variant: 'success' | 'info' | 'warning' | 'primary' | 'neutral') => {
  switch (variant) {
    case 'success':
    case 'primary':
      return onboardingColors.green[200];
    case 'info':
      return '#7DD3FC';
    case 'warning':
      return '#FCD34D';
    case 'neutral':
    default:
      return onboardingColors.gray[200];
  }
};

/**
 * GlassCard
 *
 * A premium "Liquid Glass" card component with:
 * - Gaussian blur background (expo-blur)
 * - Gradient overlay (expo-linear-gradient)
 * - Subtle border
 * - Smooth shadows
 * - Multiple variants and customization options
 *
 * Usage:
 * ```tsx
 * <GlassCard variant="success" padding="lg">
 *   <Text>Your content here</Text>
 * </GlassCard>
 * ```
 *
 * Features:
 * - High customization (blur intensity, gradient variant)
 * - Responsive padding
 * - Border customization
 * - TypeScript support
 * - Accessibility friendly
 */
export function GlassCard({
  children,
  blurIntensity = 85,
  variant = 'primary',
  padding = 'lg',
  borderRadius = 'md',
  style,
  bordered = true,
  testID,
}: GlassCardProps) {
  const blur = getBlurIntensity(blurIntensity);
  const gradient = getGradient(variant);
  const borderColor = getBorderColor(variant);
  const paddingValue = spacing[padding];
  const radiusValue = radius[borderRadius];

  return (
    <View
      testID={testID}
      style={[
        {
          borderRadius: radiusValue,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Blur Background */}
      <BlurView intensity={blur} style={StyleSheet.absoluteFill} />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={gradient.colors as [string, string]}
        start={gradient.start}
        end={gradient.end}
        style={StyleSheet.absoluteFill}
      />

      {/* Content Container */}
      <View
        style={[
          {
            padding: paddingValue,
            borderRadius: radiusValue,
            borderWidth: bordered ? 1 : 0,
            borderColor: bordered ? borderColor : 'transparent',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/**
 * GlassCardGroup
 *
 * A container for multiple glass cards with proper spacing
 */
export function GlassCardGroup({
  children,
  spacing: spacingSize = 'md',
}: {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) {
  return (
    <View style={{ gap: spacing[spacingSize] }}>
      {children}
    </View>
  );
}
