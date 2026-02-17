/**
 * EventBus - Mediator Pattern Implementation
 * Enables loose coupling between features through event-driven communication
 *
 * Benefits:
 * - Decouples features (plants doesn't know about gamification)
 * - Enables reactive programming (listen to events anywhere)
 * - Solves circular dependency problems
 * - Easy to extend with new events
 *
 * Architecture:
 * Plants feature emits events → EventBus → Gamification feature listens
 */

import { logger } from '@lib/services/logger';

/**
 * Defines all possible events in the app
 * Add more events here as features grow
 */
export type AppEvent =
  // Authentication events
  | { type: 'USER_LOGGED_IN'; payload: { userId: string; email: string } }
  | { type: 'USER_LOGGED_OUT'; payload: { userId: string } }

  // Plant events
  | { type: 'PLANT_ADDED'; payload: { plantId: string; plantName: string } }
  | { type: 'PLANT_WATERED'; payload: { plantId: string; plantName: string; xpEarned: number } }
  | { type: 'PLANT_FERTILIZED'; payload: { plantId: string; plantName: string; xpEarned: number } }
  | { type: 'PLANT_DELETED'; payload: { plantId: string; plantName: string } }
  | { type: 'PLANT_HEALTH_CHANGED'; payload: { plantId: string; newHealth: number; previousHealth: number } }

  // Gamification events
  | { type: 'ACHIEVEMENT_UNLOCKED'; payload: { achievementId: string; achievementName: string; xpRewarded: number } }
  | { type: 'LEVEL_UP'; payload: { newLevel: number; totalXp: number } }
  | { type: 'STREAK_MILESTONE_REACHED'; payload: { daysAchieved: number; bonusXp: number } }
  | { type: 'XP_GAINED'; payload: { amount: number; reason: string } };

/**
 * Event handler function signature
 * Called when event is emitted
 */
export type EventHandler<T extends AppEvent = any> = (
  payload: T extends { payload: infer P } ? P : never
) => void | Promise<void>;

/**
 * Unsubscribe function
 * Call to remove listener from event
 */
export type UnsubscribeFn = () => void;

/**
 * EventBus - Singleton mediator for all app events
 * Thread-safe, supports async handlers
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: Array<{ event: AppEvent; timestamp: number }> = [];
  private readonly MAX_HISTORY = 100;
  private isDebugMode = false;

  /**
   * Private constructor prevents multiple instances
   */
  private constructor() {
    logger.info('🚀 EventBus initialized (singleton)');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to event
   * Returns unsubscribe function
   */
  on<T extends AppEvent['type']>(
    eventType: T,
    handler: EventHandler<Extract<AppEvent, { type: T }>>
  ): UnsubscribeFn {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const handlers = this.listeners.get(eventType)!;
    handlers.add(handler as EventHandler);

    if (this.isDebugMode) {
      logger.debug(`📌 Handler registered for event: ${eventType}`, {
        totalHandlers: handlers.size
      });
    }

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler);
      if (this.isDebugMode) {
        logger.debug(`📌 Handler unregistered for event: ${eventType}`, {
          totalHandlers: handlers.size
        });
      }
    };
  }

  /**
   * Subscribe to multiple event types
   */
  onMultiple<T extends AppEvent['type']>(
    eventTypes: T[],
    handler: EventHandler<Extract<AppEvent, { type: T }>>
  ): UnsubscribeFn {
    const unsubscribers = eventTypes.map(type => this.on(type, handler));

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first emission)
   */
  once<T extends AppEvent['type']>(
    eventType: T,
    handler: EventHandler<Extract<AppEvent, { type: T }>>
  ): UnsubscribeFn {
    const wrappedHandler = async (payload: any) => {
      await handler(payload);
      unsubscribe(); // Auto-unsubscribe
    };

    const unsubscribe = this.on(eventType, wrappedHandler as EventHandler);
    return unsubscribe;
  }

  /**
   * Emit event to all listeners
   * Supports async handlers (waits for all to complete)
   */
  async emit<T extends AppEvent['type']>(
    eventType: T,
    payload: Extract<AppEvent, { type: T }>['payload']
  ): Promise<void> {
    const event: AppEvent = { type: eventType, payload } as any;

    // Add to history for debugging
    this.addToHistory(event);

    const handlers = this.listeners.get(eventType);

    if (!handlers || handlers.size === 0) {
      if (this.isDebugMode) {
        logger.debug(`ℹ️ Event emitted but no listeners: ${eventType}`);
      }
      return;
    }

    if (this.isDebugMode) {
      logger.debug(`📡 Emitting event: ${eventType}`, {
        handlerCount: handlers.size,
        payload
      });
    }

    // Execute all handlers in parallel
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`❌ EventBus handler error for ${eventType}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    await Promise.all(promises);
  }

  /**
   * Emit event synchronously (don't wait for async handlers)
   */
  emitSync<T extends AppEvent['type']>(
    eventType: T,
    payload: Extract<AppEvent, { type: T }>['payload']
  ): void {
    const event: AppEvent = { type: eventType, payload } as any;
    this.addToHistory(event);

    const handlers = this.listeners.get(eventType);
    if (!handlers || handlers.size === 0) {
      return;
    }

    if (this.isDebugMode) {
      logger.debug(`📡 Emitting event (sync): ${eventType}`, {
        handlerCount: handlers.size
      });
    }

    // Execute handlers without waiting
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        logger.error(`❌ EventBus handler error for ${eventType}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  /**
   * Remove all listeners for a specific event
   */
  off(eventType: string): void {
    this.listeners.delete(eventType);
    logger.debug(`🗑️ All listeners removed for: ${eventType}`);
  }

  /**
   * Remove all listeners for all events
   */
  offAll(): void {
    this.listeners.clear();
    logger.info('🗑️ All event listeners cleared');
  }

  /**
   * Get count of listeners for an event
   */
  getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }

  /**
   * Get summary of all registered events
   */
  getSummary(): { event: string; listeners: number }[] {
    return Array.from(this.listeners.entries()).map(([event, handlers]) => ({
      event,
      listeners: handlers.size
    }));
  }

  /**
   * Enable/disable debug mode
   * In debug mode, logs all event emissions and subscriptions
   */
  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
    logger.info(`🐛 EventBus debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Add event to history for debugging
   */
  private addToHistory(event: AppEvent): void {
    this.eventHistory.push({
      event,
      timestamp: Date.now()
    });

    // Keep history size limited
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history (useful for debugging)
   */
  getHistory(limit: number = 20): Array<{ event: AppEvent; timestamp: number }> {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}

/**
 * Singleton instance exported for convenience
 * Use: eventBus.on(), eventBus.emit(), etc.
 */
export const eventBus = EventBus.getInstance();
