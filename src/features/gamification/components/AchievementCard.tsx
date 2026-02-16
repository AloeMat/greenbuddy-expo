import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AchievementCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
}

// P2.3 PERFORMANCE FIX: Memoize AchievementCard for achievement grids
// Prevents re-renders when parent updates (e.g., list scrolling)
const AchievementCardComponent = ({ title, description, icon, unlocked }: AchievementCardProps) => {
  return (
    <View style={[styles.card, !unlocked && styles.lockedCard]}>
      <View style={[styles.iconContainer, !unlocked && styles.lockedIcon]}>
        <Ionicons name={icon} size={32} color={unlocked ? '#FFD700' : '#999'} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !unlocked && styles.lockedText]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {unlocked && (
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </View>
      )}
    </View>
  );
};

// Export memoized version
export const AchievementCard = React.memo(AchievementCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockedIcon: {
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  lockedText: {
    color: '#666',
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    marginLeft: 8,
  },
});