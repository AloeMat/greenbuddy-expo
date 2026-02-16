/**
 * Progrès Tab - Life Tree Visualization & Achievements
 * Displays Arbre de Vie (9 tiers), XP progress, streaks, and achievements by category
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGamificationStore } from '@gamification/store';
import { LIFE_TREE_TIERS } from '@gamification/constants/lifetree';
import { calculateTierProgress } from '@gamification/services/avatarService';
import { COLORS } from '@tokens/colors';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { totalXp, currentTier, achievements, unlockedAchievements } =
    useGamificationStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Animated values for tier progress
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
    const tierProgress = calculateTierProgress(totalXp);
    Animated.timing(progressAnim, {
      toValue: tierProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [totalXp, progressAnim]);

  const currentTierData = LIFE_TREE_TIERS[currentTier - 1] || LIFE_TREE_TIERS[0];
  const nextTierData = LIFE_TREE_TIERS[currentTier] || LIFE_TREE_TIERS[8];

  // Group achievements by category
  const achievementsByCategory = achievements.reduce(
    (acc, achievement) => {
      const cat = achievement.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(achievement);
      return acc;
    },
    {} as Record<string, typeof achievements>
  );

  const categoryLabels: Record<string, string> = {
    botaniste: '🌿 Botaniste',
    soigneur: '💚 Soigneur',
    social: '👥 Social',
    explorateur: '🔍 Explorateur',
    collectionneur: '📚 Collectionneur',
    other: '⭐ Autre',
  };

  const renderTierIcon = (tier: number) => {
    const icons = ['🌱', '🌿', '🌱', '🌾', '🍃', '🌸', '🍎', '🌳', '🌲'];
    return icons[tier - 1] || '🌱';
  };

  const renderAchievementCard = (achievement: typeof achievements[0]) => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          !isUnlocked && styles.achievementCardLocked,
        ]}
      >
        <Text style={styles.achievementIcon}>
          {isUnlocked ? achievement.icon : '🔒'}
        </Text>
        <View style={styles.achievementContent}>
          <Text
            style={[
              styles.achievementName,
              !isUnlocked && styles.achievementNameLocked,
            ]}
          >
            {achievement.name}
          </Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
        </View>
        {isUnlocked && (
          <Text style={styles.achievementCheck}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategory = (category: string) => {
    const catAchievements = achievementsByCategory[category] || [];
    const unlockedCount = catAchievements.filter((a) =>
      unlockedAchievements.includes(a.id)
    ).length;
    const isExpanded = expandedCategory === category;

    return (
      <View key={category} style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() =>
            setExpandedCategory(isExpanded ? null : category)
          }
        >
          <Text style={styles.categoryTitle}>
            {categoryLabels[category]}
          </Text>
          <Text style={styles.categoryProgress}>
            {unlockedCount}/{catAchievements.length}
          </Text>
          <Text style={styles.categoryToggle}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoryContent}>
            {catAchievements.map((achievement) =>
              renderAchievementCard(achievement)
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 80 },
      ]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Votre Progression</Text>
        <Text style={styles.subtitle}>Arbre de Vie {currentTier}/9</Text>
      </View>

      {/* Life Tree Tier Display */}
      <View style={styles.tierCard}>
        <View style={styles.tierIconContainer}>
          <Text style={styles.tierIcon}>
            {renderTierIcon(currentTier)}
          </Text>
        </View>
        <View style={styles.tierContent}>
          <Text style={styles.tierName}>{currentTierData.name}</Text>
          <Text style={styles.tierDescription}>
            {currentTierData.description}
          </Text>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Expérience</Text>
          <Text style={styles.progressValue}>{totalXp} XP</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {nextTierData && nextTierData.requiredXp !== undefined && (
          <Text style={styles.progressInfo}>
            {Math.ceil(nextTierData.requiredXp - totalXp)} XP vers{' '}
            {nextTierData.name}
          </Text>
        )}
      </View>

      {/* Achievements Section */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Badges & Accomplissements</Text>
        {Object.keys(achievementsByCategory).map((category) =>
          renderCategory(category)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background[50],
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text[500],
  },
  tierCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    alignItems: 'center',
  },
  tierIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary[100],
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tierIcon: {
    fontSize: 48,
  },
  tierContent: {
    flex: 1,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary[700],
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 13,
    color: COLORS.text[600],
    lineHeight: 18,
  },
  progressSection: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text[700],
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
    borderRadius: 4,
  },
  progressInfo: {
    fontSize: 12,
    color: COLORS.text[500],
  },
  achievementsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text[900],
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  categoryHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text[800],
  },
  categoryProgress: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary[600],
    marginRight: 12,
  },
  categoryToggle: {
    fontSize: 12,
    color: COLORS.text[500],
  },
  categoryContent: {
    backgroundColor: COLORS.neutral[50],
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  achievementCardLocked: {
    opacity: 0.6,
    borderColor: COLORS.neutral[200],
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text[900],
    marginBottom: 2,
  },
  achievementNameLocked: {
    color: COLORS.text[500],
  },
  achievementDescription: {
    fontSize: 12,
    color: COLORS.text[600],
    lineHeight: 16,
  },
  achievementCheck: {
    fontSize: 18,
    color: COLORS.primary[600],
    fontWeight: '700',
  },
});
