import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@auth/store/authStore';
import { ActivityIndicator, View, Text } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔍 Index screen - isLoading:', isLoading, 'session:', !!session);

    if (isLoading) return;

    if (session) {
      console.log('✅ Session found, navigating to (tabs)');
      router.replace('/(tabs)');
    } else {
      console.log('➡️ No session, navigating to onboarding');
      router.replace('/onboarding');
    }
  }, [session, isLoading, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={{ marginTop: 20, fontSize: 14, color: '#666' }}>
        Chargement{isLoading ? '...' : ' terminé'}
      </Text>
    </View>
  );
}
