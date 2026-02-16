import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { useAuth } from '@auth/store';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';
import { page9Schema, type Page9FormData } from '@lib/validation/onboarding';

export default function Page9() {
  const { setCurrentPage, plantName, addXP, markPageComplete } = useOnboardingStore();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<Page9FormData>({
    resolver: zodResolver(page9Schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    trackPageView('page9');
    setCurrentPage('page9');
  }, [setCurrentPage]);

  const handleSignUp = handleSubmit(async (data) => {
    if (!signUp) {
      Alert.alert('Erreur', 'Service d\'authentification indisponible', [{ text: 'OK' }]);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(data.email, data.password);

      addXP(10);
      markPageComplete('page9');

      router.push('/onboarding/page10');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur lors de la création du compte';
      Alert.alert('Erreur', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <ScrollView testID="onboarding-page9" style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}>
      {/* Header with progress bar */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24 }}>
        <View testID="progress-bar" style={{ height: 8, backgroundColor: onboardingColors.gray[200], borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: onboardingColors.green[500], width: `${PAGE_PROGRESS.page9}%` }}
          />
        </View>
        <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>Étape 13/14</Text>
      </View>

      {/* Main content */}
      <Animated.View entering={FadeInDown.springify()} style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={{ fontSize: 30, fontWeight: 'bold', color: onboardingColors.text.primary, textAlign: 'center', marginBottom: 8 }}
        >
          Sauvegardez {plantName}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(400)}
          style={{ fontSize: 16, color: onboardingColors.text.secondary, textAlign: 'center', marginBottom: 32 }}
        >
          Créez un compte pour sauvegarder vos plantes et recevoir des alertes
        </Animated.Text>

        {/* Email field */}
        <Animated.View entering={FadeInDown.delay(600)} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 8 }}>Adresse email</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: errors.email ? onboardingColors.error : onboardingColors.gray[200], borderRadius: 8, backgroundColor: 'white' }}>
            <Mail size={20} color={onboardingColors.text.muted} style={{ marginLeft: 12 }} />
            <TextInput
              testID="input-email"
              value={watch('email')}
              onChangeText={(value) => setValue('email', value)}
              placeholder="votre@email.com"
              editable={!isLoading}
              style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={onboardingColors.text.muted}
            />
          </View>
          {errors.email && <Text style={{ color: onboardingColors.error, fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>}
        </Animated.View>

        {/* Password field */}
        <Animated.View entering={FadeInDown.delay(800)} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 8 }}>Mot de passe</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: errors.password ? onboardingColors.error : onboardingColors.gray[200], borderRadius: 8, backgroundColor: 'white' }}>
            <Lock size={20} color={onboardingColors.text.muted} style={{ marginLeft: 12 }} />
            <TextInput
              testID="input-password"
              value={watch('password')}
              onChangeText={(value) => setValue('password', value)}
              placeholder="••••••"
              editable={!isLoading}
              style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 }}
              secureTextEntry
              placeholderTextColor={onboardingColors.text.muted}
            />
          </View>
          {errors.password && <Text style={{ color: onboardingColors.error, fontSize: 12, marginTop: 4 }}>{errors.password.message}</Text>}
        </Animated.View>

        {/* Confirm password field */}
        <Animated.View entering={FadeInDown.delay(1000)} style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: 8 }}>Confirmer le mot de passe</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: errors.confirmPassword ? onboardingColors.error : onboardingColors.gray[200], borderRadius: 8, backgroundColor: 'white' }}>
            <Lock size={20} color={onboardingColors.text.muted} style={{ marginLeft: 12 }} />
            <TextInput
              testID="input-confirm-password"
              value={watch('confirmPassword')}
              onChangeText={(value) => setValue('confirmPassword', value)}
              placeholder="••••••"
              editable={!isLoading}
              style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 }}
              secureTextEntry
              placeholderTextColor={onboardingColors.text.muted}
            />
          </View>
          {errors.confirmPassword && (
            <Text style={{ color: onboardingColors.error, fontSize: 12, marginTop: 4 }}>{errors.confirmPassword.message}</Text>
          )}
        </Animated.View>

        {/* Info box */}
        <Animated.View
          entering={FadeInDown.delay(1200)}
          style={{ backgroundColor: onboardingColors.green[50], borderLeftWidth: 4, borderLeftColor: onboardingColors.green[500], borderBottomRightRadius: 8, borderTopRightRadius: 8, padding: 16, marginBottom: 32 }}
        >
          <Text style={{ fontSize: 14, color: onboardingColors.text.primary }}>
            🔒 Vos données sont sécurisées et ne seront jamais partagées sans votre consentement.
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Animated.View entering={FadeInDown.delay(1400)}>
          <TouchableOpacity
            testID="button-signup"
            onPress={handleSignUp}
            disabled={isLoading || !isValid}
            style={{
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: isLoading || !isValid ? onboardingColors.gray[200] : onboardingColors.green[500]
            }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Création en cours...</Text>
              </>
            ) : (
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Créer mon compte</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
