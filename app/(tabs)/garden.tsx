/**
 * Garden Screen - Phase 3.1
 * My Plants Management with filtering and CRUD
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import type { PlantPersonality, AvatarEmotion } from '@gamification/types';
import { usePlants } from '@plants/hooks/usePlants';
import { useGamificationStore } from '@gamification/store/gamificationStore';
import { gardenService } from '@plants/services/GardenService';
import { FilterTabs, FilterOption } from '@/features/dashboard/components/FilterTabs';
import { PlantList } from '@plants/components/PlantList';
import { PlantForm } from '@plants/components/PlantForm';
import { logger } from '@lib/services/logger';
import type { PlantFormData } from '@plants/components/PlantForm';

export default function GardenScreen() {
  const router = useRouter();
  const { plants, loading, error, addPlant, refresh } = usePlants();
  const { addXp, unlockAchievement } = useGamificationStore();
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      logger.info('✅ Garden refreshed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('❌ Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handlePlantPress = (plantId: string) => {
    router.push({ pathname: '/plant/[id]', params: { id: plantId } });
  };

  const handleAddPlant = async (formData: PlantFormData) => {
    try {
      // Map form data to database format
      const dbData = gardenService.mapPlantFormToDb(formData);
      const result = await addPlant(dbData);

      if (result) {
        setShowAddPlantModal(false);

        // Calculate rewards and achievements using service
        const { xpAmount, achievementsToUnlock } = gardenService.calculateAddPlantRewards(plants.length);

        // Award XP
        addXp(xpAmount, 'add_plant');
        logger.info(`✅ Plant added: +${xpAmount} XP`);

        // Unlock achievements
        for (const achievementId of achievementsToUnlock) {
          unlockAchievement(achievementId);
          logger.info(`🏆 Achievement unlocked: ${achievementId}`);
        }

        Alert.alert(
          '✅ Succès',
          `${formData.commonName} ajouté au jardin!\n+${xpAmount} XP`
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('❌ Failed to add plant:', error);
      Alert.alert('❌ Erreur', 'Impossible d\'ajouter la plante');
    }
  };

  const filterStats = gardenService.calculateFilterStats(plants);
  const filterTabs = [
    { id: 'all' as FilterOption, label: 'Tous', icon: '🌿', description: `${filterStats.all} plante${filterStats.all !== 1 ? 's' : ''}` },
    { id: 'urgent' as FilterOption, label: 'Urgent', icon: '⚠️', description: `${filterStats.urgent} à arroser` },
    { id: 'health' as FilterOption, label: 'Santé', icon: '🏥', description: `${filterStats.unhealthy} malades` },
    { id: 'personality' as FilterOption, label: 'Type', icon: '🎭', description: `${filterStats.uniquePersonalities} types` }
  ];

  const plantListItems = useMemo(() => {
    return plants.map(p => {
      const emotion = gardenService.getEmotionState(p.sante_score);
      return {
        id: p.id,
        commonName: p.nom_commun,
        personality: p.personnalite as PlantPersonality,
        healthScore: p.sante_score,
        level: p.level,
        lastWatered: p.last_watered_at ? new Date(p.last_watered_at) : undefined,
        nextWatering: p.next_watering_at ? new Date(p.next_watering_at) : undefined,
        emotionState: emotion as AvatarEmotion
      };
    });
  }, [plants]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mon Jardin 🌱</Text>
            <Text style={styles.headerSubtitle}>{plants.length} plante{plants.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddPlantModal(true)}>
            <Text style={styles.addButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        <FilterTabs tabs={filterTabs} activeTab={filterBy} onTabSelect={setFilterBy} />

        {/* OPTIMIZED: Removed ScrollView, let FlatList handle virtualization */}
        <View style={styles.content}>
          <PlantList
            plants={plantListItems}
            loading={loading}
            filterBy={filterBy}
            onPlantPress={handlePlantPress}
            style={styles.plantList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
            }
          />
        </View>

        {error && <View style={styles.errorBanner}><Text style={styles.errorText}>❌ {error}</Text></View>}

        <Modal visible={showAddPlantModal} animationType="slide" onRequestClose={() => setShowAddPlantModal(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddPlantModal(false)}><Text style={styles.modalCloseButton}>❌</Text></TouchableOpacity>
              <Text style={styles.modalTitle}>Ajouter une Plante</Text>
              <View style={{ width: 40 }} />
            </View>
            <PlantForm onSubmit={handleAddPlant} onCancel={() => setShowAddPlantModal(false)} />
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  addButtonText: { fontSize: 20 },
  content: { flex: 1 },
  plantList: { paddingHorizontal: 8, paddingVertical: 8 },
  errorBanner: { backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#FCA5A5' },
  errorText: { fontSize: 13, color: '#DC2626', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  modalCloseButton: { fontSize: 16, paddingHorizontal: 8 },
});
