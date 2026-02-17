/**
 * Event Bus - Mediator Pattern Implementation
 * Enables loose coupling between features through event-driven communication
 *
 * Available Events:
 * - USER_LOGGED_IN / USER_LOGGED_OUT
 * - PLANT_ADDED / PLANT_WATERED / PLANT_FERTILIZED / PLANT_DELETED
 * - ACHIEVEMENT_UNLOCKED / LEVEL_UP / STREAK_MILESTONE_REACHED / XP_GAINED
 *
 * Hooks:
 * - useEventBus: Subscribe to single event
 * - useEventBusMultiple: Subscribe to multiple events
 * - useEventBusOnce: Subscribe once, then auto-unsubscribe
 * - useEventBusEmit: Emit events from components
 * - useEventBusManager: Dynamic subscribe/unsubscribe
 * - useEventBusDebug: Debug and monitor EventBus
 */

export { EventBus, eventBus, type AppEvent, type EventHandler, type UnsubscribeFn } from './EventBus';
export {
  useEventBus,
  useEventBusMultiple,
  useEventBusOnce,
  useEventBusEmit,
  useEventBusManager,
  useEventBusDebug
} from './useEventBus';
