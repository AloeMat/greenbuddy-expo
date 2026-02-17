import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@design-system/components/Button';
import { ProgressBar } from '@features/onboarding/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingStep1() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={6} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf" size={80} color="#2D5A27" />
        </View>
        
        <Text style={styles.title}>Bienvenue sur GreenBuddy</Text>
        <Text style={styles.subtitle}>
          L'application qui donne une voix à vos plantes et vous aide à en prendre soin.
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="scan-outline" text="Identifiez vos plantes instantanément" />
          <FeatureItem icon="chatbubble-ellipses-outline" text="Discutez avec elles grâce à l'IA" />
          <FeatureItem icon="water-outline" text="Recevez des rappels d'arrosage" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Commencer l'aventure" onPress={() => router.push('/onboarding/step2')} />
      </View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={24} color="#4A7C59" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666666', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  features: { width: '100%', gap: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12 },
  featureText: { fontSize: 16, color: '#1A1A1A', flex: 1 },
  footer: { padding: 24 },
});