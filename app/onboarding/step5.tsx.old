import React from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@design-system/components/Button';
import { ProgressBar } from '@features/onboarding/components/ProgressBar';
import { Card } from '@design-system/components/Card';
import { SignupModal } from '@features/onboarding/components/SignupModal';
import { Ionicons } from '@expo/vector-icons';
import type { RewardType } from '@appTypes';
import { geolocationService } from '@lib/services/geolocation';
import { useGamificationStore } from '@gamification/store/gamificationStore';
import { xpRewardService, RewardType as ServiceRewardType } from '@gamification/services/xpRewardService';
import { logger } from '@lib/services/logger';

const ONBOARDING_XP = 100;

export default function OnboardingStep5() {
  const router = useRouter();
  const [notifsEnabled, setNotifsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const { addXp } = useGamificationStore();

  const handleFinish = async () => {
    try {
      if (locationEnabled) {
        await geolocationService.getCurrentPosition();
      }

      // Award XP for completing onboarding
      const rewardType: RewardType = 'ADD_PLANT';
      addXp(ONBOARDING_XP, rewardType);
      xpRewardService.logReward(ServiceRewardType.ADD_PLANT, 'Onboarding complet');

      logger.info('Onboarding completed, showing signup modal');
      // Show signup modal instead of direct redirect
      setShowSignupModal(true);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error during onboarding finish', err);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleSignupSuccess = () => {
    logger.info('User signed up from onboarding, redirecting to app');
    router.replace('/(tabs)');
  };

  const handleSkipSignup = () => {
    logger.info('User skipped signup, proceeding as guest');
    router.replace('/(tabs)');
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Progress Bar + Header Row */}
        <View style={styles.progressSection}>
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '100%' }]} />
            </View>
          </View>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.stepCounter}>5/5</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Derniers réglages</Text>
          <Text style={styles.subtitle}>
            Pour une expérience optimale, nous avons besoin de quelques permissions.
          </Text>

          <Card style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <View style={styles.permissionInfo}>
                <Ionicons name="notifications-outline" size={24} color="#2D5A27" />
                <View>
                  <Text style={styles.permissionTitle}>Notifications</Text>
                  <Text style={styles.permissionDesc}>Pour les rappels d'arrosage</Text>
                </View>
              </View>
              <Switch value={notifsEnabled} onValueChange={setNotifsEnabled} trackColor={{ false: '#E0E0E0', true: '#4CAF50' }} />
            </View>

            <View style={[styles.permissionRow, { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16 }]}>
              <View style={styles.permissionInfo}>
                <Ionicons name="location-outline" size={24} color="#2D5A27" />
                <View>
                  <Text style={styles.permissionTitle}>Localisation</Text>
                  <Text style={styles.permissionDesc}>Pour la météo locale</Text>
                </View>
              </View>
              <Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ false: '#E0E0E0', true: '#4CAF50' }} />
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button label="C'est parti !" onPress={handleFinish} />
        </View>
      </SafeAreaView>

      <SignupModal
        visible={showSignupModal}
        onSignupSuccess={handleSignupSuccess}
        onCancel={handleSkipSignup}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  progressSection: { paddingHorizontal: 24, paddingVertical: 12 },
  barContainer: { marginBottom: 8 },
  barBackground: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  stepCounter: { fontSize: 13, color: '#666', fontWeight: '500' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#666666', marginBottom: 32, lineHeight: 24 },
  permissionCard: { padding: 0 },
  permissionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  permissionInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  permissionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  permissionDesc: { fontSize: 14, color: '#666666' },
  footer: { padding: 24 },
});