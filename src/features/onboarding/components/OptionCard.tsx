import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

interface Option {
  label: string; // "Oui 😔"
  value: string; // "oui_une"
  xp: number; // 5
  feedback: string; // "On comprend cette douleur..."
}

interface OptionCardProps {
  title: string;
  text: string;
  options: Option[];
  progress: number;
  nextRoute: string;
  currentPage: string;
  onSelect: (option: Option) => void;
}

export function OptionCard({
  title,
  text,
  options,
  progress,
  nextRoute,
  currentPage,
  onSelect,
}: OptionCardProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleSelect = (option: Option) => {
    setSelectedValue(option.value);
    onSelect(option);

    // Show feedback alert
    Alert.alert(
      'Merci de votre confiance',
      option.feedback,
      [
        {
          text: 'Continuer',
          onPress: () => router.push(nextRoute),
        },
      ],
      { cancelable: false }
    );
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
            key={option.value}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              testID={`pain-${option.value}`}
              onPress={() => handleSelect(option)}
              className={`p-4 rounded-xl border-2 mb-4 ${
                selectedValue === option.value
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
