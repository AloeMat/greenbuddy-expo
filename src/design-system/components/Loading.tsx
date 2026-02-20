import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '@/design-system/tokens/colors';
import { typography } from '@/design-system/tokens/typography';
import { spacing } from '@/design-system/tokens/spacing';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading = ({ message, size = 'large' }: LoadingProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.brand} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    color: '#666666',
    marginTop: spacing.md,
  },
});
