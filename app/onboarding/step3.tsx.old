import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
  ZoomIn
} from 'react-native-reanimated';
import { Button } from '@design-system/components/Button';
import { ProgressBar } from '@features/onboarding/components/ProgressBar';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function OnboardingStep3() {
  const router = useRouter();
  const { identifiedPlant, setPlantName } = useOnboardingStore();
  const [nameInput, setNameInput] = useState('');

  // Animation values
  const avatarScale = useSharedValue(0);
  const avatarTranslateY = useSharedValue(0);

  useEffect(() => {
    // Avatar pop entrance
    avatarScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Breathing idle animation
    avatarTranslateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: avatarScale.value },
      { translateY: avatarTranslateY.value }
    ]
  }));

  const handleContinue = () => {
    if (nameInput.trim().length > 0) {
      setPlantName(nameInput);
      router.push('/onboarding/step4');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar + Header Row */}
      <View style={styles.progressSection}>
        <View style={styles.barContainer}>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: '60%' }]} />
          </View>
        </View>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.stepCounter}>3/5</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Avatar Section with Glow */}
          <View style={styles.avatarContainer}>
            {/* Glow effect background */}
            <Animated.View
              entering={ZoomIn.delay(200)}
              style={styles.glowEffect}
            />

            {/* Avatar */}
            <Animated.View style={[animatedAvatarStyle]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>🌿</Text>
              </View>

              {/* New Friend Badge */}
              <Animated.View
                entering={ZoomIn.delay(1000).springify()}
                style={styles.badge}
              >
                <Text style={styles.badgeEmoji}>✨</Text>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Dialog Section */}
          <Animated.View
            entering={FadeInDown.delay(600).springify()}
            style={styles.dialogSection}
          >
            <Text style={styles.greeting}>
              Enchanté ! Je suis un {identifiedPlant?.commonName || 'Plante'}.
            </Text>
            <Text style={styles.title}>
              Comment veux-tu m'appeler ?
            </Text>
          </Animated.View>

          {/* Input Section */}
          <Animated.View
            entering={FadeInDown.delay(800).springify()}
            style={styles.inputSection}
          >
            <View style={[
              styles.inputContainer,
              {
                borderColor: nameInput.length > 0 ? '#10B981' : '#E5E7EB'
              }
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Donne-moi un petit nom..."
                placeholderTextColor="#9CA3AF"
                value={nameInput}
                onChangeText={setNameInput}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
                selectionColor="#10B981"
              />
            </View>

            {/* Character counter */}
            <Text style={styles.counter}>
              {nameInput.length}/50 caractères
            </Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            label="C'est son nom !"
            onPress={handleContinue}
            disabled={nameInput.length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  barContainer: {
    marginBottom: 8,
  },
  barBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepCounter: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 160,
    height: 160,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ECFDF5',
    opacity: 0.6,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 64,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  badgeEmoji: {
    fontSize: 24,
  },
  dialogSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    paddingVertical: 14,
    padding: 0,
  },
  counter: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 24,
  },
});
