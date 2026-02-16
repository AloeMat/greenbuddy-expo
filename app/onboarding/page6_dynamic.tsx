import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Volume2, SkipForward } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { useGoogleTTS } from '@lib/hooks/useGoogleTTS';
import { logger } from '@lib/services/logger';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS, PAGE6_VARIANTS, PROFILES } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';

export default function Page6Dynamic() {
  const { setCurrentPage, userProfile, identifiedPlant, addXP, markPageComplete } =
    useOnboardingStore();
  const [textSpoken, setTextSpoken] = useState(false);

  useEffect(() => {
    trackPageView('page6_dynamic');
    setCurrentPage('page6_dynamic');
  }, [setCurrentPage]);

  // Get variant based on user profile
  const variant =
    userProfile && PAGE6_VARIANTS[userProfile as keyof typeof PAGE6_VARIANTS]
      ? PAGE6_VARIANTS[userProfile as keyof typeof PAGE6_VARIANTS]
      : PAGE6_VARIANTS.actif;

  // Replace placeholders in text
  const text = variant.text.replace('[NOM_ESPÈCE]', identifiedPlant?.commonName || 'Plante');

  // Get voice speed from profile
  const profile = userProfile as keyof typeof PROFILES;
  const voiceSpeed = PROFILES[profile]?.voiceSpeed || 1.0;

  // Create TTS hook with voice speed
  const { speak, isSpeaking } = useGoogleTTS({ speed: voiceSpeed });

  // Speak on component mount
  useEffect(() => {
    const speakText = async () => {
      try {
        logger.info(`🔊 Speaking with profile: ${profile}, speed: ${voiceSpeed}`);
        await speak(text);
        setTextSpoken(true);
        addXP(5);
        markPageComplete('page6_dynamic');
      } catch (error) {
        logger.error('🔊 TTS error:', error);
        setTextSpoken(true); // Allow to continue even if TTS fails
        addXP(5);
        markPageComplete('page6_dynamic');
      }
    };

    speakText();
  }, [text, userProfile, speak, addXP, markPageComplete]);

  const handleContinue = () => {
    router.push('/onboarding/page8');
  };

  return (
    <View style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View style={{ height: 8, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${PAGE_PROGRESS.page6_dynamic}%` }}
          />
        </View>
        <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 9/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={{ fontSize: 24, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 8 }}
        >
          Première parole
        </Animated.Text>

        {/* Profile tone */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          style={{ fontSize: 14, color: onboardingColors.text.muted, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' }}
        >
          Ton: {variant.tone}
        </Animated.Text>

        {/* Speech text */}
        <Animated.View
          entering={FadeInDown.delay(600)}
          style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: onboardingColors.gray[200] }}
        >
          <Text style={{ fontSize: 18, color: onboardingColors.text.primary, textAlign: 'center', lineHeight: 24 }}>{text}</Text>
        </Animated.View>

        {/* TTS Status */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}
        >
          {isSpeaking ? (
            <>
              <ActivityIndicator color={onboardingColors.green[500]} size="small" />
              <Text style={{ color: onboardingColors.green[500], fontWeight: '600' }}>Écoute en cours...</Text>
            </>
          ) : textSpoken ? (
            <>
              <Volume2 size={20} color={onboardingColors.green[500]} />
              <Text style={{ color: onboardingColors.green[500], fontWeight: '600' }}>Enregistrement terminé</Text>
            </>
          ) : (
            <>
              <ActivityIndicator color={onboardingColors.green[500]} size="small" />
              <Text style={{ color: onboardingColors.green[500], fontWeight: '600' }}>Préparation audio...</Text>
            </>
          )}
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!textSpoken}
            style={{
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: textSpoken ? onboardingColors.green[500] : onboardingColors.gray[200]
            }}
          >
            <SkipForward size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Continuer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
