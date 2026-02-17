import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing } from '@tokens/spacing';
import { onboardingColors } from '@design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingContent, OnboardingFooter, Title, Subtitle, PrimaryButton } from '@design-system/onboarding/components';
import { ActionsPage } from '../../types/onboardingSchema';
import { useOnboardingStore } from '../../store/onboardingStore';
import { getStepNumber } from '../../utils/getStepNumber';
import * as Haptics from 'expo-haptics';
import { cameraService } from '@plants/services/camera';
import { plantNetService } from '@plants/services/plantnet';

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
      setLoadingMessage('📸 Accès à la caméra...');
      const hasPermission = await cameraService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission refusée', 'La caméra est nécessaire.');
        setIsLoading(false);
        return;
      }
      setLoadingMessage('📷 Capture en cours...');
      const photo = await cameraService.takePicture();
      if (!photo) { setIsLoading(false); return; }
      setLoadingMessage('🔄 Compression...');
      const compressed = await cameraService.compressImage(photo, 2048);
      setLoadingMessage('🔄 Préparation...');
      const base64 = await cameraService.getBase64(compressed);
      setLoadingMessage('🔍 Identification en cours...');
      const identified = await plantNetService.identifyPlant(base64);
      if (!identified) {
        Alert.alert('Identification échouée', 'Veuillez réessayer.');
        setIsLoading(false);
        return;
      }
      store.setPlantData(base64, identified);
      setIsLoading(false);
      onNavigate(page.next);
    } catch (error) {
      console.error('[ActionsRenderer] Error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      setIsLoading(false);
    }
  };

  const handleImportGallery = () => Alert.alert('Galerie', 'Disponible prochainement.');
  const handleManualSelect = () => Alert.alert('Sélection manuelle', 'Disponible prochainement.');

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
        <Animated.View entering={FadeInDown.delay(400).springify()} pointerEvents="auto" style={{ width: '100%', gap: spacing.md }}>
          {page.actions.map((action) => (
            <PrimaryButton key={action.type} testID={`action-${action.type}`} onPress={() => handleAction(action)}>
              {action.children}
            </PrimaryButton>
          ))}
        </Animated.View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
