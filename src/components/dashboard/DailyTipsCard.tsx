import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { getDailyTip } from '@/lib/utils/dailyTips';
import { radius } from '@/design-system/tokens/radius';

/**
 * Daily Tips Card
 * Displays a rotating daily tip for plant care
 * Used in Dashboard
 */
export const DailyTipsCard: React.FC = () => {
  const tip = getDailyTip();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={20} color="#F59E0B" />
        <Text style={styles.title}>Conseil du jour</Text>
      </View>
      <Text style={styles.tip}>{tip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#FFFBF0',
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});
