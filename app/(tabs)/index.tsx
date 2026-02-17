import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Bienvenue 👋</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
          Utilisateur: {user?.email || 'Non connecté'}
        </Text>

        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => router.push('/(tabs)/garden')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>🌱 Mes Plantes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>📊 Progression</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>👤 Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 24,
            }}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>📷 Scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#ff4444',
              borderRadius: 8,
            }}
            onPress={() => {
              logout();
              router.replace('/(auth)');
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
              Déconnexion
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
