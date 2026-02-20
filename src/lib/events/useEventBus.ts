/**
 * useEventBus Hook
 * Provides easy event subscription/emission in React components
 * Handles cleanup automatically on unmount
 */

import { useEffect, useCallback } from 'react';
import { eventBus, AppEvent, EventHandler, UnsubscribeFn } from './EventBus';

/**
 * Hook to subscribe to events with automatic cleanup
 * @param eventType - Event type to listen for
 * @param handler - Function called when event emitted
 * @param enabled - Enable/disable listener (default: true)
 *
 * @example
 * ```tsx
 * function GamificationListener() {
 *   useEventBus('PLANT_WATERED', ({ plantId, xpEarned }) => {
 *     addXp(xpEarned);
 *   });
 *
 *   return null; // Invisible component
 * }
 * ```
 */
export const useEventBus = <T extends AppEvent['type']>(
  eventType: T,
  handler: EventHandler<Extract<AppEvent, { type: T }>>,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = eventBus.on(eventType, handler);

    // Cleanup on unmount
    return unsubscribe;
  }, [eventType, handler, enabled]);
};

/**
 * Hook to listen to multiple event types
 * @param eventTypes - Array of event types to listen for
 * @param handler - Function called when any event emitted
 * @param enabled - Enable/disable listener (default: true)
 */
export const useEventBusMultiple = <T extends AppEvent['type']>(
  eventTypes: T[],
  handler: EventHandler<Extract<AppEvent, { type: T }>>,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = eventBus.onMultiple(eventTypes, handler);
    return unsubscribe;
  }, [eventTypes, handler, enabled]);
};

/**
 * Hook to listen to event once
 * @param eventType - Event type to listen for
 * @param handler - Function called when event emitted (only once)
 * @param enabled - Enable/disable listener (default: true)
 */
export const useEventBusOnce = <T extends AppEvent['type']>(
  eventType: T,
  handler: EventHandler<Extract<AppEvent, { type: T }>>,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = eventBus.once(eventType, handler);
    return unsubscribe;
  }, [eventType, handler, enabled]);
};

/**
 * Hook to emit events from components
 * Returns emit and emitSync functions
 *
 * @example
 * ```tsx
 * function PlantDetail({ plantId }) {
 *   const { emit } = useEventBusEmit();
 *
 *   const handleWater = async () => {
 *     await waterPlant(plantId);
 *     await emit('PLANT_WATERED', { plantId, xpEarned: 10 });
 *   };
 *
 *   return <Button onPress={handleWater} />;
 * }
 * ```
 */
export const useEventBusEmit = () => {
  const emit = useCallback(
    async <T extends AppEvent['type']>(
      eventType: T,
      payload: Extract<AppEvent, { type: T }>['payload']
    ) => {
      // Type assertion needed: TS can't narrow generic T in callback context
      await eventBus.emit(eventType, payload as never);
    },
    []
  );

  const emitSync = useCallback(
    <T extends AppEvent['type']>(
      eventType: T,
      payload: Extract<AppEvent, { type: T }>['payload']
    ) => {
      // Type assertion needed: TS can't narrow generic T in callback context
      eventBus.emitSync(eventType, payload as never);
    },
    []
  );

  return { emit, emitSync };
};

/**
 * Hook to manage listeners (subscribe/unsubscribe)
 * Useful for dynamic subscriptions
 *
 * @example
 * ```tsx
 * function DynamicListener({ shouldListen }) {
 *   const { subscribe, unsubscribe } = useEventBusManager();
 *
 *   const handlePlantWatered = ({ xpEarned }) => {
 *     console.log('Gained', xpEarned, 'XP');
 *   };
 *
 *   useEffect(() => {
 *     if (shouldListen) {
 *       const unsubscribeFn = subscribe('PLANT_WATERED', handlePlantWatered);
 *       return unsubscribeFn;
 *     }
 *   }, [shouldListen, subscribe]);
 *
 *   return null;
 * }
 * ```
 */
export const useEventBusManager = () => {
  const subscribe = useCallback(
    <T extends AppEvent['type']>(
      eventType: T,
      handler: EventHandler<Extract<AppEvent, { type: T }>>
    ): UnsubscribeFn => {
      return eventBus.on(eventType, handler);
    },
    []
  );

  const unsubscribe = useCallback((eventType: string) => {
    eventBus.off(eventType);
  }, []);

  const unsubscribeAll = useCallback(() => {
    eventBus.offAll();
  }, []);

  const getListenerCount = useCallback((eventType: string) => {
    return eventBus.getListenerCount(eventType);
  }, []);

  const getSummary = useCallback(() => {
    return eventBus.getSummary();
  }, []);

  return {
    subscribe,
    unsubscribe,
    unsubscribeAll,
    getListenerCount,
    getSummary
  };
};

/**
 * Hook to debug EventBus
 * Shows all events and listeners
 */
export const useEventBusDebug = () => {
  const { getSummary } = useEventBusManager();

  const getDebugInfo = useCallback(() => {
    const summary = getSummary();
    const history = eventBus.getHistory(10);

    return {
      registeredEvents: summary,
      recentEvents: history,
      totalListeners: summary.reduce((sum, e) => sum + e.listeners, 0),
      totalEvents: summary.length
    };
  }, [getSummary]);

  const enableDebugMode = useCallback(() => {
    eventBus.setDebugMode(true);
  }, []);

  const disableDebugMode = useCallback(() => {
    eventBus.setDebugMode(false);
  }, []);

  const clearHistory = useCallback(() => {
    eventBus.clearHistory();
  }, []);

  return {
    getDebugInfo,
    enableDebugMode,
    disableDebugMode,
    clearHistory
  };
};
