import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { useAuth } from '@auth/store';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { logger } from '@lib/services/logger';

export default function Page9() {
  const { setCurrentPage, plantName, addXP, markPageComplete } = useOnboardingStore();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    trackPageView('page9');
    setCurrentPage('page9');
  }, [setCurrentPage]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 6) {
      newErrors.password = 'Au moins 6 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    if (!signUp) {
      logger.error('❌ SignUp function not available');
      Alert.alert('Erreur', 'Service d\'authentification indisponible', [{ text: 'OK' }]);
      return;
    }

    setIsLoading(true);
    try {
      logger.info('📝 Creating account...');
      await signUp(email, password);

      addXP(10);
      markPageComplete('page9');

      logger.info('✅ Account created successfully');

      // Navigate to page10
      router.push('/onboarding/page10');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur lors de la création du compte';
      logger.error('❌ Signup error:', errorMessage);
      Alert.alert('Erreur', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView testID="onboarding-page9" className="flex-1 bg-green-50">
      {/* Header with progress bar */}
      <View className="pt-12 px-6">
        <View testID="progress-bar" className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${PAGE_PROGRESS.page9}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 text-right">Étape 13/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} className="px-6 py-8">
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="text-3xl font-bold text-green-900 text-center mb-2"
        >
          Sauvegardez {plantName}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          className="text-base text-gray-700 text-center mb-8"
        >
          Créez un compte pour sauvegarder vos plantes et recevoir des alertes
        </Animated.Text>

        {/* Email field */}
        <Animated.View entering={FadeInDown.delay(600)} className="mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Adresse email</Text>
          <View className="flex-row items-center border-2 border-gray-300 rounded-lg bg-white">
            <Mail size={20} color="#999" className="ml-3" />
            <TextInput
              testID="input-email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              editable={!isLoading}
              className="flex-1 px-3 py-3 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>
          {errors.email && <Text className="text-red-600 text-xs mt-1">{errors.email}</Text>}
        </Animated.View>

        {/* Password field */}
        <Animated.View entering={FadeInDown.delay(800)} className="mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Mot de passe</Text>
          <View className="flex-row items-center border-2 border-gray-300 rounded-lg bg-white">
            <Lock size={20} color="#999" className="ml-3" />
            <TextInput
              testID="input-password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              editable={!isLoading}
              className="flex-1 px-3 py-3 text-base"
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>
          {errors.password && <Text className="text-red-600 text-xs mt-1">{errors.password}</Text>}
        </Animated.View>

        {/* Confirm password field */}
        <Animated.View entering={FadeInDown.delay(1000)} className="mb-8">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Confirmer le mot de passe</Text>
          <View className="flex-row items-center border-2 border-gray-300 rounded-lg bg-white">
            <Lock size={20} color="#999" className="ml-3" />
            <TextInput
              testID="input-confirm-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••"
              editable={!isLoading}
              className="flex-1 px-3 py-3 text-base"
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>
          {errors.confirmPassword && (
            <Text className="text-red-600 text-xs mt-1">{errors.confirmPassword}</Text>
          )}
        </Animated.View>

        {/* Info box */}
        <Animated.View
          entering={FadeInDown.delay(1200)}
          className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-8"
        >
          <Text className="text-sm text-green-900">
            🔒 Vos données sont sécurisées et ne seront jamais partagées sans votre consentement.
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View className="px-6 pb-8">
        <Animated.View entering={FadeInDown.delay(1400)}>
          <TouchableOpacity
            testID="button-signup"
            onPress={handleSignUp}
            disabled={isLoading}
            className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${
              isLoading ? 'bg-gray-300' : 'bg-green-500'
            }`}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="white" />
                <Text className="text-white font-semibold text-lg">Création en cours...</Text>
              </>
            ) : (
              <Text className="text-white font-semibold text-lg">Créer mon compte</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
