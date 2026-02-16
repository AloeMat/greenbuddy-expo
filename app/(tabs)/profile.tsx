import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@auth/store/authStore';
import { useGamificationStore } from '@gamification/store/gamificationStore';
import { XpBar } from '@gamification/components/XpBar';
import { Card } from '@design-system/components/Card';
import { GradientOverlay } from '@design-system/components/GradientOverlay';
import { getXpNeededForNextTier } from '@gamification/constants/lifetree';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { totalXp, currentTier, unlockedAchievements } = useGamificationStore();
  const nextLevelXp = getXpNeededForNextTier(currentTier);
  const level = currentTier;
  const router = useRouter();

  const xpProgress = (totalXp % 500) / 500; // Assuming 500 XP per level
  const currentLevelXp = totalXp % 500;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Level Card with Gradient */}
        <GradientOverlay
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelCard}
        >
          <View style={styles.levelContent}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Niveau</Text>
              <Text style={styles.xpCounter}>{totalXp} XP total</Text>
            </View>
          </View>
        </GradientOverlay>

        {/* XP Progress Bar */}
        <View style={styles.xpBarContainer}>
          <XpBar currentXp={currentLevelXp} nextLevelXp={500} level={level} />
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle" size={48} color="#10B981" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.email || 'Utilisateur'}</Text>
              <Text style={styles.userSubtitle}>Jardinier enthousiaste</Text>
            </View>
          </View>
        </Card>

        {/* Achievements Summary */}
        <Card style={styles.achievementsCard}>
          <View style={styles.achievementHeader}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.achievementTitle}>Trophées Débloqués</Text>
          </View>
          <Text style={styles.achievementCount}>{unlockedAchievements.length} succès</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)/achievements')}
          >
            <Text style={styles.viewAllText}>Voir tous les trophées →</Text>
          </TouchableOpacity>
        </Card>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🌱</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Plantes</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Arrosages</Text>
          </Card>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut!();
            router.replace('/(auth)/login');
          }}
        >
          <Ionicons name="log-out" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 12 },

  // Level Card
  levelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  levelInfo: { flex: 1 },
  levelLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 4 },
  xpCounter: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },

  // XP Bar
  xpBarContainer: { marginBottom: 20 },

  // User Card
  userCard: { marginBottom: 16, padding: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  userSubtitle: { fontSize: 13, color: '#666' },

  // Achievements Card
  achievementsCard: { marginBottom: 16, padding: 16 },
  achievementHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  achievementTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  achievementCount: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginBottom: 12 },
  viewAllButton: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' },
  viewAllText: { color: '#10B981', fontWeight: '600', fontSize: 13, textAlign: 'center' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#666', fontWeight: '500' },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 40,
  },
  logoutText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});
