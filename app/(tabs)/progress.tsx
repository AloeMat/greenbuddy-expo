import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trophy, Zap } from 'lucide-react-native';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { useStreak } from '@/features/gamification/hooks/useStreak';
import { radius } from '@/design-system/tokens/radius';
import {
  BOTANISTE_ACHIEVEMENTS,
  SOIGNEUR_ACHIEVEMENTS,
  SOCIAL_ACHIEVEMENTS,
  EXPLORATEUR_ACHIEVEMENTS,
  COLLECTIONNEUR_ACHIEVEMENTS,
  type Achievement,
} from '@/features/gamification/constants/achievements';

/**
 * Progress Screen
 * Displays user XP, level, achievements, and progression stats
 */
export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalXp, unlockedAchievements } = useGamificationStore();
  const { plants = [] } = usePlants();
  const { currentStreak = 0 } = useStreak();

  // Calculate current level and XP
  const XP_PER_LEVEL = 500;
  const currentLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  const xpProgress = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.round((xpProgress / xpNeeded) * 100);

  // Get all achievements
  const allAchievements = useMemo(
    () => [
      ...BOTANISTE_ACHIEVEMENTS,
      ...SOIGNEUR_ACHIEVEMENTS,
      ...SOCIAL_ACHIEVEMENTS,
      ...EXPLORATEUR_ACHIEVEMENTS,
      ...COLLECTIONNEUR_ACHIEVEMENTS,
    ],
    []
  );

  // Get recent achievements (last 5 unlocked)
  const recentAchievements = useMemo(() => {
    return unlockedAchievements
      .slice(-5)
      .reverse()
      .map((id: string) => allAchievements.find((a: Achievement) => a.id === id))
      .filter(Boolean) as Achievement[];
  }, [unlockedAchievements, allAchievements]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ paddingBottom: insets.bottom + 70 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progression 📊</Text>
        </View>

        {/* Level Badge */}
        <View style={styles.levelSection}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{currentLevel}</Text>
            <Trophy size={32} color="#8B5CF6" style={{ marginTop: 8 }} />
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Niveau Actuel</Text>
            <Text style={styles.levelDescription}>
              Vous êtes au niveau {currentLevel}
            </Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Zap size={20} color="#F59E0B" />
            <Text style={styles.xpLabel}>Expérience</Text>
          </View>

          {/* XP Bar */}
          <View style={styles.xpProgressBar}>
            <View
              style={[
                styles.xpProgressFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          <Text style={styles.xpText}>
            {xpProgress} / {xpNeeded} XP vers le niveau {currentLevel + 1}
          </Text>
          <Text style={styles.xpTotal}>Total: {totalXp} XP</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalXp}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentLevel}</Text>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{plants.length}</Text>
            <Text style={styles.statLabel}>Plantes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>🏆 Succès Récents</Text>
            <Text style={styles.achievementCount}>
              {unlockedAchievements.length} / {allAchievements.length}
            </Text>
          </View>

          {recentAchievements.length > 0 ? (
            <View>
              {recentAchievements.map((achievement: Achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    {achievement.icon}
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    {achievement.reward && (
                      <Text style={styles.achievementReward}>
                        +{achievement.reward} XP
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/achievements')}
              >
                <Text style={styles.viewAllButtonText}>Voir tous les succès →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {"Aucun succès débloqué pour l'instant."}
              </Text>
              <Text style={styles.emptySubText}>
                Continuez à vous occuper de vos plantes !
              </Text>
            </View>
          )}
        </View>

        {/* Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>🎯 Prochains Jalons</Text>

          <View style={styles.milestoneItem}>
            <View style={styles.milestoneIcon}>
              <Text>🌿</Text>
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>Botaniste (Niv. 10)</Text>
              <Text style={styles.milestoneProgress}>
                {currentLevel} / 10
              </Text>
            </View>
          </View>

          <View style={styles.milestoneItem}>
            <View style={styles.milestoneIcon}>
              <Text>💪</Text>
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>Soigneur Confirmé</Text>
              <Text style={styles.milestoneProgress}>
                {plants.length} / 10 plantes
              </Text>
            </View>
          </View>

          <View style={styles.milestoneItem}>
            <View style={styles.milestoneIcon}>
              <Text>⛓️</Text>
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>Engagé (30 jours)</Text>
              <Text style={styles.milestoneProgress}>
                {currentStreak} / 30 jours
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  levelSection: {
    marginHorizontal: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F3E8FF',
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  xpSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: radius.xs,
    overflow: 'hidden',
    marginBottom: 12,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  xpTotal: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  achievementsSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  achievementCount: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: '#FFF9C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  achievementReward: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#999',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
    alignItems: 'center',
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  milestonesSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  milestoneIcon: {
    fontSize: 24,
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  milestoneProgress: {
    fontSize: 12,
    color: '#666',
  },
});
