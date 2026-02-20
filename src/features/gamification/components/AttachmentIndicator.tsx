/**
 * AttachmentIndicator Component
 * ════════════════════════════════
 *
 * Visual representation of plant attachment phase and progression
 * - Shows current attachment phase with emoji indicators
 * - Displays progress bar to next phase milestone
 * - Shows attachment score (0-100%)
 * - Lists unlocked features for current phase
 * - Displays next milestone with day countdown
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { Zap, Unlock } from 'lucide-react-native';

import {
  AttachmentService,
  type AttachmentPhase,
  type AttachmentState,
} from '@/features/gamification/services/attachmentService';
import { type PlantPersonality } from '@/types';
import { getPersonalityProfile } from '@/features/gamification/constants/personalities';

export interface AttachmentIndicatorProps {
  attachmentState: AttachmentState;
  personality: PlantPersonality;
  compact?: boolean;
  showFeatures?: boolean;
  showMilestone?: boolean;
}

// Phase emojis and colors
const PHASE_CONFIG: Record<
  AttachmentPhase,
  {
    emoji: string;
    color: string;
    label: string;
    description: string;
  }
> = {
  discovery: {
    emoji: '🌱',
    color: '#60A5FA',
    label: 'Découverte',
    description: 'Première rencontre',
  },
  familiarity: {
    emoji: '🌿',
    color: '#34D399',
    label: 'Familiarité',
    description: 'Habitude formée',
  },
  attachment: {
    emoji: '🌳',
    color: '#FBBF24',
    label: 'Attachement',
    description: 'Lien établi',
  },
  companion: {
    emoji: '🌲',
    color: '#10B981',
    label: 'Compagnon',
    description: 'Ami pour la vie',
  },
};

export const AttachmentIndicator: React.FC<AttachmentIndicatorProps> = ({
  attachmentState,
  personality,
  compact = false,
  showFeatures = true,
  showMilestone = true,
}) => {
  // Profile used for future personality-based rendering
  getPersonalityProfile(personality);
  const phaseConfig = PHASE_CONFIG[attachmentState.attachmentPhase];
  const nextMilestone = AttachmentService.getNextMilestone(
    attachmentState.attachmentPhase,
    attachmentState.dayWithUser
  );
  const phaseProgress = AttachmentService.getPhaseProgress(
    attachmentState.attachmentPhase,
    attachmentState.dayWithUser
  );
  const unlockedFeatures = AttachmentService.getUnlockedFeatures(attachmentState.attachmentPhase);

  // Compact view for dashboard
  if (compact) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactEmoji}>{phaseConfig.emoji}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactLabel}>{phaseConfig.label}</Text>
            <Text style={styles.compactDays}>{attachmentState.dayWithUser} jours ensemble</Text>
          </View>
          <View
            style={[
              styles.scoreRing,
              {
                borderColor: phaseConfig.color,
                backgroundColor: phaseConfig.color + '15',
              },
            ]}
          >
            <Text style={[styles.scoreText, { color: phaseConfig.color }]}>
              {attachmentState.attachmentScore}%
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.compactProgressBar,
            { backgroundColor: phaseConfig.color + '30' },
          ]}
        >
          <Animated.View
            style={[
              styles.compactProgressFill,
              {
                width: `${phaseProgress}%`,
                backgroundColor: phaseConfig.color,
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  }

  // Full view for detail pages
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={LinearTransition.springify()}
      style={styles.container}
    >
      {/* Phase Header */}
      <View style={styles.header}>
        <View style={styles.phaseTitle}>
          <Text style={styles.phaseEmoji}>{phaseConfig.emoji}</Text>
          <View style={styles.phaseLabelSection}>
            <Text style={styles.phaseLabel}>{phaseConfig.label}</Text>
            <Text style={styles.phaseDescription}>{phaseConfig.description}</Text>
          </View>
        </View>
        <View
          style={[
            styles.scoreDisplay,
            {
              backgroundColor: phaseConfig.color,
              borderColor: phaseConfig.color,
            },
          ]}
        >
          <Text style={styles.scoreLabel}>Attachement</Text>
          <Text style={styles.scoreValue}>{attachmentState.attachmentScore}%</Text>
        </View>
      </View>

      {/* Days & Care Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statLabel}>Jours ensemble</Text>
          <Text style={styles.statValue}>{attachmentState.dayWithUser}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>💧</Text>
          <Text style={styles.statLabel}>Jours de soin</Text>
          <Text style={styles.statValue}>{attachmentState.careConsistencyDays}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>✨</Text>
          <Text style={styles.statLabel}>Interactions</Text>
          <Text style={styles.statValue}>{attachmentState.totalInteractions}</Text>
        </View>
      </View>

      {/* Phase Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progression de phase</Text>
          <Text style={styles.progressPercent}>{phaseProgress}%</Text>
        </View>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: phaseConfig.color + '20' },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${phaseProgress}%`,
                backgroundColor: phaseConfig.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Next Milestone */}
      {showMilestone && nextMilestone && (
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneHeader}>
            <Zap size={16} color={phaseConfig.color} />
            <Text style={styles.milestoneTitle}>Prochain jalon</Text>
          </View>
          <View
            style={[
              styles.milestoneCard,
              { borderColor: phaseConfig.color, borderLeftColor: phaseConfig.color },
            ]}
          >
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneName}>{nextMilestone.name}</Text>
              <Text style={styles.milestoneDay}>
                Jour {nextMilestone.day} ({nextMilestone.day - attachmentState.dayWithUser} jours restants)
              </Text>
            </View>
            {nextMilestone.reward && (
              <View style={styles.milestoneReward}>
                <Text style={styles.rewardText}>+{nextMilestone.reward}</Text>
                <Text style={styles.rewardLabel}>XP</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Unlocked Features */}
      {showFeatures && unlockedFeatures.length > 0 && (
        <View style={styles.featuresSection}>
          <View style={styles.featuresHeader}>
            <Unlock size={16} color={phaseConfig.color} />
            <Text style={styles.featuresTitle}>Fonctionnalités débloquées</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuresList}
            contentContainerStyle={styles.featuresContent}
          >
            {unlockedFeatures.map((feature, index) => (
              <View
                key={`${feature}-${index}`}
                style={[
                  styles.featureBadge,
                  { backgroundColor: phaseConfig.color + '20', borderColor: phaseConfig.color },
                ]}
              >
                <Text style={[styles.featureName, { color: phaseConfig.color }]}>
                  {formatFeatureName(feature)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Emotional Depth Indicator */}
      <View style={styles.emotionalSection}>
        <Text style={styles.emotionalLabel}>Profondeur émotionnelle</Text>
        <View style={styles.emotionalBar}>
          {(['surface', 'developing', 'strong', 'deep'] as const).map((level, index) => {
            const isReached = isEmotionalLevelReached(attachmentState.attachmentPhase, level);
            return (
              <View
                key={level}
                style={[
                  styles.emotionalDot,
                  {
                    backgroundColor: isReached ? phaseConfig.color : '#E5E5E5',
                    opacity: isReached ? 1 : 0.4,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.emotionalDescription}>
          {getEmotionalDescription(attachmentState.attachmentPhase)}
        </Text>
      </View>
    </Animated.View>
  );
};

// Helper functions
function formatFeatureName(feature: string): string {
  return feature
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isEmotionalLevelReached(
  phase: AttachmentPhase,
  level: 'surface' | 'developing' | 'strong' | 'deep'
): boolean {
  const phaseOrder: Record<AttachmentPhase, number> = {
    discovery: 1,
    familiarity: 2,
    attachment: 3,
    companion: 4,
  };

  const levelOrder: Record<string, number> = {
    surface: 1,
    developing: 2,
    strong: 3,
    deep: 4,
  };

  return phaseOrder[phase] >= levelOrder[level];
}

function getEmotionalDescription(phase: AttachmentPhase): string {
  const descriptions: Record<AttachmentPhase, string> = {
    discovery: 'Votre plante vous découvre. Interactions basiques et curiosité.',
    familiarity: 'Une habitude se forme. Votre plante commence à vous reconnaître.',
    attachment: 'Un vrai lien s\'établit. Votre plante réagit à votre présence.',
    companion: 'Compagnon fidèle. Une relation profonde et durable s\'est formée.',
  };

  return descriptions[phase];
}

const styles = StyleSheet.create({
  // Compact View
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 8,
  },

  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  compactEmoji: {
    fontSize: 32,
  },

  compactInfo: {
    flex: 1,
  },

  compactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  compactDays: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },

  scoreRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },

  compactProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },

  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Full View
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  phaseTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  phaseEmoji: {
    fontSize: 48,
  },

  phaseLabelSection: {
    flex: 1,
  },

  phaseLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  phaseDescription: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },

  scoreDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },

  // Progress Section
  progressSection: {
    gap: 8,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },

  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Milestone Section
  milestoneSection: {
    gap: 12,
  },

  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  milestoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    backgroundColor: '#F9FAFB',
  },

  milestoneContent: {
    flex: 1,
  },

  milestoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  milestoneDay: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },

  milestoneReward: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  rewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },

  rewardLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },

  // Features Section
  featuresSection: {
    gap: 12,
  },

  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  featuresList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },

  featuresContent: {
    gap: 8,
    paddingRight: 16,
  },

  featureBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },

  featureName: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Emotional Section
  emotionalSection: {
    gap: 8,
  },

  emotionalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  emotionalBar: {
    flexDirection: 'row',
    gap: 8,
  },

  emotionalDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },

  emotionalDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginTop: 4,
  },
});
