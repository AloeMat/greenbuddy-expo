import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { radius } from '@tokens/radius';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
}

export const Card = ({ children, variant = 'default', style }: CardProps) => {
  const variantStyle = getVariantStyle(variant);

  return <View style={[styles.card, variantStyle, style]}>{children}</View>;
};

function getVariantStyle(variant: CardVariant) {
  const baseStyles = {
    default: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      elevation: 4,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#2D5A27',
    },
  };

  return baseStyles[variant];
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md, // Phase 5.5: 12 → 16 (+33%)
    padding: 16,
    marginVertical: 8,
  },
});
