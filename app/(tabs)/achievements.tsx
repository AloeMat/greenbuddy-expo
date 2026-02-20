import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { XpBar } from '@/features/gamification/components/XpBar';
import { AchievementGrid } from '@/features/gamification/components/AchievementGrid';
import { getXpNeededForNextTier } from '@/features/gamification/constants/lifetree';
import { ALL_ACHIEVEMENTS } from '@/features/gamification/constants/achievements';
import { COLORS } from '@/design-system/tokens/colors';

export default function AchievementsScreen() {
  const { totalXp, currentTier, unlockedAchievements } = useGamificationStore();
  const nextLevelXp = getXpNeededForNextTier(currentTier);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Mes Succès', headerShadowVisible: false, headerStyle: { backgroundColor: '#F5F5F0' } }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.header}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{currentTier}</Text>
            <Text style={styles.levelLabel}>NIVEAU</Text>
          </View>
          <View style={styles.xpContainer}>
            <XpBar currentXp={totalXp} nextLevelXp={nextLevelXp} level={currentTier} />
          </View>
        </View>

        {/* Achievements Title */}
        <Text style={styles.sectionTitle}>
          Trophées ({unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length})
        </Text>

        {/* Achievement Grid with Category Filters */}
        <AchievementGrid unlockedIds={unlockedAchievements} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  levelBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.brand, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  levelNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  levelLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  xpContainer: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
});
