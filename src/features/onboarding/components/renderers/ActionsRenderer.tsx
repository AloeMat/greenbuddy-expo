import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '@/design-system/tokens/spacing';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, OnboardingFooter, Title, Subtitle, PrimaryButton } from '@/design-system/onboarding/components';
import { ActionsPage } from '@/features/onboarding/types/onboardingSchema';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/services/logger';

interface ActionsRendererProps {
  page: ActionsPage;
  onNavigate: (nextPageId: string) => void;
}

export function ActionsRenderer({ page, onNavigate }: ActionsRendererProps) {
  const store = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleAction = async (action: typeof page.actions[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action.type === 'upload_photo') await handleTakePhoto();
    else if (action.type === 'import_gallery') handleImportGallery();
    else if (action.type === 'manual_select') handleManualSelect();
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('📸 Demande de permission caméra...');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La caméra est nécessaire pour scanner des plantes.');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('📷 Capture en cours...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        setIsLoading(false);
        return;
      }

      const base64 = result.assets[0].base64;
      if (!base64) {
        Alert.alert('Erreur', 'Impossible de traiter l\'image.');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('🌿 Identification de votre plante...');
      // For onboarding, use a placeholder plant instead of API call
      store.setPlantData(base64, {
        commonNames: ['Plante identifiée'],
        scientificName: 'Plantae sp.',
        description: 'Une belle plante trouvée via la caméra.',
        careGuide: {
          watering: 'Arrosez régulièrement',
          lighting: 'Lumière indirecte',
          humidity: 'Humidité modérée',
        },
      });

      setIsLoading(false);
      onNavigate(page.next);
    } catch (error) {
      logger.error('[ActionsRenderer] Camera error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la capture.');
      setIsLoading(false);
    }
  };

  const handleImportGallery = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('📂 Demande de permission galerie...');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire.');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('📂 Sélection en cours...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        setIsLoading(false);
        return;
      }

      const base64 = result.assets[0].base64;
      if (!base64) {
        Alert.alert('Erreur', 'Impossible de traiter l\'image.');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('🌿 Identification de votre plante...');
      // For onboarding, use a placeholder plant instead of API call
      store.setPlantData(base64, {
        commonNames: ['Plante de galerie'],
        scientificName: 'Plantae sp.',
        description: 'Une belle plante de votre galerie.',
        careGuide: {
          watering: 'Arrosez régulièrement',
          lighting: 'Lumière indirecte',
          humidity: 'Humidité modérée',
        },
      });

      setIsLoading(false);
      onNavigate(page.next);
    } catch (error) {
      logger.error('[ActionsRenderer] Gallery error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection.');
      setIsLoading(false);
    }
  };

  const handleManualSelect = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);
      setLoadingMessage('🌿 Préparation de votre plante...');

      // Simulate plant selection with a placeholder
      setTimeout(() => {
        store.setPlantData(
          '', // No actual image for now
          {
            commonNames: ['Monstera Deliciosa'],
            scientificName: 'Monstera deliciosa',
            description: 'Une belle plante d\'intérieur avec des feuilles perforées.',
            careGuide: {
              watering: 'Arrosez une fois par semaine',
              lighting: 'Lumière indirecte brillante',
              humidity: 'Aime l\'humidité élevée',
            },
          }
        );
        setIsLoading(false);
        onNavigate(page.next);
      }, 1500);
    } catch (error) {
      logger.error('[ActionsRenderer] Manual select error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      setIsLoading(false);
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Title>{page.title}</Title>
        </Animated.View>
        {page.text && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Subtitle>{page.text}</Subtitle>
          </Animated.View>
        )}
        {isLoading && (
          <View style={{ marginVertical: spacing['3xl'], alignItems: 'center', gap: spacing.md }}>
            <ActivityIndicator size="large" color={onboardingColors.green[500]} />
            <Text style={{ fontSize: 16, color: onboardingColors.text.secondary }}>{loadingMessage}</Text>
          </View>
        )}
      </ScrollView>
      <OnboardingFooter>
        <Animated.View entering={FadeInDown.delay(400).springify()} pointerEvents={isLoading ? 'none' : 'auto'} style={{ width: '100%', gap: spacing.md, opacity: isLoading ? 0.5 : 1 }}>
          {page.actions.map((action) => (
            <PrimaryButton
              key={action.type}
              testID={`action-${action.type}`}
              onPress={() => handleAction(action)}
            >
              {action.children}
            </PrimaryButton>
          ))}
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
