/**
 * Avatar Identification Display Component
 *
 * Displays plant avatar with real-time facial animations during and after identification
 * - Shows avatar with emotion state (excited during loading, happy after success)
 * - Animates mouth movement to indicate "speaking" during loading
 * - Displays plant information cards with smooth animations
 * - Shows plant health diagnosis with avatar emotion reflecting health status
 * - Supports multiple identification states
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { PlantAvatar } from '@/features/plants/components/PlantAvatar';
import { PlantPersonality, AvatarEmotion } from '@/types';
import { PlantDiagnosis } from '@/features/plants/services/PlantDiagnosticsService';
import {
  CheckCircle,
  AlertCircle,
  Leaf,
  Heart,
  TrendingUp,
  AlertTriangle,
  Zap,
  Bug,
  Droplets,
  Wind,
  Activity,
} from 'lucide-react-native';

// Helper functions - declare before component
function getDiagnosisCardColor(healthScore: number): string {
  if (healthScore >= 80) return '#F0FDF4'; // light green
  if (healthScore >= 60) return '#F7FEE7'; // light lime
  if (healthScore >= 40) return '#FEFCE8'; // light yellow
  return '#FEF2F2'; // light red
}

function getHealthScoreColor(healthScore: number): string {
  if (healthScore >= 80) return '#22C55E'; // green
  if (healthScore >= 60) return '#84CC16'; // lime
  if (healthScore >= 40) return '#EAB308'; // yellow
  return '#EF4444'; // red
}

export type IdentificationState = 'loading' | 'success' | 'error' | 'idle';

interface PlantIdentificationInfo {
  commonName: string;
  scientificName?: string;
  family?: string;
  confidence?: number;
  description?: string;
}

interface AvatarIdentificationDisplayProps {
  // Visual state
  state: IdentificationState;
  personality: PlantPersonality;
  plantInfo?: PlantIdentificationInfo;
  diagnosis?: PlantDiagnosis; // New: plant health diagnosis from Gemini Vision
  
  // Optional loading text
  loadingText?: string;
  successText?: string;
  errorText?: string;
  
  // Callbacks
  onLoadingComplete?: () => void;
  
  // Styling
  size?: 'small' | 'medium' | 'large';
  showGlow?: boolean;
}

export function AvatarIdentificationDisplay({
  state,
  personality,
  plantInfo,
  diagnosis, // New: use diagnosis for avatar emotion
  loadingText = 'Analyse en cours...',
  successText = 'Identification réussie!',
  errorText = 'Impossible d\'identifier',
  onLoadingComplete,
  size = 'large',
  showGlow = true,
}: AvatarIdentificationDisplayProps) {
  const [shouldPulse, setShouldPulse] = useState(state === 'loading');

  useEffect(() => {
    setShouldPulse(state === 'loading');
  }, [state]);

  // Determine emotion based on state AND diagnosis health
  const getEmotion = (): AvatarEmotion => {
    switch (state) {
      case 'loading':
        return 'excited';
      case 'success':
        // Use diagnosis emotion if available (already type-safe)
        if (diagnosis) {
          return diagnosis.emotionState as AvatarEmotion;
        }
        return 'happy';
      case 'error':
        return 'worried';
      default:
        return 'idle';
    }
  };

  // Avatar mouth should move while loading (speaking animation)
  const isSpeaking = state === 'loading';

  // Avatar size config
  const avatarSizeMap = {
    small: 120,
    medium: 180,
    large: 240,
  };

  const containerSize = avatarSizeMap[size] + 40;

  return (
    <View style={styles.container}>
      {/* Avatar Container with Border */}
      <Animated.View
        entering={ZoomIn.springify()}
        style={[
          styles.avatarContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            borderWidth: 3,
            borderColor:
              state === 'error'
                ? onboardingColors.warning
                : onboardingColors.green[500],
          },
        ]}
      >
        <PlantAvatar
          personality={personality}
          emotionState={getEmotion()}
          isSpeaking={isSpeaking}
          size={size}
          showGlow={showGlow}
          level={1}
        />
      </Animated.View>

      {/* Status Indicator Badge */}
      {state !== 'idle' && (
        <Animated.View
          entering={FadeIn.delay(200)}
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                state === 'error'
                  ? onboardingColors.error
                  : state === 'success'
                  ? onboardingColors.success
                  : onboardingColors.green[500],
            },
          ]}
        >
          {state === 'loading' && (
            <ActivityIndicator size="small" color="white" />
          )}
          {state === 'success' && (
            <CheckCircle size={16} color="white" strokeWidth={2.5} />
          )}
          {state === 'error' && (
            <AlertCircle size={16} color="white" strokeWidth={2.5} />
          )}
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600',
              marginLeft: 4,
            }}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </Text>
        </Animated.View>
      )}

      {/* Status Text */}
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={{ alignItems: 'center', marginVertical: spacing.lg }}
      >
        <Text style={styles.statusText}>
          {state === 'loading' && loadingText}
          {state === 'success' && successText}
          {state === 'error' && errorText}
        </Text>
      </Animated.View>

      {/* Plant Information Card - Shows on success */}
      {state === 'success' && plantInfo && (
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={[
            styles.infoCard,
            {
              backgroundColor: onboardingColors.green[50],
              borderLeftColor: onboardingColors.green[600],
            },
          ]}
        >
          {/* Common Name - Large & Bold */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={styles.commonName}>{plantInfo.commonName}</Text>
          </View>

          {/* Scientific Name */}
          {plantInfo.scientificName && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={styles.label}>Nom scientifique</Text>
              <Text style={styles.scientificName}>{plantInfo.scientificName}</Text>
            </View>
          )}

          {/* Family */}
          {plantInfo.family && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={styles.label}>Famille botanique</Text>
              <Text style={styles.value}>{plantInfo.family}</Text>
            </View>
          )}

          {/* Confidence Score */}
          {plantInfo.confidence !== undefined && (
            <View
              style={{
                marginTop: spacing.md,
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: onboardingColors.green[200],
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <Leaf
                  size={14}
                  color={onboardingColors.green[600]}
                  strokeWidth={2}
                />
                <Text style={styles.confidenceText}>
                  {Math.round(plantInfo.confidence * 100)}% de confiance
                </Text>
              </View>
            </View>
          )}

          {/* Description */}
          {plantInfo.description && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.label}>Caractéristiques</Text>
              <Text
                style={[
                  styles.description,
                  { color: onboardingColors.text.secondary },
                ]}
              >
                {plantInfo.description}
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Error State Card */}
      {state === 'error' && (
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[
            styles.infoCard,
            {
              backgroundColor: '#FEF2F2',
              borderLeftColor: onboardingColors.error,
            },
          ]}
        >
          <Text
            style={{
              color: onboardingColors.error,
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Impossible d'identifier la plante
          </Text>
          <Text
            style={{
              color: onboardingColors.text.secondary,
              fontSize: 12,
              marginTop: spacing.sm,
              textAlign: 'center',
            }}
          >
            Essayez un autre nom ou une autre photo
          </Text>
        </Animated.View>
      )}

      {/* Diagnosis Card - Shows on success with diagnosis data */}
      {state === 'success' && diagnosis && (
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={[
            styles.infoCard,
            {
              backgroundColor: getDiagnosisCardColor(diagnosis.healthScore),
              borderLeftColor: onboardingColors.green[600],
            },
          ]}
        >
          {/* Health Score Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Heart
                  size={16}
                  color={getHealthScoreColor(diagnosis.healthScore)}
                  strokeWidth={2}
                />
                <Text style={styles.label}>Santé de la plante</Text>
              </View>
              <Text
                style={[
                  styles.value,
                  {
                    fontSize: 20,
                    fontWeight: '700',
                    color: getHealthScoreColor(diagnosis.healthScore),
                  },
                ]}
              >
                {diagnosis.healthScore}%
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: '#E5E7EB',
                borderRadius: radius.full,
                overflow: 'hidden',
                marginTop: spacing.sm,
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${diagnosis.healthScore}%`,
                  backgroundColor: getHealthScoreColor(diagnosis.healthScore),
                  borderRadius: radius.full,
                }}
              />
            </View>
          </View>

          {/* Diseases Section */}
          {diagnosis.diseases && diagnosis.diseases.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
                <Text style={styles.label}>Maladies détectées</Text>
              </View>
              {diagnosis.diseases.slice(0, 2).map((disease, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                  <Bug size={12} color="#F97316" strokeWidth={2.5} style={{ marginRight: spacing.sm, marginTop: 2 }} />
                  <Text style={styles.value}>
                    {disease.name} ({disease.confidence}% confiance)
                  </Text>
                </View>
              ))}
              {diagnosis.diseases.length > 2 && (
                <Text style={[styles.value, { marginTop: spacing.sm, fontStyle: 'italic' }]}>
                  +{diagnosis.diseases.length - 2} autre(s)
                </Text>
              )}
            </View>
          )}

          {/* Deficiencies Section */}
          {diagnosis.deficiencies && diagnosis.deficiencies.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                <Leaf size={16} color="#22C55E" strokeWidth={2} />
                <Text style={styles.label}>Carences nutritionnelles</Text>
              </View>
              {diagnosis.deficiencies.slice(0, 2).map((def, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                  <Droplets size={12} color="#3B82F6" strokeWidth={2.5} style={{ marginRight: spacing.sm, marginTop: 2 }} />
                  <Text style={styles.value}>
                    {def.nutrient} ({def.severity})
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary */}
          <Text style={[styles.value, { fontStyle: 'italic', marginTop: spacing.md }]}>
            {diagnosis.summary}
          </Text>

          {/* Urgency Indicator */}
          {diagnosis.urgency !== 'low' && (
            <View
              style={{
                marginTop: spacing.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor:
                  diagnosis.urgency === 'critical'
                    ? '#FECACA'
                    : diagnosis.urgency === 'high'
                    ? '#FED7AA'
                    : '#FEE2E2',
                borderRadius: radius.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <AlertTriangle
                size={14}
                color={
                  diagnosis.urgency === 'critical'
                    ? '#7F1D1D'
                    : diagnosis.urgency === 'high'
                    ? '#92400E'
                    : '#7F1D1D'
                }
                strokeWidth={2}
              />
              <Text
                style={{
                  color:
                    diagnosis.urgency === 'critical'
                      ? '#7F1D1D'
                      : diagnosis.urgency === 'high'
                      ? '#92400E'
                      : '#7F1D1D',
                  fontSize: 12,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                Attention requise (Urgence: {diagnosis.urgency})
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },

  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    marginTop: spacing.md,
  },

  statusText: {
    fontSize: 14,
    color: onboardingColors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  infoCard: {
    width: '100%',
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    marginTop: spacing.lg,
  },

  commonName: {
    fontSize: 20,
    fontWeight: '700',
    color: onboardingColors.text.primary,
  },

  label: {
    fontSize: 11,
    color: onboardingColors.text.muted,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  scientificName: {
    fontSize: 14,
    color: onboardingColors.text.secondary,
    fontStyle: 'italic',
  },

  value: {
    fontSize: 14,
    color: onboardingColors.text.secondary,
    fontWeight: '500',
  },

  confidenceText: {
    fontSize: 13,
    color: onboardingColors.green[700],
    fontWeight: '600',
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
