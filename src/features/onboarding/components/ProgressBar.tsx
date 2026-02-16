import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  currentStep: number; // 1-5
  totalSteps?: number;
}

export const ProgressBar = ({ currentStep, totalSteps = 5 }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>

      {/* Step indicator */}
      <Text style={styles.stepText}>{currentStep}/{totalSteps}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingVertical: 12 },
  barBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});
