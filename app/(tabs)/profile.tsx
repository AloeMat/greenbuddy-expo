import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'expo-router';
import { Trophy, LogOut, Bell, Globe } from 'lucide-react-native';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { useStreak } from '@/features/gamification/hooks/useStreak';
import { radius } from '@/design-system/tokens/radius';

/**
 * Profile Screen
 * Displays user profile, stats, achievements, and settings
 */
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { totalXp, unlockedAchievements } = useGamificationStore();
  const { plants = [] } = usePlants();
  const { currentStreak = 0 } = useStreak();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Calculate current level and XP
  const XP_PER_LEVEL = 500;
  const currentLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  const xpProgress = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.round((xpProgress / xpNeeded) * 100);

  // Garden health calculation
  const healthyPlants = useMemo(() => {
    return plants.filter((p) => p.sante_score >= 80).length;
  }, [plants]);
  const healthPercentage = plants.length > 0 ? Math.round((healthyPlants / plants.length) * 100) : 0;

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', onPress: () => {} },
        {
          text: 'Déconnecter',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ paddingBottom: 80 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil 👤</Text>
        </View>

        {/* User Email Card */}
        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>Connecté en tant que</Text>
          <Text style={styles.emailValue}>{user?.email || 'Non disponible'}</Text>
        </View>

        {/* Level Badge */}
        <View style={styles.levelSection}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{currentLevel}</Text>
            <Trophy size={28} color="#8B5CF6" style={{ marginTop: 6 }} />
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Niveau Actuel</Text>
            <Text style={styles.levelDescription}>Vous êtes au niveau {currentLevel}</Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpSection}>
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
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{plants.length}</Text>
            <Text style={styles.statLabel}>Plantes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Succès</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalXp}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
        </View>

        {/* Garden Health */}
        <View style={styles.gardenHealthSection}>
          <Text style={styles.sectionTitle}>🌿 État de votre jardin</Text>
          <View style={styles.healthContainer}>
            <View style={styles.healthBar}>
              <View
                style={[
                  styles.healthFill,
                  {
                    width: `${healthPercentage}%`,
                    backgroundColor: healthPercentage >= 80 ? '#10B981' : healthPercentage >= 50 ? '#F59E0B' : '#EF4444',
                  },
                ]}
              />
            </View>
            <Text style={styles.healthText}>
              {healthyPlants} / {plants.length} plantes en bonne santé ({healthPercentage}%)
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Bell size={20} color="#F59E0B" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Rappels d'arrosage</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#10B98150' }}
              thumbColor={notificationsEnabled ? '#10B981' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Globe size={20} color="#0891B2" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Localisation</Text>
                <Text style={styles.settingDescription}>Pour les conseils météo</Text>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#D1D5DB', true: '#0891B250' }}
              thumbColor={locationEnabled ? '#0891B2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabelText}>🌍 Langue</Text>
            </View>
            <Text style={styles.settingValue}>Français</Text>
          </View>
        </View>

        {/* Achievements Button */}
        <TouchableOpacity
          style={styles.achievementsButton}
          onPress={() => router.push('/achievements')}
        >
          <Text style={styles.achievementsButtonText}>🏆 Voir mes succès</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
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
  emailCard: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#0891B2',
  },
  emailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  levelSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F3E8FF',
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  levelDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  xpSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: radius.xs,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  xpText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  gardenHealthSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  healthContainer: {
    gap: 8,
  },
  healthBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
  },
  healthText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  settingsSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  settingLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  achievementsButton: {
    marginHorizontal: 12,
    marginVertical: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  achievementsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  logoutButton: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
