import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Droplets } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { radius } from '@/design-system/tokens/radius';

interface UpcomingWatering {
  plantId: string;
  plantName: string;
  daysUntilWatering: number;
  wateringDate: Date;
}

/**
 * Upcoming Waterings Card
 * Displays plants that need watering in the next 7 days
 * Used in Dashboard
 */
export const UpcomingWateringsCard: React.FC = () => {
  const router = useRouter();
  const { plants = [] } = usePlants();

  const upcomingWaterings = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return plants
      .filter((plant) => {
        if (!plant.next_watering_at) return false;
        const wateringDate = new Date(plant.next_watering_at);
        return wateringDate >= now && wateringDate <= sevenDaysFromNow;
      })
      .map((plant) => {
        const wateringDate = new Date(plant.next_watering_at!);
        const now = new Date();
        const daysUntilWatering = Math.ceil(
          (wateringDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          plantId: plant.id,
          plantName: plant.surnom || plant.nom_commun,
          daysUntilWatering,
          wateringDate,
        };
      })
      .sort((a, b) => a.daysUntilWatering - b.daysUntilWatering);
  }, [plants]);

  if (upcomingWaterings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>💧 Aucun arrosage prévu dans les 7 prochains jours</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Droplets size={20} color="#06B6D4" />
        <Text style={styles.title}>À arroser bientôt</Text>
        <Text style={styles.count}>{upcomingWaterings.length}</Text>
      </View>

      <FlatList
        scrollEnabled={false}
        data={upcomingWaterings}
        keyExtractor={(item) => item.plantId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.wateringItem}
            onPress={() => router.push(`/plant/${item.plantId}`)}
          >
            <View style={styles.wateringContent}>
              <Text style={styles.plantName}>{item.plantName}</Text>
              <View style={styles.daysContainer}>
                {item.daysUntilWatering === 0 ? (
                  <Text style={styles.daysToday}>{"🔴 Aujourd'hui"}</Text>
                ) : item.daysUntilWatering === 1 ? (
                  <Text style={styles.daysSoon}>🟡 Demain</Text>
                ) : (
                  <Text style={styles.daysLater}>{`⚪ Dans ${item.daysUntilWatering} jours`}</Text>
                )}
              </View>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CFFAFE',
  },
  emptyContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: radius.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#06B6D4',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#CFFAFE',
    color: '#0891B2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  wateringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  wateringContent: {
    flex: 1,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysToday: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  daysSoon: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA8C55',
  },
  daysLater: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  arrow: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
});
