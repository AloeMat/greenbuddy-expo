import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import * as Haptics from 'expo-haptics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { useAuth } from '@auth/store';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';
import { onboardingColors } from '@design-system/onboarding/colors';
import { page9Schema, type Page9FormData } from '@lib/validation/onboarding';
import { FeedbackModal } from '@onboarding/components';

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  testID: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  editable?: boolean;
  enterDelay: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  testID,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  enterDelay,
}) => (
  <Animated.View entering={FadeInDown.delay(enterDelay)} style={{ marginBottom: spacing.lg }}>
    <Text style={{ fontSize: 14, fontWeight: '600', color: onboardingColors.text.primary, marginBottom: spacing.sm }}>
      {label}
    </Text>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: error ? onboardingColors.error : onboardingColors.gray[200],
        borderRadius: radius.sm,
        backgroundColor: editable ? 'white' : onboardingColors.gray[100],
        paddingHorizontal: spacing.md,
        height: spacing.input.height,
      }}
    >
      <View style={{ marginRight: spacing.md }}>
        {icon}
      </View>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        style={{
          flex: 1,
          fontSize: 16,
          color: onboardingColors.text.primary,
        }}
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholderTextColor={onboardingColors.text.muted}
        secureTextEntry={secureTextEntry}
      />
    </View>
    {error && (
      <Text style={{ color: onboardingColors.error, fontSize: 12, marginTop: spacing.xs }}>
        {error}
      </Text>
    )}
  </Animated.View>
);

export default function Page9() {
  const { setCurrentPage, plantName, addXP, markPageComplete } = useOnboardingStore();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Service d\'authentification indisponible');
      setErrorModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await signUp(data.email, data.password);

      addXP(10);
      markPageComplete('page9');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/onboarding/page10');
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        error instanceof Error ? error.message : 'Erreur lors de la création du compte';
      setErrorMessage(msg);
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <>
      <ScrollView
        testID="onboarding-page9"
        style={{ flex: 1, backgroundColor: onboardingColors.green[50] }}
        keyboardShouldPersistTaps="handled"
        scrollIndicatorInsets={{ right: 1 }}
      >
        {/* Header with progress bar */}
        <View style={{ paddingTop: spacing['5xl'], paddingHorizontal: spacing['2xl'] }}>
          <View
            testID="progress-bar"
            style={{
              height: 12,
              backgroundColor: onboardingColors.gray[200],
              borderRadius: radius.full,
              overflow: 'hidden',
              marginBottom: spacing.sm,
            }}
          >
            <Animated.View
              entering={FadeIn}
              style={{
                height: '100%',
                backgroundColor: onboardingColors.green[500],
                width: `${PAGE_PROGRESS.page9}%`,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: onboardingColors.text.muted, textAlign: 'right' }}>
            Étape 13/14
          </Text>
        </View>

        {/* Main content */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{ paddingHorizontal: spacing['2xl'], paddingVertical: spacing['3xl'] }}
        >
          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(200)}
            style={{
              fontSize: 30,
              fontWeight: 'bold',
              color: onboardingColors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            Sauvegardez {plantName}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            entering={FadeInDown.delay(400)}
            style={{
              fontSize: 16,
              color: onboardingColors.text.secondary,
              textAlign: 'center',
              marginBottom: spacing['3xl'],
            }}
          >
            Créez un compte pour sauvegarder vos plantes et recevoir des alertes
          </Animated.Text>

          {/* Form Fields */}
          <InputField
            label="Adresse email"
            icon={<Mail size={20} color={onboardingColors.text.muted} />}
            error={errors.email?.message}
            testID="input-email"
            value={watch('email')}
            onChangeText={(value) => setValue('email', value)}
            placeholder="votre@email.com"
            keyboardType="email-address"
            editable={!isLoading}
            enterDelay={600}
          />

          <InputField
            label="Mot de passe"
            icon={<Lock size={20} color={onboardingColors.text.muted} />}
            error={errors.password?.message}
            testID="input-password"
            value={watch('password')}
            onChangeText={(value) => setValue('password', value)}
            placeholder="••••••"
            secureTextEntry
            editable={!isLoading}
            enterDelay={800}
          />

          <InputField
            label="Confirmer le mot de passe"
            icon={<Lock size={20} color={onboardingColors.text.muted} />}
            error={errors.confirmPassword?.message}
            testID="input-confirm-password"
            value={watch('confirmPassword')}
            onChangeText={(value) => setValue('confirmPassword', value)}
            placeholder="••••••"
            secureTextEntry
            editable={!isLoading}
            enterDelay={1000}
          />

          {/* Info box */}
          <Animated.View
            entering={FadeInDown.delay(1200)}
            style={{
              backgroundColor: onboardingColors.green[50],
              borderLeftWidth: 4,
              borderLeftColor: onboardingColors.green[500],
              borderBottomRightRadius: radius.sm,
              borderTopRightRadius: radius.sm,
              padding: spacing.md,
              marginBottom: spacing['3xl'],
            }}
          >
            <Text style={{ fontSize: 14, color: onboardingColors.text.primary, lineHeight: 20 }}>
              🔒 Vos données sont sécurisées et ne seront jamais partagées sans votre consentement.
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Footer button */}
        <View style={{ paddingHorizontal: spacing['2xl'], paddingBottom: spacing['3xl'] }}>
          <Animated.View entering={FadeInDown.delay(1400)}>
            <TouchableOpacity
              testID="button-signup"
              activeOpacity={0.7}
              onPress={handleSignUp}
              disabled={isLoading || !isValid}
              style={{
                borderRadius: radius.sm,
                paddingVertical: spacing.lg,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: spacing.sm,
                backgroundColor:
                  isLoading || !isValid ? onboardingColors.gray[200] : onboardingColors.green[500],
              }}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading || !isValid }}
              accessibilityLabel="Créer mon compte"
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>
                    Création en cours...
                  </Text>
                </>
              ) : (
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>
                  Créer mon compte
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <FeedbackModal
        visible={errorModalVisible}
        title="Erreur"
        message={errorMessage}
        buttonText="D'accord"
        onConfirm={() => setErrorModalVisible(false)}
      />
    </>
  );
}
