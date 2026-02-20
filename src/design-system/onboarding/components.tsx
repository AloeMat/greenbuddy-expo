/**
 * Onboarding UI Components
 * Reusable components with inline styles for 100% compatibility
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from './colors';

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

interface ButtonProps {
  onPress: () => void;
  children: string;
  testID?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: import('react-native').ViewStyle;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  onPress,
  children,
  testID,
  disabled,
  style: styleProp,
}) => (
  <TouchableOpacity
    testID={testID}
    activeOpacity={0.7}
    onPress={onPress}
    disabled={disabled}
    style={{
      backgroundColor: onboardingColors.green[500],
      borderRadius: radius.sm, // Phase 5.5: 8 → 12 (+50%)
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 12,
      opacity: disabled ? 0.5 : 1,
      ...styleProp,
    }}
  >
    <Text
      style={{
        color: onboardingColors.text.white,
        fontWeight: '600',
        fontSize: 18,
      }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

export const SecondaryButton: React.FC<ButtonProps> = ({
  onPress,
  children,
  testID,
}) => (
  <TouchableOpacity
    testID={testID}
    activeOpacity={0.7}
    onPress={onPress}
    style={{
      borderWidth: 2,
      borderColor: onboardingColors.green[500],
      borderRadius: radius.sm, // Phase 5.5: 8 → 12 (+50%)
      paddingVertical: 16,
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        color: onboardingColors.green[700],
        fontWeight: '600',
        fontSize: 18,
      }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

// ============================================================================
// TEXT COMPONENTS
// ============================================================================

interface HeadingProps {
  children: React.ReactNode;
  style?: import('react-native').TextStyle;
}

export const Title: React.FC<HeadingProps> = ({ children, style }) => (
  <Text
    style={{
      fontSize: 30,
      fontWeight: 'bold',
      color: onboardingColors.text.primary,
      textAlign: 'center',
      marginBottom: 16,
      ...style,
    }}
  >
    {children}
  </Text>
);

export const Subtitle: React.FC<HeadingProps> = ({ children, style }) => (
  <Text
    style={{
      fontSize: 18,
      color: onboardingColors.text.secondary,
      textAlign: 'center',
      marginBottom: 32,
      ...style,
    }}
  >
    {children}
  </Text>
);

export const Label: React.FC<HeadingProps> = ({ children, style }) => (
  <Text
    style={{
      fontSize: 12,
      color: onboardingColors.text.muted,
      textAlign: 'right',
      ...style,
    }}
  >
    {children}
  </Text>
);

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  progress: number; // 0-100
  testID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  testID,
}) => (
  <View
    style={{
      height: 12,
      backgroundColor: onboardingColors.gray[200],
      borderRadius: radius.full, // Phase 5.5: 9999 (unchanged, perfect circle)
      overflow: 'hidden',
      marginBottom: 8,
    }}
    testID={testID}
  >
    <Animated.View
      style={{
        height: '100%',
        backgroundColor: onboardingColors.green[500],
        width: `${progress}%`,
      }}
    />
  </View>
);

// ============================================================================
// CONTAINER COMPONENTS
// ============================================================================

interface ContainerProps {
  children: React.ReactNode;
  testID?: string;
}

export const OnboardingScreen: React.FC<ContainerProps> = ({
  children,
  testID,
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: onboardingColors.green[50],
    }}
    testID={testID}
  >
    {children}
  </View>
);

interface HeaderProps {
  progress: number;
  step: number;
  totalSteps?: number;
}

export const OnboardingHeader: React.FC<HeaderProps> = ({
  progress,
  step,
  totalSteps = 14,
}) => (
  <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
    <ProgressBar progress={progress} testID="progress-bar" />
    <Label>{`${step}/${totalSteps}`}</Label>
  </View>
);

interface ContentProps {
  children: React.ReactNode;
  entering?: typeof FadeInDown;
}

export const OnboardingContent: React.FC<ContentProps> = ({
  children,
  entering,
}) => (
  <Animated.View
    entering={entering}
    style={{
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    }}
  >
    {children}
  </Animated.View>
);

interface FooterProps {
  children: React.ReactNode;
}

export const OnboardingFooter: React.FC<FooterProps> = ({ children }) => (
  <View style={{ paddingHorizontal: spacing['2xl'], paddingBottom: spacing['3xl'], gap: spacing.md }}>
    {children}
  </View>
);

// ============================================================================
// ICON CONTAINER
// ============================================================================

interface IconContainerProps {
  children: React.ReactNode;
  entering?: typeof FadeInDown;
}

export const IconContainer: React.FC<IconContainerProps> = ({
  children,
  entering,
}) => (
  <View style={{ alignItems: 'center', marginBottom: 32 }}>
    <Animated.View entering={entering}>{children}</Animated.View>
  </View>
);
