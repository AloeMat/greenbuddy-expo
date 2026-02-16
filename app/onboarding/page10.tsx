import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Sparkles, Trophy, Zap } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { useGamificationStore } from '@gamification/store';
import { ConfettiExplosion } from '@gamification/components/ConfettiAnimation';
import { trackPageView, trackCompletion } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS, TOTAL_POSSIBLE_XP } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

export default function Page10() {
  const { setCurrentPage, earnedXP, completeOnboarding, userProfile, plantName } =
    useOnboardingStore();
  const { addXp } = useGamificationStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    trackPageView('page10');
    setCurrentPage('page10');

    // Award final XP bonus
    const finalBonus = 100;
    addXp(finalBonus, 'ADD_PLANT');
    logger.info(`🎉 Onboarding completed! +${finalBonus} XP bonus`);

    // Track completion
    if (userProfile) {
      trackCompletion({
        totalTime: Date.now(),
        earnedXP: earnedXP + finalBonus,
        userProfile,
      });
    }

    // Auto-hide confetti after 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(confettiTimer);
  }, [setCurrentPage, earnedXP, addXp, userProfile]);

  const handleContinue = () => {
    completeOnboarding();
    logger.info('✨ Navigating to dashboard');
    router.replace('/(tabs)');
  };

  const totalXP = earnedXP + 100; // 100 is final bonus

  return (
    <View className="flex-1" testID="onboarding-page10">
      {/* Confetti overlay */}
      <View testID="confetti-container">
        <ConfettiExplosion visible={showConfetti} />
      </View>

      <ScrollView className="flex-1 bg-green-50">
      {/* Header with progress bar (100%) */}
      <View className="pt-12 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: '100%' }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 14/14</Text>
      </View>

      {/* Main content - Celebration */}
      <Animated.View entering={FadeInDown.springify()} className="px-6 py-12 items-center flex-1">
        {/* Celebration emoji */}
        <Animated.Text entering={FadeInDown.delay(200)} className="text-8xl mb-6">
          🎉
        </Animated.Text>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-3xl font-bold text-green-900 text-center mb-2"
        >
          Tout est prêt !
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(600)}
          className="text-base text-gray-700 text-center mb-8"
        >
          Vous avez débloqué la version gratuite de GreenBuddy
        </Animated.Text>

        {/* Stats cards */}
        <View className="w-full gap-4 mb-12">
          {/* XP card */}
          <Animated.View
            entering={FadeInDown.delay(800).springify()}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-yellow-100 rounded-lg p-3">
                <Zap size={24} color="#FBBF24" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600">XP gagné</Text>
                <Text className="text-2xl font-bold text-green-900">{totalXP} XP</Text>
              </View>
            </View>
          </Animated.View>

          {/* Achievement card */}
          <Animated.View
            entering={FadeInDown.delay(1000).springify()}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-purple-100 rounded-lg p-3">
                <Trophy size={24} color="#A855F7" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600">Achievements débloqués</Text>
                <Text className="text-2xl font-bold text-purple-900">2</Text>
              </View>
            </View>
          </Animated.View>

          {/* Plant count card */}
          <Animated.View
            entering={FadeInDown.delay(1200).springify()}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-green-100 rounded-lg p-3">
                <Sparkles size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600">Plante créée</Text>
                <Text className="text-2xl font-bold text-green-900">{plantName}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Summary box */}
        <Animated.View
          entering={FadeInDown.delay(1400)}
          className="bg-green-100 rounded-lg p-6 mb-12 w-full"
        >
          <Text className="text-sm text-green-900 text-center leading-6">
            🌱 Vous avez complété l'onboarding et créé votre première plante. Vous êtes maintenant
            prêt à explorer toutes les fonctionnalités de GreenBuddy !
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View className="px-6 pb-8">
        <Animated.View entering={FadeInDown.delay(1600)}>
          <TouchableOpacity
            testID="button-discover-garden"
            onPress={handleContinue}
            className="bg-green-500 rounded-lg py-4 items-center flex-row justify-center gap-2"
          >
            <Sparkles size={20} color="white" />
            <Text className="text-white font-semibold text-lg">Découvrir mon jardin</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      </ScrollView>
    </View>
  );
}
