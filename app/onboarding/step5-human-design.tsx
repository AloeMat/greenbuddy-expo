/**
 * Onboarding Step 5: Human Design Setup
 * ════════════════════════════════════════
 *
 * Questionnaire to personalize user experience:
 * Q1: Caregiver profile (forgetful/stressed/passionate)
 * Q2: Living place (apartment/house/office)
 * Q3: Watering rhythm (1x/week to daily)
 * Q4: Guilt sensitivity (yes/somewhat/no)
 * Q5: Avatar personality (funny/gentle/expert)
 *
 * Saves to human_design_setups table for personalization
 * Phase 4.2: Post-Onboarding Integration
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInUp,
  ZoomIn,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@lib/services/supabase';
import { useAuth } from '@auth/store/authStore';
import { Button } from '@design-system/components/Button';
import { ProgressBar } from '@features/onboarding/components/ProgressBar';
import { Card } from '@design-system/components/Card';
import type {
  CaregiverProfile,
  LivingPlace,
  WateringRhythm,
  GuiltSensitivity,
  AvatarPersonalityType,
  HumanDesignSetup,
} from '@appTypes/humanDesign';
import {
  calculateCheckFrequency,
  calculateNotificationStyle,
  getCaregiverLabel,
} from '@appTypes/humanDesign';
import { logger } from '@lib/services/logger';

interface HumanDesignForm {
  caregiver_profile?: CaregiverProfile;
  living_place?: LivingPlace;
  watering_rhythm?: WateringRhythm;
  guilt_sensitivity?: GuiltSensitivity;
  avatar_personality?: AvatarPersonalityType;
}

const QUESTIONS = [
  {
    id: 'caregiver_profile',
    title: 'Comment te décrirais-tu comme soignant?',
    options: [
      { value: 'forgetful', label: 'Oublieux (j\'oublie souvent)' },
      { value: 'stressed', label: 'Stressé (toujours pressé)' },
      { value: 'passionate', label: 'Passionné (je m\'en occupe bien)' },
    ],
  },
  {
    id: 'living_place',
    title: 'Où vis-tu?',
    options: [
      { value: 'apartment', label: 'Appartement' },
      { value: 'house', label: 'Maison' },
      { value: 'office', label: 'Bureau' },
    ],
  },
  {
    id: 'watering_rhythm',
    title: 'Combien de fois veux-tu arroser?',
    options: [
      { value: '1x_week', label: '1x par semaine' },
      { value: '2x_week', label: '2x par semaine' },
      { value: '3x_week', label: '3x par semaine' },
      { value: 'daily', label: 'Quotidiennement' },
    ],
  },
  {
    id: 'guilt_sensitivity',
    title: 'Es-tu sensible à la culpabilité?',
    options: [
      { value: 'yes', label: 'Oui, beaucoup' },
      { value: 'somewhat', label: 'Un peu' },
      { value: 'no', label: 'Non, pas vraiment' },
    ],
  },
  {
    id: 'avatar_personality',
    title: 'Quel tempérament pour ton avatar?',
    options: [
      { value: 'funny', label: 'Drôle (blagues & memes)' },
      { value: 'gentle', label: 'Doux (encourageant & tendre)' },
      { value: 'expert', label: 'Expert (scientifique & précis)' },
    ],
  },
];

export default function OnboardingStep5HumanDesign() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<HumanDesignForm>({});
  const [isLoading, setIsLoading] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentAnswer = formData[question.id as keyof HumanDesignForm];

  // Reanimated animations
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardScale.value = withSpring(1, { damping: 12 });
    cardOpacity.value = withSpring(1, { damping: 12 });
  }, [currentQuestion]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const handleAnswer = useCallback(
    (value: string) => {
      setFormData(prev => ({
        ...prev,
        [question.id]: value as any,
      }));

      if (currentQuestion < QUESTIONS.length - 1) {
        // Move to next question after small delay
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
    if (Object.keys(formData).length !== QUESTIONS.length) {
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
      <ProgressBar currentStep={currentQuestion + 1} totalSteps={QUESTIONS.length} />

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
          style={[styles.questionCard, cardAnimatedStyle]}
          entering={SlideInUp.duration(400)}
        >
          <Text style={styles.questionTitle}>{question.title}</Text>
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
                  <Text
                    style={[
                      styles.optionLabel,
                      currentAnswer === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
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

        {/* Skip Option */}
        {currentQuestion === 0 && (
          <Animated.View entering={FadeIn.delay(500).duration(400)}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Passer cette étape</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    alignItems: 'center',
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
  },

  optionCheckboxSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#10B981',
  },

  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },

  optionLabelSelected: {
    fontWeight: '600',
    color: '#10B981',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  button: {
    flex: 1,
  },

  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textDecorationLine: 'underline',
  },
});
