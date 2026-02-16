/**
 * Integration Examples - VocalInteraction & AttachmentIndicator
 * ════════════════════════════════════════════════════════════════
 *
 * Real-world examples for integrating Avatar Vocal components
 * into your app screens. Copy & adapt these patterns.
 *
 * Phase 4.2: Avatar Vocal Enrichi - Screen Integration
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  VocalInteraction,
  AttachmentIndicator,
  useAttachment,
  useAttachmentMulti,
  type AttachmentPhase,
  type MicroActionType,
} from '@/features/gamification';

// ═══════════════════════════════════════════════════════════════
// EXAMPLE 1: PlantDetail Screen
// ═══════════════════════════════════════════════════════════════
/**
 * Full integration example for a plant detail/info screen
 * Shows all features: VocalInteraction + AttachmentIndicator + Feature gates
 */
export function PlantDetailScreenExample({ plantId }: { plantId: string }) {
  const [showVoiceInteraction, setShowVoiceInteraction] = useState(false);
  const [activeMicroAction, setActiveMicroAction] = useState<MicroActionType | null>(null);

  // Get attachment data
  const attachment = useAttachment(plantId);

  // Mock plant data (replace with usePlant hook)
  const plant = {
    id: plantId,
    name: 'Monstera Deliciosa',
    personality: 'monstera' as const,
    health: 75,
    daysSinceWatered: 3,
    daysSinceFertilized: 7,
    temperature: 22,
    humidity: 65,
    imageUri: 'https://...',
  };

  if (attachment.isLoading) {
    return <Text>Loading...</Text>;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handleWaterPlant = async () => {
    // Update plant in database
    // await waterPlant(plantId);

    // Record care action in attachment
    await attachment.recordCareAction('water');

    // Trigger reply
    setShowVoiceInteraction(true);
  };

  const handleFertilizePlant = async () => {
    // await fertilizePlant(plantId);
    await attachment.recordCareAction('fertilize');
    setShowVoiceInteraction(true);
  };

  const handleMicroAction = (action: MicroActionType) => {
    setActiveMicroAction(action);
    console.log('[PlantDetail] Micro-action:', action);
    // Trigger actual animations here
  };

  const handlePhaseChange = (newPhase: AttachmentPhase) => {
    console.log('[PlantDetail] Phase changed to:', newPhase);
    // Show celebration, unlock achievements, etc.
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <ScrollView style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.healthBadge}>Health: {plant.health}%</Text>
      </View>

      {/* VOICE INTERACTION SECTION */}
      {showVoiceInteraction && (
        <Animated.View entering={FadeIn.duration(300)}>
          <VocalInteraction
            plantId={plantId}
            plantName={plant.name}
            personality={plant.personality}
            plantHealth={plant.health}
            daysSinceWatered={plant.daysSinceWatered}
            daysSinceFertilized={plant.daysSinceFertilized}
            dayWithUser={attachment.dayWithUser}
            temperature={plant.temperature}
            humidity={plant.humidity}
            autoPlay={true}
            showAttachmentIndicator={true}
            enableMicroInteractions={true}
            disableSpeech={false}
            onReplyComplete={() => setShowVoiceInteraction(false)}
            onMicroActionTriggered={handleMicroAction}
            onAttachmentPhaseChange={handlePhaseChange}
          />
        </Animated.View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleWaterPlant}
        >
          <Text style={styles.buttonText}>💧 Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleFertilizePlant}
        >
          <Text style={styles.buttonText}>🌱 Fertilize</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowVoiceInteraction(!showVoiceInteraction)}
        >
          <Text style={styles.buttonText}>
            {showVoiceInteraction ? '✕ Hide' : '🗣️ Talk'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ATTACHMENT INDICATOR - FULL VIEW */}
      {attachment.state && (
        <AttachmentIndicator
          attachmentState={attachment.state}
          personality={plant.personality}
          compact={false}
          showFeatures={true}
          showMilestone={true}
        />
      )}

      {/* FEATURE GATES - Only show after certain phases */}
      {attachment.isFeatureUnlocked('health_insights') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 Health Insights</Text>
          <Text style={styles.sectionText}>
            Available from Familiarity phase onwards.
          </Text>
        </View>
      )}

      {attachment.isFeatureUnlocked('growth_tracking') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Growth Timeline</Text>
          <Text style={styles.sectionText}>
            Available from Attachment phase onwards.
          </Text>
        </View>
      )}

      {attachment.isFeatureUnlocked('memory_album') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Memory Album</Text>
          <Text style={styles.sectionText}>
            Available from Companion phase onwards.
          </Text>
        </View>
      )}

      {/* DEBUGGING INFO */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text>Phase: {attachment.phase}</Text>
          <Text>Days: {attachment.dayWithUser}</Text>
          <Text>Score: {attachment.attachmentScore}%</Text>
          <Text>Progress: {attachment.phaseProgress}%</Text>
          {attachment.nextMilestone && (
            <Text>Next: {attachment.nextMilestone.name} (Day {attachment.nextMilestone.day})</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXAMPLE 2: Dashboard / Garden View
// ═══════════════════════════════════════════════════════════════
/**
 * Compact integration for a dashboard/garden grid view
 * Shows all plants with compact attachment indicators
 */
export function DashboardScreenExample({ plantIds }: { plantIds: string[] }) {
  const attachments = useAttachmentMulti(plantIds);

  // Daily update on app launch
  useEffect(() => {
    attachments.updateAllDaily();
  }, []);

  // Mock plant data (replace with usePlants hook)
  const plants = [
    {
      id: 'plant-1',
      name: 'Monstera',
      personality: 'monstera' as const,
      imageUri: 'https://...',
    },
    {
      id: 'plant-2',
      name: 'Cactus',
      personality: 'cactus' as const,
      imageUri: 'https://...',
    },
  ];

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.screenTitle}>🌿 Your Garden</Text>

      <View style={styles.plantGrid}>
        {plants.map(plant => {
          const attachment = attachments.states[plant.id];

          return (
            <TouchableOpacity
              key={plant.id}
              style={styles.plantCard}
              // onPress={() => navigate('PlantDetail', { plantId: plant.id })}
            >
              {/* Plant Image */}
              <View style={styles.plantImage}>
                <Text style={styles.imagePlaceholder}>{plant.name[0]}</Text>
              </View>

              {/* Plant Name */}
              <Text style={styles.plantCardName}>{plant.name}</Text>

              {/* Compact Attachment Indicator */}
              {attachment && (
                <AttachmentIndicator
                  attachmentState={attachment}
                  personality={plant.personality}
                  compact={true}
                  showFeatures={false}
                  showMilestone={false}
                />
              )}

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={async () => {
                    await attachments.recordCareAction(plant.id, 'water');
                  }}
                >
                  <Text>💧</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={async () => {
                    await attachments.recordCareAction(plant.id, 'interact');
                  }}
                >
                  <Text>🗣️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXAMPLE 3: Progress / Stats Tab
// ═══════════════════════════════════════════════════════════════
/**
 * Full progress view showing attachment progression for all plants
 */
export function ProgressScreenExample({ plantIds }: { plantIds: string[] }) {
  const attachments = useAttachmentMulti(plantIds);

  // Mock plant data
  const plants = [
    { id: 'plant-1', name: 'Monstera', personality: 'monstera' as const },
    { id: 'plant-2', name: 'Cactus', personality: 'cactus' as const },
  ];

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.screenTitle}>📊 Plant Progression</Text>

      {plants.map(plant => {
        const attachment = attachments.states[plant.id];

        return (
          <View key={plant.id} style={styles.progressSection}>
            <Text style={styles.progressPlantName}>{plant.name}</Text>

            {attachment && (
              <AttachmentIndicator
                attachmentState={attachment}
                personality={plant.personality}
                compact={false}
                showFeatures={true}
                showMilestone={true}
              />
            )}
          </View>
        );
      })}

      {/* OVERALL STATS */}
      <View style={styles.overallStats}>
        <Text style={styles.statsTitle}>📈 Overall Garden Stats</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.values(attachments.states).reduce((sum, s) => sum + s.dayWithUser, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(
                Object.values(attachments.states).reduce((sum, s) => sum + s.attachmentScore, 0) /
                  Object.keys(attachments.states).length
              )}
              %
            </Text>
            <Text style={styles.statLabel}>Avg Attachment</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.values(attachments.states).reduce((sum, s) => sum + s.totalInteractions, 0)}
            </Text>
            <Text style={styles.statLabel}>Interactions</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Screens
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // PlantDetail
  header: {
    padding: 16,
    alignItems: 'center',
  },

  plantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  healthBadge: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: '#22C55E',
  },

  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  section: {
    margin: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  sectionText: {
    fontSize: 14,
    color: '#666666',
  },

  debugSection: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 6,
  },

  debugTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },

  // Dashboard
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  plantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },

  plantCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  plantImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  imagePlaceholder: {
    fontSize: 32,
  },

  plantCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  quickActionBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Progress Tab
  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  progressPlantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  overallStats: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBDDC6',
  },

  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22C55E',
  },

  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});
