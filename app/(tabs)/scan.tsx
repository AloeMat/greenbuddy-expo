import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 16, paddingBottom: 80 }}>
      <Text style={{ fontSize: 32, marginBottom: 16 }}>📷</Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Scanner de Plantes</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' }}>
        Prenez une photo pour identifier votre plante
      </Text>

      <TouchableOpacity
        style={{
          padding: 16,
          backgroundColor: '#2D5A27',
          borderRadius: 8,
          width: '100%',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
          Ouvrir la Caméra
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          padding: 12,
          marginTop: 12,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          width: '100%',
        }}
        onPress={() => router.back()}
      >
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>Retour</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
