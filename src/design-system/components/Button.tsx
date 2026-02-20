import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { COLORS } from '@/design-system/tokens/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress?: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  const styles = getStyles(variant, size, disabled);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

function getStyles(variant: ButtonVariant, size: ButtonSize, disabled: boolean) {
  const baseButton: ViewStyle = {
    borderRadius: radius.sm, // Phase 5.5: 8 → 12 (+50%)
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  const basText: TextStyle = {
    fontWeight: '600',
  };

  const sizeStyles: Record<ButtonSize, { padding: number; fontSize: number }> = {
    small: { padding: spacing.sm, fontSize: 12 },
    medium: { padding: spacing.md, fontSize: 14 },
    large: { padding: spacing.lg, fontSize: 16 },
  };

  const variantStyles: Record<ButtonVariant, { bg: string; text: string }> = {
    primary: { bg: COLORS.brand, text: '#FFFFFF' },
    secondary: { bg: '#4A7C59', text: '#FFFFFF' },
    outlined: { bg: 'transparent', text: COLORS.brand },
    danger: { bg: '#D32F2F', text: '#FFFFFF' },
  };

  const variant_style = variantStyles[variant];
  const size_style = sizeStyles[size];

  return StyleSheet.create({
    button: {
      ...baseButton,
      paddingVertical: size_style.padding,
      paddingHorizontal: size_style.padding * 1.5,
      backgroundColor: variant === 'outlined' ? 'transparent' : variant_style.bg,
      borderWidth: variant === 'outlined' ? 2 : 0,
      borderColor: variant === 'outlined' ? variant_style.text : 'transparent',
    },
    text: {
      ...basText,
      fontSize: size_style.fontSize,
      color: variant_style.text,
    },
  });
}
