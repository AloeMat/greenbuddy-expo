import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/authStore';
import { StatsGrid } from '@/features/gamification/components/StatsGrid';
import { DailyCheckInButton } from '@/features/gamification/components/DailyCheckInButton';
import { DailyTipsCard } from '@/components/dashboard/DailyTipsCard';
import { AlertsCard } from '@/components/dashboard/AlertsCard';
import { UpcomingWateringsCard } from '@/components/dashboard/UpcomingWateringsCard';

/**
 * Dashboard Screen
 * Main dashboard showing:
 * - Daily check-in button
 * - Stats grid (XP, Level, Plants, Streak)
 * - Daily tip
 * - Alerts (plants in danger)
 * - Upcoming waterings
 */
export default function DashboardScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ paddingBottom: 80 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#000' }}>Bienvenue 👋</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            {user?.email || 'Non connecté'}
          </Text>
        </View>

        {/* Daily Check-in */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <DailyCheckInButton />
        </View>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Daily Tip */}
        <DailyTipsCard />

        {/* Alerts */}
        <AlertsCard />

        {/* Upcoming Waterings */}
        <UpcomingWateringsCard />
      </ScrollView>
    </SafeAreaView>
  );
}
