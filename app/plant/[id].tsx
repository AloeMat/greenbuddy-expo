/**
 * Plant Detail Screen - Phase 3.2
 * Full plant information, actions, and chat interface
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlants } from '@plants/hooks/usePlants';
import { useGamificationStore } from '@gamification/store/gamificationStore';
import { PlantAvatar } from '@plants/components/PlantAvatar';
import { xpRewardService, RewardType as RewardTypeEnum } from '@gamification/services/xpRewardService';
import { PlantForm } from '@plants/components/PlantForm';
import { TypingIndicator } from '@design-system/animations/TypingIndicator';
import { logger } from '@lib/services/logger';
import { geminiService } from '@lib/services/gemini';
import { PlantActionHaptics, triggerHaptic } from '@lib/services/hapticsFeedback';
import type { PlantFormData } from '@plants/components/PlantForm';

export default function PlantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getPlant, updatePlant, deletePlant, waterPlant, fertilizePlant } = usePlants();
  const { addXp, unlockAchievement } = useGamificationStore();

  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actingLoading, setActingLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch plant on mount
  useEffect(() => {
    const fetchPlant = async () => {
      if (!id) return;
      try {
        const plantData = await getPlant(id as string);
        if (plantData) {
          setPlant(plantData);
          logger.info('✅ Plant loaded', { name: plantData.nom_commun });
        } else {
          logger.error('Plant not found');
          Alert.alert('Erreur', 'Plante non trouvée');
          router.back();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Failed to load plant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id, getPlant]);

  // Handle water action
  const handleWater = async () => {
    if (!plant) return;
    setActionInProgress('water');
    setActingLoading(true);
    try {
      // Trigger success haptic pattern
      await triggerHaptic(() => PlantActionHaptics.water());

      const result = await waterPlant(plant.id);
      if (result) {
        setPlant(result);

        // Award XP
        const xpAmount = xpRewardService.getRewardAmount(RewardTypeEnum.WATER_PLANT);
        addXp(xpAmount, 'watering');
        xpRewardService.logReward(RewardTypeEnum.WATER_PLANT, plant.nom_commun);

        Alert.alert('✅ Succès', `${plant.nom_commun} arrosé(e)!\n+${xpAmount} XP`);
        logger.info('✅ Plant watered', { id: plant.id, xpAwarded: xpAmount });
      }
    } catch (err) {
      Alert.alert('❌ Erreur', 'Impossible d\'arroser la plante');
    } finally {
      setActingLoading(false);
      setActionInProgress(null);
    }
  };

  // Handle fertilize action
  const handleFertilize = async () => {
    if (!plant) return;
    setActionInProgress('fertilize');
    setActingLoading(true);
    try {
      // Trigger success haptic pattern
      await triggerHaptic(() => PlantActionHaptics.fertilize());

      const result = await fertilizePlant(plant.id);
      if (result) {
        setPlant(result);

        // Award XP
        const xpAmount = xpRewardService.getRewardAmount(RewardTypeEnum.FERTILIZE_PLANT);
        addXp(xpAmount, 'fertilize');
        xpRewardService.logReward(RewardTypeEnum.FERTILIZE_PLANT, plant.nom_commun);

        // Check for health achievement
        if (result.sante_score >= 100) {
          unlockAchievement('plant_healthy');
          xpRewardService.logReward(RewardTypeEnum.PLANT_HEALTHY, plant.nom_commun);
          addXp(xpRewardService.getRewardAmount(RewardTypeEnum.PLANT_HEALTHY), 'PLANT_HEALTHY');
        }

        Alert.alert('✅ Succès', `${plant.nom_commun} fertilisé(e)!\n+${xpAmount} XP`);
        logger.info('✅ Plant fertilized', { id: plant.id, xpAwarded: xpAmount });
      }
    } catch (err) {
      Alert.alert('❌ Erreur', 'Impossible de fertiliser la plante');
    } finally {
      setActingLoading(false);
      setActionInProgress(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!plant) return;
    setShowDeleteConfirm(false);
    setActingLoading(true);
    try {
      // Trigger delete haptic pattern (triple tap warning)
      await triggerHaptic(() => PlantActionHaptics.delete());

      const result = await deletePlant(plant.id);
      if (result) {
        Alert.alert('✅ Succès', `${plant.nom_commun} a été supprimé(e)`);
        router.back();
      }
    } catch (err) {
      Alert.alert('❌ Erreur', 'Impossible de supprimer la plante');
    } finally {
      setActingLoading(false);
    }
  };

  // Handle edit
  const handleEditPlant = async (formData: PlantFormData) => {
    try {
      setActingLoading(true);
      const result = await updatePlant(plant.id, {
        nom_commun: formData.commonName,
        nom_scientifique: formData.scientificName,
        personnalite: formData.personality,
        surnom: formData.nickname,
        sante_score: formData.healthScore,
        localisation: formData.location,
        notes: formData.notes,
        arrosage_frequence_jours: formData.wateringFrequency,
        lumiere: formData.lightRequirements,
        temperature_min: formData.temperatureMin,
        temperature_max: formData.temperatureMax
      });

      if (result) {
        setPlant(result);
        setShowEditModal(false);
        Alert.alert('✅ Succès', 'Plante mise à jour');
      }
    } catch (err) {
      Alert.alert('❌ Erreur', 'Impossible de mettre à jour la plante');
    } finally {
      setActingLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  if (!plant) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plante non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setShowEditModal(true)}>
            <Text style={styles.editButton}>✏️ Éditer</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <PlantAvatar
            personality={plant.personnalite}
            emotionState={plant.sante_score >= 80 ? 'happy' : plant.sante_score >= 60 ? 'idle' : 'sad'}
            size="large"
            showGlow
            level={plant.level}
          />
        </View>

        {/* Plant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.commonName}>{plant.nom_commun}</Text>
          {plant.surnom && <Text style={styles.nickname}>"{plant.surnom}"</Text>}
          <Text style={styles.scientificName}>{plant.nom_scientifique}</Text>
          {plant.famille && <Text style={styles.family}>{plant.famille}</Text>}
        </View>

        {/* Health Bar */}
        <View style={styles.healthSection}>
          <View style={styles.healthLabel}>
            <Text style={styles.healthText}>Santé</Text>
            <Text style={[styles.healthScore, { color: plant.sante_score >= 80 ? '#10B981' : plant.sante_score >= 60 ? '#F59E0B' : '#DC2626' }]}>
              {plant.sante_score}%
            </Text>
          </View>
          <View style={styles.healthBar}>
            <View style={[styles.healthBarFill, { width: `${plant.sante_score}%`, backgroundColor: plant.sante_score >= 80 ? '#10B981' : plant.sante_score >= 60 ? '#F59E0B' : '#DC2626' }]} />
          </View>
        </View>

        {/* Location & Notes */}
        {(plant.localisation || plant.notes) && (
          <View style={styles.detailsSection}>
            {plant.localisation && (
              <DetailItem icon="📍" label="Localisation" value={plant.localisation} />
            )}
            {plant.notes && (
              <DetailItem icon="📝" label="Notes" value={plant.notes} />
            )}
          </View>
        )}

        {/* Care Requirements */}
        <View style={styles.careSection}>
          <Text style={styles.sectionTitle}>💧 Soins Requis</Text>
          <DetailItem icon="💧" label="Arrosage" value={`Tous les ${plant.arrosage_frequence_jours} jours`} />
          {plant.lumiere && <DetailItem icon="☀️" label="Lumière" value={plant.lumiere} />}
          {plant.temperature_min && (
            <DetailItem
              icon="🌡️"
              label="Température"
              value={`${plant.temperature_min}°C - ${plant.temperature_max || 25}°C`}
            />
          )}
          {plant.humidite && <DetailItem icon="💨" label="Humidité" value={plant.humidite} />}
        </View>

        {/* Watering History */}
        <View style={styles.wateringSection}>
          <Text style={styles.sectionTitle}>📅 Historique</Text>
          {plant.last_watered_at && (
            <DetailItem
              icon="✅"
              label="Dernière fois"
              value={new Date(plant.last_watered_at).toLocaleDateString('fr-FR')}
            />
          )}
          {plant.next_watering_at && (
            <DetailItem
              icon="⏰"
              label="Prochain arrosage"
              value={new Date(plant.next_watering_at).toLocaleDateString('fr-FR')}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <ActionButton
            icon="💧"
            label="Arroser"
            onPress={handleWater}
            loading={actionInProgress === 'water' && actingLoading}
            style={styles.actionButtonWater}
          />
          <ActionButton
            icon="🌿"
            label="Fertiliser"
            onPress={handleFertilize}
            loading={actionInProgress === 'fertilize' && actingLoading}
            style={styles.actionButtonFertilize}
          />
          <ActionButton
            icon="🗑️"
            label="Supprimer"
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.actionButtonDelete}
          />
        </View>

        {/* Delete Confirmation Modal */}
        <Modal visible={showDeleteConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <Text style={styles.deleteTitle}>⚠️ Supprimer {plant.nom_commun}?</Text>
              <Text style={styles.deleteMessage}>Cette action est irréversible</Text>
              <View style={styles.deleteButtons}>
                <TouchableOpacity
                  style={styles.deleteConfirmButton}
                  onPress={handleDelete}
                  disabled={actingLoading}
                >
                  <Text style={styles.deleteConfirmText}>Supprimer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteCancelButton}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text style={styles.deleteCancelText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} animationType="slide" onRequestClose={() => setShowEditModal(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.editModalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.editModalCloseButton}>❌</Text>
              </TouchableOpacity>
              <Text style={styles.editModalTitle}>Éditer la Plante</Text>
              <View style={{ width: 40 }} />
            </View>
            <PlantForm
              prefilledData={{
                commonName: plant.nom_commun,
                scientificName: plant.nom_scientifique,
                personality: plant.personnalite,
                healthScore: plant.sante_score,
                soins: {
                  wateringFrequencyDays: plant.arrosage_frequence_jours,
                  lightRequirements: plant.lumiere || 'indirect',
                  temperatureMin: plant.temperature_min || 15,
                  temperatureMax: plant.temperature_max || 25,
                  humidity: plant.humidite || 'medium',
                  fertilizerFrequencyDays: plant.engrais_frequence_jours || 30
                }
              }}
              onSubmit={handleEditPlant}
              onCancel={() => setShowEditModal(false)}
            />
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Detail Item Component
 */
interface DetailItemProps {
  icon: string;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

/**
 * Action Button Component
 */
interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, loading, style }) => (
  <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress} disabled={loading}>
    {loading ? (
      <ActivityIndicator size="small" color="#FFF" />
    ) : (
      <>
        <Text style={styles.actionButtonIcon}>{icon}</Text>
        <Text style={styles.actionButtonLabel}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#DC2626' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  editButton: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  infoSection: { alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
  commonName: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  nickname: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 4 },
  scientificName: { fontSize: 13, color: '#999' },
  family: { fontSize: 12, color: '#CCC', marginTop: 2 },
  healthSection: { paddingHorizontal: 16, marginBottom: 20 },
  healthLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  healthText: { fontSize: 13, fontWeight: '600', color: '#666' },
  healthScore: { fontSize: 14, fontWeight: 'bold' },
  healthBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  healthBarFill: { height: '100%', borderRadius: 4 },
  detailsSection: { paddingHorizontal: 16, marginBottom: 20, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  detailIcon: { fontSize: 18, marginRight: 12, width: 24 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#888', fontWeight: '500', marginBottom: 2 },
  detailValue: { fontSize: 14, color: '#111', fontWeight: '500' },
  careSection: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  wateringSection: { paddingHorizontal: 16, marginBottom: 20 },
  actionsSection: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 20, gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 4 },
  actionButtonWater: { backgroundColor: '#3B82F6' },
  actionButtonFertilize: { backgroundColor: '#10B981' },
  actionButtonDelete: { backgroundColor: '#DC2626' },
  actionButtonIcon: { fontSize: 16 },
  actionButtonLabel: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteModal: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, width: '80%', alignItems: 'center' },
  deleteTitle: { fontSize: 16, fontWeight: 'bold', color: '#DC2626', marginBottom: 8, textAlign: 'center' },
  deleteMessage: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center' },
  deleteButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  deleteConfirmButton: { flex: 1, backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  deleteConfirmText: { color: '#FFF', fontWeight: '600' },
  deleteCancelButton: { flex: 1, backgroundColor: '#E5E7EB', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  deleteCancelText: { color: '#111', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  editModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  editModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  editModalCloseButton: { fontSize: 16, paddingHorizontal: 8 }
});
