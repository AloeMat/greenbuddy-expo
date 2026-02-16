/**
 * VocalInteraction Component
 * ════════════════════════════════
 *
 * Displays plant avatar speaking with contextual replies
 * - Shows avatar with current emotion animation
 * - Displays French reply text with personality flavor
 * - Plays TTS voice with mouth animation sync
 * - Triggers micro-action animations
 * - Shows attachment phase context
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  BounceIn,
  SlideInDown,
} from 'react-native-reanimated';

import {
  ContextualReplyService,
  type ReplyContext,
  type ContextualReply,
} from '@gamification/services/contextualReplyService';
import {
  MicroInteractionService,
  type MicroActionType,
} from '@gamification/services/microInteractionService';
import { AvatarService, type AvatarEmotion } from '@gamification/services/avatarService';
import { AttachmentService, type AttachmentPhase } from '@gamification/services/attachmentService';
import { getPersonalityProfile, type PlantPersonality } from '@gamification/constants/personalities';
import { logger } from '@lib/services/logger';

export interface VocalInteractionProps {
  // Plant context
  plantId: string;
  plantName: string;
  personality: PlantPersonality;
  plantHealth: number;

  // Timing
  daysSinceWatered: number;
  daysSinceFertilized: number;
  dayWithUser: number;
  temperature?: number;
  humidity?: number;

  // Callbacks
  onReplyComplete?: () => void;
  onMicroActionTriggered?: (action: MicroActionType) => void;
  onAttachmentPhaseChange?: (phase: AttachmentPhase) => void;

  // Options
  autoPlay?: boolean;
  showAttachmentIndicator?: boolean;
  enableMicroInteractions?: boolean;
  disableSpeech?: boolean;
}

export const VocalInteraction: React.FC<VocalInteractionProps> = ({
  plantId,
  plantName,
  personality,
  plantHealth,
  daysSinceWatered,
  daysSinceFertilized,
  dayWithUser,
  temperature = 20,
  humidity = 50,
  onReplyComplete,
  onMicroActionTriggered,
  onAttachmentPhaseChange,
  autoPlay = false,
  showAttachmentIndicator = true,
  enableMicroInteractions = true,
  disableSpeech = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [reply, setReply] = useState<ContextualReply | null>(null);
  const [emotion, setEmotion] = useState<AvatarEmotion>('neutral');
  const [attachmentPhase, setAttachmentPhase] = useState<AttachmentPhase>('discovery');
  const [error, setError] = useState<string | null>(null);

  const profile = getPersonalityProfile(personality);

  // Load and generate reply
  const generateReply = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const replyContext: ReplyContext = {
        plant: ContextualReplyService.buildPlantContext(
          plantId,
          plantName,
          personality,
          plantHealth,
          daysSinceWatered,
          daysSinceFertilized,
          dayWithUser,
          temperature,
          humidity
        ),
        user: {
          userId: '', // Will be set in real implementation
          totalPlantsOwned: 1,
          userStreak: 0,
          userLevel: 1,
          recentInteractions: [],
        },
        weather: {
          temperature,
          humidity,
          condition: 'sunny',
          hasRainedToday: false,
        },
      };

      const generatedReply = await ContextualReplyService.generateReply(replyContext);
      setReply(generatedReply);
      setEmotion(generatedReply.emotion);

      // Check attachment phase
      const phase = AttachmentService.getAttachmentPhase(dayWithUser);
      if (phase !== attachmentPhase) {
        setAttachmentPhase(phase);
        onAttachmentPhaseChange?.(phase);
      }

      // Trigger micro-action if present
      if (generatedReply.action && enableMicroInteractions) {
        onMicroActionTriggered?.(generatedReply.action);
      }

      // Play TTS (mocked for now, will integrate with actual TTS)
      if (!disableSpeech && generatedReply.text) {
        await playTTS(generatedReply.text);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      logger.error('[VocalInteraction] Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    plantId,
    plantName,
    personality,
    plantHealth,
    daysSinceWatered,
    daysSinceFertilized,
    dayWithUser,
    temperature,
    humidity,
    attachmentPhase,
    enableMicroInteractions,
    disableSpeech,
    onMicroActionTriggered,
    onAttachmentPhaseChange,
  ]);

  // Play TTS (placeholder - will integrate with actual TTS service)
  const playTTS = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      // TODO: Integrate with useGoogleTTS hook
      // For now, simulate 2-3 second speech duration
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      setIsSpeaking(false);
      onReplyComplete?.();
    } catch (err) {
      logger.error('[VocalInteraction] TTS error:', err);
      setIsSpeaking(false);
    }
  }, [onReplyComplete]);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay) {
      generateReply();
    }
  }, [autoPlay, generateReply]);

  const emotionColors = AvatarService.getEmotionColors(emotion);
  const attachmentProgress = AttachmentService.getPhaseProgress(attachmentPhase, dayWithUser);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
      style={styles.container}
    >
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        {/* Emotion Indicator */}
        <View
          style={[
            styles.emotionBadge,
            { backgroundColor: emotionColors.primary + '20', borderColor: emotionColors.primary },
          ]}
        >
          <Text style={[styles.emotionText, { color: emotionColors.primary }]}>
            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
          </Text>
        </View>

        {/* Avatar Placeholder (will be replaced with PlantAvatar component) */}
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: profile.colors.primary + '15' },
          ]}
        >
          {isLoading && <ActivityIndicator size="large" color={profile.colors.primary} />}
          {!isLoading && <Text style={styles.avatarEmoji}>{profile.emoji}</Text>}
        </View>

        {/* Personality Badge */}
        <View style={[styles.personalityBadge, { backgroundColor: profile.colors.primary }]}>
          <Text style={styles.personalityName}>{profile.name}</Text>
        </View>
      </View>

      {/* Reply Section */}
      {reply && (
        <Animated.View
          entering={SlideInDown.duration(400)}
          style={styles.replySection}
        >
          {/* Speech Bubble */}
          <View
            style={[
              styles.speechBubble,
              {
                borderColor: emotionColors.primary,
                backgroundColor: emotionColors.primary + '08',
              },
            ]}
          >
            <Text style={styles.replyText}>{reply.text}</Text>

            {/* Typing Indicator */}
            {isSpeaking && (
              <View style={styles.typingIndicator}>
                <Animated.View
                  style={[styles.typingDot, { backgroundColor: emotionColors.primary }]}
                />
                <Animated.View
                  style={[styles.typingDot, { backgroundColor: emotionColors.primary }]}
                />
                <Animated.View
                  style={[styles.typingDot, { backgroundColor: emotionColors.primary }]}
                />
              </View>
            )}
          </View>

          {/* Attachment Phase Indicator */}
          {showAttachmentIndicator && (
            <View style={styles.attachmentSection}>
              <View style={styles.attachmentLabel}>
                <Text style={styles.phaseName}>
                  Fase: {attachmentPhase.charAt(0).toUpperCase() + attachmentPhase.slice(1)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${attachmentProgress}%`,
                      backgroundColor: emotionColors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      {!isLoading && (
        <View style={styles.actionButtons}>
          {!reply ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: profile.colors.primary }]}
              onPress={generateReply}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Écoutez {plantName}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: profile.colors.secondary }]}
                onPress={generateReply}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Parlez à nouveau</Text>
              </TouchableOpacity>
              {onReplyComplete && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onReplyComplete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Fermer</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 12,
    gap: 16,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },

  emotionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  emotionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarEmoji: {
    fontSize: 64,
  },

  personalityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },

  personalityName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Reply Section
  replySection: {
    gap: 12,
  },

  speechBubble: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 60,
    justifyContent: 'center',
  },

  replyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    fontStyle: 'italic',
  },

  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    alignItems: 'center',
    height: 16,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },

  // Attachment Section
  attachmentSection: {
    gap: 8,
  },

  attachmentLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  phaseName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },

  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Error Section
  errorSection: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },

  errorText: {
    fontSize: 14,
    color: '#991B1B',
  },

  // Action Buttons
  actionButtons: {
    gap: 12,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
