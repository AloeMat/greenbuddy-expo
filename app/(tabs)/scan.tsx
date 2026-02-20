import React, { useState, useRef } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { CameraOverlay } from '@/features/plants/components/scan/CameraOverlay';
import { LoadingAnalysis } from '@/features/plants/components/scan/LoadingAnalysis';
import { ErrorState } from '@/features/plants/components/scan/ErrorState';
import { PlantResult } from '@/features/plants/components/scan/PlantResult';
import { cameraService } from '@/features/plants/services/camera';
import { plantNetService } from '@/features/plants/services/plantnet';
import { geminiService } from '@/lib/services/gemini';
import { logger } from '@/lib/services/logger';
import type { PlantIdentificationResult } from '@/features/plants/services/plantnet';
import type { PlantAnalysis } from '@/types';

type ScanState = 'camera' | 'loading' | 'result' | 'error';

interface PlantData {
  identification: PlantIdentificationResult;
  analysis: {
    personality?: string;
    healthScore: number;
    soins: {
      wateringFrequencyDays: number;
      lightRequirements: string;
      temperatureMin: number;
      temperatureMax: number;
    };
    dialogue: {
      presentation: string;
    };
  };
  personality: {
    emotionState: string;
  };
}

export default function ScanScreen() {
  const router = useRouter();
  const { addPlant } = usePlants();

  const cameraRef = useRef<CameraView>(null);
  const [state, setState] = useState<ScanState>('camera');
  const [error, setError] = useState<string>('');
  const [plantData, setPlantData] = useState<PlantData | null>(null);

  // Request camera permissions
  const requestCameraPermissions = async () => {
    try {
      const result = await cameraService.requestPermissions();
      if (!result.granted) {
        setError('Permissions caméra requises pour scanner des plantes');
        setState('error');
        return false;
      }
      return true;
    } catch (err) {
      logger.error('❌ Camera permission error:', err);
      setError('Erreur lors de la demande de permissions caméra');
      setState('error');
      return false;
    }
  };

  // Capture photo and identify plant
  const handleCapture = async () => {
    try {
      // Check permissions
      const hasPermissions = await requestCameraPermissions();
      if (!hasPermissions) return;

      setState('loading');
      setError('');

      // Wait for camera to be ready
      await cameraService.waitForCameraReady();

      // Capture photo
      logger.info('📸 Capturing photo...');
      const photo = await cameraService.takePicture();
      logger.info('✅ Photo captured:', { uri: photo.uri });

      // Compress image
      const compressedPhoto = await cameraService.compressImage(photo, 2048);

      // Get base64
      const base64 = await cameraService.getBase64(compressedPhoto);

      // Identify plant via PlantNet or Gemini
      logger.info('🌿 Identifying plant...');
      const identification = await plantNetService.identifyPlant(base64);

      // Generate personality and care info via Gemini
      logger.info('🧠 Generating personality...');
      const geminiAnalysis = await geminiService.analyzeImage(base64);

      // Merge identification with analysis
      const analysisData: Partial<PlantAnalysis> = {
        commonName: geminiAnalysis.commonName || identification.commonName,
        personality: geminiAnalysis.personality || 'monstera',
        healthScore: geminiAnalysis.healthScore || 75,
        soins: {
          wateringFrequencyDays: geminiAnalysis.soins?.wateringFrequencyDays || 7,
          lightRequirements: geminiAnalysis.soins?.lightRequirements || 'indirect',
          temperatureMin: geminiAnalysis.soins?.temperatureMin || 15,
          temperatureMax: geminiAnalysis.soins?.temperatureMax || 25,
          humidity: geminiAnalysis.soins?.humidity || 'medium',
          fertilizerFrequencyDays: geminiAnalysis.soins?.fertilizerFrequencyDays || 30,
        },
        dialogue: {
          presentation: geminiAnalysis.dialogue?.presentation || `Bonjour ! Je suis un ${identification.commonName}.`,
          diagnosis: geminiAnalysis.dialogue?.diagnosis,
          needs: geminiAnalysis.dialogue?.needs,
        },
      };

      // Store plant data for display
      const plantResult: PlantData = {
        identification,
        analysis: {
          personality: analysisData.personality,
          healthScore: analysisData.healthScore || 75,
          soins: {
            wateringFrequencyDays: analysisData.soins?.wateringFrequencyDays || 7,
            lightRequirements: analysisData.soins?.lightRequirements || 'indirect',
            temperatureMin: analysisData.soins?.temperatureMin || 15,
            temperatureMax: analysisData.soins?.temperatureMax || 25,
          },
          dialogue: {
            presentation: analysisData.dialogue?.presentation || `Bonjour ! Je suis un ${identification.commonName}.`,
          },
        },
        personality: {
          emotionState: 'happy',
        },
      };

      setPlantData(plantResult);
      setState('result');
    } catch (err) {
      logger.error('❌ Scan error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'identification';
      setError(errorMsg);
      setState('error');
    }
  };

  // Add plant to garden
  const handleAddToGarden = async () => {
    if (!plantData) return;

    try {
      setState('loading');

      // Create plant object using correct Plant interface property names
      const newPlant = {
        nom_commun: plantData.identification.commonName,
        nom_scientifique: plantData.identification.scientificName,
        famille: plantData.identification.family,
        surnom: plantData.identification.commonName, // Use common name as default nickname
        personnalite: plantData.analysis.personality || 'succulente',
        sante_score: plantData.analysis.healthScore,
        arrosage_frequence_jours: plantData.analysis.soins.wateringFrequencyDays,
        lumiere: plantData.analysis.soins.lightRequirements,
        temperature_min: plantData.analysis.soins.temperatureMin,
        temperature_max: plantData.analysis.soins.temperatureMax,
      };

      // Add to database
      await addPlant(newPlant);

      logger.info('✅ Plant added to garden successfully');

      // Show success alert and navigate
      Alert.alert(
        '✅ Plante ajoutée !',
        `${plantData.identification.commonName} a été ajoutée à votre jardin avec succès. Vous avez gagné +50 XP !`,
        [
          {
            text: 'Voir mon jardin',
            onPress: () => router.push('/(tabs)/garden'),
          },
          {
            text: 'Scanner une autre',
            onPress: () => {
              setState('camera');
              setPlantData(null);
            },
          },
        ]
      );
    } catch (err) {
      logger.error('❌ Error adding plant:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la plante';
      Alert.alert('❌ Erreur', errorMsg);
      setState('result');
    }
  };

  // Render based on state
  if (state === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingAnalysis />
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ErrorState
          error={error}
          onRetry={() => {
            setState('camera');
            setError('');
            setPlantData(null);
          }}
        />
      </SafeAreaView>
    );
  }

  if (state === 'result' && plantData) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <PlantResult
          identification={plantData.identification}
          analysis={plantData.analysis}
          personality={plantData.personality}
          onAddToGarden={handleAddToGarden}
          onScanAgain={() => {
            setState('camera');
            setPlantData(null);
          }}
        />
      </SafeAreaView>
    );
  }

  // Camera state (default)
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        onCameraReady={() => {
          cameraService.setRef(cameraRef.current);
          cameraService.setReady(true);
        }}
      >
        <CameraOverlay onCapture={handleCapture} />
      </CameraView>
    </View>
  );
}
