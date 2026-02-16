import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Droplet, Sun, Thermometer, Leaf, Lock } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';

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
    <ScrollView testID="onboarding-page7" className="flex-1 bg-green-50">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View testID="progress-bar" className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page7}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 12/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="px-6 py-8">
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="text-3xl font-bold text-green-900 text-center mb-2"
        >
          Voici mon plan de soins
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-base text-gray-700 text-center mb-2"
        >
          Aujourd'hui, {plantName} a besoin de...
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(600)}
          className="text-sm text-gray-500 text-center mb-8 italic"
        >
          Actions disponibles après création du compte
        </Animated.Text>

        {/* Plant info card */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200"
        >
          <View className="gap-2 mb-4">
            <Text className="text-xl font-bold text-green-900">{plantName}</Text>
            <Text className="text-sm text-gray-600">{identifiedPlant?.scientificName}</Text>
          </View>

          {/* Health bar */}
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-gray-700">Santé</Text>
              <Text className="text-sm text-green-600 font-semibold">80%</Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View className="h-full bg-green-500" style={{ width: '80%' }} />
            </View>
          </View>
        </Animated.View>

        {/* Care actions */}
        <Animated.Text
          entering={FadeInDown.delay(1000)}
          className="text-sm font-semibold text-gray-900 mb-3"
        >
          Soins recommandés
        </Animated.Text>

        <View className="gap-3 mb-8">
          {/* Water action */}
          <Animated.View entering={FadeInDown.delay(1100).springify()}>
            <TouchableOpacity
              onPress={handleDisabledAction}
              disabled
              className="bg-white rounded-lg p-4 border-2 border-gray-200 flex-row items-center gap-3 opacity-60"
            >
              <View className="bg-blue-100 rounded-lg p-3">
                <Droplet size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Arrosage</Text>
                <Text className="text-xs text-gray-500">Dans 3 jours</Text>
              </View>
              <Lock size={16} color="#999" />
            </TouchableOpacity>
          </Animated.View>

          {/* Sun action */}
          <Animated.View entering={FadeInDown.delay(1200).springify()}>
            <TouchableOpacity
              onPress={handleDisabledAction}
              disabled
              className="bg-white rounded-lg p-4 border-2 border-gray-200 flex-row items-center gap-3 opacity-60"
            >
              <View className="bg-yellow-100 rounded-lg p-3">
                <Sun size={20} color="#FBBF24" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Ensoleillement</Text>
                <Text className="text-xs text-gray-500">Luminosité: OK ✓</Text>
              </View>
              <Lock size={16} color="#999" />
            </TouchableOpacity>
          </Animated.View>

          {/* Temperature action */}
          <Animated.View entering={FadeInDown.delay(1300).springify()}>
            <TouchableOpacity
              onPress={handleDisabledAction}
              disabled
              className="bg-white rounded-lg p-4 border-2 border-gray-200 flex-row items-center gap-3 opacity-60"
            >
              <View className="bg-orange-100 rounded-lg p-3">
                <Thermometer size={20} color="#FB923C" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Température</Text>
                <Text className="text-xs text-gray-500">20°C (OK)</Text>
              </View>
              <Lock size={16} color="#999" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Upcoming tasks preview */}
        <Animated.Text
          entering={FadeInDown.delay(1400)}
          className="text-sm font-semibold text-gray-900 mb-3"
        >
          Prochaines tâches
        </Animated.Text>

        <View className="gap-2 mb-8">
          {['Vérifier l\'humidité', 'Rotation de la plante'].map((task, index) => (
            <Animated.View
              key={task}
              entering={FadeInDown.delay(1500 + index * 100).springify()}
              className="bg-white rounded-lg p-3 flex-row items-center gap-3 opacity-60 border border-gray-200"
            >
              <Leaf size={16} color="#999" />
              <Text className="text-sm text-gray-700">{task}</Text>
              <Lock size={14} color="#999" className="ml-auto" />
            </Animated.View>
          ))}
        </View>

        {/* Note */}
        <Animated.View
          entering={FadeInDown.delay(1700)}
          className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-8"
        >
          <Text className="text-sm text-green-900">
            💡 <Text className="font-semibold">Info:</Text> Créez un compte pour accéder à tous les soins, recevoir des rappels et suivre la santé de votre plante en temps réel.
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View className="px-6 pb-8">
        <Animated.View entering={FadeInDown.delay(1800)}>
          <TouchableOpacity
            testID="button-continue"
            onPress={handleContinue}
            className="bg-green-500 rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Sauvegarder ma plante</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
