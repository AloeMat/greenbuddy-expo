/**
 * Streak Counter Component
 * Displays current streak with fire animation
 * Shows daily check-in progress and milestone rewards
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Flame, Zap, Trophy } from 'lucide-react-native';
import { COLORS } from '@tokens/colors';
import { radius } from '@tokens/radius';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  nextMilestone?: number;
  animated?: boolean;
}

/**
 * Fire animation component
 */
const FireAnimation: React.FC<{ intensity: number }> = ({ intensity }) => {
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Continuous float animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [floatAnim, scaleAnim]);

  const getColor = () => {
    if (intensity >= 90) return COLORS.error[500]; // Red for high streaks
    if (intensity >= 30) return COLORS.warning[500]; // Orange for medium
    return COLORS.primary[500]; // Green for low
  };

  return (
    <Animated.View
      style={[
        styles.fireContainer,
        {
          transform: [{ translateY: floatAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Flame
        size={48}
        color={getColor()}
        fill={getColor()}
        strokeWidth={1}
      />
    </Animated.View>
  );
};

/**
 * Milestone Badge Component
 */
const MilestoneBadge: React.FC<{ milestone: number; achieved: boolean }> = ({
  milestone,
  achieved,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(achieved ? 1 : 0)).current;

  useEffect(() => {
    if (achieved) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [achieved, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.milestoneBadge,
        {
          backgroundColor: achieved
            ? COLORS.warning[500]
            : COLORS.neutral[200],
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text
        style={[
          styles.milestoneBadgeText,
          { color: achieved ? COLORS.neutral[50] : COLORS.text[600] },
        ]}
      >
        {milestone}
      </Text>
    </Animated.View>
  );
};

/**
 * Streak Counter Component
 */
export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  nextMilestone = 7,
  animated = true,
}) => {
  const milestones = [7, 30, 90];
  const achievedMilestones = milestones.filter((m) => currentStreak >= m);

  const getStreakColor = () => {
    if (currentStreak >= 90) return COLORS.error[600];
    if (currentStreak >= 30) return COLORS.warning[600];
    if (currentStreak >= 7) return COLORS.primary[600];
    return COLORS.text[700];
  };

  const getStreakLabel = () => {
    if (currentStreak >= 90) return 'Légendaire!';
    if (currentStreak >= 30) return 'Incroyable!';
    if (currentStreak >= 7) return 'Excellent!';
    return 'Bravo!';
  };

  return (
    <View style={styles.container}>
      {/* Main Streak Display */}
      <View style={styles.streakCard}>
        {animated && (
          <View style={styles.fireAnimationContainer}>
            <FireAnimation intensity={currentStreak} />
          </View>
        )}

        <View style={styles.streakContent}>
          <Text style={styles.streakLabel}>{getStreakLabel()}</Text>
          <View style={styles.streakNumberContainer}>
            <Text
              style={[
                styles.streakNumber,
                { color: getStreakColor() },
              ]}
            >
              {currentStreak}
            </Text>
            <Text style={styles.streakUnit}>jours</Text>
          </View>

          {longestStreak && currentStreak !== longestStreak && (
            <Text style={styles.personalBest}>
              Record: {longestStreak} jours
            </Text>
          )}
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesLabel}>Jalons</Text>
        <View style={styles.milestonesGrid}>
          {milestones.map((milestone) => (
            <MilestoneBadge
              key={milestone}
              milestone={milestone}
              achieved={currentStreak >= milestone}
            />
          ))}
        </View>
      </View>

      {/* Progress to Next Milestone */}
      {currentStreak < 90 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {nextMilestone - currentStreak} jour(s) jusqu'à {nextMilestone}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(currentStreak / nextMilestone) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  streakCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: radius.lg, // Phase 5.5: 16 → 24 (+50%)
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.warning[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fireAnimationContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakContent: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning[700],
    marginBottom: 4,
  },
  streakNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  streakUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text[600],
  },
  personalBest: {
    fontSize: 12,
    color: COLORS.text[500],
    fontStyle: 'italic',
  },
  milestonesContainer: {
    gap: 8,
  },
  milestonesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text[700],
  },
  milestonesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  milestoneBadge: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm, // Phase 5.5: 10 → 12 (+20%)
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressSection: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text[600],
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: radius.xs, // Phase 5.5: 3 → 8 (+167%)
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning[500],
    borderRadius: radius.xs, // Phase 5.5: 3 → 8 (+167%)
  },
});
