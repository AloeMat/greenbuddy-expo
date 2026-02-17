import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Profil 👤</Text>

        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Email</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 4 }}>{user?.email || 'Non disponible'}</Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Langue</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 4 }}>Français</Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Thème</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 4 }}>Clair</Text>
        </View>

        <TouchableOpacity
          style={{
            padding: 12,
            backgroundColor: '#2D5A27',
            borderRadius: 8,
          }}
          onPress={() => {
            const { logout } = useAuthStore.getState();
            logout();
            router.replace('/(auth)');
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
            Paramètres
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
