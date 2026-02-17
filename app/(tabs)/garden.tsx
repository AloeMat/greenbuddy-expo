import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function GardenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Mes Plantes 🌱</Text>

        <TouchableOpacity
          style={{
            padding: 16,
            backgroundColor: '#e8f5e9',
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Plante 1</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Santé: 85%</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 16,
            backgroundColor: '#e8f5e9',
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Plante 2</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Santé: 60%</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 16,
            backgroundColor: '#fff3cd',
            borderRadius: 8,
            marginTop: 20,
          }}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
            + Ajouter une plante
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
