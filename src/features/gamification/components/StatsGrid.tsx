import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Trophy, Leaf, Flame } from 'lucide-react-native';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { useStreak } from '@/features/gamification/hooks/useStreak';
import { radius } from '@/design-system/tokens/radius';

/**
 * StatsGrid Component
 * Displays 4 key metrics: XP, Level, Plants, Streak
 * Used in Dashboard
 */
export const StatsGrid: React.FC = () => {
  const { totalXp, currentTier } = useGamificationStore();
  const { plants = [] } = usePlants();
  const { currentStreak = 0 } = useStreak();

  const stats = [
    {
      label: 'XP Total',
      value: totalXp.toString(),
      icon: Zap,
      color: '#F59E0B', // Amber
    },
    {
      label: 'Niveau',
      value: currentTier.toString(),
      icon: Trophy,
      color: '#8B5CF6', // Purple
    },
    {
      label: 'Plantes',
      value: plants.length.toString(),
      icon: Leaf,
      color: '#10B981', // Green
    },
    {
      label: 'Streak',
      value: currentStreak.toString(),
      icon: Flame,
      color: '#EF4444', // Red
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <View key={index} style={styles.card}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${stat.color}20` },
              ]}
            >
              <IconComponent size={24} color={stat.color} />
            </View>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    marginVertical: 16,
  },
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
