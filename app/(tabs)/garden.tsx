import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { FilterTabs, FilterOption, FilterTab } from '@/features/dashboard/components/FilterTabs';
import { PlantList, PlantListItem } from '@/features/plants/components/PlantList';
import { radius } from '@/design-system/tokens/radius';
import { COLORS } from '@/design-system/tokens/colors';
import type { Plant } from '@/features/plants/repositories/PlantRepository';
import type { PlantPersonality } from '@/types';

/**
 * Garden Screen
 * Displays user's plants with filtering and management options
 */
export default function GardenScreen() {
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', marginTop: 16, marginBottom: 24 }}>
            Mes Plantes 🌱
          </Text>

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🌍</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 8 }}>
              Votre jardin est vide
            </Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 }}>
              Commencez par scanner une plante ou ajouter manuellement
            </Text>

            <TouchableOpacity
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
              <Plus size={20} color="#fff" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Ajouter une plante</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.brand} />
      </SafeAreaView>
    );
  }

  // Main screen with plants
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#000' }}>Mes Plantes 🌱</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
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
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          {filteredPlants.length > 0 ? (
            <PlantList
              plants={filteredPlants}
              onPlantPress={(plantId) => router.push(`/plant/${plantId}`)}
            />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Aucune plante dans cette catégorie
              </Text>
            </View>
          )}
        </View>

        {/* Add Plant Button */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
          <TouchableOpacity
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
            <Plus size={20} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Ajouter une plante</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
