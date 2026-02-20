import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useAuthStore } from '@/features/auth/store/authStore';
import { logger } from '@/lib/services/logger';
import { STORAGE_KEYS } from '@/lib/constants/storageKeys';
import { useRouter } from 'expo-router';
import { Trophy, LogOut, Bell, Globe } from 'lucide-react-native';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { useStreak } from '@/features/gamification/hooks/useStreak';
import { useDailyNotification } from '@/features/gamification/hooks/useDailyNotification';
import { COLORS } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { typography } from '@/design-system/tokens/typography';

/** Returns the color for a health percentage bar */
function getHealthColor(percentage: number): string {
  if (percentage >= 80) return COLORS.semantic.success;
  if (percentage >= 50) return COLORS.accent['500'];
  return COLORS.error['500'];
}

/**
 * Profile Screen
 * Displays user profile, stats, achievements, and settings
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { totalXp, unlockedAchievements } = useGamificationStore();
  const { plants = [] } = usePlants();
  const { currentStreak = 0 } = useStreak();

  // Notifications - from useDailyNotification hook
  const { isScheduled: notificationsEnabled, toggleNotifications, isLoading: notificationsLoading } = useDailyNotification();

  // Location - persisted in AsyncStorage
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Load location preference from AsyncStorage on mount
  useEffect(() => {
    const loadLocationPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_ENABLED);
        if (saved !== null) {
          setLocationEnabled(saved === 'true');
        }
      } catch (error) {
        logger.error('Error loading location preference:', error);
      }
    };
    loadLocationPreference();
  }, []);

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
          onPress: () => {
            void (async () => {
              try {
                await logout();
                router.replace('/(auth)');
              } catch (err) {
                logger.error('[Profile] Logout failed:', err);
                Alert.alert('Erreur', 'Impossible de se déconnecter');
              }
            })();
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle notifications toggle
  const handleNotificationsToggle = async () => {
    try {
      await toggleNotifications();
      Alert.alert(
        notificationsEnabled ? '✅ Notifications désactivées' : '✅ Notifications activées',
        notificationsEnabled ? 'Vous ne recevrez plus de rappels quotidiens' : 'Vous recevrez des rappels quotidiens'
      );
    } catch (error) {
      logger.error('[Profile] Notifications toggle failed:', error);
      Alert.alert('❌ Erreur', 'Impossible de modifier les notifications');
    }
  };

  // Handle location toggle
  const enableLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Veuillez autoriser l\'accès à la localisation dans les paramètres de l\'app pour recevoir des conseils météo.'
        );
        setLocationLoading(false);
        return;
      }
      setLocationEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_ENABLED, 'true');
      Alert.alert('✅ Localisation activée', 'Vous recevrez des conseils météo basés sur votre position');
    } catch (error) {
      logger.error('[Profile] Location access failed:', error);
      Alert.alert('❌ Erreur', 'Impossible d\'accéder à la localisation');
    } finally {
      setLocationLoading(false);
    }
  };

  const disableLocation = async () => {
    setLocationEnabled(false);
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_ENABLED, 'false');
    Alert.alert('✅ Localisation désactivée', 'Vous ne recevrez plus de conseils météo');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral['50'] }}>
      <ScrollView style={{ paddingBottom: insets.bottom + 70 }} testID="profile-scroll">
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
            <Trophy size={28} color={COLORS.secondary['500']} style={{ marginTop: 6 }} />
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
                    backgroundColor: getHealthColor(healthPercentage),
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

          {/* Notifications */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Bell size={20} color={COLORS.accent['500']} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>{"Rappels d'arrosage"}</Text>
              </View>
            </View>
            {notificationsLoading ? (
              <ActivityIndicator size="small" color={COLORS.semantic.success} />
            ) : (
              <Switch
                accessibilityLabel="Activer les notifications"
                accessibilityRole="switch"
                testID="profile-notifications-switch"
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: COLORS.neutral['300'], true: `${COLORS.semantic.success}50` }}
                thumbColor={notificationsEnabled ? COLORS.semantic.success : COLORS.neutral['100']}
                disabled={notificationsLoading}
              />
            )}
          </View>

          {/* Location */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Globe size={20} color={COLORS.secondary['600']} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Localisation</Text>
                <Text style={styles.settingDescription}>Pour les conseils météo</Text>
              </View>
            </View>
            {locationLoading ? (
              <ActivityIndicator size="small" color={COLORS.secondary['600']} />
            ) : (
              <Switch
                accessibilityLabel="Activer la localisation"
                accessibilityRole="switch"
                testID="profile-location-switch"
                value={locationEnabled}
                onValueChange={(value) => { void (value ? enableLocation() : disableLocation()); }}
                trackColor={{ false: COLORS.neutral['300'], true: `${COLORS.secondary['600']}50` }}
                thumbColor={locationEnabled ? COLORS.secondary['600'] : COLORS.neutral['100']}
                disabled={locationLoading}
              />
            )}
          </View>

          {/* Language */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabelText}>🌍 Langue</Text>
            </View>
            <Text style={styles.settingValue}>Français</Text>
          </View>
        </View>

        {/* Achievements Button */}
        <TouchableOpacity
          accessibilityLabel="Voir les achievements"
          accessibilityRole="button"
          testID="profile-achievements-button"
          style={styles.achievementsButton}
          onPress={() => router.push('/achievements')}
        >
          <Text style={styles.achievementsButtonText}>🏆 Voir mes succès</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          accessibilityLabel="Se déconnecter"
          accessibilityRole="button"
          testID="profile-logout-button"
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={COLORS.neutral['50']} />
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
    ...typography.heading.h2,
    color: COLORS.text['900'],
  },
  emailCard: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.blue['50'],
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary['600'],
  },
  emailLabel: {
    ...typography.body.sm,
    color: COLORS.text['500'],
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  emailValue: {
    ...typography.subtitle.md,
    color: COLORS.text['900'],
  },
  levelSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.secondary['50'],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 70,
    height: 70,
    borderRadius: radius.full,
    backgroundColor: COLORS.neutral['50'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary['500'],
  },
  levelNumber: {
    ...typography.heading.h1,
    color: COLORS.secondary['500'],
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    ...typography.body.xs,
    color: COLORS.text['500'],
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  levelDescription: {
    ...typography.label.lg,
    fontWeight: '600',
    color: COLORS.text['900'],
  },
  xpSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.neutral['50'],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.accent['300'],
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: COLORS.neutral['200'],
    borderRadius: radius.xs,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: COLORS.accent['500'],
  },
  xpText: {
    ...typography.label.md,
    color: COLORS.text['500'],
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
    backgroundColor: COLORS.neutral['50'],
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral['100'],
  },
  statValue: {
    ...typography.heading.h4,
    color: COLORS.text['900'],
    marginBottom: 2,
  },
  statLabel: {
    ...typography.label.sm,
    color: COLORS.text['500'],
  },
  gardenHealthSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.neutral['50'],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.blue['100'],
  },
  sectionTitle: {
    ...typography.subtitle.md,
    fontWeight: '700',
    color: COLORS.text['900'],
    marginBottom: 12,
  },
  healthContainer: {
    gap: 8,
  },
  healthBar: {
    height: 8,
    backgroundColor: COLORS.neutral['200'],
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
  },
  healthText: {
    ...typography.body.md,
    fontWeight: '500',
    color: COLORS.text['500'],
  },
  settingsSection: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.neutral['50'],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.neutral['200'],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral['100'],
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
    ...typography.subtitle.sm,
    fontWeight: '600',
    color: COLORS.text['900'],
    marginBottom: 2,
  },
  settingLabelText: {
    ...typography.subtitle.sm,
    fontWeight: '600',
    color: COLORS.text['900'],
  },
  settingDescription: {
    ...typography.body.sm,
    color: COLORS.text['400'],
  },
  settingValue: {
    ...typography.body.md,
    fontWeight: '500',
    color: COLORS.text['500'],
  },
  achievementsButton: {
    marginHorizontal: 12,
    marginVertical: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.accent['100'],
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent['300'],
  },
  achievementsButtonText: {
    ...typography.label.lg,
    fontWeight: '600',
    color: COLORS.accent['800'],
  },
  logoutButton: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.error['600'],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    ...typography.label.lg,
    fontWeight: '600',
    color: COLORS.neutral['50'],
  },
});
