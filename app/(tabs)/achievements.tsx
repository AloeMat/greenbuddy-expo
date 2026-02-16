import React from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useGamificationStore } from '@gamification/store/gamificationStore';
import { AchievementCard } from '@gamification/components/AchievementCard';
import { XpBar } from '@gamification/components/XpBar';
import { getXpNeededForNextTier } from '@gamification/constants/lifetree';

// Mock data pour les succès (à déplacer dans un fichier de constantes plus tard)
const ACHIEVEMENTS_LIST = [
  { id: 'first_plant', title: 'Main Verte', description: 'Ajouter votre première plante', icon: 'leaf' as const },
  { id: 'first_water', title: 'Source de Vie', description: 'Arroser une plante pour la première fois', icon: 'water' as const },
  { id: 'streak_7', title: 'Jardinier Dévoué', description: 'Ouvrir l\'application 7 jours de suite', icon: 'calendar' as const },
  { id: 'level_5', title: 'Expert Botaniste', description: 'Atteindre le niveau 5', icon: 'school' as const },
  { id: 'collection_10', title: 'Jungle Urbaine', description: 'Avoir 10 plantes dans votre jardin', icon: 'flower' as const },
];

export default function AchievementsScreen() {
  const { totalXp, currentTier, unlockedAchievements } = useGamificationStore();
  const nextLevelXp = getXpNeededForNextTier(currentTier);

  // Render header component
  const renderHeader = () => (
    <View>
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
      <Text style={styles.sectionTitle}>Trophées ({unlockedAchievements.length}/{ACHIEVEMENTS_LIST.length})</Text>
    </View>
  );

  // Render achievement item
  const renderItem = ({ item }: ListRenderItemInfo<typeof ACHIEVEMENTS_LIST[0]>) => (
    <AchievementCard
      title={item.title}
      description={item.description}
      icon={item.icon}
      unlocked={unlockedAchievements.includes(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Mes Succès', headerShadowVisible: false, headerStyle: { backgroundColor: '#F5F5F0' } }} />

      {/* OPTIMIZED: Using FlatList instead of ScrollView + .map() */}
      <FlatList
        data={ACHIEVEMENTS_LIST}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  scrollContent: { padding: 16, gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  levelBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2D5A27', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  levelNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  levelLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  xpContainer: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
});