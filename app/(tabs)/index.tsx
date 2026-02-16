// Dashboard Screen - Phase 3.3
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlants } from '@plants/hooks/usePlants';
import { GradientOverlay } from '@design-system/components/GradientOverlay';
import { DailyCheckInButton } from '@gamification/components/DailyCheckInButton';
import { logger } from '@lib/services/logger';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { plants } = usePlants();

  const stats = useMemo(() => {
    if (plants.length === 0) return { totalPlants: 0, avgHealth: 0, avgLevel: 0, urgentCount: 0, lowHealthCount: 0 };
    const totalHealth = plants.reduce((sum, p) => sum + p.sante_score, 0);
    const totalLevel = plants.reduce((sum, p) => sum + p.level, 0);
    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const urgentCount = plants.filter(p => {
      if (!p.next_watering_at) return false;
      return new Date(p.next_watering_at) <= in2Days;
    }).length;
    const lowHealthCount = plants.filter(p => p.sante_score < 50).length;
    return { totalPlants: plants.length, avgHealth: Math.round(totalHealth / plants.length), avgLevel: Math.round(totalLevel / plants.length), urgentCount, lowHealthCount };
  }, [plants]);

  const upcomingWaterings = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return plants
      .filter(p => {
        if (!p.next_watering_at) return false;
        const nextWatering = new Date(p.next_watering_at);
        return nextWatering >= now && nextWatering <= in7Days;
      })
      .sort((a, b) => {
        const aTime = a.next_watering_at ? new Date(a.next_watering_at).getTime() : 0;
        const bTime = b.next_watering_at ? new Date(b.next_watering_at).getTime() : 0;
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [plants]);

  const lowHealthPlants = useMemo(() => {
    return plants.filter(p => p.sante_score < 50).sort((a, b) => a.sante_score - b.sante_score).slice(0, 3);
  }, [plants]);

  const dailyTip = useMemo(() => {
    const tips = [
      { icon: '💧', text: 'Arrosez le matin pour éviter l\'évaporation' },
      { icon: '☀️', text: 'La plupart des plantes préfèrent la lumière indirecte' },
      { icon: '🌡️', text: 'Maintenez une température stable autour de 20°C' },
      { icon: '🌿', text: 'Fertilisez pendant la saison de croissance' },
      { icon: '✂️', text: 'Élaguez régulièrement pour favoriser la croissance' }
    ];
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return tips[dayOfYear % tips.length];
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.greeting}>Bienvenue 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        <DailyCheckInButton compact={true} />

        <View style={styles.statsGrid}>
          <StatCard icon="🌱" label="Plantes" value={String(stats.totalPlants)} />
          <StatCard icon="❤️" label="Santé moy." value={`${stats.avgHealth}%`} />
          <StatCard icon="📊" label="Niveau moy." value={String(stats.avgLevel)} />
          <StatCard icon="⚠️" label="Urgent" value={String(stats.urgentCount)} highlight={stats.urgentCount > 0} />
        </View>

        <GradientOverlay colors={['#F0FDF4', '#ECFDF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tipCard}>
          <Text style={styles.tipIcon}>{dailyTip.icon}</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipLabel}>Conseil du jour</Text>
            <Text style={styles.tipText}>{dailyTip.text}</Text>
          </View>
        </GradientOverlay>

        {lowHealthPlants.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>⚠️ Plantes en détresse</Text>
            <FlatList
              data={lowHealthPlants}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.alertItem} onPress={() => router.push({ pathname: '/plant/[id]', params: { id: item.id } })}>
                  <View style={styles.alertIcon}><Text style={styles.alertIconText}>⚠️</Text></View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertName}>{item.nom_commun}</Text>
                    <View style={styles.alertHealthBar}><View style={[styles.alertHealthBarFill, { width: `${item.sante_score}%` }]} /></View>
                    <Text style={styles.alertHealthValue}>{item.sante_score}% de santé</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              scrollEnabled={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
            />
          </View>
        )}

        {upcomingWaterings.length > 0 && (
          <View style={styles.wateringSection}>
            <View style={styles.wateringSectionHeader}>
              <Text style={styles.sectionTitle}>💧 Arrosages prévus</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/garden')}>
                <Text style={styles.viewAllLink}>Voir tous →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={upcomingWaterings}
              renderItem={({ item }) => {
                if (!item.next_watering_at) return null;
                const wateringDate = new Date(item.next_watering_at);
                return (
                  <TouchableOpacity style={styles.wateringItem} onPress={() => router.push({ pathname: '/plant/[id]', params: { id: item.id } })}>
                    <View style={styles.wateringItemDate}>
                      <Text style={styles.wateringItemDayOfWeek}>{wateringDate.toLocaleDateString('fr-FR', { weekday: 'short' })}</Text>
                      <Text style={styles.wateringItemDate2}>{wateringDate.getDate()}</Text>
                    </View>
                    <View style={styles.wateringItemInfo}>
                      <Text style={styles.wateringItemName}>{item.nom_commun}</Text>
                      <Text style={styles.wateringItemTime}>{wateringDate.toLocaleDateString('fr-FR')}</Text>
                    </View>
                    <Text style={styles.wateringItemArrow}>→</Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
              scrollEnabled={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
            />
          </View>
        )}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard icon="📸" label="Scanner" onPress={() => router.push('/scan')} />
            <QuickActionCard icon="🌿" label="Mon Jardin" onPress={() => router.push('/(tabs)/garden')} />
            <QuickActionCard icon="🏆" label="Achievements" onPress={() => logger.info('TODO')} />
            <QuickActionCard icon="⚙️" label="Paramètres" onPress={() => logger.info('TODO')} />
          </View>
        </View>

        {plants.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🪴</Text>
            <Text style={styles.emptyStateTitle}>Commençons!</Text>
            <Text style={styles.emptyStateText}>Aucune plante pour le moment. Scannez votre première plante!</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push('/scan')}>
              <Text style={styles.emptyStateButtonText}>📸 Scanner une Plante</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, highlight }) => (
  <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface QuickActionCardProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
    <Text style={styles.quickActionIcon}>{icon}</Text>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  headerSection: { paddingHorizontal: 16, paddingVertical: 16 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  date: { fontSize: 13, color: '#666', textTransform: 'capitalize' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  statCard: { width: (width - 48) / 2, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statCardHighlight: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  tipCard: { marginHorizontal: 16, marginBottom: 20, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIcon: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipLabel: { fontSize: 11, color: '#10B981', fontWeight: '600', marginBottom: 2 },
  tipText: { fontSize: 13, color: '#111', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  alertsSection: { paddingHorizontal: 16, marginBottom: 20 },
  alertItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  alertIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FCA5A5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertIconText: { fontSize: 20 },
  alertContent: { flex: 1 },
  alertName: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
  alertHealthBar: { height: 4, backgroundColor: '#FCA5A5', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  alertHealthBarFill: { height: '100%', backgroundColor: '#DC2626' },
  alertHealthValue: { fontSize: 11, color: '#666' },
  wateringSection: { paddingHorizontal: 16, marginBottom: 20 },
  wateringSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAllLink: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  wateringItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#10B981' },
  wateringItemDate: { alignItems: 'center', marginRight: 12, minWidth: 40 },
  wateringItemDayOfWeek: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 2 },
  wateringItemDate2: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  wateringItemInfo: { flex: 1 },
  wateringItemName: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  wateringItemTime: { fontSize: 12, color: '#666' },
  wateringItemArrow: { fontSize: 14, color: '#10B981', fontWeight: 'bold' },
  actionsSection: { paddingHorizontal: 16, marginBottom: 20 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickActionCard: { width: (width - 48) / 2, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  quickActionIcon: { fontSize: 24, marginBottom: 6 },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: '#111', textAlign: 'center' },
  emptyState: { paddingHorizontal: 16, paddingVertical: 60, alignItems: 'center' },
  emptyStateIcon: { fontSize: 64, marginBottom: 16 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emptyStateButton: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  emptyStateButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 }
});
