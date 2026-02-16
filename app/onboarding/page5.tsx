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
import { onboardingColors } from '@design-system/onboarding/colors';

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
      setErrorMsg('⏳ La caméra se charge... Réessaye dans 2 secondes');
      return;
    }

    setIsCapturing(true);
    setErrorMsg('');

    try {
      // Request permissions FIRST
      const perms = await cameraService.requestPermissions();
      if (!perms.granted) {
        throw new Error('Permissions caméra refusées: ' + perms.message);
      }

      // Wait for camera to be fully ready
      await cameraService.waitForCameraReady(5000);

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
      const identification = await plantNetService.identifyPlant(base64);

      // Save to store
      setPlantData(base64, identification);
      addXP(5);
      markPageComplete('page5');

      // Navigate to identification loading page
      router.push('/onboarding/page5_identification');
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Erreur inconnue';
      setState('error');
      setErrorMsg(errorText);
      setIsCapturing(false);
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
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView
          ref={cameraRef}
          facing="back"
          style={{ flex: 1 }}
          onCameraReady={handleCameraReady}
        >
          {/* Progress bar */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 48 }}>
            <View style={{ height: 8, backgroundColor: 'rgba(229, 231, 235, 0.5)', borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
              <Animated.View
                entering={FadeIn}
                style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${PAGE_PROGRESS.page5}%` }}
              />
            </View>
            <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'right' }}>Étape 7/14</Text>
          </View>

          {/* Capture button */}
          <View style={{ position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleTakePicture}
              disabled={isCapturing}
              style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: onboardingColors.green[500], alignItems: 'center', justifyContent: 'center' }}
            >
              {isCapturing ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Camera size={40} color="white" />
              )}
            </TouchableOpacity>
            <Text style={{ color: 'white', marginTop: 16, textAlign: 'center' }}>Appuyez pour prendre une photo</Text>
          </View>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 48, left: 24, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 8 }}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View style={{ height: 8, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${PAGE_PROGRESS.page5}%` }}
          />
        </View>
        <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 7/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={{ fontSize: 30, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 8 }}
        >
          Ajoutons votre première plante
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginBottom: 8 }}
        >
          Prenez une photo ou choisissez dans votre galerie. On va l'identifier ensemble.
        </Animated.Text>

        {/* Note */}
        <Animated.Text
          entering={FadeInDown.delay(600)}
          style={{ fontSize: 14, color: onboardingColors.text.muted, textAlign: 'center', marginBottom: 32 }}
        >
          Pas besoin de compte pour l'instant, on sauvegarde tout localement.
        </Animated.Text>

        {/* Error message */}
        {errorMsg && (
          <Animated.Text style={{ color: onboardingColors.error, textAlign: 'center', marginBottom: 16 }}>{errorMsg}</Animated.Text>
        )}
      </Animated.View>

      {/* Action buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}>
        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            onPress={() => setState('camera_open')}
            disabled={isCapturing}
            style={{ backgroundColor: onboardingColors.green[500], borderRadius: 8, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <Camera size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Prendre une photo</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity
            disabled
            style={{ borderWidth: 2, borderColor: onboardingColors.green[500], borderRadius: 8, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: 0.5 }}
          >
            <ImageIcon size={20} color={onboardingColors.green[700]} />
            <Text style={{ color: onboardingColors.green[700], fontWeight: '600', fontSize: 18 }}>Choisir dans la galerie</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1200)}>
          <TouchableOpacity
            disabled
            style={{ borderWidth: 2, borderColor: onboardingColors.green[500], borderRadius: 8, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: 0.5 }}
          >
            <Search size={20} color={onboardingColors.green[700]} />
            <Text style={{ color: onboardingColors.green[700], fontWeight: '600', fontSize: 18 }}>Je connais le nom</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
