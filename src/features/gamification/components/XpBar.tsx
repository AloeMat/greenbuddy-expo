import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';

interface XpBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
}

export const XpBar = ({ currentXp, nextLevelXp, level }: XpBarProps) => {
  // Calcul du pourcentage (0 à 1)
  const progress = Math.min(Math.max(currentXp / nextLevelXp, 0), 1);
  const width = useSharedValue(0);

  useEffect(() => {
    // Animation fluide de la largeur
    width.value = withTiming(progress * 100, { duration: 1000 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.levelText}>Niveau {level}</Text>
        <Text style={styles.xpText}>{currentXp} / {nextLevelXp} XP</Text>
      </View>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 8 },
  textContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  levelText: { fontWeight: 'bold', color: '#2D5A27' },
  xpText: { fontSize: 12, color: '#666' },
  barBackground: { height: 10, backgroundColor: '#E0E0E0', borderRadius: radius.xs, overflow: 'hidden' }, // Phase 5.5: 5 → 8 (+60%)
  barFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: radius.xs }, // Phase 5.5: 5 → 8 (+60%)
});