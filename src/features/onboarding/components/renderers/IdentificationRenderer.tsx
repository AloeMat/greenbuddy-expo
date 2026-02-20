import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing } from '@/design-system/tokens/spacing';
import { OnboardingScreen, OnboardingHeader, Title } from '@/design-system/onboarding/components';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { OnboardingPageBase } from '@/features/onboarding/types/onboardingSchema';
import { AvatarIdentificationDisplay, IdentificationState } from '../AvatarIdentificationDisplay';
import { plantNetService } from '@/features/plants/services/plantnet';
import { PlantDiagnosticsService, PlantDiagnosis } from '@/features/plants/services/PlantDiagnosticsService';
import { logger } from '@/lib/services/logger';
import { PlantPersonality } from '@/types';

interface IdentificationRendererProps {
  readonly page: OnboardingPageBase & { next: string; text?: string; auto_advance?: number | string };
  readonly onNavigate: (nextPageId: string) => void;
}

// Map plant families to personalities for better visual representation
const PERSONALITY_MAPPING: Record<string, PlantPersonality> = {
  'Cactaceae': 'cactus',
  'Orchidaceae': 'orchidee',
  'Araceae': 'monstera',
  'Euphorbiaceae': 'succulente',
  'Polypodiaceae': 'fougere',
  'Sarraceniaceae': 'carnivore',
  'Araliaceae': 'fougere',
  'Arecaceae': 'palmier',
  'Piperaceae': 'pilea',
  'Vitaceae': 'pothos',
};

const getPersonalityFromFamily = (family?: string): PlantPersonality => {
  if (family && PERSONALITY_MAPPING[family]) {
    return PERSONALITY_MAPPING[family];
  }
  // Default to monstera as fallback
  return 'monstera';
};


/**
 * IdentificationRenderer - Enhanced Version with Avatar Interaction
 *
 * Shows plant avatar with interactive mouth/eyes while identifying the plant
 * - Displays PlantAvatar with dynamic personality based on identified plant family
 * - Shows isSpeaking state to animate mouth when loading
 * - Displays plant information (common name, scientific name, family)
 * - Auto-advances after identification with celebration animation
 * - Graceful fallback if identification fails
 */
export function IdentificationRenderer({ page, onNavigate }: IdentificationRendererProps) {
  const store = useOnboardingStore();
  const identifiedRef = useRef(false);
  const [identificationState, setIdentificationState] = useState<IdentificationState>('loading');
  const [plantPersonality, setPlantPersonality] = useState<PlantPersonality>('monstera');
  const [plantDiagnosis, setPlantDiagnosis] = useState<PlantDiagnosis | null>(null);

  useEffect(() => {
    // Prevent duplicate identification
    if (identifiedRef.current) return;
    identifiedRef.current = true;

    const identifyPlant = async () => {
      try {
        const plantName = store.plantName;
        const plantPhoto = store.plantPhoto;

        if (!plantName) {
          logger.warn('[IdentificationRenderer] No plant name found in store');
          setIdentificationState('error');
          setTimeout(() => {
            onNavigate(page.next);
          }, 2000);
          return;
        }

        logger.info('[IdentificationRenderer] Starting plant identification by name', {
          plantName,
        });

        // Step 1: PlantNet Identification
        const identificationResult = await plantNetService.identifyPlantByName(plantName);

        // Determine best personality based on plant family
        const personality = getPersonalityFromFamily(identificationResult.family);
        setPlantPersonality(personality);

        // Save identified plant to store
        store.setPlantData('', identificationResult);
        store.setPlantPersonality(
          store.plantPersonality || 'funny'
        );

        logger.info('[IdentificationRenderer] Plant identified successfully', {
          commonName: identificationResult.commonName,
          family: identificationResult.family,
          personality,
          confidence: identificationResult.confidence,
        });

        // Step 2: Get complete diagnosis via Gemini Vision (only if we have plant photo)
        if (plantPhoto) {
          try {
            logger.info('[IdentificationRenderer] Starting plant health diagnosis', {
              plantName: identificationResult.commonName,
            });

            const diagnosis = await PlantDiagnosticsService.diagnosePlantHealth(
              plantPhoto,
              identificationResult.commonName,
              identificationResult.scientificName
            );

            // Only set diagnosis if it's not the default fallback
            // Check for default fallback: summary contains "Unable to diagnose"
            if (diagnosis.summary.includes('Unable to diagnose')) {
              logger.warn('[IdentificationRenderer] Using default diagnosis fallback');
              setPlantDiagnosis(null);
            } else {
              setPlantDiagnosis(diagnosis);
              logger.info('[IdentificationRenderer] Diagnosis complete', {
                healthScore: diagnosis.healthScore,
                emotion: diagnosis.emotionState,
              });
            }
          } catch (diagError) {
            logger.warn('[IdentificationRenderer] Diagnosis failed, continuing without it', { error: String(diagError) });
            setPlantDiagnosis(null);
          }
        } else {
          logger.info('[IdentificationRenderer] No photo available, skipping diagnosis');
          setPlantDiagnosis(null);
        }

        // Show success state
        setIdentificationState('success');

        // Auto-advance after identification
        const delay = typeof page.auto_advance === 'number' ? page.auto_advance : 3000;
        setTimeout(() => {
          // Save diagnosis to store for next page
          if (plantDiagnosis) {
            // Store diagnosis somewhere accessible to next page
            logger.info('[IdentificationRenderer] Saving diagnosis for next page', {
              healthScore: plantDiagnosis.healthScore,
            });
          }
          onNavigate(page.next);
        }, delay);
      } catch (error) {
        logger.error('[IdentificationRenderer] Identification error:', error);
        setIdentificationState('error');
        // Still advance on error
        setTimeout(() => {
          onNavigate(page.next);
        }, 3000);
      }
    };

    identifyPlant();
  }, []);

  const identifiedPlant = store.identifiedPlant;

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <Title style={{ marginBottom: spacing['2xl'] }}>
            {identificationState === 'loading' ? 'Identification de votre plante'
              : identificationState === 'success' ? 'Magnifique!'
              : identificationState === 'error' ? 'Oups...'
              : ''}
          </Title>
        </Animated.View>

        {/* Avatar with Identification Display */}
        <AvatarIdentificationDisplay
          state={identificationState}
          personality={plantPersonality}
          plantInfo={
            identifiedPlant
              ? {
                  commonName: identifiedPlant.commonName,
                  scientificName: identifiedPlant.scientificName,
                  family: identifiedPlant.family,
                  confidence: identifiedPlant.confidence,
                  description: identifiedPlant.description,
                }
              : undefined
          }
          diagnosis={plantDiagnosis || undefined}
          loadingText={page.text || 'On analyse votre plante...'}
          successText="Voici votre plante identifiée!"
          errorText="Impossible d'identifier cette plante"
          size="large"
          showGlow={true}
        />
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({});
