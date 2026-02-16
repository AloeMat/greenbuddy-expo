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
import { onboardingColors } from '@design-system/onboarding/colors';

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
    router.replace('/(tabs)');
  };

  const totalXP = earnedXP + 100; // 100 is final bonus

  return (
    <View style={{ flex: 1 }} testID="onboarding-page10">
      {/* Confetti overlay */}
      <View testID="confetti-container">
        <ConfettiExplosion visible={showConfetti} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
        {/* Header with progress bar (100%) */}
        <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
          <View style={{ height: 8, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
            <Animated.View
              entering={FadeIn}
              style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: '100%' }}
            />
          </View>
          <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 14/14</Text>
        </View>

        {/* Main content - Celebration */}
        <Animated.View entering={FadeInDown.springify()} style={{ paddingHorizontal: 24, paddingVertical: 48, alignItems: 'center', flex: 1 }}>
          {/* Celebration emoji */}
          <Animated.Text entering={FadeInDown.delay(200)} style={{ fontSize: 88, marginBottom: 24 }}>
            🎉
          </Animated.Text>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(400)}
            style={{ fontSize: 30, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 8 }}
          >
            Tout est prêt !
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            entering={FadeInDown.delay(600)}
            style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginBottom: 32 }}
          >
            Vous avez débloqué la version gratuite de GreenBuddy
          </Animated.Text>

          {/* Stats cards */}
          <View style={{ width: '100%', gap: 16, marginBottom: 48 }}>
            {/* XP card */}
            <Animated.View
              entering={FadeInDown.delay(800).springify()}
              style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 24, borderWidth: 1, borderColor: onboardingColors.gray[200] }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 12 }}>
                  <Zap size={24} color="#FBBF24" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: onboardingColors.text.secondary }}>XP gagné</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: onboardingColors.text.primary }}>{totalXP} XP</Text>
                </View>
              </View>
            </Animated.View>

            {/* Achievement card */}
            <Animated.View
              entering={FadeInDown.delay(1000).springify()}
              style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 24, borderWidth: 1, borderColor: onboardingColors.gray[200] }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#F3E8FF', borderRadius: 8, padding: 12 }}>
                  <Trophy size={24} color="#A855F7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: onboardingColors.text.secondary }}>Achievements débloqués</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#7E22CE' }}>2</Text>
                </View>
              </View>
            </Animated.View>

            {/* Plant count card */}
            <Animated.View
              entering={FadeInDown.delay(1200).springify()}
              style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 24, borderWidth: 1, borderColor: onboardingColors.gray[200] }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#DCFCE7', borderRadius: 8, padding: 12 }}>
                  <Sparkles size={24} color={onboardingColors.green[500]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: onboardingColors.text.secondary }}>Plante créée</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: onboardingColors.text.primary }}>{plantName}</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Summary box */}
          <Animated.View
            entering={FadeInDown.delay(1400)}
            style={{ backgroundColor: '#E0F2FE', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 24, marginBottom: 48, width: '100%' }}
          >
            <Text style={{ fontSize: 14, color: onboardingColors.text.primary, textAlign: 'center', lineHeight: 24 }}>
              🌱 Vous avez complété l'onboarding et créé votre première plante. Vous êtes maintenant prêt à explorer toutes les fonctionnalités de GreenBuddy !
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Footer button */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <Animated.View entering={FadeInDown.delay(1600)}>
            <TouchableOpacity
              testID="button-discover-garden"
              onPress={handleContinue}
              style={{ backgroundColor: onboardingColors.green[500], borderRadius: 8, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Sparkles size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Découvrir mon jardin</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
