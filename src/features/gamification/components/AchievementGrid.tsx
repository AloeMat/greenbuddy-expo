/**
 * Achievement Grid Component
 * Display achievements in a grid with filtering by category
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { BadgeCard } from '@design-system/components';
import {
  ALL_ACHIEVEMENTS,
  getAchievementsByCategory,
  CATEGORY_METADATA,
  AchievementCategory,
  Achievement,
} from '@gamification/constants/achievements';
import { COLORS } from '@tokens/colors';

interface AchievementGridProps {
  unlockedIds: string[];
  onAchievementPress?: (achievementId: string) => void;
  defaultCategory?: AchievementCategory;
}

/**
 * Achievement Grid Component
 */
export const AchievementGrid: React.FC<AchievementGridProps> = ({
  unlockedIds,
  onAchievementPress,
  defaultCategory = 'botaniste',
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<AchievementCategory>(defaultCategory);

  const categories: AchievementCategory[] = [
    'botaniste',
    'soigneur',
    'social',
    'explorateur',
    'collectionneur',
  ];

  const achievements = getAchievementsByCategory(selectedCategory);
  const unlockedCount = achievements.filter((a) =>
    unlockedIds.includes(a.id)
  ).length;

  const renderAchievementCard = (achievement: Achievement) => (
    <View key={achievement.id} style={styles.cardWrapper}>
      <BadgeCard
        icon={achievement.icon}
        label={achievement.name}
        description={achievement.description}
        unlocked={unlockedIds.includes(achievement.id)}
        onPress={() => onAchievementPress?.(achievement.id)}
        size="md"
      />
      {achievement.reward && (
        <Text style={styles.rewardLabel}>+{achievement.reward} XP</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.filterButton,
              selectedCategory === cat && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat && styles.filterTextActive,
              ]}
            >
              {CATEGORY_METADATA[cat].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <View>
          <Text style={styles.categoryTitle}>
            {CATEGORY_METADATA[selectedCategory].label}
          </Text>
          <Text style={styles.categoryDescription}>
            {CATEGORY_METADATA[selectedCategory].description}
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
      </View>

      {/* Achievement Cards Grid */}
      <FlatList
        data={achievements}
        renderItem={({ item }) => renderAchievementCard(item)}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.gridContent}
      />
    </View>
  );
};

/**
 * Single Achievement Category View (compact)
 */
export const AchievementCategorySection: React.FC<{
  category: AchievementCategory;
  unlockedIds: string[];
  onAchievementPress?: (achievementId: string) => void;
  expandable?: boolean;
}> = ({ category, unlockedIds, onAchievementPress, expandable = true }) => {
  const [expanded, setExpanded] = useState(true);
  const achievements = getAchievementsByCategory(category);
  const unlockedCount = achievements.filter((a) =>
    unlockedIds.includes(a.id)
  ).length;

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.sectionHeader}
      >
        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>
            {CATEGORY_METADATA[category].label}
          </Text>
          <Text style={styles.sectionCount}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionContent}>
          {achievements.map((achievement) =>
            renderAchievementCard(achievement)
          )}
        </View>
      )}
    </View>
  );

  function renderAchievementCard(achievement: Achievement) {
    return (
      <View key={achievement.id} style={styles.compactCardWrapper}>
        <BadgeCard
          icon={achievement.icon}
          label={achievement.name}
          unlocked={unlockedIds.includes(achievement.id)}
          onPress={() => onAchievementPress?.(achievement.id)}
          size="sm"
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    maxHeight: 60,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[200],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[600],
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text[700],
  },
  filterTextActive: {
    color: COLORS.neutral[50],
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.primary[50],
    padding: 12,
    borderRadius: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text[900],
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: COLORS.text[600],
  },
  progressBadge: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral[50],
  },
  gridContent: {
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: '31%',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary[600],
    marginTop: 4,
    textAlign: 'center',
  },
  // Section styles
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.neutral[100],
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text[900],
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.text[500],
  },
  sectionContent: {
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  compactCardWrapper: {
    width: '32%',
    alignItems: 'center',
  },
});
