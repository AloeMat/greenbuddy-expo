import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { FilterTabs, FilterOption, FilterTab } from '@/features/dashboard/components/FilterTabs';
import { PlantList, PlantListItem } from '@/features/plants/components/PlantList';
import { radius } from '@/design-system/tokens/radius';
import { COLORS } from '@/design-system/tokens/colors';
import { typography } from '@/design-system/tokens/typography';
import type { Plant } from '@/features/plants/repositories/PlantRepository';
import type { PlantPersonality } from '@/types';

/**
 * Garden Screen
 * Displays user's plants with filtering and management options
 */
export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plants = [], loading, refresh } = usePlants();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Transform Plant to PlantListItem format
  const transformedPlants = useMemo(() => {
    return plants.map((plant: Plant): PlantListItem => ({
      id: plant.id,
      commonName: plant.surnom || plant.nom_commun,
      personality: (plant.personnalite as PlantPersonality) || 'succulente',
      healthScore: plant.sante_score,
      level: plant.level || 1,
      lastWatered: plant.last_watered_at ? new Date(plant.last_watered_at) : undefined,
      nextWatering: plant.next_watering_at ? new Date(plant.next_watering_at) : undefined,
      emotionState: 'idle',
    }));
  }, [plants]);

  // Filter plants based on selected filter
  const filteredPlants = useMemo(() => {
    switch (filter) {
      case 'urgent':
        return transformedPlants.filter((plant) => plant.healthScore < 50);
      case 'health':
        return transformedPlants.filter((plant) => plant.healthScore >= 80);
      case 'personality':
        return transformedPlants;
      case 'all':
      default:
        return transformedPlants;
    }
  }, [transformedPlants, filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Filter tabs configuration
  const filterTabs: FilterTab[] = [
    { id: 'all', label: 'Tous', icon: '🌿', description: 'Toutes les plantes' },
    {
      id: 'urgent',
      label: 'Urgents',
      icon: '⚠️',
      description: 'À arroser bientôt',
    },
    {
      id: 'health',
      label: 'Sains',
      icon: '💚',
      description: 'En bonne santé',
    },
  ];

  // Empty state
  if (!loading && plants.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral['50'] }}>
        <ScrollView
          style={[{ flex: 1, paddingHorizontal: 16 }, { paddingBottom: insets.bottom + 70 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <Text style={{ ...typography.heading.h3, marginTop: 16, marginBottom: 24 }}>
            Mes Plantes 🌱
          </Text>

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
            }}
            testID="garden-empty-state"
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🌍</Text>
            <Text style={{ ...typography.subtitle.lg, color: COLORS.text['900'], marginBottom: 8 }}>
              Votre jardin est vide
            </Text>
            <Text style={{ ...typography.body.md, color: COLORS.text['500'], textAlign: 'center', marginBottom: 24 }}>
              Commencez par scanner une plante ou ajouter manuellement
            </Text>

            <TouchableOpacity
              accessibilityLabel="Ajouter une plante"
              accessibilityRole="button"
              testID="garden-add-plant-button"
              style={{
                backgroundColor: COLORS.brand,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: radius.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <Plus size={20} color={COLORS.neutral['50']} />
              <Text style={{ ...typography.label.lg, color: COLORS.neutral['50'] }}>Ajouter une plante</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral['50'], justifyContent: 'center', alignItems: 'center' }} testID="garden-loading">
        <ActivityIndicator size="large" color={COLORS.brand} />
      </SafeAreaView>
    );
  }

  // Main screen with plants
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral['50'] }}>
      <ScrollView
        style={[styles.container, { paddingBottom: insets.bottom + 70 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ ...typography.heading.h2, color: COLORS.text['900'] }}>Mes Plantes 🌱</Text>
          <Text style={{ ...typography.body.md, color: COLORS.text['500'], marginTop: 2 }}>
            {plants.length} plante{plants.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <FilterTabs
            tabs={filterTabs}
            activeTab={filter}
            onTabSelect={(selectedTab) => setFilter(selectedTab)}
          />
        </View>

        {/* Plant List */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }} testID="garden-plant-list">
          {filteredPlants.length > 0 ? (
            <PlantList
              plants={filteredPlants}
              onPlantPress={(plantId) => router.push(`/plant/${plantId}`)}
            />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ ...typography.body.md, color: COLORS.text['500'] }}>
                Aucune plante dans cette catégorie
              </Text>
            </View>
          )}
        </View>

        {/* Add Plant Button */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
          <TouchableOpacity
            accessibilityLabel="Ajouter une plante"
            accessibilityRole="button"
            testID="garden-add-plant-button"
            style={{
              backgroundColor: COLORS.brand,
              paddingVertical: 14,
              borderRadius: radius.md,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Plus size={20} color={COLORS.neutral['50']} />
            <Text style={{ ...typography.label.lg, color: COLORS.neutral['50'] }}>Ajouter une plante</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
});
