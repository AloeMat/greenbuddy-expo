import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { PremiumInput } from '@/design-system/components/PremiumInput';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, Title, Subtitle, PrimaryButton } from '@/design-system/onboarding/components';
import { InputsPage } from '@/features/onboarding/types/onboardingSchema';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { executeActions } from '@/features/onboarding/utils/actionExecutor';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import * as Haptics from 'expo-haptics';

interface InputsRendererProps {
  page: InputsPage;
  onNavigate: (nextPageId: string) => void;
}

export function InputsRenderer({ page, onNavigate }: InputsRendererProps) {
  const store = useOnboardingStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    page.inputs.forEach(input => {
      if (input.required && (!formData[input.name] || formData[input.name].toString().trim() === '')) {
        newErrors[input.name] = 'Ce champ est requis';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      executeActions(page.on_complete, { inputs: formData, store });
      onNavigate(page.next);
    } catch (error) {
      console.error('[InputsRenderer] Error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Title>{page.title}</Title>
        </Animated.View>
        {page.text && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Subtitle>{page.text}</Subtitle>
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ gap: spacing.lg, marginTop: spacing.lg }}>
          {page.inputs.map((input, index) => (
            input.type === 'text' ? (
              <Animated.View
                key={input.name}
                entering={FadeInDown.delay(300 + index * 100).springify()}
              >
                <PremiumInput
                  testID={`input-${input.name}`}
                  label={input.placeholder || input.name}
                  placeholder={input.placeholder}
                  value={formData[input.name] || ''}
                  onChangeText={(value) => handleInputChange(input.name, value)}
                  error={errors[input.name]}
                />
              </Animated.View>
            ) : (
              <Animated.View
                key={input.name}
                entering={FadeInDown.delay(300 + index * 100).springify()}
              >
                <Subtitle style={{ fontSize: 14, marginBottom: spacing.md }}>{input.placeholder || input.name}</Subtitle>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                  {input.options && input.options.length > 0 ? (
                    input.options.map(opt => (
                      <TouchableOpacity
                        key={opt}
                        testID={`option-${input.name}-${opt}`}
                        activeOpacity={0.7}
                        onPress={() => handleInputChange(input.name, opt)}
                        style={{
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          borderRadius: radius.sm,
                          borderWidth: 2,
                          borderColor: formData[input.name] === opt ? onboardingColors.green[500] : onboardingColors.gray[200],
                          backgroundColor: formData[input.name] === opt ? onboardingColors.green[50] : 'white',
                        }}
                      >
                        <Subtitle style={{ fontSize: 14 }}>{opt}</Subtitle>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Subtitle style={{ fontSize: 14, color: onboardingColors.text.secondary }}>
                      Aucune option disponible
                    </Subtitle>
                  )}
                </View>
              </Animated.View>
            )
          ))}
        </Animated.View>
      </ScrollView>
      <OnboardingFooter>
        <Animated.View entering={FadeInDown.delay(400).springify()} pointerEvents="auto" style={{ width: '100%' }}>
          <PrimaryButton testID={`button-${page.cta_primary.action}`} onPress={handleSubmit}>
            {page.cta_primary.children}
          </PrimaryButton>
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
