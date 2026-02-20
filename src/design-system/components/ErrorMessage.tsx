import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/design-system/tokens/spacing';

interface ErrorMessageProps {
  message: string;
  details?: string;
}

export const ErrorMessage = ({ message, details }: ErrorMessageProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={24} color="#D32F2F" />
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
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
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
    color: '#D32F2F',
  },
  details: {
    fontSize: 12,
    color: '#B71C1C',
    marginTop: spacing.xs,
  },
});
