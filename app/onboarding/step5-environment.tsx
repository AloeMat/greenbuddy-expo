/**
 * Onboarding Step 5: Human Design - L'Environnement
 * ════════════════════════════════════════════════
 *
 * Environment & Lifestyle preferences:
 * Q1: Living place (apartment/house/office)
 * Q2: Watering rhythm (1x/week to daily)
 *
 * Saves partial data to useOnboardingStore
 * Phase 2: Integration Roadmap
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@design-system/components/Button';
import type { LivingPlace, WateringRhythm } from '@appTypes/humanDesign';
import { logger } from '@lib/services/logger';

interface EnvironmentForm {
  living_place?: LivingPlace;
  watering_rhythm?: WateringRhythm;
}

const QUESTIONS = [
  {
    id: 'living_place',
    title: 'Où vis-tu?',
    subtitle: 'Cela nous aide à adapter les conseils pour ton environnement',
    options: [
      { value: 'apartment', label: '🏢 Appartement', description: 'Espace limité, lumière contrôlée' },
      { value: 'house', label: '🏠 Maison', description: 'Espace ouvert, accès à l\'extérieur' },
      { value: 'office', label: '🏢 Bureau', description: 'Espace de travail uniquement' },
    ],
  },
  {
    id: 'watering_rhythm',
    title: 'Combien de fois veux-tu arroser?',
    subtitle: 'À quelle fréquence pourrais-tu prendre soin de tes plantes?',
    options: [
      { value: '1x_week', label: '💧 1x par semaine', description: 'Minimal, très discret' },
      { value: '2x_week', label: '💧💧 2x par semaine', description: 'Équilibré, idéal' },
      { value: '3x_week', label: '💧💧💧 3x par semaine', description: 'Actif, engagé' },
      { value: 'daily', label: '💧💧💧💧 Quotidiennement', description: 'Très attentif' },
    ],
  },
];

export default function OnboardingStep5Environment() {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<EnvironmentForm>({});

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentAnswer = formData[question.id as keyof EnvironmentForm];

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

  const handleContinue = () => {
    if (!currentAnswer) return;

    // Continue to next step (will integrate with full form in step 6)
    logger.info('Environment preferences selected', formData);
    router.push('/onboarding/step6-personality');
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
          <Text style={styles.stepCounter}>5/6</Text>
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
              label="Continuer →"
              disabled={!currentAnswer}
              onPress={handleContinue}
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
