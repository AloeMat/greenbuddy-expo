import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading = ({ message, size = 'large' }: LoadingProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#2D5A27" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
});
