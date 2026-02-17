/**
 * Mock Services Barrel Export
 * Centralized mocks for testing without external APIs
 */

export { createMockGeminiService, mockGeminiService } from './gemini.mock';
export type { IGeminiService } from '@/lib/services/gemini';

export { createMockGoogleTTSService, mockGoogleTTSService } from './googleTTS.mock';
export type { IGoogleTTSService } from '@/lib/services/googleTTS';

export { createMockCameraService, mockCameraService } from './camera.mock';
export type { ICameraService } from '@/features/plants/services/camera';

export { createMockPlantNetService, mockPlantNetService } from './plantnet.mock';
export type { IPlantNetService } from '@/features/plants/services/plantnet';

export { createMockNotificationService, mockNotificationService } from './notifications.mock';
export type { INotificationService } from './notifications.mock';

export { createMockGeolocationService, mockGeolocationService } from './geolocation.mock';
export type { IGeolocationService } from './geolocation.mock';

/**
 * Usage in tests:
 *
 * import { createMockGeminiService } from '@/lib/services/__mocks__';
 *
 * const mockGemini = createMockGeminiService({
 *   generatePersonality: async () => ({
 *     personality: 'cactus',
 *     emotionState: 'happy',
 *     dialogue: 'Test dialogue'
 *   })
 * });
 *
 * // Pass to hooks or components that need DI
 */
