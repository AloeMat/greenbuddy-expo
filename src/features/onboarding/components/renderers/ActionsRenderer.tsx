import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Camera, Images, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, Title, Subtitle } from '@/design-system/onboarding/components';
import { ActionsPage } from '@/features/onboarding/types/onboardingSchema';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/services/logger';
import { plantNetService } from '@/features/plants/services/plantnet';

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
      setLoadingMessage('Demande de permission caméra...');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La caméra est nécessaire pour scanner des plantes.');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Capture en cours...');
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

      setLoadingMessage('Identification de votre plante...');
      // Call real PlantNet API with 15s timeout
      const plantIdentification = await Promise.race([
        plantNetService.identifyPlant(base64),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PlantNet timeout')), 15000)
        ),
      ]);
      store.setPlantData(base64, {
        commonName: plantIdentification.commonName,
        scientificName: plantIdentification.scientificName,
        family: plantIdentification.family,
        confidence: plantIdentification.confidence,
        description: plantIdentification.description,
      });

      setIsLoading(false);
      onNavigate(page.next);
    } catch (error) {
      logger.error('[ActionsRenderer] Camera error:', error);
      const isTimeout = error instanceof Error && error.message === 'PlantNet timeout';
      Alert.alert(
        'Erreur',
        isTimeout
          ? 'Identification lente - en manque de connexion. Essayez la sélection manuelle.'
          : 'Une erreur est survenue lors de la capture.'
      );
      setIsLoading(false);
    }
  };

  const handleImportGallery = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      setIsLoading(true);
      setLoadingMessage('Demande de permission galerie...');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire.');
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Sélection en cours...');
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

      setLoadingMessage('Identification de votre plante...');
      // Call real PlantNet API with 15s timeout
      const plantIdentification = await Promise.race([
        plantNetService.identifyPlant(base64),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PlantNet timeout')), 15000)
        ),
      ]);
      store.setPlantData(base64, {
        commonName: plantIdentification.commonName,
        scientificName: plantIdentification.scientificName,
        family: plantIdentification.family,
        confidence: plantIdentification.confidence,
        description: plantIdentification.description,
      });

      setIsLoading(false);
      onNavigate(page.next);
    } catch (error) {
      logger.error('[ActionsRenderer] Gallery error:', error);
      const isTimeout = error instanceof Error && error.message === 'PlantNet timeout';
      Alert.alert(
        'Erreur',
        isTimeout
          ? 'Identification lente - en manque de connexion. Essayez la sélection manuelle.'
          : 'Une erreur est survenue lors de la sélection.'
      );
      setIsLoading(false);
    }
  };

  const handleManualSelect = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Navigate to manual input page where user can enter plant name
      onNavigate('page5_manual_input');
    } catch (error) {
      logger.error('[ActionsRenderer] Manual select error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const getActionIcon = (icon?: string) => {
    const color = onboardingColors.text.white;
    const size = 20;
    switch (icon) {
      case 'camera':
        return <Camera size={size} color={color} strokeWidth={2} />;
      case 'gallery':
        return <Images size={size} color={color} strokeWidth={2} />;
      case 'search':
        return <Search size={size} color={color} strokeWidth={2} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg }} showsVerticalScrollIndicator={false}>
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
        <View pointerEvents={isLoading ? 'none' : 'auto'} style={{ width: '100%', gap: spacing.md, opacity: isLoading ? 0.5 : 1 }}>
          {page.actions.map((action, index) => (
            <Animated.View
              key={action.type}
              entering={FadeInDown.delay(300 + index * 100).springify()}
            >
              <TouchableOpacity
                testID={`action-${action.type}`}
                activeOpacity={0.7}
                onPress={() => handleAction(action)}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? onboardingColors.gray[300] : onboardingColors.green[500],
                  borderRadius: radius.sm,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.xs,
                }}
              >
                {getActionIcon(action.icon)}
                <Text style={{ color: isLoading ? onboardingColors.text.muted : 'white', fontWeight: '600', fontSize: 18 }}>
                  {action.children}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </OnboardingFooter>
    </OnboardingScreen>
  );
}
