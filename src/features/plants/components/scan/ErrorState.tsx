/**
 * ErrorState Component
 * Displays error message when plant identification fails
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>❌ Erreur d'identification</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={onRetry}
      >
        <Text style={styles.buttonText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFF'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonPrimary: {
    backgroundColor: '#10B981'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF'
  }
});
