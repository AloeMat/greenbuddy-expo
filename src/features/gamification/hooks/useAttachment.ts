/**
 * useAttachment Hook
 * ════════════════════════════════
 *
 * Manages plant attachment state with AsyncStorage persistence
 * - Loads/saves attachment state automatically
 * - Tracks daily updates and phase transitions
 * - Records care actions and calculates scores
 * - Provides milestone tracking and feature unlocking
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import { useEffect, useState, useCallback } from 'react';
import { AttachmentService, AttachmentState, AttachmentPhase, getAttachmentStatus } from '@/features/gamification/services/attachmentService';
import { logger } from '@/lib/services/logger';

export interface UseAttachmentReturn {
  // State
  state: AttachmentState | null;
  isLoading: boolean;
  error: Error | null;

  // Current status
  phase: AttachmentPhase | null;
  dayWithUser: number;
  attachmentScore: number;
  phaseProgress: number;
  statusText: string;
  tip: string;
  nextMilestone: { day: number; name: string; reward?: number } | null;

  // Actions
  recordCareAction: (actionType: 'water' | 'fertilize' | 'interact' | 'check_in') => Promise<void>;
  recordInteraction: () => Promise<void>;
  updateDaily: () => Promise<{ phaseChanged: boolean; newPhase?: AttachmentPhase }>;
  refresh: () => Promise<void>;
  isFeatureUnlocked: (feature: string) => boolean;
  getUnlockedFeatures: () => string[];
}

/**
 * Hook to manage plant attachment progression
 * @param plantId - Plant identifier
 * @returns Attachment state and helper methods
 */
export function useAttachment(plantId: string): UseAttachmentReturn {
  const [state, setState] = useState<AttachmentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load attachment state on mount or when plantId changes
  useEffect(() => {
    const loadAttachment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let attachment = await AttachmentService.loadAttachment(plantId);

        // Initialize if doesn't exist
        if (!attachment) {
          attachment = AttachmentService.initializeAttachment(plantId);
          await AttachmentService.saveAttachment(attachment);
        }

        setState(attachment);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading attachment');
        setError(error);
        logger.error('[useAttachment] Load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttachment();
  }, [plantId]);

  // Record care action
  const recordCareAction = useCallback(
    async (actionType: 'water' | 'fertilize' | 'interact' | 'check_in') => {
      if (!state) return;

      try {
        const updated = AttachmentService.recordCareAction(state, actionType);
        await AttachmentService.saveAttachment(updated);
        setState(updated);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to record care action');
        setError(error);
        logger.error('[useAttachment] Record action error:', error);
      }
    },
    [state]
  );

  // Shorthand for interaction recording
  const recordInteraction = useCallback(async () => {
    await recordCareAction('interact');
  }, [recordCareAction]);

  // Update daily state (call once per day)
  const updateDaily = useCallback(async () => {
    if (!state) return { phaseChanged: false };

    try {
      const { updatedState, phaseChanged, newPhase } = AttachmentService.updateDaily(state);
      await AttachmentService.saveAttachment(updatedState);
      setState(updatedState);
      return { phaseChanged, newPhase };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update daily');
      setError(error);
      logger.error('[useAttachment] Update daily error:', error);
      return { phaseChanged: false };
    }
  }, [state]);

  // Refresh attachment state
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const attachment = await AttachmentService.loadAttachment(plantId);
      if (attachment) {
        setState(attachment);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh');
      setError(error);
      logger.error('[useAttachment] Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [plantId]);

  // Check if feature is unlocked
  const isFeatureUnlocked = useCallback(
    (feature: string): boolean => {
      if (!state) return false;
      return AttachmentService.isFeatureUnlocked(state.attachmentPhase, feature);
    },
    [state]
  );

  // Get all unlocked features
  const getUnlockedFeatures = useCallback((): string[] => {
    if (!state) return [];
    return AttachmentService.getUnlockedFeatures(state.attachmentPhase);
  }, [state]);

  // Compute current status
  let phase: AttachmentPhase | null = null;
  let dayWithUser = 0;
  let attachmentScore = 0;
  let phaseProgress = 0;
  let statusText = '';
  let tip = '';
  let nextMilestone: { day: number; name: string; reward?: number } | null = null;

  if (state) {
    const status = getAttachmentStatus(state);
    phase = status.phase;
    dayWithUser = state.dayWithUser;
    attachmentScore = status.score;
    phaseProgress = status.progress;
    statusText = status.statusText;
    tip = status.tip;
    nextMilestone = status.nextMilestone;
  }

  return {
    // State
    state,
    isLoading,
    error,

    // Current status
    phase,
    dayWithUser,
    attachmentScore,
    phaseProgress,
    statusText,
    tip,
    nextMilestone,

    // Actions
    recordCareAction,
    recordInteraction,
    updateDaily,
    refresh,
    isFeatureUnlocked,
    getUnlockedFeatures,
  };
}

/**
 * Advanced hook for multi-plant attachment tracking
 * Tracks all plants and syncs with app state
 */
export function useAttachmentMulti(plantIds: string[]) {
  const [states, setStates] = useState<Record<string, AttachmentState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loaded: Record<string, AttachmentState> = {};

        for (const id of plantIds) {
          let attachment = await AttachmentService.loadAttachment(id);
          if (!attachment) {
            attachment = AttachmentService.initializeAttachment(id);
            await AttachmentService.saveAttachment(attachment);
          }
          loaded[id] = attachment;
        }

        setStates(loaded);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load attachments');
        setError(error);
        logger.error('[useAttachmentMulti] Load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (plantIds.length > 0) {
      loadAll();
    }
  }, [plantIds.join(',')]); // Join to create stable dependency

  const recordCareAction = useCallback(
    async (plantId: string, actionType: 'water' | 'fertilize' | 'interact' | 'check_in') => {
      const state = states[plantId];
      if (!state) return;

      try {
        const updated = AttachmentService.recordCareAction(state, actionType);
        await AttachmentService.saveAttachment(updated);
        setStates(prev => ({ ...prev, [plantId]: updated }));
      } catch (err) {
        logger.error('[useAttachmentMulti] Record action error:', err);
      }
    },
    [states]
  );

  const updateAllDaily = useCallback(async () => {
    const updated: Record<string, AttachmentState> = { ...states };

    for (const plantId in states) {
      const { updatedState } = AttachmentService.updateDaily(states[plantId]);
      await AttachmentService.saveAttachment(updatedState);
      updated[plantId] = updatedState;
    }

    setStates(updated);
  }, [states]);

  return {
    states,
    isLoading,
    error,
    recordCareAction,
    updateAllDaily,
  };
}
