import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/design-system/tokens/spacing';

interface SuccessMessageProps {
  message: string;
  details?: string;
}

export const SuccessMessage = ({ message, details }: SuccessMessageProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={24} color="#388E3C" />
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        {details && <Text style={styles.details}>{details}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#388E3C',
    padding: spacing.md,
    borderRadius: 4,
    marginVertical: spacing.sm,
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#388E3C',
  },
  details: {
    fontSize: 12,
    color: '#1B5E20',
    marginTop: spacing.xs,
  },
});
