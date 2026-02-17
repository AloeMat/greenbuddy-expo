import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@design-system/components/Button';
import { ProgressBar } from '@features/onboarding/components/ProgressBar';
import { SignupModal } from '@features/onboarding/components/SignupModal';
import { PlantAvatar } from '@plants/components/PlantAvatar';
import { useGoogleTTS } from '@lib/hooks/useGoogleTTS';
import { useOnboardingStore } from '@/store/useOnboardingStore';

type DiagnosisType = 'thirsty' | 'happy' | 'needs_light' | null;

export default function OnboardingStep4() {
  const router = useRouter();
  const { speak, isSpeaking } = useGoogleTTS();
  const { identifiedPlant } = useOnboardingStore();

  const [diagnosis, setDiagnosis] = useState<DiagnosisType>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [emotion, setEmotion] = useState<'happy' | 'sad' | 'neutral'>('happy');

  // Generate random diagnosis on mount
  useEffect(() => {
    const diagnoses: DiagnosisType[] = ['thirsty', 'happy', 'needs_light'];
    const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
    setDiagnosis(randomDiagnosis);
  }, []);

  // Plant speaks based on diagnosis
  useEffect(() => {
    const timer = setTimeout(() => {
      const messages: Record<Exclude<DiagnosisType, null>, string> = {
        thirsty: "Bonjour ! Je suis ravi de faire ta connaissance. J'ai un peu soif... Tu pourrais m'arroser ?",
        happy: "Bonjour ! Je suis ravi de faire ta connaissance. Je me sens bien ici !",
        needs_light: "Bonjour ! Je suis ravi de faire ta connaissance. J'aimerais un peu plus de lumière...",
      };

      speak(diagnosis ? messages[diagnosis] : "Bonjour ! Je suis ravi de faire ta connaissance.");

      // Update emotion based on diagnosis
      if (diagnosis === 'thirsty') {
        setEmotion('sad');
      } else if (diagnosis === 'needs_light') {
        setEmotion('neutral');
      } else {
        setEmotion('happy');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [diagnosis, speak]);

  const handleAdoptPlant = () => {
    Alert.alert(
      '🌱 Adopter cette plante',
      `Êtes-vous prêt à vous engager à prendre soin de ce ${identifiedPlant?.commonName || 'plante'} ? Créez votre compte pour sauvegarder votre progression.`,
      [
        {
          text: 'Non, précédent',
          onPress: () => router.back(),
          style: 'cancel',
        },
        {
          text: 'Oui, créer compte',
          onPress: () => setShowSignupModal(true),
          style: 'default',
        },
      ]
    );
  };

  const handleSignupSuccess = () => {
    Alert.alert(
      '✨ Bienvenue!',
      'Votre compte a été créé. Votre plante a hâte de vous rencontrer !',
      [
        {
          text: 'Continuer',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const handleSkipSignup = () => {
    router.push('/onboarding/step5');
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Progress Bar + Header Row */}
        <View style={styles.progressSection}>
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '80%' }]} />
            </View>
          </View>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.stepCounter}>4/5</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Écoutez-le parler !</Text>

          <View style={styles.avatarContainer}>
            <PlantAvatar
              personality="monstera"
              emotionState={emotion}
              isSpeaking={isSpeaking}
              size="large"
              showGlow={true}
            />
          </View>

          {/* Diagnosis Card */}
          {diagnosis && (
            <View style={[styles.diagnosisCard, styles[`diagnosis_${diagnosis}`]]}>
              <Ionicons
                name={diagnosis === 'thirsty' ? 'water' : diagnosis === 'needs_light' ? 'sunny' : 'heart'}
                size={24}
                color={diagnosis === 'thirsty' ? '#3B82F6' : diagnosis === 'needs_light' ? '#F59E0B' : '#10B981'}
              />
              <Text style={styles.diagnosisText}>
                {diagnosis === 'thirsty'
                  ? 'J\'ai un peu soif...'
                  : diagnosis === 'needs_light'
                  ? 'J\'aimerais plus de lumière...'
                  : 'Je me sens bien !'}
              </Text>
            </View>
          )}

          <Text style={styles.subtitle}>
            Cette {identifiedPlant?.commonName || 'plante'} compte sur vous pour prendre soin d'elle. Êtes-vous prêt à vous engager ?
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            label="Adopter et créer compte"
            onPress={handleAdoptPlant}
            style={styles.primaryButton}
          />
          <Button
            label="Continuer sans compte"
            variant="secondary"
            onPress={handleSkipSignup}
            style={styles.secondaryButton}
          />
        </View>
      </SafeAreaView>

      <SignupModal
        visible={showSignupModal}
        onSignupSuccess={handleSignupSuccess}
        onCancel={() => setShowSignupModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  progressSection: { paddingHorizontal: 24, paddingVertical: 12 },
  barContainer: { marginBottom: 8 },
  barBackground: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  stepCounter: { fontSize: 13, color: '#666', fontWeight: '500' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 32, textAlign: 'center' },
  avatarContainer: { marginBottom: 24 },
  diagnosisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  diagnosis_thirsty: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
  },
  diagnosis_happy: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  diagnosis_needs_light: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  diagnosisText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  subtitle: { fontSize: 15, color: '#666666', textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  footer: { padding: 24, gap: 12 },
  primaryButton: { marginBottom: 0 },
  secondaryButton: { marginTop: 0 },
});