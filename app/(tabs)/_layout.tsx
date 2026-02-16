import { Tabs } from 'expo-router';
import { usePlants } from '@plants/hooks/usePlants';
import { useWateringReminders } from '@plants/hooks/useWateringReminders';
import { CustomTabBar } from '@features/navigation';
import { COLORS } from '@tokens/colors';

export default function TabsLayout() {
  // Initialize watering reminders for all plants
  const { plants } = usePlants();
  useWateringReminders(plants, { enabled: true, autoReschedule: true });

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.neutral[50],
          borderBottomWidth: 1,
          borderBottomColor: COLORS.neutral[200],
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.text[900],
        },
        headerTintColor: COLORS.primary[600],
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerShown: true,
        }}
      />

      <Tabs.Screen
        name="garden"
        options={{
          title: 'Mes Plantes',
          headerShown: true,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progression',
          headerShown: true,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: true,
        }}
      />

      {/* Hidden Scanner route (controlled by FAB) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
