import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Camera, Images, Search, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '@/design-system/tokens/spacing';
import { radius } from '@/design-system/tokens/radius';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { OnboardingScreen, OnboardingHeader, Title, Subtitle, PrimaryButton } from '@/design-system/onboarding/components';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { getStepNumber } from '@/features/onboarding/utils/getStepNumber';
import { OnboardingPageBase } from '@/features/onboarding/types/onboardingSchema';
import { plantNetService } from '@/features/plants/services/plantnet';
import { AvatarIdentificationDisplay, IdentificationState } from '../AvatarIdentificationDisplay';
import { PlantPersonality } from '@/types';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/services/logger';

type TabType = 'camera' | 'gallery' | 'search';
type IdentificationMode = 'idle' | 'loading' | 'input' | 'identifying';

interface TabbedIdentificationRendererProps {
  page: OnboardingPageBase & { next: string; text?: string };
  onNavigate: (nextPageId: string) => void;
}

// Map plant families to personalities
const PERSONALITY_MAPPING: Record<string, PlantPersonality> = {
  'Cactaceae': 'cactus',
  'Orchidaceae': 'orchidee',
  'Araceae': 'monstera',
  'Euphorbiaceae': 'succulente',
  'Polypodiaceae': 'fougere',
  'Sarraceniaceae': 'carnivore',
  'Araliaceae': 'fougere',
  'Arecaceae': 'palmier',
  'Piperaceae': 'pilea',
  'Vitaceae': 'pothos',
};

const getPersonalityFromFamily = (family?: string): PlantPersonality => {
  if (family && PERSONALITY_MAPPING[family]) {
    return PERSONALITY_MAPPING[family];
  }
  return 'monstera';
};

