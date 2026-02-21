import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/authStore';
import { StatsGrid } from '@/features/gamification/components/StatsGrid';
import { DailyCheckInButton } from '@/features/gamification/components/DailyCheckInButton';
import { DailyTipsCard } from '@/features/dashboard/components/DailyTipsCard';
import { AlertsCard } from '@/features/dashboard/components/AlertsCard';
import { UpcomingWateringsCard } from '@/features/dashboard/components/UpcomingWateringsCard';
import { COLORS } from '@/design-system/tokens/colors';
import { typography } from '@/design-system/tokens/typography';

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
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral['50'] }}>
      <ScrollView style={{ paddingBottom: insets.bottom + 70 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ ...typography.heading.h2, color: COLORS.text['900'] }}>Bienvenue 👋</Text>
          <Text style={{ ...typography.body.md, color: COLORS.text['500'], marginTop: 4 }}>
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
