/**
 * Plant Actions with Event Emission
 * Example of how to integrate EventBus into service layer
 * Demonstrates Mediator Pattern: plant service emits events → gamification listens
 *
 * This file shows the pattern for integrating events into existing services.
 * In production, these would be integrated into PlantCareService.
 */

import { eventBus } from '@lib/events';
import { logger } from '@lib/services/logger';

/**
 * Example: Water plant and emit event
 * When a plant is watered, gamification listener receives event and awards XP
 */
export const waterPlantWithEvent = async (
  plantId: string,
  plantName: string,
  xpAmount: number = 10
): Promise<{ success: boolean; xpAwarded: number }> => {
  try {
    logger.info('💧 Watering plant...', { plantName });

    // Perform the actual watering action
    // (would normally call plantCareService.waterPlant)
    // For now, simulating:
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Emit event - gamification listener will receive this
    await eventBus.emit('PLANT_WATERED', {
      plantId,
      plantName,
      xpEarned: xpAmount
    });

    logger.info('✅ Plant watered + event emitted', {
      plantName,
      xpAwarded: xpAmount,
      eventListeners: `${eventBus.getListenerCount('PLANT_WATERED')} listeners received`
    });

    return { success: true, xpAwarded: xpAmount };

  } catch (error) {
    logger.error('❌ Error watering plant:', error);
    return { success: false, xpAwarded: 0 };
  }
};

/**
 * Example: Fertilize plant and emit event
 */
export const fertilizePlantWithEvent = async (
  plantId: string,
  plantName: string,
  healthBonus: number = 15,
  xpAmount: number = 20
): Promise<{ success: boolean; xpAwarded: number; healthBonus: number }> => {
  try {
    logger.info('🌻 Fertilizing plant...', { plantName });

    // Perform the actual fertilizing action
    // (would normally call plantCareService.fertilizePlant)
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Emit event
    await eventBus.emit('PLANT_FERTILIZED', {
      plantId,
      plantName,
      xpEarned: xpAmount
    });

    logger.info('✅ Plant fertilized + event emitted', {
      plantName,
      xpAwarded: xpAmount,
      healthBonus,
      eventListeners: `${eventBus.getListenerCount('PLANT_FERTILIZED')} listeners received`
    });

    return { success: true, xpAwarded: xpAmount, healthBonus };

  } catch (error) {
    logger.error('❌ Error fertilizing plant:', error);
    return { success: false, xpAwarded: 0, healthBonus: 0 };
  }
};

/**
 * Example: Add plant and emit event
 */
export const addPlantWithEvent = async (
  plantId: string,
  plantName: string,
  xpAmount: number = 50
): Promise<{ success: boolean; xpAwarded: number }> => {
  try {
    logger.info('🌱 Adding plant...', { plantName });

    // Perform the actual add action
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Emit event
    await eventBus.emit('PLANT_ADDED', {
      plantId,
      plantName
    });

    logger.info('✅ Plant added + event emitted', {
      plantName,
      xpAwarded: xpAmount,
      eventListeners: `${eventBus.getListenerCount('PLANT_ADDED')} listeners received`
    });

    return { success: true, xpAwarded: xpAmount };

  } catch (error) {
    logger.error('❌ Error adding plant:', error);
    return { success: false, xpAwarded: 0 };
  }
};

/**
 * Example: Delete plant and emit event
 */
export const deletePlantWithEvent = async (
  plantId: string,
  plantName: string,
  xpPenalty: number = -10
): Promise<{ success: boolean; xpPenalty: number }> => {
  try {
    logger.info('🗑️ Deleting plant...', { plantName });

    // Perform the actual delete action
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Emit event
    await eventBus.emit('PLANT_DELETED', {
      plantId,
      plantName
    });

    logger.info('✅ Plant deleted + event emitted', {
      plantName,
      xpPenalty,
      eventListeners: `${eventBus.getListenerCount('PLANT_DELETED')} listeners received`
    });

    return { success: true, xpPenalty };

  } catch (error) {
    logger.error('❌ Error deleting plant:', error);
    return { success: false, xpPenalty: 0 };
  }
};

/**
 * INTEGRATION EXAMPLE:
 *
 * In PlantDetail.tsx:
 * ```tsx
 * function PlantDetailScreen({ plantId }) {
 *   const handleWater = async () => {
 *     const result = await waterPlantWithEvent(plantId, 'Monstera', 10);
 *     if (result.success) {
 *       Alert.alert('Success', `Watered! +${result.xpAwarded} XP`);
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handleWater} label="Water" />
 *     </View>
 *   );
 * }
 * ```
 *
 * The GamificationListener will automatically receive the PLANT_WATERED event
 * and award the XP without the plant detail knowing about gamification.
 * Perfect decoupling!
 */
