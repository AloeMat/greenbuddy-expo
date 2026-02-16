import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';
import { page8Schema, type Page8FormData } from '@lib/validation/onboarding';

const personalityOptions = [
  { id: 'funny', label: 'Drôle 😄', emoji: '😄' },
  { id: 'gentle', label: 'Doux 💚', emoji: '💚' },
  { id: 'expert', label: 'Expert 🎓', emoji: '🎓' },
];

export default function Page8() {
  const { setCurrentPage, plantName, setPlantName, setPlantPersonality, addXP, markPageComplete } =
    useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<Page8FormData>({
    resolver: zodResolver(page8Schema),
    mode: 'onChange',
    defaultValues: {
      plantName: plantName || '',
      personality: undefined,
    },
  });

  const selectedPersonality = watch('personality');

  useEffect(() => {
    trackPageView('page8');
    setCurrentPage('page8');
  }, [setCurrentPage]);

  const handleContinue = handleSubmit(async (data) => {
    setPlantName(data.plantName);
    setPlantPersonality(data.personality);
    addXP(5);
    markPageComplete('page8');

    router.push('/onboarding/page8_confirmation');
  });

  return (
    <ScrollView testID="onboarding-page8" style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View testID="progress-bar" style={{ height: 8, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${PAGE_PROGRESS.page8}%` }}
          />
        </View>
        <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 10/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={{ fontSize: 30, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 8 }}
        >
          Donnez-moi un nom
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginBottom: 32 }}
        >
          Comment voulez-vous m'appeler ? Et quelle personnalité souhaitez-vous que j'aie ?
        </Animated.Text>

        {/* Name input */}
        <Animated.View entering={FadeInDown.delay(600)} style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 12 }}>Nom de votre plante</Text>
          <TextInput
            testID="input-plant-name"
            value={watch('plantName')}
            onChangeText={(value) => setValue('plantName', value)}
            placeholder="ex: Rosalie, Monstera..."
            style={{
              borderWidth: 2,
              borderColor: errors.plantName ? onboardingColors.error : onboardingColors.gray[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholderTextColor={onboardingColors.text.muted}
          />
          {errors.plantName && (
            <Text style={{ color: onboardingColors.error, fontSize: 12, marginTop: 4 }}>
              {errors.plantName.message}
            </Text>
          )}
        </Animated.View>

        {/* Personality selection */}
        <Animated.View entering={FadeInDown.delay(800)}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 12 }}>Personnalité</Text>
          <View style={{ gap: 12, marginBottom: 32 }}>
            {personalityOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(800 + index * 100).springify()}
              >
                <TouchableOpacity
                  testID={`personality-${option.id}`}
                  onPress={() => setValue('personality', option.id as any)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: selectedPersonality === option.id ? onboardingColors.green[100] : 'white',
                    borderColor: selectedPersonality === option.id ? onboardingColors.green[500] : onboardingColors.gray[200]
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: onboardingColors.text.primary, flex: 1 }}>{option.label}</Text>
                  {selectedPersonality === option.id && (
                    <Check size={20} color={onboardingColors.green[500]} strokeWidth={3} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Animated.View entering={FadeInDown.delay(1200)}>
          <TouchableOpacity
            testID="button-continue"
            onPress={handleContinue}
            disabled={!isValid}
            style={{
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'center',
              backgroundColor: isValid ? onboardingColors.green[500] : onboardingColors.gray[200]
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Continuer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
