/**
 * Onboarding Step 6: Human Design - La Personnalité
 * ════════════════════════════════════════════════════
 *
 * Personality & Emotional preferences:
 * Q1: Caregiver profile (forgetful/stressed/passionate)
 * Q2: Guilt sensitivity (yes/somewhat/no)
 * Q3: Avatar personality (funny/gentle/expert)
 *
 * Saves complete profile to human_design_setups table
 * Phase 2: Integration Roadmap
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@lib/services/supabase';
import { useAuth } from '@auth/store/authStore';
import { Button } from '@design-system/components/Button';
import type {
  CaregiverProfile,
  GuiltSensitivity,
  AvatarPersonalityType,
  LivingPlace,
  WateringRhythm,
  HumanDesignSetup,
} from '@appTypes/humanDesign';
import {
  calculateCheckFrequency,
  calculateNotificationStyle,
} from '@appTypes/humanDesign';
import { logger } from '@lib/services/logger';

interface PersonalityForm {
  caregiver_profile?: CaregiverProfile;
  guilt_sensitivity?: GuiltSensitivity;
  avatar_personality?: AvatarPersonalityType;
  // Environment data from step 5
  living_place?: LivingPlace;
  watering_rhythm?: WateringRhythm;
}

const QUESTIONS = [
  {
    id: 'caregiver_profile',
    title: 'Comment te décrirais-tu comme soignant?',
    subtitle: 'Cela nous aidera à personnaliser les rappels',
    options: [
      { value: 'forgetful', label: '😅 Oublieux', description: 'J\'oublie souvent les détails' },
      { value: 'stressed', label: '⏰ Stressé', description: 'Je suis toujours pressé' },
      { value: 'passionate', label: '🌱 Passionné', description: 'Je m\'en occupe très bien' },
    ],
  },
  {
    id: 'guilt_sensitivity',
    title: 'Es-tu sensible à la culpabilité?',
    subtitle: 'Cela affecte notre ton de communication',
    options: [
      { value: 'yes', label: '💔 Oui, beaucoup', description: 'Je me sens coupable facilement' },
      { value: 'somewhat', label: '🤔 Un peu', description: 'C\'est neutre pour moi' },
      { value: 'no', label: '💪 Non, pas vraiment', description: 'Je suis résilient' },
    ],
  },
  {
    id: 'avatar_personality',
    title: 'Quel tempérament pour ton avatar?',
    subtitle: 'Comment veux-tu que ta plante te parle?',
    options: [
      { value: 'funny', label: '😂 Drôle', description: 'Blagues & mèmes amusants' },
      { value: 'gentle', label: '🤗 Doux', description: 'Encourageant & tendre' },
      { value: 'expert', label: '🧪 Expert', description: 'Scientifique & précis' },
    ],
  },
];

export default function OnboardingStep6Personality() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<PersonalityForm>({});
  const [isLoading, setIsLoading] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentAnswer = formData[question.id as keyof PersonalityForm];

  const handleAnswer = useCallback(
    (value: string) => {
      setFormData(prev => ({
        ...prev,
        [question.id]: value as any,
      }));

      if (currentQuestion < QUESTIONS.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
        }, 300);
      }
    },
    [currentQuestion, question.id]
  );

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être authentifié');
      return;
    }

    // Validate all questions answered
    if (Object.keys(formData).length < 3) {
      Alert.alert('Erreur', 'Veuillez répondre à toutes les questions');
      return;
    }

    setIsLoading(true);

    try {
      const setupData: Omit<HumanDesignSetup, 'id' | 'completed_at' | 'updated_at'> = {
        user_id: user.id,
        caregiver_profile: (formData.caregiver_profile || 'passionate') as CaregiverProfile,
        living_place: (formData.living_place || 'apartment') as LivingPlace,
        watering_rhythm: (formData.watering_rhythm || '2x_week') as WateringRhythm,
        guilt_sensitivity: (formData.guilt_sensitivity || 'no') as GuiltSensitivity,
        avatar_personality: (formData.avatar_personality || 'gentle') as AvatarPersonalityType,
        recommended_check_frequency: calculateCheckFrequency(
          (formData.watering_rhythm || '2x_week') as WateringRhythm
        ),
        notification_style: calculateNotificationStyle(
          (formData.caregiver_profile || 'passionate') as CaregiverProfile,
          (formData.guilt_sensitivity || 'no') as GuiltSensitivity
        ),
      };

      // Upsert to Supabase
      const { error } = await supabase
        .from('human_design_setups')
        .upsert(setupData, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      Alert.alert('✅ Profil complété!', 'Vos préférences ont été sauvegardées.', [
        {
          text: 'Continuer',
          onPress: () => {
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Erreur inconnue';
      Alert.alert('Erreur', `Impossible de sauvegarder: ${err}`);
      logger.error('Human design setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar + Header Row */}
      <View style={styles.progressSection}>
        <View style={styles.barContainer}>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.stepCounter}>6/6</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={styles.stepLabel}>
            Question {currentQuestion + 1} de {QUESTIONS.length}
          </Text>
        </Animated.View>

        {/* Question Card */}
        <Animated.View
          style={styles.questionCard}
          entering={SlideInUp.duration(400)}
        >
          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
        </Animated.View>

        {/* Options */}
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.optionsContainer}
        >
          {question.options.map((option, idx) => (
            <Animated.View
              key={option.value}
              entering={SlideInUp.delay(300 + idx * 50).duration(400)}
            >
              <TouchableOpacity
                onPress={() => handleAnswer(option.value)}
                style={[
                  styles.optionButton,
                  currentAnswer === option.value && styles.optionButtonSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionCheckbox,
                      currentAnswer === option.value && styles.optionCheckboxSelected,
                    ]}
                  >
                    {currentAnswer === option.value && (
                      <Ionicons name="checkmark" size={18} color="#10B981" />
                    )}
                  </View>
                  <View style={styles.optionTextGroup}>
                    <Text
                      style={[
                        styles.optionLabel,
                        currentAnswer === option.value && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Navigation Buttons */}
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={styles.buttonContainer}
        >
          <Button
            label={currentQuestion > 0 ? '← Précédent' : 'Annuler'}
            variant="secondary"
            onPress={handleBack}
            style={styles.button}
          />

          {currentQuestion === QUESTIONS.length - 1 ? (
            <Button
              label={isLoading ? 'Sauvegarde...' : 'Terminer'}
              disabled={isLoading || !currentAnswer}
              onPress={handleSubmit}
              style={styles.button}
            />
          ) : currentAnswer ? (
            <Button
              label="Suivant →"
              onPress={() => setCurrentQuestion(currentQuestion + 1)}
              style={styles.button}
            />
          ) : (
            <Button
              label="Suivant →"
              disabled={true}
              style={styles.button}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },

  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  barContainer: {
    marginBottom: 8,
  },

  barBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  stepCounter: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },

  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },

  questionSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },

  optionsContainer: {
    gap: 12,
  },

  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  optionButtonSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  optionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },

  optionCheckboxSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#10B981',
  },

  optionTextGroup: {
    flex: 1,
  },

  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  optionDescription: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },

  optionLabelSelected: {
    color: '#10B981',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
  },

  button: {
    flex: 1,
  },
});
