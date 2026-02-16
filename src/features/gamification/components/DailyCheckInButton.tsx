/**
 * Daily Check-In Button Component
 * Displays current streak and allows user to check in daily
 * Integrated with streakService for XP rewards and milestone tracking
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Flame, CheckCircle } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  BounceIn,
  ZoomIn,
} from 'react-native-reanimated';
import { useDailyCheckIn } from '@gamification/hooks/useStreak';
import { useGamificationStore } from '@gamification/store/gamificationStore';
import { colors } from '@design-system/tokens/colors';
import { logger } from '@lib/services/logger';

interface DailyCheckInButtonProps {
  onCheckInComplete?: (result?: any) => void;
  compact?: boolean;
}

/**
 * Daily Check-In Button Component
 * Shows streak count + check-in button + milestone progress
 */
export const DailyCheckInButton: React.FC<DailyCheckInButtonProps> = ({
  onCheckInComplete,
  compact = false,
}) => {
  const { handleCheckIn, isLoading, isCheckInAvailable, result } = useDailyCheckIn();
  const store = useGamificationStore();

  const handlePress = async () => {
    if (!isCheckInAvailable || isLoading) return;

    try {
      const checkInResult = await handleCheckIn();

      if (checkInResult) {
        // Show success message
        if (checkInResult.milestonReached) {
          Alert.alert(
            '🎉 Milestone Atteint!',
            `Vous avez maintenu une série de ${checkInResult.milestonReached.days} jours!\n+${checkInResult.xpEarned} XP`
          );
        } else {
          Alert.alert(
            '✅ Check-in Complété!',
            `+${checkInResult.xpEarned} XP\nSérie actuelle: ${checkInResult.streakAfter} jours`
          );
        }

        // Callback
        onCheckInComplete?.(checkInResult);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de compléter le check-in.');
      logger.error('Check-in error:', error);
    }
  };

  const buttonColor = getStreakColor(store.currentStreak);

  if (compact) {
    // Compact version for header/dashboard
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: buttonColor }]}
        onPress={handlePress}
        disabled={!isCheckInAvailable || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : isCheckInAvailable ? (
          <>
            <Flame size={16} color="#FFF" strokeWidth={2} />
            <Text style={styles.compactButtonText}>{store.currentStreak} jours</Text>
          </>
        ) : (
          <>
            <CheckCircle size={16} color="#FFF" strokeWidth={2} />
            <Text style={styles.compactButtonText}>Demain!</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Full version for dedicated screen
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={[styles.card, { borderColor: buttonColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.flameIcon, { backgroundColor: buttonColor }]}>
              <Flame size={24} color="#FFF" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.headerLabel}>Série actuelle</Text>
              <View style={styles.streakDisplay}>
                <Text style={[styles.streakNumber, { color: buttonColor }]}>
                  {store.currentStreak}
                </Text>
                <Text style={styles.streakUnit}>jours</Text>
              </View>
            </View>
          </View>
          <View style={styles.personalBest}>
            <Text style={styles.personalBestLabel}>Meilleur</Text>
            <Text style={styles.personalBestValue}>{store.longestStreak}</Text>
          </View>
        </View>

        {/* Milestone Progress */}
        <View style={styles.milestoneSection}>
          <Text style={styles.milestoneLabel}>Prochaine étape</Text>
          <View style={styles.milestones}>
            {[7, 30, 90].map((days) => {
              const unlocked = store.currentStreak >= days;
              return (
                <View
                  key={days}
                  style={[
                    styles.milestoneBadge,
                    unlocked && styles.milestoneBadgeUnlocked,
                  ]}
                >
                  <Text style={[styles.milestoneDays, unlocked && { color: '#FFF' }]}>
                    {days}j
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Check-In Button */}
        <TouchableOpacity
          style={[
            styles.checkInButton,
            { backgroundColor: buttonColor },
            (!isCheckInAvailable || isLoading) && styles.checkInButtonDisabled,
          ]}
          onPress={handlePress}
          disabled={!isCheckInAvailable || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : isCheckInAvailable ? (
            <>
              <Text style={styles.checkInButtonText}>Check-in quotidien</Text>
              <Text style={styles.checkInButtonSubtext}>Gagnez +5 XP</Text>
            </>
          ) : (
            <>
              <CheckCircle size={24} color="#FFF" strokeWidth={2} />
              <Text style={styles.checkInButtonText}>Complété pour aujourd'hui!</Text>
              <Text style={styles.checkInButtonSubtext}>Revenez demain</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Result Message */}
        {result && (
          <Animated.View entering={BounceIn} style={styles.resultMessage}>
            <CheckCircle size={20} color={colors.semantic.success} strokeWidth={2} />
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>
                +{result.xpEarned} XP{result.milestonReached && ' (Bonus!)'}
              </Text>
              <Text style={styles.resultSubtitle}>
                {result.milestonReached
                  ? `Félicitations pour ${result.milestonReached.days} jours!`
                  : `Série: ${result.streakAfter} jours`}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

/**
 * Get color based on current streak
 */
function getStreakColor(streak: number): string {
  if (streak >= 90) return colors.semantic.danger; // Red for legendary
  if (streak >= 30) return colors.semantic.warning; // Orange for passionate
  if (streak >= 7) return colors.semantic.success; // Green for good
  return colors.primary[400];
}

const styles = StyleSheet.create({
  // Compact version
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  compactButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Full version
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '600',
    marginBottom: 4,
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  streakUnit: {
    fontSize: 13,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  personalBest: {
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  personalBestLabel: {
    fontSize: 10,
    color: colors.neutral[600],
    fontWeight: '600',
    marginBottom: 2,
  },
  personalBestValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral[900],
  },

  // Milestones
  milestoneSection: {
    marginBottom: 16,
  },
  milestoneLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '600',
    marginBottom: 8,
  },
  milestones: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  milestoneBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  milestoneBadgeUnlocked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  milestoneDays: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[700],
  },

  // Check-In Button
  checkInButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  checkInButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },

  // Result Message
  resultMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.semantic.success,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: colors.semantic.success,
    fontWeight: '500',
  },
});
