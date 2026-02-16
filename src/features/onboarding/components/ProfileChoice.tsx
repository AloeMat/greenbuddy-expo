import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useOnboardingStore } from '../store/onboardingStore';
import { trackPageView } from '../utils/analytics';
import { FeedbackModal } from './FeedbackModal';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
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
            key={option.profile}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              testID={`profile-${option.profile}`}
              onPress={() => handleSelect(option)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 12,
                borderWidth: 2,
                marginBottom: 16,
                backgroundColor: selectedProfile === option.profile ? '#DCFCE7' : '#FFFFFF',
                borderColor: selectedProfile === option.profile ? '#10B981' : '#E5E7EB',
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
        title="Personnalisation activée"
        message={feedbackText}
        buttonText="Continuer"
        onConfirm={handleConfirm}
      />
    </>
  );
}
