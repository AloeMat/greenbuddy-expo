import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Volume2, SkipForward } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { useGoogleTTS } from '@lib/hooks/useGoogleTTS';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS, PAGE6_VARIANTS, PROFILES } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

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
    <View className="flex-1 bg-green-50">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page6_dynamic}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 9/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="flex-1 justify-center px-6">
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="text-2xl font-bold text-green-900 text-center mb-2"
        >
          Première parole
        </Animated.Text>

        {/* Profile tone */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-sm text-gray-500 text-center mb-8 italic"
        >
          Ton: {variant.tone}
        </Animated.Text>

        {/* Speech text */}
        <Animated.View
          entering={FadeInDown.delay(600)}
          className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200"
        >
          <Text className="text-lg text-gray-900 text-center leading-6">{text}</Text>
        </Animated.View>

        {/* TTS Status */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          className="flex-row items-center justify-center gap-2 mb-8"
        >
          {isSpeaking ? (
            <>
              <ActivityIndicator color="#10B981" size="small" />
              <Text className="text-green-600 font-semibold">Écoute en cours...</Text>
            </>
          ) : textSpoken ? (
            <>
              <Volume2 size={20} color="#10B981" />
              <Text className="text-green-600 font-semibold">Enregistrement terminé</Text>
            </>
          ) : (
            <>
              <ActivityIndicator color="#10B981" size="small" />
              <Text className="text-green-600 font-semibold">Préparation audio...</Text>
            </>
          )}
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View className="px-6 pb-8">
        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!textSpoken}
            className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${
              textSpoken ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <SkipForward size={20} color="white" />
            <Text className="text-white font-semibold text-lg">Continuer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
