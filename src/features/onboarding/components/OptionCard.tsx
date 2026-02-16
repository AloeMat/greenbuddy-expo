import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { FeedbackModal } from './FeedbackModal';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSelect = (option: Option) => {
    setSelectedValue(option.value);
    onSelect(option);

    // Show feedback modal instead of alert
    setFeedbackText(option.feedback);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    router.push(nextRoute);
  };

  return (
    <>
      <ScrollView
        testID={`onboarding-${currentPage}`}
        style={{ flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 24, paddingTop: 64 }}
      >
      {/* Progress bar */}
      <View testID="progress-bar" style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden', marginBottom: 32 }}>
        <View style={{ height: '100%', backgroundColor: '#10B981', width: `${progress}%` }} />
      </View>

      {/* Title */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 16, color: '#4B5563', marginBottom: 32 }}>{text}</Text>

      {/* Options */}
      <View style={{ paddingBottom: 40 }}>
        {options.map((option, index) => (
          <Animated.View
            key={option.value}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              testID={`pain-${option.value}`}
              onPress={() => handleSelect(option)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 12,
                borderWidth: 2,
                marginBottom: 16,
                backgroundColor: selectedValue === option.value ? '#DCFCE7' : '#FFFFFF',
                borderColor: selectedValue === option.value ? '#10B981' : '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{option.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title="Merci de votre confiance"
        message={feedbackText}
        buttonText="Continuer"
        onConfirm={handleConfirm}
      />
    </>
  );
}
