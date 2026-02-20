/**
 * Plant List Component
 * Renders scrollable list of PlantCards with optional filtering
 */

import React, { useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ListRenderItemInfo,
  ViewStyle,
  ActivityIndicator,
  RefreshControlProps
} from 'react-native';
import { PlantCard } from './PlantCard';
import { PlantPersonality, AvatarEmotion } from '@/types';
import { logger } from '@/lib/services/logger';

export interface PlantListItem {
  id: string;
  commonName: string;
  personality: PlantPersonality;
  healthScore: number;
  level: number;
  lastWatered?: Date;
  nextWatering?: Date;
  emotionState?: AvatarEmotion;
}

export interface PlantListProps {
  plants: PlantListItem[];
  onPlantPress: (plantId: string) => void;
  onLongPress?: (plantId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  filterBy?: 'all' | 'health' | 'urgent' | 'personality';
  filterValue?: string | number;
  style?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const PlantList: React.FC<PlantListProps> = ({
  plants,
  onPlantPress,
  onLongPress,
  loading = false,
  emptyMessage = 'Aucune plante trouvée. Ajouter votre première plante ! 🌱',
  filterBy = 'all',
  filterValue,
  style,
  refreshControl
}) => {
  // Filter plants based on criteria
  const filteredPlants = useMemo(() => {
    logger.debug('Filtering plants', { filterBy, filterValue, count: plants.length });

    switch (filterBy) {
      case 'health':
        // Show only plants with health score below threshold (urgent)
        return plants.filter(p => p.healthScore < 50);

      case 'urgent':
        // Show plants needing water soon
        if (!filterValue) return plants;
        return plants.filter(p => {
          if (!p.nextWatering) return false;
          const daysUntil = Math.ceil(
            (p.nextWatering.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntil <= 2;
        });

      case 'personality':
        // Filter by plant personality
        return plants.filter(p => p.personality === filterValue);

      case 'all':
      default:
        return plants;
    }
  }, [plants, filterBy, filterValue]);

  // Sort plants: urgent first, then by health descending
  const sortedPlants = useMemo(() => {
    return [...filteredPlants].sort((a, b) => {
      // Urgent plants first (next watering < 2 days)
      const aUrgent = a.nextWatering ?
        (a.nextWatering.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 2 :
        false;
      const bUrgent = b.nextWatering ?
        (b.nextWatering.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 2 :
        false;

      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;

      // Then by health (lower health first)
      return a.healthScore - b.healthScore;
    });
  }, [filteredPlants]);

  // Render plant card
  const renderPlant = ({ item, index }: ListRenderItemInfo<PlantListItem>) => (
    <PlantCard
      id={item.id}
      commonName={item.commonName}
      personality={item.personality}
      healthScore={item.healthScore}
      level={item.level}
      lastWatered={item.lastWatered}
      nextWatering={item.nextWatering}
      emotionState={item.emotionState}
      onPress={onPlantPress}
      style={styles.plantCard}
    />
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🪴</Text>
      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Render list footer (statistics)
  const renderFooter = () => {
    if (sortedPlants.length === 0) return null;
    return (
      <View style={styles.statisticsContainer}>
        <StatisticItem
          icon="🌱"
          label="Total"
          value={String(filteredPlants.length)}
        />
        <StatisticItem
          icon="❤️"
          label="Santé moyenne"
          value={`${Math.round(
            filteredPlants.reduce((sum, p) => sum + p.healthScore, 0) / filteredPlants.length
          )}%`}
        />
        <StatisticItem
          icon="📊"
          label="Niveau moyen"
          value={`${Math.round(
            filteredPlants.reduce((sum, p) => sum + p.level, 0) / filteredPlants.length
          )}`}
        />
      </View>
    );
  };

  // Get item layout for fixed height optimization
  const getItemLayout = (data: ArrayLike<PlantListItem> | null | undefined, index: number) => ({
    length: 182, // PlantCard height (~180px + margins)
    offset: 182 * index,
    index,
  });

  // Render list
  return (
    <View style={[styles.container, style]}>
      {/* Filter summary */}
      {filterBy !== 'all' && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterText}>
            {filterBy === 'health' && '🏥 Plantes en mauvaise santé'}
            {filterBy === 'urgent' && '⚠️ Arrosage urgent'}
            {filterBy === 'personality' && `🌿 ${filterValue}`}
          </Text>
          <Text style={styles.countText}>
            {sortedPlants.length} plante{sortedPlants.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Plants list - OPTIMIZED WITH VIRTUALIZATION */}
      {/* Plants list - OPTIMIZED WITH VIRTUALIZATION */}
      <FlatList
        data={sortedPlants}
        renderItem={renderPlant}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={sortedPlants.length === 0 ? styles.emptyListContainer : undefined}
        refreshControl={refreshControl}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        windowSize={10}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};

/**
 * Statistic Item Component
 */
interface StatisticItemProps {
  icon: string;
  label: string;
  value: string;
}

const StatisticItem: React.FC<StatisticItemProps> = ({ icon, label, value }) => (
  <View style={styles.statisticItem}>
    <Text style={styles.statisticIcon}>{icon}</Text>
    <View>
      <Text style={styles.statisticLabel}>{label}</Text>
      <Text style={styles.statisticValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  filterSummary: {
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#D1E7E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981'
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  plantCard: {
    marginHorizontal: 12,
    marginVertical: 6
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  },
  statisticsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statisticItem: {
    alignItems: 'center',
    gap: 4
  },
  statisticIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  statisticLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
    marginBottom: 2
  },
  statisticValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111'
  }
});
