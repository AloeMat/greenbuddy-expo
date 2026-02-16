import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@auth/store/authStore';
import { Input } from '@design-system/components/Input';
import { Button } from '@design-system/components/Button';
import { ErrorMessage } from '@design-system/components/ErrorMessage';
import { Loading } from '@design-system/components/Loading';
import { logger } from '@lib/services/logger';
import { registerSchema, type RegisterFormData } from '@lib/validation/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRegister = handleSubmit(async (data) => {
    setLoading(true);
    setApiError(null);

    try {
      await signUp!(data.email, data.password);
      logger.info('User registered successfully', { email: data.email });
      // Redirect to app (signup is now called from onboarding modal, not as separate flow)
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setApiError(errorMessage);
      logger.error('Registration failed', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  });

  if (loading) {
    return <Loading message="Inscription en cours..." />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GreenBuddy</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {apiError && <ErrorMessage message={apiError} />}

          <View>
            <Input
              label="Email"
              placeholder="votre@email.com"
              value={watch('email')}
              onChangeText={(value) => setValue('email', value)}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View>
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={watch('password')}
              onChangeText={(value) => setValue('password', value)}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          <View>
            <Input
              label="Confirmer mot de passe"
              placeholder="••••••••"
              value={watch('confirmPassword')}
              onChangeText={(value) => setValue('confirmPassword', value)}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
          </View>

          <Button
            label="S'inscrire"
            onPress={handleRegister}
            style={styles.registerButton}
            disabled={!isValid || loading}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà inscrit? </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.link}>Se connecter</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A27',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    marginBottom: 24,
    gap: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  link: {
    fontSize: 14,
    color: '#2D5A27',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});
