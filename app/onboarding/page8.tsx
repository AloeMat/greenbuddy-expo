import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';
import { page8Schema, type Page8FormData } from '@lib/validation/onboarding';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { PremiumInput, PremiumButton, PremiumChipGroup } from '@design-system/components';
import type { ChipItem } from '@design-system/components';

const personalityOptions: ChipItem[] = [
  { id: 'funny', label: 'Drôle 😄' },
  { id: 'gentle', label: 'Doux 💚' },
  { id: 'expert', label: 'Expert 🎓' },
];

export default function Page8() {
  const { setCurrentPage, plantName, setPlantName, setPlantPersonality, addXP, markPageComplete } =
    useOnboardingStore();

  const {
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
    if (data.personality) {
      setPlantPersonality(data.personality);
    }
    addXP(5);
    markPageComplete('page8');

    router.push('/onboarding/page8_confirmation');
  });

  return (
    <ScrollView 
      testID="onboarding-page8" 
      style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View testID="progress-bar" style={{ height: 12, backgroundColor: onboardingColors.gray[200], borderRadius: radius.full, overflow: 'hidden', marginBottom: 8 }}>
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
          <PremiumInput
            testID="input-plant-name"
            label="Nom de votre plante"
            value={watch('plantName')}
            onChangeText={(value: string) => setValue('plantName', value)}
            placeholder="ex: Rosalie, Monstera..."
            error={errors.plantName ? errors.plantName.message : undefined}
          />
        </Animated.View>

        {/* Personality selection */}
        <Animated.View entering={FadeInDown.delay(800)}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: spacing.md }}>
            Personnalité
          </Text>
          <PremiumChipGroup
            items={personalityOptions}
            selected={selectedPersonality ? [selectedPersonality] : []}
            onSelect={(id: string) => setValue('personality', id as any)}
            multiSelect={false}
          />
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Animated.View entering={FadeInDown.delay(1200)}>
          <PremiumButton
            testID="button-continue"
            variant="primary"
            size="md"
            onPress={handleContinue}
            disabled={!isValid}
          >
            Continuer
          </PremiumButton>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
