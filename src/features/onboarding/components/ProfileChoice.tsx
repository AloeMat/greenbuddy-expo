import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useOnboardingStore } from '../store/onboardingStore';
import { trackPageView } from '../utils/analytics';

interface Option {
  label: string; // "🌿 J'agis immédiatement"
  profile: string; // "actif"
  xp: number; // 5
  feedback: string; // "Parfait ! On adapte..."
}

interface ProfileChoiceProps {
  title: string;
  text: string;
  options: Option[];
  progress: number;
  nextRoute: string;
  currentPage: string;
  onSelect?: (option: Option) => void;
}

export function ProfileChoice({
  title,
  text,
  options,
  progress,
  nextRoute,
  currentPage,
  onSelect,
}: ProfileChoiceProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const { setUserProfile, addXP, markPageComplete } = useOnboardingStore();

  React.useEffect(() => {
    trackPageView(currentPage);
  }, [currentPage]);

  const handleSelect = (option: Option) => {
    setSelectedProfile(option.profile);
    setUserProfile(option.profile as any);
    addXP(option.xp);
    markPageComplete(currentPage);

    // Call custom handler if provided
    if (onSelect) {
      onSelect(option);
    }

    // Show feedback alert
    Alert.alert('Personnalisation activée', option.feedback, [
      {
        text: 'Continuer',
        onPress: () => router.push(nextRoute),
      },
    ]);
  };

  return (
    <ScrollView testID={`onboarding-${currentPage}`} className="flex-1 bg-green-50 px-6 pt-16">
      {/* Progress bar */}
      <View testID="progress-bar" className="h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
        <View className="h-full bg-green-500" style={{ width: `${progress}%` }} />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-green-900 mb-2">{title}</Text>
      <Text className="text-base text-gray-700 mb-8">{text}</Text>

      {/* Options */}
      <View className="pb-10">
        {options.map((option, index) => (
          <Animated.View
            key={option.profile}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              testID={`profile-${option.profile}`}
              onPress={() => handleSelect(option)}
              className={`p-4 rounded-xl border-2 mb-4 ${
                selectedProfile === option.profile
                  ? 'bg-green-100 border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className="text-lg font-semibold text-gray-900">{option.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
