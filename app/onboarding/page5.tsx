import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { CameraView } from 'expo-camera';
import { Camera, Image as ImageIcon, Search } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { cameraService } from '@plants/services/camera';
import { plantNetService } from '@plants/services/plantnet';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

type CameraState = 'ready' | 'error' | 'camera_open';

export default function Page5() {
  const { setCurrentPage, setPlantData, addXP, markPageComplete } = useOnboardingStore();
  const cameraRef = useRef<CameraView>(null);
  const [state, setState] = useState<CameraState>('ready');
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    trackPageView('page5');
    setCurrentPage('page5');
  }, [setCurrentPage]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraService.setRef(cameraRef.current);
    }

    return () => {
      cameraService.setRef(null);
      cameraService.setReady(false);
    };
  }, []);

  const handleTakePicture = async () => {
    if (!cameraRef.current) {
      const msg = 'Camera reference not available';
      logger.error(msg);
      setState('error');
      setErrorMsg(msg);
      return;
    }

    setIsCapturing(true);
    setErrorMsg('');

    try {
      // Request permissions
      const perms = await cameraService.requestPermissions();
      if (!perms.granted) {
        throw new Error('Camera permissions denied: ' + perms.message);
      }

      // Capture photo
      const photo = await cameraService.takePicture();
      if (!photo) {
        throw new Error('Camera capture returned empty photo');
      }

      // Compress image
      const compressed = await cameraService.compressImage(photo, 2048);

      // Get base64
      const base64 = await cameraService.getBase64(compressed);

      // Identify plant
      logger.info('🌿 Identifying plant with PlantNet + Gemini...');
      const identification = await plantNetService.identifyPlant(base64);

      // Save to store
      setPlantData(base64, identification);
      addXP(5);
      markPageComplete('page5');

      // Navigate to identification loading page
      router.push('/onboarding/page5_identification');
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('📸 Camera error:', errorText);
      setState('error');
      setErrorMsg(errorText);
    }
  };

  // When camera is ready, transition to open state
  const handleCameraReady = () => {
    if (state === 'ready') {
      setState('camera_open');
    }
  };

  if (state === 'camera_open') {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          facing="back"
          className="flex-1"
          onCameraReady={handleCameraReady}
        >
          {/* Progress bar */}
          <View className="absolute top-0 left-0 right-0 px-6 pt-12">
            <View className="h-2 bg-gray-300 rounded-full overflow-hidden mb-2">
              <Animated.View
                entering={FadeIn}
                className="h-full bg-green-500"
                style={{ width: `${PAGE_PROGRESS.page5}%` }}
              />
            </View>
            <Text className="text-xs text-gray-300 text-right">Étape 7/14</Text>
          </View>

          {/* Capture button */}
          <View className="absolute bottom-8 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={handleTakePicture}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-green-500 items-center justify-center"
            >
              {isCapturing ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Camera size={40} color="white" />
              )}
            </TouchableOpacity>
            <Text className="text-white mt-4 text-center">Appuyez pour prendre une photo</Text>
          </View>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 bg-black/50 rounded-full p-2"
          >
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-green-50">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page5}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 7/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="flex-1 justify-center px-6">
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="text-3xl font-bold text-green-900 text-center mb-2"
        >
          Ajoutons votre première plante
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-base text-gray-700 text-center mb-2"
        >
          Prenez une photo ou choisissez dans votre galerie. On va l'identifier ensemble.
        </Animated.Text>

        {/* Note */}
        <Animated.Text
          entering={FadeInDown.delay(600)}
          className="text-sm text-gray-500 text-center mb-8"
        >
          Pas besoin de compte pour l'instant, on sauvegarde tout localement.
        </Animated.Text>

        {/* Error message */}
        {errorMsg && (
          <Animated.Text className="text-red-600 text-center mb-4">{errorMsg}</Animated.Text>
        )}
      </Animated.View>

      {/* Action buttons */}
      <View className="px-6 pb-8 gap-3">
        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            onPress={handleTakePicture}
            disabled={isCapturing}
            className="bg-green-500 rounded-lg py-4 items-center flex-row justify-center gap-2"
          >
            <Camera size={20} color="white" />
            <Text className="text-white font-semibold text-lg">Prendre une photo</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity
            disabled
            className="border-2 border-green-500 rounded-lg py-4 items-center flex-row justify-center gap-2 opacity-50"
          >
            <ImageIcon size={20} color="#059669" />
            <Text className="text-green-700 font-semibold text-lg">Choisir dans la galerie</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1200)}>
          <TouchableOpacity
            disabled
            className="border-2 border-green-500 rounded-lg py-4 items-center flex-row justify-center gap-2 opacity-50"
          >
            <Search size={20} color="#059669" />
            <Text className="text-green-700 font-semibold text-lg">Je connais le nom</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