const TabButton: React.FC<{
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled: boolean;
}> = ({ isActive, icon, label, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    style={[
      styles.tabButton,
      isActive && styles.tabButtonActive,
      disabled && styles.tabButtonDisabled,
    ]}
  >
    {icon}
    <Text
      style={[
        styles.tabButtonText,
        isActive && styles.tabButtonTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export function TabbedIdentificationRenderer({
  page,
  onNavigate,
}: TabbedIdentificationRendererProps) {
  const store = useOnboardingStore();
  const identifiedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<TabType>('camera');
  const [mode, setMode] = useState<IdentificationMode>('idle');
  const [searchText, setSearchText] = useState('');
  const [identificationState, setIdentificationState] = useState<IdentificationState>('idle');
  const [plantPersonality, setPlantPersonality] = useState<PlantPersonality>('monstera');
  const [loadingMessage, setLoadingMessage] = useState('');

  // Handle camera capture
  const handleTakePhoto = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIdentificationState('loading');
      setLoadingMessage('Demande de permission caméra...');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La caméra est nécessaire pour scanner des plantes.');
        setIdentificationState('idle');
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
        setIdentificationState('idle');
        return;
      }

      const base64 = result.assets[0].base64;
      if (!base64) {
        Alert.alert('Erreur', 'Impossible de traiter l\'image.');
        setIdentificationState('idle');
        return;
      }

      setLoadingMessage('Identification de votre plante...');
      const plantIdentification = await Promise.race([
        plantNetService.identifyPlant(base64),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PlantNet timeout')), 15000)
        ),
      ]);

      const personality = getPersonalityFromFamily(plantIdentification.family);
      setPlantPersonality(personality);

      store.setPlantData(base64, {
        commonName: plantIdentification.commonName,
        scientificName: plantIdentification.scientificName,
        family: plantIdentification.family,
        confidence: plantIdentification.confidence,
        description: plantIdentification.description,
      });
      store.setPlantPersonality(personality);

      setIdentificationState('success');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        onNavigate(page.next);
      }, 2000);
    } catch (error) {
      logger.error('[TabbedIdentificationRenderer] Camera error:', error);
      const isTimeout = error instanceof Error && error.message === 'PlantNet timeout';
      Alert.alert(
        'Erreur',
        isTimeout
          ? 'Identification lente - en manque de connexion. Essayez la galerie ou la recherche.'
          : 'Une erreur est survenue lors de la capture.'
      );
      setIdentificationState('idle');
    }
  };

  // Handle gallery import
  const handleImportGallery = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIdentificationState('loading');
      setLoadingMessage('Demande de permission galerie...');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire.');
        setIdentificationState('idle');
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
        setIdentificationState('idle');
        return;
      }

      const base64 = result.assets[0].base64;
      if (!base64) {
        Alert.alert('Erreur', 'Impossible de traiter l\'image.');
        setIdentificationState('idle');
        return;
      }

      setLoadingMessage('Identification de votre plante...');
      const plantIdentification = await Promise.race([
        plantNetService.identifyPlant(base64),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PlantNet timeout')), 15000)
        ),
      ]);

      const personality = getPersonalityFromFamily(plantIdentification.family);
      setPlantPersonality(personality);

      store.setPlantData(base64, {
        commonName: plantIdentification.commonName,
        scientificName: plantIdentification.scientificName,
        family: plantIdentification.family,
        confidence: plantIdentification.confidence,
        description: plantIdentification.description,
      });
      store.setPlantPersonality(personality);

      setIdentificationState('success');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        onNavigate(page.next);
      }, 2000);
    } catch (error) {
      logger.error('[TabbedIdentificationRenderer] Gallery error:', error);
      const isTimeout = error instanceof Error && error.message === 'PlantNet timeout';
      Alert.alert(
        'Erreur',
        isTimeout
          ? 'Identification lente - en manque de connexion. Réessayez ou utilisez la recherche.'
          : 'Une erreur est survenue lors de la sélection.'
      );
      setIdentificationState('idle');
    }
  };

  // Handle text search
  const handleSearchPlant = async () => {
    if (!searchText.trim()) {
      Alert.alert('Erreur', 'Entrez le nom d\'une plante.');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMode('identifying');
      setIdentificationState('loading');
      setLoadingMessage('Recherche en cours...');

      const plantIdentification = await plantNetService.identifyPlantByName(searchText.trim());

      const personality = getPersonalityFromFamily(plantIdentification.family);
      setPlantPersonality(personality);

      store.setPlantName(plantIdentification.commonName);
      store.setPlantData('', {
        commonName: plantIdentification.commonName,
        scientificName: plantIdentification.scientificName,
        family: plantIdentification.family,
        confidence: plantIdentification.confidence,
        description: plantIdentification.description,
      });
      store.setPlantPersonality(personality);

      setIdentificationState('success');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        onNavigate(page.next);
      }, 2000);
    } catch (error) {
      logger.error('[TabbedIdentificationRenderer] Search error:', error);
      Alert.alert(
        'Erreur',
        'Impossible de trouver cette plante. Essayez un autre nom.'
      );
      setMode('input');
      setIdentificationState('idle');
    }
  };

  const renderTabContent = () => {
    if (identificationState !== 'idle' && identificationState !== 'error') {
      return (
        <AvatarIdentificationDisplay
          state={identificationState}
          personality={plantPersonality}
          plantInfo={
            identificationState === 'success'
              ? store.identifiedPlant || {
                  commonName: 'Plante',
                  scientificName: '',
                  family: '',
                  confidence: 0,
                  description: '',
                }
              : undefined
          }
        />
      );
    }

    switch (activeTab) {
      case 'camera':
        return (
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={{ alignItems: 'center', marginVertical: spacing['3xl'] }}>
              <Text style={styles.tabDescription}>
                Prenez une photo de votre plante pour l&apos;identifier instantanément.
              </Text>
              <PrimaryButton
                onPress={handleTakePhoto}
                disabled={identificationState === 'error'}
                style={{ marginTop: spacing.xl }}
              >
                Prendre une photo
              </PrimaryButton>
            </View>
          </Animated.View>
        );

      case 'gallery':
        return (
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={{ alignItems: 'center', marginVertical: spacing['3xl'] }}>
              <Text style={styles.tabDescription}>
                Sélectionnez une photo existante de votre galerie.
              </Text>
              <PrimaryButton
                onPress={handleImportGallery}
                disabled={identificationState === 'error'}
                style={{ marginTop: spacing.xl }}
              >
                Choisir dans la galerie
              </PrimaryButton>
            </View>
          </Animated.View>
        );

      case 'search':
        return (
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={{ marginVertical: spacing.lg }}>
              <Text style={styles.tabDescription}>
                Connaissez-vous le nom de votre plante ? Entrez-le ici.
              </Text>
              <View style={styles.searchInputContainer}>
                <TextInput
                  placeholder="Ex: Monstera, Pothos..."
                  value={searchText}
                  onChangeText={setSearchText}
                  editable={identificationState !== 'error'}
                  style={styles.searchInput}
                  placeholderTextColor={onboardingColors.text.secondary}
                />
                {searchText && identificationState !== 'error' && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={styles.clearButton}
                  >
                    <X size={20} color={onboardingColors.gray[500]} />
                  </TouchableOpacity>
                )}
              </View>
              <PrimaryButton
                onPress={handleSearchPlant}
                disabled={identificationState === 'error' || !searchText.trim()}
                style={{ marginTop: spacing.lg }}
              >
                Rechercher
              </PrimaryButton>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingScreen testID={`onboarding-${page.id}`}>
      <OnboardingHeader progress={page.progress} step={getStepNumber(page.id)} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
          paddingBottom: spacing['2xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50)}>
          <Title>{page.title}</Title>
        </Animated.View>
        {page.text && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Subtitle>{page.text}</Subtitle>
          </Animated.View>
        )}

        {/* Tab Navigation */}
        {identificationState === 'idle' && (
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              marginVertical: spacing.xl,
            }}
          >
            <TabButton
              isActive={activeTab === 'camera'}
              icon={<Camera size={18} color={activeTab === 'camera' ? 'white' : onboardingColors.gray[600]} />}
              label="Photo"
              onPress={() => setActiveTab('camera')}
              disabled={false}
            />
            <TabButton
              isActive={activeTab === 'gallery'}
              icon={<Images size={18} color={activeTab === 'gallery' ? 'white' : onboardingColors.gray[600]} />}
              label="Galerie"
              onPress={() => setActiveTab('gallery')}
              disabled={false}
            />
            <TabButton
              isActive={activeTab === 'search'}
              icon={<Search size={18} color={activeTab === 'search' ? 'white' : onboardingColors.gray[600]} />}
              label="Recherche"
              onPress={() => setActiveTab('search')}
              disabled={false}
            />
          </Animated.View>
        )}

        {/* Tab Content */}
        {renderTabContent()}

        {/* Loading State */}
        {identificationState === 'loading' && (
          <View style={{ alignItems: 'center', marginVertical: spacing['3xl'], gap: spacing.md }}>
            <ActivityIndicator size="large" color={onboardingColors.green[500]} />
            <Text style={{ fontSize: 14, color: onboardingColors.text.secondary }}>
              {loadingMessage}
            </Text>
          </View>
        )}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: onboardingColors.gray[100],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: onboardingColors.green[500],
    borderColor: onboardingColors.green[600],
  },
  tabButtonDisabled: {
    opacity: 0.5,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: onboardingColors.gray[600],
  },
  tabButtonTextActive: {
    color: 'white',
  },
  tabDescription: {
    fontSize: 15,
    color: onboardingColors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  searchInputContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  searchInput: {
    height: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: onboardingColors.gray[300],
    paddingHorizontal: spacing.md,
    fontSize: 16,
    backgroundColor: onboardingColors.gray[50],
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});
