import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

const personalityOptions = [
  { id: 'funny', label: 'Drôle 😄', emoji: '😄' },
  { id: 'gentle', label: 'Doux 💚', emoji: '💚' },
  { id: 'expert', label: 'Expert 🎓', emoji: '🎓' },
];

export default function Page8() {
  const { setCurrentPage, plantName, setPlantName, setPlantPersonality, addXP, markPageComplete } =
    useOnboardingStore();
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState(plantName);

  useEffect(() => {
    trackPageView('page8');
    setCurrentPage('page8');
  }, [setCurrentPage]);

  const handleContinue = () => {
    if (!nameInput.trim()) {
      logger.warn('⚠️ Plant name is empty');
      return;
    }

    if (!selectedPersonality) {
      logger.warn('⚠️ Personality not selected');
      return;
    }

    setPlantName(nameInput);
    setPlantPersonality(selectedPersonality as 'funny' | 'gentle' | 'expert');
    addXP(5);
    markPageComplete('page8');

    router.push('/onboarding/page8_confirmation');
  };

  const isFormValid = nameInput.trim() && selectedPersonality;

  return (
    <ScrollView testID="onboarding-page8" className="flex-1 bg-green-50">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View testID="progress-bar" className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page8}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 10/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="px-6 py-8">
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="text-3xl font-bold text-green-900 text-center mb-2"
        >
          Donnez-moi un nom
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-base text-gray-700 text-center mb-8"
        >
          Comment voulez-vous m'appeler ? Et quelle personnalité souhaitez-vous que j'aie ?
        </Animated.Text>

        {/* Name input */}
        <Animated.View entering={FadeInDown.delay(600)} className="mb-8">
          <Text className="text-sm font-semibold text-gray-900 mb-3">Nom de votre plante</Text>
          <TextInput
            testID="input-plant-name"
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="ex: Rosalie, Monstera..."
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
            placeholderTextColor="#999"
          />
        </Animated.View>

        {/* Personality selection */}
        <Animated.View entering={FadeInDown.delay(800)}>
          <Text className="text-sm font-semibold text-gray-900 mb-3">Personnalité</Text>
          <View className="gap-3 mb-8">
            {personalityOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(800 + index * 100).springify()}
              >
                <TouchableOpacity
                  testID={`personality-${option.id}`}
                  onPress={() => setSelectedPersonality(option.id)}
                  className={`p-4 rounded-lg border-2 flex-row items-center gap-3 ${
                    selectedPersonality === option.id
                      ? 'bg-green-100 border-green-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className="text-2xl">{option.emoji}</Text>
                  <Text className="text-base font-semibold text-gray-900 flex-1">{option.label}</Text>
                  {selectedPersonality === option.id && (
                    <Check size={20} color="#10B981" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View className="px-6 pb-8">
        <Animated.View entering={FadeInDown.delay(1200)}>
          <TouchableOpacity
            testID="button-continue"
            onPress={handleContinue}
            disabled={!isFormValid}
            className={`rounded-lg py-4 items-center ${isFormValid ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <Text className="text-white font-semibold text-lg">Continuer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
