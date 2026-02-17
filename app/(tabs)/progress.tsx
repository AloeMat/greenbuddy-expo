import { View, Text, SafeAreaView, ScrollView } from 'react-native';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Progression 📊</Text>

        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Niveau</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>5</Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>XP Total</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>2,450 / 2,500</Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Achievements</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>8 / 25</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
