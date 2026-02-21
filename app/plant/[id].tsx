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
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { PlantAvatar } from '@/features/plants/components/PlantAvatar';
import { xpRewardService, RewardType as RewardTypeEnum } from '@/features/gamification/services/xpRewardService';
import { PlantForm } from '@/features/plants/components/PlantForm';
import { TypingIndicator } from '@/design-system/animations/TypingIndicator';
import { COLORS } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { typography } from '@/design-system/tokens/typography';
import { spacing } from '@/design-system/tokens/spacing';
import { logger } from '@/lib/services/logger';
import { geminiService } from '@/lib/services/gemini';
import { PlantActionHaptics, triggerHaptic } from '@/lib/services/hapticsFeedback';
import type { PlantFormData } from '@/features/plants/components/PlantForm';
import type { Plant as PlantRecord } from '@/features/plants/repositories/PlantRepository';
import type { PlantPersonality, CareRequirements } from '@/types';

export default function PlantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { getPlant, updatePlant, deletePlant, waterPlant, fertilizePlant } = usePlants();
  const { addXp, unlockAchievement } = useGamificationStore();

  const [plant, setPlant] = useState<PlantRecord | null>(null);
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

  // Defensive auth guard for deep-link access
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

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
      logger.error('[PlantDetail] Water failed:', err);
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
      logger.error('[PlantDetail] Fertilize failed:', err);
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
      logger.error('[PlantDetail] Delete failed:', err);
      Alert.alert('❌ Erreur', 'Impossible de supprimer la plante');
    } finally {
      setActingLoading(false);
    }
  };

  // Handle edit
  const handleEditPlant = async (formData: PlantFormData) => {
    if (!plant) return;
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
      logger.error('[PlantDetail] Edit failed:', err);
      Alert.alert('❌ Erreur', 'Impossible de mettre à jour la plante');
    } finally {
      setActingLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand} />
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
          <TouchableOpacity
            accessibilityLabel="Retour"
            accessibilityRole="button"
            testID="plant-back-button"
            onPress={() => router.back()}
          >
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            accessibilityLabel="Modifier la plante"
            accessibilityRole="button"
            testID="plant-edit-button"
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editButton}>✏️ Éditer</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <PlantAvatar
            personality={plant.personnalite as PlantPersonality}
            emotionState={plant.sante_score >= 80 ? 'happy' : plant.sante_score >= 60 ? 'idle' : 'sad'}
            size="large"
            showGlow
            level={plant.level}
          />
        </View>

        {/* Plant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.commonName}>{plant.nom_commun}</Text>
          {plant.surnom && <Text style={styles.nickname}>{`"${plant.surnom}"`}</Text>}
          <Text style={styles.scientificName}>{plant.nom_scientifique}</Text>
          {plant.famille && <Text style={styles.family}>{plant.famille}</Text>}
        </View>

        {/* Health Bar */}
        <View style={styles.healthSection}>
          <View style={styles.healthLabel}>
            <Text style={styles.healthText}>Santé</Text>
            <Text style={[styles.healthScore, { color: plant.sante_score >= 80 ? COLORS.semantic.success : plant.sante_score >= 60 ? COLORS.accent['500'] : COLORS.error['600'] }]}>
              {plant.sante_score}%
            </Text>
          </View>
          <View style={styles.healthBar}>
            <View style={[styles.healthBarFill, { width: `${plant.sante_score}%`, backgroundColor: plant.sante_score >= 80 ? COLORS.semantic.success : plant.sante_score >= 60 ? COLORS.accent['500'] : COLORS.error['600'] }]} />
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
            testID="plant-water-button"
            accessibilityLabel="Arroser la plante"
          />
          <ActionButton
            icon="🌿"
            label="Fertiliser"
            onPress={handleFertilize}
            loading={actionInProgress === 'fertilize' && actingLoading}
            style={styles.actionButtonFertilize}
            testID="plant-fertilize-button"
            accessibilityLabel="Fertiliser la plante"
          />
          <ActionButton
            icon="🗑️"
            label="Supprimer"
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.actionButtonDelete}
            testID="plant-delete-button"
            accessibilityLabel="Supprimer la plante"
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
                  accessibilityLabel="Confirmer la suppression"
                  accessibilityRole="button"
                  testID="plant-confirm-delete-button"
                  style={styles.deleteConfirmButton}
                  onPress={handleDelete}
                  disabled={actingLoading}
                >
                  <Text style={styles.deleteConfirmText}>Supprimer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Annuler"
                  accessibilityRole="button"
                  testID="plant-cancel-delete-button"
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
              <TouchableOpacity
                accessibilityLabel="Fermer"
                accessibilityRole="button"
                testID="plant-edit-modal-close-button"
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.editModalCloseButton}>❌</Text>
              </TouchableOpacity>
              <Text style={styles.editModalTitle}>Éditer la Plante</Text>
              <View style={{ width: 40 }} />
            </View>
            <PlantForm
              prefilledData={{
                commonName: plant.nom_commun,
                scientificName: plant.nom_scientifique,
                personality: plant.personnalite as PlantPersonality,
                healthScore: plant.sante_score,
                soins: {
                  wateringFrequencyDays: plant.arrosage_frequence_jours,
                  lightRequirements: (plant.lumiere || 'indirect') as CareRequirements['lightRequirements'],
                  temperatureMin: plant.temperature_min || 15,
                  temperatureMax: plant.temperature_max || 25,
                  humidity: (plant.humidite || 'medium') as CareRequirements['humidity'],
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
  style?: import('react-native').ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, loading, style, testID, accessibilityLabel }) => (
  <TouchableOpacity
    style={[styles.actionButton, style]}
    onPress={onPress}
    disabled={loading}
    testID={testID}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
  >
    {loading ? (
      <ActivityIndicator size="small" color={COLORS.neutral['50']} />
    ) : (
      <>
        <Text style={styles.actionButtonIcon}>{icon}</Text>
        <Text style={styles.actionButtonLabel}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.neutral['50'] },
  container: { flex: 1, backgroundColor: COLORS.neutral['50'] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...typography.body.lg, color: COLORS.error['600'] },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.neutral['200'] },
  backButton: { ...typography.subtitle.sm, color: COLORS.semantic.success },
  editButton: { ...typography.subtitle.sm, color: COLORS.semantic.success },
  avatarSection: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  infoSection: { alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  commonName: { ...typography.heading.h3, color: COLORS.text['900'], marginBottom: spacing.xs },
  nickname: { ...typography.body.md, color: COLORS.text['500'], fontStyle: 'italic', marginBottom: spacing.xs },
  scientificName: { ...typography.body.md, color: COLORS.text['400'] },
  family: { ...typography.body.sm, color: COLORS.text['500'], marginTop: 2 },
  healthSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  healthLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  healthText: { ...typography.label.md, fontWeight: typography.weights.semiBold, color: COLORS.text['500'] },
  healthScore: { ...typography.label.lg, fontWeight: typography.weights.bold },
  healthBar: { height: 8, backgroundColor: COLORS.neutral['200'], borderRadius: radius.xs, overflow: 'hidden' },
  healthBarFill: { height: '100%', borderRadius: radius.xs },
  detailsSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl, backgroundColor: COLORS.neutral['50'], borderRadius: radius.xs, padding: spacing.md },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  detailIcon: { fontSize: 18, marginRight: spacing.md, width: 24 },
  detailContent: { flex: 1 },
  detailLabel: { ...typography.label.md, color: COLORS.text['400'], marginBottom: 2 },
  detailValue: { ...typography.label.lg, color: COLORS.text['900'] },
  careSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { ...typography.subtitle.md, fontWeight: typography.weights.bold, color: COLORS.text['900'], marginBottom: spacing.md },
  wateringSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  actionsSection: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.sm },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: radius.xs, gap: spacing.xs },
  actionButtonWater: { backgroundColor: COLORS.blue['500'] },
  actionButtonFertilize: { backgroundColor: COLORS.semantic.success },
  actionButtonDelete: { backgroundColor: COLORS.error['600'] },
  actionButtonIcon: { fontSize: 16 },
  actionButtonLabel: { ...typography.label.md, fontWeight: typography.weights.semiBold, color: COLORS.neutral['50'] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteModal: { backgroundColor: COLORS.neutral['50'], borderRadius: radius.sm, padding: spacing.xl, width: '80%', alignItems: 'center' },
  deleteTitle: { ...typography.subtitle.md, fontWeight: typography.weights.bold, color: COLORS.error['600'], marginBottom: spacing.sm, textAlign: 'center' },
  deleteMessage: { ...typography.body.md, color: COLORS.text['500'], marginBottom: spacing.xl, textAlign: 'center' },
  deleteButtons: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  deleteConfirmButton: { flex: 1, backgroundColor: COLORS.error['600'], paddingVertical: 10, borderRadius: radius.xs, alignItems: 'center' },
  deleteConfirmText: { color: COLORS.neutral['50'], fontWeight: typography.weights.semiBold },
  deleteCancelButton: { flex: 1, backgroundColor: COLORS.neutral['200'], paddingVertical: 10, borderRadius: radius.xs, alignItems: 'center' },
  deleteCancelText: { color: COLORS.text['900'], fontWeight: typography.weights.semiBold },
  modalContainer: { flex: 1, backgroundColor: COLORS.neutral['50'] },
  editModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.neutral['200'] },
  editModalTitle: { ...typography.subtitle.lg, fontWeight: typography.weights.bold, color: COLORS.text['900'] },
  editModalCloseButton: { ...typography.body.lg, paddingHorizontal: spacing.sm }
});
