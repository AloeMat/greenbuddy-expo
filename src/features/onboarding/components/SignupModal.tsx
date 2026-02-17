/**
 * SignupModal Component
 * Affiche le formulaire d'inscription après completion de l'onboarding
 * (Correspond au modal de registration dans greenbuddy_dev)
 */

import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/features/auth/store/authStore';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { ErrorMessage } from '@/design-system/components/ErrorMessage';
import { Loading } from '@/design-system/components/Loading';
import { logger } from '@/lib/services/logger';

interface SignupModalProps {
  visible: boolean;
  onSignupSuccess: () => void;
  onCancel: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ visible, onSignupSuccess, onCancel }) => {
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      logger.info('Signup initiated from onboarding', { email });
      await signUp?.(email, password);

      logger.info('User registered successfully', { email });

      // Success alert
      Alert.alert(
        '✅ Inscription réussie!',
        'Bienvenue sur GreenBuddy! Votre compte a été créé.',
        [
          {
            text: 'Continuer',
            onPress: onSignupSuccess,
            style: 'default',
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
      logger.error('Signup failed', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <Loading message="Inscription en cours..." />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onCancel}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dernière étape!</Text>
          <Text style={styles.subtitle}>Créez votre compte GreenBuddy pour sauvegarder votre progression</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && <ErrorMessage message={error} />}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Input
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <Input
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <Text style={styles.hint}>Minimum 8 caractères</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer mot de passe</Text>
            <Input
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Button
            label="S'inscrire et continuer"
            onPress={handleSignup}
            style={styles.signupButton}
            disabled={loading}
          />

          <Button
            label="Passer cette étape"
            onPress={onCancel}
            style={styles.skipButton}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F0',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A27',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5A27',
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 4,
    marginTop: 4,
  },
  signupButton: {
    marginTop: 16,
  },
  skipButton: {
    marginTop: 8,
  },
});
