import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Droplet, Sun, Thermometer, Leaf, Lock } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';

export default function Page7() {
  const { setCurrentPage, plantName, identifiedPlant, markPageComplete } = useOnboardingStore();

  useEffect(() => {
    trackPageView('page7');
    setCurrentPage('page7');
  }, [setCurrentPage]);

  const handleDisabledAction = () => {
    Alert.alert(
      'Actions verrouillées',
      'Créez un compte pour débloquer toutes les actions et sauvegarder votre plante.',
      [{ text: 'OK' }]
    );
  };

  const handleContinue = () => {
    markPageComplete('page7');
    router.push('/onboarding/page9');
  };

  return (
    <ScrollView testID="onboarding-page7" style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View testID="progress-bar" style={{ height: 8, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${PAGE_PROGRESS.page7}%` }}
          />
        </View>
        <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 12/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={{ fontSize: 30, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 8 }}
        >
          Voici mon plan de soins
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginBottom: 8 }}
        >
          Aujourd'hui, {plantName} a besoin de...
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(600)}
          style={{ fontSize: 14, color: onboardingColors.text.muted, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' }}
        >
          Actions disponibles après création du compte
        </Animated.Text>

        {/* Plant info card */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: onboardingColors.gray[200] }}
        >
          <View style={{ gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: onboardingColors.text.primary }}>{plantName}</Text>
            <Text style={{ fontSize: 14, color: onboardingColors.text.secondary }}>{identifiedPlant?.scientificName}</Text>
          </View>

          {/* Health bar */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.secondary }}>Santé</Text>
              <Text style={{ fontSize: 14, color: onboardingColors.green[500], fontWeight: '600' }}>80%</Text>
            </View>
            <View style={{ height: 12, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: '80%' }} />
            </View>
          </View>
        </Animated.View>

        {/* Care actions */}
        <Animated.Text
          entering={FadeInDown.delay(1000)}
          style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 12 }}
        >
          Soins recommandés
        </Animated.Text>

        <View style={{ gap: 12, marginBottom: 32 }}>
          {/* Water action */}
          <Animated.View entering={FadeInDown.delay(1100).springify()}>
            <TouchableOpacity
              onPress={handleDisabledAction}
              disabled
              style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, borderWidth: 2, borderColor: onboardingColors.gray[200], flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.6 }}
            >
              <View style={{ backgroundColor: '#DBEAFE', borderRadius: 8, padding: 12 }}>
                <Droplet size={20} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: onboardingColors.text.primary }}>Arrosage</Text>
                <Text style={{ fontSize: 12, color: onboardingColors.text.muted }}>Dans 3 jours</Text>
              </View>
              <Lock size={16} color="#999" />
            </TouchableOpacity>
          </Animated.View>

          {/* Sun action */}
          <Animated.View entering={FadeInDown.delay(1200).springify()}>
            <TouchableOpacity
              onPress={handleDisabledAction}
              disabled
              style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, borderWidth: 2, borderColor: onboardingColors.gray[200], flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.6 }}
            >
              <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 12 }}>
                <Sun size={20} color="#FBBF24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: onboardingColors.text.primary }}>Ensoleillement</Text>
                <Text style={{ fontSize: 12, color: onboardingColors.text.muted }}>Luminosité: OK ✓</Text>
              </View>
              <Lock size={16} color="#999" />
            </TouchableOpacity>
          </Animated.View>

          {/* Temperature action */}
          <Animated.View entering={FadeInDown.delay(1300).springify()}>
            <TouchableOpacity
              onPress={handleDisabledAction}
              disabled
              style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, borderWidth: 2, borderColor: onboardingColors.gray[200], flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.6 }}
            >
              <View style={{ backgroundColor: '#FFEDD5', borderRadius: 8, padding: 12 }}>
                <Thermometer size={20} color="#FB923C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: onboardingColors.text.primary }}>Température</Text>
                <Text style={{ fontSize: 12, color: onboardingColors.text.muted }}>20°C (OK)</Text>
              </View>
              <Lock size={16} color="#999" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Upcoming tasks preview */}
        <Animated.Text
          entering={FadeInDown.delay(1400)}
          style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 12 }}
        >
          Prochaines tâches
        </Animated.Text>

        <View style={{ gap: 8, marginBottom: 32 }}>
          {['Vérifier l\'humidité', 'Rotation de la plante'].map((task, index) => (
            <Animated.View
              key={task}
              entering={FadeInDown.delay(1500 + index * 100).springify()}
              style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.6, borderWidth: 1, borderColor: onboardingColors.gray[200] }}
            >
              <Leaf size={16} color="#999" />
              <Text style={{ fontSize: 14, color: onboardingColors.text.secondary }}>{task}</Text>
              <Lock size={14} color="#999" style={{ marginLeft: 'auto' }} />
            </Animated.View>
          ))}
        </View>

        {/* Note */}
        <Animated.View
          entering={FadeInDown.delay(1700)}
          style={{ backgroundColor: onboardingColors.green[50], borderLeftWidth: 4, borderLeftColor: onboardingColors.green[500], borderBottomRightRadius: 8, borderTopRightRadius: 8, padding: 16, marginBottom: 32 }}
        >
          <Text style={{ fontSize: 14, color: onboardingColors.text.primary }}>
            💡 <Text style={{ fontWeight: '600' }}>Info:</Text> Créez un compte pour accéder à tous les soins, recevoir des rappels et suivre la santé de votre plante en temps réel.
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Animated.View entering={FadeInDown.delay(1800)}>
          <TouchableOpacity
            testID="button-continue"
            onPress={handleContinue}
            style={{ backgroundColor: onboardingColors.green[500], borderRadius: 8, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Sauvegarder ma plante</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
