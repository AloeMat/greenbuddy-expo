import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, OnboardingFooter, Title, Subtitle, PrimaryButton } from '@/design-system/onboarding/components';
import { VariantPage } from '@/features/onboarding/types/onboardingSchema';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import { PlantAvatar } from '@/features/plants/components/PlantAvatar';
import { PlantPersonality } from '@/types';
import * as Haptics from 'expo-haptics';

interface VariantRendererProps {
  page: VariantPage;
  onNavigate: (nextPageId: string) => void;
}

// Map plant personalities to emotion states based on variant tone
const TONE_TO_EMOTION: Record<string, 'happy' | 'sad' | 'idle' | 'excited' | 'neutral'> = {
  'énergique': 'excited',
  'pédagogique': 'idle',
  'doux': 'happy',
  'neutre': 'neutral',
  'default': 'happy',
};

/**
 * VariantRenderer - Enhanced with Avatar Interaction
 *
 * Shows plant avatar with emotion state that matches the tone of the variant message
 * - Displays personality-specific text based on user profile
 * - Avatar shows matching emotion (excited, happy, gentle, etc.)
 * - Avatar has mouth animation to show "speaking" the variant text
 * - Smooth fade-in animations
 */
export function VariantRenderer({ page, onNavigate }: VariantRendererProps) {
  const store = useOnboardingStore();
  const { userProfile, identifiedPlant, plantName } = store;
  const [avatarPersonality, setAvatarPersonality] = useState<PlantPersonality>('monstera');
  
  const selectedVariantKey = (userProfile && userProfile in page.variants ? userProfile : 'default') as keyof typeof page.variants;
  const variant = page.variants[selectedVariantKey] || page.variants.default;

  // Get emotion from tone
  const emotion = TONE_TO_EMOTION[variant.tone] || 'happy';

  // Determine avatar personality from identified plant
  useEffect(() => {
    if (identifiedPlant?.family) {
      // Use the family name to pick a personality
      const familyToPersonality: Record<string, PlantPersonality> = {
        'Cactaceae': 'cactus',
        'Orchidaceae': 'orchidee',
        'Araceae': 'monstera',
        'Euphorbiaceae': 'succulente',
        'Polypodiaceae': 'fougere',
        'Sarraceniaceae': 'carnivore',
        'Arecaceae': 'palmier',
        'Piperaceae': 'pilea',
      };

      const family = identifiedPlant.family || '';
      const personality = familyToPersonality[family] || 'monstera';
      setAvatarPersonality(personality);
    }
  }, [identifiedPlant]);

  const handleNavigate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(page.next);
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
          justifyContent: 'flex-start',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Container - Enhanced with border and glow */}
        <Animated.View
          entering={ZoomIn.springify()}
          style={[
            styles.avatarContainer,
            {
              marginBottom: spacing['2xl'],
            },
          ]}
        >
          <PlantAvatar
            personality={avatarPersonality}
            emotionState={emotion}
            isSpeaking={true} // Avatar is "speaking" the variant text
            size="large"
            showGlow={true}
            level={1}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Title>{page.title}</Title>
        </Animated.View>

        {/* Variant Message with Tone Indicator */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor:
                  emotion === 'excited'
                    ? onboardingColors.warning + '15'
                    : emotion === 'happy'
                    ? onboardingColors.green[50]
                    : onboardingColors.gray[50],
              },
            ]}
          >
            <Subtitle>{variant.text}</Subtitle>
            
            {/* Tone indicator */}
            <Animated.View
              entering={FadeInDown.delay(400)}
              style={{
                marginTop: spacing.md,
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: onboardingColors.gray[200],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      emotion === 'excited'
                        ? onboardingColors.warning
                        : emotion === 'happy'
                        ? onboardingColors.green[500]
                        : onboardingColors.gray[500],
                  }}
                />
                <Subtitle
                  style={{
                    fontSize: 12,
                    color: onboardingColors.text.muted,
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}
                >
                  Ton: {variant.tone || 'neutral'}
                </Subtitle>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Plant Name Confirmation if available */}
        {plantName && (
          <Animated.View
            entering={FadeInDown.delay(500)}
            style={[
              styles.messageCard,
              {
                backgroundColor: onboardingColors.green[50],
                marginTop: spacing.lg,
                borderLeftWidth: 3,
                borderLeftColor: onboardingColors.green[500],
              },
            ]}
          >
            <Subtitle style={{ fontSize: 14, color: onboardingColors.text.secondary }}>
              Votre plante: <Subtitle style={{ fontWeight: '700', color: onboardingColors.text.primary }}>
                {plantName}
              </Subtitle>
            </Subtitle>
          </Animated.View>
        )}
      </ScrollView>

      <OnboardingFooter>
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          pointerEvents="auto"
          style={{ width: '100%' }}
        >
          <PrimaryButton testID={`button-${page.cta_primary.action}`} onPress={handleNavigate}>
            {page.cta_primary.children}
          </PrimaryButton>
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: onboardingColors.green[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  messageCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
});
