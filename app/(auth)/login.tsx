import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/store/authStore';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { ErrorMessage } from '@/design-system/components/ErrorMessage';
import { Loading } from '@/design-system/components/Loading';
import { logger } from '@/lib/services/logger';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = handleSubmit(async (data) => {
    setLoading(true);
    setApiError(null);

    try {
      await signIn!(data.email, data.password);
      logger.info('User logged in successfully', { email: data.email });
      router.replace('/(tabs)/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setApiError(errorMessage);
      logger.error('Login failed', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  });

  if (loading) {
    return <Loading message="Connexion en cours..." />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GreenBuddy</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
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

          <Button
            label="Se connecter"
            onPress={handleLogin}
            style={styles.loginButton}
            disabled={loading}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte? </Text>
          <Link href="/(auth)/register" asChild>
            <Text style={styles.link}>{"S'inscrire"}</Text>
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
  loginButton: {
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
