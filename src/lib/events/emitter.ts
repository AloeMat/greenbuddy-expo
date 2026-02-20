/**
 * GreenBuddy Event Emitter Implementation
 * 
 * Simple pub/sub pattern for inter-feature communication
 * No third-party dependencies required
 */

import type { AppEvent, EventCallback, IEventBus } from './types';

class EventEmitter implements IEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * Returns unsubscribe function
   */
  on<T extends AppEvent>(
    eventName: T['name'],
    callback: EventCallback<T>
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)?.add(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends AppEvent>(eventName: T['name'], callback: EventCallback<T>): void {
    this.listeners.get(eventName)?.delete(callback as EventCallback);
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<T extends AppEvent>(event: T): Promise<void> {
    const callbacks = this.listeners.get(event.name);
    if (!callbacks) return;

    // Execute all listeners in parallel
    await Promise.all(
      Array.from(callbacks).map((cb) => Promise.resolve(cb(event as any)))
    );
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get number of listeners for an event (for testing/debugging)
   */
  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size ?? 0;
  }
}

/**
 * Global event bus singleton
 */
export const eventBus = new EventEmitter();

// Export for testing/debugging
export { EventEmitter };
