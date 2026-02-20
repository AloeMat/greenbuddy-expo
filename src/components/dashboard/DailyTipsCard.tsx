import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { getDailyTip } from '@/lib/utils/dailyTips';
import { radius } from '@/design-system/tokens/radius';
import { COLORS } from '@/design-system/tokens/colors';
import { typography } from '@/design-system/tokens/typography';

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
        <Lightbulb size={20} color={COLORS.accent['500']} />
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
    backgroundColor: COLORS.background['50'],
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent['500'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.label.lg,
    color: COLORS.text['900'],
    marginLeft: 8,
  },
  tip: {
    ...typography.body.md,
    color: COLORS.text['700'],
  },
});
